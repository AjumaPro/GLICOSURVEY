<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleTaskRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('tasks/', '', $path);
    
    switch ($method) {
        case 'GET':
            if (empty($subPath)) {
                return handleGetTasks($authorization);
            } elseif (is_numeric($subPath)) {
                return handleGetTask($subPath, $authorization);
            }
            break;
            
        case 'POST':
            if (empty($subPath)) {
                return handleCreateTask($input, $authorization);
            }
            break;
            
        case 'PUT':
            if (is_numeric($subPath)) {
                return handleUpdateTask($subPath, $input, $authorization);
            }
            break;
            
        case 'DELETE':
            if (is_numeric($subPath)) {
                return handleDeleteTask($subPath, $authorization);
            }
            break;
    }
    
    http_response_code(404);
    return ['error' => 'Task endpoint not found'];
}

function handleGetTasks($authorization) {
    $user = requireAuth($authorization);
    
    $status = $_GET['status'] ?? null;
    $priority = $_GET['priority'] ?? null;
    
    $sql = 'SELECT t.*, u.full_name as assigned_to_name, s.title as survey_title 
            FROM tasks t 
            LEFT JOIN users u ON t.assigned_to = u.id 
            LEFT JOIN surveys s ON t.survey_id = s.id 
            WHERE t.is_deleted = 0';
    
    $params = [];
    
    if ($status) {
        $sql .= ' AND t.status = ?';
        $params[] = $status;
    }
    
    if ($priority) {
        $sql .= ' AND t.priority = ?';
        $params[] = $priority;
    }
    
    // Filter by user role
    if ($user['role'] === 'user') {
        $sql .= ' AND (t.assigned_to = ? OR t.created_by = ?)';
        $params[] = $user['id'];
        $params[] = $user['id'];
    }
    
    $sql .= ' ORDER BY t.priority DESC, t.due_date ASC';
    
    $tasks = query($sql, $params);
    
    return $tasks;
}

function handleGetTask($taskId, $authorization) {
    $user = requireAuth($authorization);
    
    $task = queryOne(
        'SELECT t.*, u.full_name as assigned_to_name, s.title as survey_title 
         FROM tasks t 
         LEFT JOIN users u ON t.assigned_to = u.id 
         LEFT JOIN surveys s ON t.survey_id = s.id 
         WHERE t.id = ? AND t.is_deleted = 0',
        [$taskId]
    );
    
    if (!$task) {
        http_response_code(404);
        return ['error' => 'Task not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user' && $task['assigned_to'] != $user['id'] && $task['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    return $task;
}

function handleCreateTask($input, $authorization) {
    $user = requireAuth($authorization);
    
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $surveyId = $input['survey_id'] ?? null;
    $assignedTo = $input['assigned_to'] ?? null;
    $priority = $input['priority'] ?? 'medium';
    $dueDate = $input['due_date'] ?? null;
    
    if (empty($title)) {
        http_response_code(400);
        return ['error' => 'Task title is required'];
    }
    
    // Validate priority
    $validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!in_array($priority, $validPriorities)) {
        http_response_code(400);
        return ['error' => 'Invalid priority level'];
    }
    
    // Check if survey exists (if provided)
    if ($surveyId) {
        $survey = queryOne(
            'SELECT created_by FROM surveys WHERE id = ? AND is_deleted = 0',
            [$surveyId]
        );
        
        if (!$survey) {
            http_response_code(404);
            return ['error' => 'Survey not found'];
        }
        
        // Check if user has access to this survey
        if ($user['role'] === 'user' && $survey['created_by'] != $user['id']) {
            http_response_code(403);
            return ['error' => 'Access denied to survey'];
        }
    }
    
    try {
        $result = query(
            'INSERT INTO tasks (title, description, survey_id, assigned_to, priority, due_date, status, created_by, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [
                $title,
                $description,
                $surveyId,
                $assignedTo,
                $priority,
                $dueDate,
                'pending',
                $user['id']
            ]
        );
        
        return [
            'message' => 'Task created successfully',
            'task_id' => $result['last_insert_id']
        ];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to create task: ' . $e->getMessage()];
    }
}

function handleUpdateTask($taskId, $input, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if task exists and user has permission
    $task = queryOne(
        'SELECT * FROM tasks WHERE id = ? AND is_deleted = 0',
        [$taskId]
    );
    
    if (!$task) {
        http_response_code(404);
        return ['error' => 'Task not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user' && $task['assigned_to'] != $user['id'] && $task['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    $title = $input['title'] ?? $task['title'];
    $description = $input['description'] ?? $task['description'];
    $status = $input['status'] ?? $task['status'];
    $priority = $input['priority'] ?? $task['priority'];
    $dueDate = $input['due_date'] ?? $task['due_date'];
    
    if (empty($title)) {
        http_response_code(400);
        return ['error' => 'Task title is required'];
    }
    
    // Validate status
    $validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        http_response_code(400);
        return ['error' => 'Invalid status'];
    }
    
    // Validate priority
    $validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!in_array($priority, $validPriorities)) {
        http_response_code(400);
        return ['error' => 'Invalid priority level'];
    }
    
    try {
        query(
            'UPDATE tasks 
             SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = NOW()
             WHERE id = ?',
            [$title, $description, $status, $priority, $dueDate, $taskId]
        );
        
        return ['message' => 'Task updated successfully'];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to update task: ' . $e->getMessage()];
    }
}

function handleDeleteTask($taskId, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if task exists and user has permission
    $task = queryOne(
        'SELECT * FROM tasks WHERE id = ? AND is_deleted = 0',
        [$taskId]
    );
    
    if (!$task) {
        http_response_code(404);
        return ['error' => 'Task not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user' && $task['assigned_to'] != $user['id'] && $task['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    try {
        // Soft delete task
        query(
            'UPDATE tasks SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
            [$taskId]
        );
        
        return ['message' => 'Task deleted successfully'];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to delete task: ' . $e->getMessage()];
    }
}
?>
