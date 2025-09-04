<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleResponseRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('responses/', '', $path);
    
    switch ($method) {
        case 'GET':
            if (empty($subPath)) {
                return handleGetResponses($authorization);
            } elseif (is_numeric($subPath)) {
                return handleGetResponse($subPath, $authorization);
            }
            break;
            
        case 'POST':
            if (empty($subPath)) {
                return handleCreateResponse($input, $authorization);
            }
            break;
            
        case 'DELETE':
            if (is_numeric($subPath)) {
                return handleDeleteResponse($subPath, $authorization);
            }
            break;
    }
    
    http_response_code(404);
    return ['error' => 'Response endpoint not found'];
}

function handleGetResponses($authorization) {
    $user = requireAuth($authorization);
    
    $surveyId = $_GET['survey_id'] ?? null;
    $sessionId = $_GET['session_id'] ?? null;
    
    $sql = 'SELECT r.*, s.title as survey_title, q.title as question_title, 
                   se.started_at, se.completed_at, se.user_agent, se.ip_address
            FROM responses r 
            JOIN surveys s ON r.survey_id = s.id 
            JOIN questions q ON r.question_id = q.id 
            LEFT JOIN sessions se ON r.session_id = se.session_id
            WHERE r.is_deleted = 0';
    
    $params = [];
    
    if ($surveyId) {
        $sql .= ' AND r.survey_id = ?';
        $params[] = $surveyId;
    }
    
    if ($sessionId) {
        $sql .= ' AND r.session_id = ?';
        $params[] = $sessionId;
    }
    
    // Filter by user role
    if ($user['role'] === 'user') {
        $sql .= ' AND s.created_by = ?';
        $params[] = $user['id'];
    }
    
    $sql .= ' ORDER BY r.created_at DESC';
    
    $responses = query($sql, $params);
    
    // Transform response data
    foreach ($responses as &$response) {
        $response['response_data'] = json_decode($response['response_data'], true);
    }
    
    return $responses;
}

function handleGetResponse($responseId, $authorization) {
    $user = requireAuth($authorization);
    
    $response = queryOne(
        'SELECT r.*, s.title as survey_title, q.title as question_title 
         FROM responses r 
         JOIN surveys s ON r.survey_id = s.id 
         JOIN questions q ON r.question_id = q.id 
         WHERE r.id = ? AND r.is_deleted = 0',
        [$responseId]
    );
    
    if (!$response) {
        http_response_code(404);
        return ['error' => 'Response not found'];
    }
    
    // Check permissions
    $survey = queryOne(
        'SELECT created_by FROM surveys WHERE id = ?',
        [$response['survey_id']]
    );
    
    if ($user['role'] === 'user' && $survey['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    $response['response_data'] = json_decode($response['response_data'], true);
    
    return $response;
}

function handleCreateResponse($input, $authorization) {
    $user = requireAuth($authorization);
    
    $surveyId = $input['survey_id'] ?? null;
    $questionId = $input['question_id'] ?? null;
    $sessionId = $input['session_id'] ?? null;
    $responseData = $input['response_data'] ?? null;
    
    if (!$surveyId || !$questionId || !$sessionId || !$responseData) {
        http_response_code(400);
        return ['error' => 'Survey ID, question ID, session ID, and response data are required'];
    }
    
    // Check if survey exists and is accessible
    $survey = queryOne(
        'SELECT * FROM surveys WHERE id = ? AND is_deleted = 0',
        [$surveyId]
    );
    
    if (!$survey) {
        http_response_code(404);
        return ['error' => 'Survey not found'];
    }
    
    // Check if question exists
    $question = queryOne(
        'SELECT * FROM questions WHERE id = ? AND survey_id = ? AND is_deleted = 0',
        [$questionId, $surveyId]
    );
    
    if (!$question) {
        http_response_code(404);
        return ['error' => 'Question not found'];
    }
    
    try {
        $result = query(
            'INSERT INTO responses (survey_id, question_id, session_id, response_data, created_at) 
             VALUES (?, ?, ?, ?, NOW())',
            [$surveyId, $questionId, $sessionId, json_encode($responseData)]
        );
        
        return [
            'message' => 'Response created successfully',
            'response_id' => $result['last_insert_id']
        ];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to create response: ' . $e->getMessage()];
    }
}

function handleDeleteResponse($responseId, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if response exists
    $response = queryOne(
        'SELECT r.*, s.created_by FROM responses r 
         JOIN surveys s ON r.survey_id = s.id 
         WHERE r.id = ? AND r.is_deleted = 0',
        [$responseId]
    );
    
    if (!$response) {
        http_response_code(404);
        return ['error' => 'Response not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user' && $response['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    // Soft delete response
    query(
        'UPDATE responses SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
        [$responseId]
    );
    
    return ['message' => 'Response deleted successfully'];
}
?>
