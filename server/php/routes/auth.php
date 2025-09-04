<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleAuthRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('auth/', '', $path);
    
    switch ($method) {
        case 'POST':
            if ($subPath === 'login') {
                return handleLogin($input);
            } elseif ($subPath === 'register') {
                return handleRegister($input, $authorization);
            } elseif ($subPath === 'change-password') {
                return handleChangePassword($input, $authorization);
            }
            break;
            
        case 'GET':
            if ($subPath === 'me') {
                return handleGetProfile($authorization);
            }
            break;
            
        case 'PUT':
            if ($subPath === 'profile') {
                return handleUpdateProfile($input, $authorization);
            }
            break;
    }
    
    http_response_code(404);
    return ['error' => 'Auth endpoint not found'];
}

function handleLogin($input) {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        return ['error' => 'Email and password are required'];
    }
    
    // Find user
    $user = queryOne(
        'SELECT id, email, password_hash, full_name, role FROM users WHERE email = ?',
        [$email]
    );
    
    if (!$user) {
        http_response_code(401);
        return ['error' => 'Invalid email or password'];
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        return ['error' => 'Invalid email or password'];
    }
    
    // Generate JWT token
    $token = generateJWT($user['id']);
    
    return [
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['full_name'],
            'role' => $user['role']
        ],
        'token' => $token
    ];
}

function handleRegister($input, $authorization) {
    // Check if the authenticated user is an admin or super admin
    $adminUser = requireAdmin($authorization);
    
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $fullName = $input['username'] ?? '';
    $role = $input['role'] ?? 'user';
    
    if (empty($email) || empty($password) || empty($fullName)) {
        http_response_code(400);
        return ['error' => 'Email, password, and username are required'];
    }
    
    // Validate role
    $validRoles = ['user', 'admin'];
    if ($adminUser['role'] === 'admin' && $role !== 'user') {
        http_response_code(403);
        return ['error' => 'Admins can only create regular user accounts'];
    }
    
    if ($adminUser['role'] === 'super_admin') {
        $validRoles[] = 'super_admin';
    }
    
    if (!in_array($role, $validRoles)) {
        http_response_code(400);
        return ['error' => 'Invalid role'];
    }
    
    // Check if user already exists
    $existingUser = queryOne(
        'SELECT id FROM users WHERE email = ?',
        [$email]
    );
    
    if ($existingUser) {
        http_response_code(400);
        return ['error' => 'User already exists with this email'];
    }
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // Create user
    $result = query(
        'INSERT INTO users (email, password_hash, full_name, role, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [$email, $passwordHash, $fullName, $role, $adminUser['id']]
    );
    
    return [
        'message' => 'User created successfully',
        'user' => [
            'id' => $result['last_insert_id'],
            'email' => $email,
            'username' => $fullName,
            'role' => $role
        ]
    ];
}

function handleGetProfile($authorization) {
    $user = requireAuth($authorization);
    
    return [
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['full_name'],
            'role' => $user['role']
        ]
    ];
}

function handleUpdateProfile($input, $authorization) {
    $user = requireAuth($authorization);
    
    $fullName = $input['username'] ?? $user['full_name'];
    $email = $input['email'] ?? $user['email'];
    
    // Check if email is already taken by another user
    if ($email !== $user['email']) {
        $existingUser = queryOne(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [$email, $user['id']]
        );
        
        if ($existingUser) {
            http_response_code(400);
            return ['error' => 'Email is already taken'];
        }
    }
    
    // Update user
    query(
        'UPDATE users SET full_name = ?, email = ?, updated_at = NOW() WHERE id = ?',
        [$fullName, $email, $user['id']]
    );
    
    return [
        'user' => [
            'id' => $user['id'],
            'email' => $email,
            'username' => $fullName,
            'role' => $user['role']
        ]
    ];
}

function handleChangePassword($input, $authorization) {
    $user = requireAuth($authorization);
    
    $currentPassword = $input['currentPassword'] ?? '';
    $newPassword = $input['newPassword'] ?? '';
    
    if (empty($currentPassword) || empty($newPassword)) {
        http_response_code(400);
        return ['error' => 'Current password and new password are required'];
    }
    
    // Get current password hash
    $currentUser = queryOne(
        'SELECT password_hash FROM users WHERE id = ?',
        [$user['id']]
    );
    
    // Verify current password
    if (!password_verify($currentPassword, $currentUser['password_hash'])) {
        http_response_code(401);
        return ['error' => 'Current password is incorrect'];
    }
    
    // Hash new password
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update password
    query(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [$newPasswordHash, $user['id']]
    );
    
    return ['message' => 'Password updated successfully'];
}

function generateJWT($userId) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'userId' => $userId,
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ]);
    
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $secret, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}
?>
