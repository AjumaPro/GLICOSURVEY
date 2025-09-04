<?php
require_once __DIR__ . '/../config/database.php';

function validateToken($authorization) {
    if (empty($authorization)) {
        return null;
    }
    
    // Extract token from "Bearer <token>"
    if (strpos($authorization, 'Bearer ') === 0) {
        $token = substr($authorization, 7);
    } else {
        $token = $authorization;
    }
    
    if (empty($token)) {
        return null;
    }
    
    try {
        // Decode JWT token (you'll need to implement JWT library or use a simple approach)
        $payload = decodeJWT($token);
        
        if (!$payload || !isset($payload['userId'])) {
            return null;
        }
        
        // Get user from database
        $user = queryOne(
            'SELECT id, email, full_name, role FROM users WHERE id = ?',
            [$payload['userId']]
        );
        
        if (!$user) {
            return null;
        }
        
        return $user;
        
    } catch (Exception $e) {
        error_log("Token validation failed: " . $e->getMessage());
        return null;
    }
}

function decodeJWT($token) {
    // Simple JWT decode implementation
    // In production, use a proper JWT library like firebase/php-jwt
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    
    $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
    
    if (!$payload) {
        return null;
    }
    
    // Check if token is expired
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

function requireAuth($authorization) {
    $user = validateToken($authorization);
    
    if (!$user) {
        http_response_code(401);
        throw new Exception('Authentication required');
    }
    
    return $user;
}

function requireRole($authorization, $requiredRole) {
    $user = requireAuth($authorization);
    
    if ($user['role'] !== $requiredRole && $user['role'] !== 'super_admin') {
        http_response_code(403);
        throw new Exception('Insufficient permissions');
    }
    
    return $user;
}

function requireAdmin($authorization) {
    return requireRole($authorization, 'admin');
}

function requireSuperAdmin($authorization) {
    $user = requireAuth($authorization);
    
    if ($user['role'] !== 'super_admin') {
        http_response_code(403);
        throw new Exception('Super admin access required');
    }
    
    return $user;
}
?>
