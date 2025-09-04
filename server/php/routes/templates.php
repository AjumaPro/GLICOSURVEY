<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleTemplateRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('templates/', '', $path);
    
    switch ($method) {
        case 'GET':
            if (empty($subPath)) {
                return handleGetTemplates($authorization);
            } else {
                return handleGetTemplate($subPath, $authorization);
            }
            break;
            
        case 'POST':
            if (empty($subPath)) {
                return handleCreateTemplate($input, $authorization);
            }
            break;
            
        case 'PUT':
            if (is_numeric($subPath)) {
                return handleUpdateTemplate($subPath, $input, $authorization);
            }
            break;
            
        case 'DELETE':
            if (is_numeric($subPath)) {
                return handleDeleteTemplate($subPath, $authorization);
            }
            break;
    }
    
    http_response_code(404);
    return ['error' => 'Template endpoint not found'];
}

function handleGetTemplates($authorization) {
    $user = requireAuth($authorization);
    
    $sql = 'SELECT t.*, u.full_name as creator_name 
            FROM survey_templates t 
            LEFT JOIN users u ON t.created_by = u.id 
            WHERE t.is_deleted = 0';
    
    $params = [];
    
    // Filter by user role
    if ($user['role'] === 'user') {
        $sql .= ' AND (t.created_by = ? OR t.is_public = 1)';
        $params[] = $user['id'];
    } elseif ($user['role'] === 'admin') {
        $sql .= ' AND (t.created_by = ? OR t.is_public = 1)';
        $params[] = $user['id'];
    }
    
    $sql .= ' ORDER BY t.created_at DESC';
    
    $templates = query($sql, $params);
    
    // Transform data to match frontend expectations
    foreach ($templates as &$template) {
        $template['questions_data'] = json_decode($template['questions_data'], true);
        $template['created_at'] = $template['created_at'];
        $template['updated_at'] = $template['updated_at'];
    }
    
    return $templates;
}

function handleGetTemplate($templateId, $authorization) {
    $user = requireAuth($authorization);
    
    $template = queryOne(
        'SELECT t.*, u.full_name as creator_name 
         FROM survey_templates t 
         LEFT JOIN users u ON t.created_by = u.id 
         WHERE t.id = ? AND t.is_deleted = 0',
        [$templateId]
    );
    
    if (!$template) {
        http_response_code(404);
        return ['error' => 'Template not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user' && $template['created_by'] != $user['id'] && !$template['is_public']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    $template['questions_data'] = json_decode($template['questions_data'], true);
    
    return $template;
}

function handleCreateTemplate($input, $authorization) {
    $user = requireAuth($authorization);
    
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $category = $input['category'] ?? '';
    $isPublic = $input['is_public'] ?? 0;
    $questions = $input['questions'] ?? [];
    
    if (empty($title)) {
        http_response_code(400);
        return ['error' => 'Template title is required'];
    }
    
    try {
        $result = query(
            'INSERT INTO survey_templates (title, description, category, is_public, created_by, created_at, questions_data) 
             VALUES (?, ?, ?, ?, ?, NOW(), ?)',
            [$title, $description, $category, $isPublic, $user['id'], json_encode($questions)]
        );
        
        return [
            'message' => 'Template created successfully',
            'template_id' => $result['last_insert_id']
        ];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to create template: ' . $e->getMessage()];
    }
}

function handleUpdateTemplate($templateId, $input, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if template exists and user has permission
    $template = queryOne(
        'SELECT created_by FROM survey_templates WHERE id = ? AND is_deleted = 0',
        [$templateId]
    );
    
    if (!$template) {
        http_response_code(404);
        return ['error' => 'Template not found'];
    }
    
    if ($user['role'] === 'user' && $template['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $category = $input['category'] ?? '';
    $isPublic = $input['is_public'] ?? 0;
    $questions = $input['questions'] ?? [];
    
    if (empty($title)) {
        http_response_code(400);
        return ['error' => 'Template title is required'];
    }
    
    try {
        query(
            'UPDATE survey_templates 
             SET title = ?, description = ?, category = ?, is_public = ?, updated_at = NOW(), questions_data = ?
             WHERE id = ?',
            [$title, $description, $category, $isPublic, json_encode($questions), $templateId]
        );
        
        return ['message' => 'Template updated successfully'];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to update template: ' . $e->getMessage()];
    }
}

function handleDeleteTemplate($templateId, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if template exists and user has permission
    $template = queryOne(
        'SELECT created_by FROM survey_templates WHERE id = ? AND is_deleted = 0',
        [$templateId]
    );
    
    if (!$template) {
        http_response_code(404);
        return ['error' => 'Template not found'];
    }
    
    if ($user['role'] === 'user' && $template['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    // Soft delete template
    query(
        'UPDATE survey_templates SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
        [$templateId]
    );
    
    return ['message' => 'Template deleted successfully'];
}
?>
