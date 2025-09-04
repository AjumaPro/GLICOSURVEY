<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleAdminRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('admin/', '', $path);
    
    switch ($method) {
        case 'GET':
            if ($subPath === 'users') {
                return handleGetUsers($authorization);
            }
            break;
            
        case 'POST':
            if ($subPath === 'users') {
                return handleCreateUser($input, $authorization);
            }
            break;
            
        case 'PUT':
            if (strpos($subPath, 'users/') === 0) {
                $userId = str_replace('users/', '', $subPath);
                return handleUpdateUser($userId, $input, $authorization);
            }
            break;
            
        case 'DELETE':
            if (strpos($subPath, 'users/') === 0) {
                $userId = str_replace('users/', '', $subPath);
                return handleDeleteUser($userId, $authorization);
            }
            break;
    }
    
    http_response_code(404);
    return ['error' => 'Admin endpoint not found'];
}

function handleGetUsers($authorization) {
    $user = requireAdmin($authorization);
    
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $role = isset($_GET['role']) ? $_GET['role'] : '';
    
    $offset = ($page - 1) * $limit;
    
    $whereConditions = [];
    $params = [];
    $paramCount = 0;
    
    // Filter by role (admins can only see regular users, super admins can see all)
    if ($user['role'] === 'admin') {
        $whereConditions[] = '(role != "super_admin" OR created_by = ?)';
        $params[] = $user['id'];
        $paramCount++;
    }
    
    // Search filter
    if (!empty($search)) {
        $whereConditions[] = '(LOWER(full_name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))';
        $params[] = "%$search%";
        $params[] = "%$search%";
        $paramCount += 2;
    }
    
    // Role filter
    if (!empty($role)) {
        $whereConditions[] = 'role = ?';
        $params[] = $role;
        $paramCount++;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM users $whereClause";
    $countResult = query($countSql, $params);
    $totalUsers = $countResult[0]['total'];
    
    // Get users with pagination
    $sql = "SELECT id, email, full_name, role, created_at, updated_at 
            FROM users 
            $whereClause 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?";
    
    $params[] = $limit;
    $params[] = $offset;
    
    $users = query($sql, $params);
    
    return [
        'users' => $users,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $totalUsers,
            'pages' => ceil($totalUsers / $limit)
        ]
    ];
}

function handleCreateUser($input, $authorization) {
    $adminUser = requireAdmin($authorization);
    
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $fullName = $input['full_name'] ?? '';
    $role = $input['role'] ?? 'user';
    
    if (empty($email) || empty($password) || empty($fullName)) {
        http_response_code(400);
        return ['error' => 'Email, password, and full name are required'];
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
            'full_name' => $fullName,
            'role' => $role
        ]
    ];
}

function handleUpdateUser($userId, $input, $authorization) {
    $adminUser = requireAdmin($authorization);
    
    // Check if user exists
    $existingUser = queryOne(
        'SELECT id, role, created_by FROM users WHERE id = ?',
        [$userId]
    );
    
    if (!$existingUser) {
        http_response_code(404);
        return ['error' => 'User not found'];
    }
    
    // Check permissions
    if ($existingUser['role'] === 'super_admin' && $adminUser['role'] !== 'super_admin') {
        http_response_code(403);
        return ['error' => 'Cannot modify super admin users'];
    }
    
    if ($existingUser['created_by'] !== $adminUser['id'] && $adminUser['role'] === 'admin') {
        http_response_code(403);
        return ['error' => 'Cannot modify users created by other admins'];
    }
    
    $email = $input['email'] ?? '';
    $fullName = $input['full_name'] ?? '';
    $role = $input['role'] ?? '';
    
    // Check if email is already taken by another user
    if (!empty($email) && $email !== $existingUser['email']) {
        $emailCheck = queryOne(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [$email, $userId]
        );
        
        if ($emailCheck) {
            http_response_code(400);
            return ['error' => 'Email is already taken'];
        }
    }
    
    // Build update query
    $updateFields = [];
    $params = [];
    
    if (!empty($email)) {
        $updateFields[] = 'email = ?';
        $params[] = $email;
    }
    
    if (!empty($fullName)) {
        $updateFields[] = 'full_name = ?';
        $params[] = $fullName;
    }
    
    if (!empty($role)) {
        // Validate role change
        if ($existingUser['role'] === 'super_admin' && $role !== 'super_admin' && $adminUser['role'] !== 'super_admin') {
            http_response_code(403);
            return ['error' => 'Cannot downgrade super admin users'];
        }
        
        $updateFields[] = 'role = ?';
        $params[] = $role;
    }
    
    if (empty($updateFields)) {
        http_response_code(400);
        return ['error' => 'No fields to update'];
    }
    
    $updateFields[] = 'updated_at = NOW()';
    $params[] = $userId;
    
    $sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
    
    try {
        query($sql, $params);
        
        return ['message' => 'User updated successfully'];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to update user: ' . $e->getMessage()];
    }
}

function handleDeleteUser($userId, $authorization) {
    $adminUser = requireAdmin($authorization);
    
    // Check if user exists
    $existingUser = queryOne(
        'SELECT id, role, created_by FROM users WHERE id = ?',
        [$userId]
    );
    
    if (!$existingUser) {
        http_response_code(404);
        return ['error' => 'User not found'];
    }
    
    // Check permissions
    if ($existingUser['role'] === 'super_admin') {
        http_response_code(403);
        return ['error' => 'Cannot delete super admin users'];
    }
    
    if ($existingUser['created_by'] !== $adminUser['id'] && $adminUser['role'] === 'admin') {
        http_response_code(403);
        return ['error' => 'Cannot delete users created by other admins'];
    }
    
    // Soft delete user
    query(
        'UPDATE users SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
        [$userId]
    );
    
    return ['message' => 'User deleted successfully'];
}
?>
