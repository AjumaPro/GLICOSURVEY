<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleUserRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('users/', '', $path);
    
    switch ($method) {
        case 'GET':
            if (empty($subPath)) {
                return handleGetUsers($authorization);
            } elseif (is_numeric($subPath)) {
                return handleGetUser($subPath, $authorization);
            }
            break;
            
        case 'PUT':
            if (is_numeric($subPath)) {
                return handleUpdateUser($subPath, $input, $authorization);
            }
            break;
            
        case 'DELETE':
            if (is_numeric($subPath)) {
                return handleDeleteUser($subPath, $authorization);
            }
            break;
    }
    
    http_response_code(404);
    return ['error' => 'User endpoint not found'];
}

function handleGetUsers($authorization) {
    $user = requireAuth($authorization);
    
    // Only admins can list users
    if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $role = isset($_GET['role']) ? $_GET['role'] : '';
    
    $offset = ($page - 1) * $limit;
    
    $whereConditions = [];
    $params = [];
    
    // Filter by role (admins can only see regular users, super admins can see all)
    if ($user['role'] === 'admin') {
        $whereConditions[] = '(role != "super_admin" OR created_by = ?)';
        $params[] = $user['id'];
    }
    
    // Search filter
    if (!empty($search)) {
        $whereConditions[] = '(LOWER(full_name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))';
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    // Role filter
    if (!empty($role)) {
        $whereConditions[] = 'role = ?';
        $params[] = $role;
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

function handleGetUser($userId, $authorization) {
    $user = requireAuth($authorization);
    
    // Users can only see their own profile, admins can see any user
    if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin' && $user['id'] != $userId) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    $targetUser = queryOne(
        'SELECT id, email, full_name, role, created_at, updated_at FROM users WHERE id = ? AND is_deleted = 0',
        [$userId]
    );
    
    if (!$targetUser) {
        http_response_code(404);
        return ['error' => 'User not found'];
    }
    
    // Check if admin can see this user
    if ($user['role'] === 'admin' && $targetUser['role'] === 'super_admin') {
        $adminUser = queryOne(
            'SELECT created_by FROM users WHERE id = ?',
            [$userId]
        );
        
        if (!$adminUser || $adminUser['created_by'] != $user['id']) {
            http_response_code(403);
            return ['error' => 'Access denied'];
        }
    }
    
    return $targetUser;
}

function handleUpdateUser($userId, $input, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if user exists
    $existingUser = queryOne(
        'SELECT id, role, created_by FROM users WHERE id = ? AND is_deleted = 0',
        [$userId]
    );
    
    if (!$existingUser) {
        http_response_code(404);
        return ['error' => 'User not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user' && $user['id'] != $userId) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    if ($user['role'] === 'admin') {
        if ($existingUser['role'] === 'super_admin') {
            $adminUser = queryOne(
                'SELECT created_by FROM users WHERE id = ?',
                [$userId]
            );
            
            if (!$adminUser || $adminUser['created_by'] != $user['id']) {
                http_response_code(403);
                return ['error' => 'Access denied'];
            }
        }
    }
    
    $fullName = $input['full_name'] ?? '';
    $email = $input['email'] ?? '';
    
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
    
    if (!empty($fullName)) {
        $updateFields[] = 'full_name = ?';
        $params[] = $fullName;
    }
    
    if (!empty($email)) {
        $updateFields[] = 'email = ?';
        $params[] = $email;
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
    $user = requireAuth($authorization);
    
    // Check if user exists
    $existingUser = queryOne(
        'SELECT id, role, created_by FROM users WHERE id = ? AND is_deleted = 0',
        [$userId]
    );
    
    if (!$existingUser) {
        http_response_code(404);
        return ['error' => 'User not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user') {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    if ($existingUser['role'] === 'super_admin') {
        http_response_code(403);
        return ['error' => 'Cannot delete super admin users'];
    }
    
    if ($user['role'] === 'admin' && $existingUser['created_by'] !== $user['id']) {
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
