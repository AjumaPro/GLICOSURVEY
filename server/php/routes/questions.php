<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleQuestionRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('questions/', '', $path);
    
    switch ($method) {
        case 'GET':
            if (empty($subPath)) {
                return handleGetQuestions($authorization);
            } elseif (is_numeric($subPath)) {
                return handleGetQuestion($subPath, $authorization);
            }
            break;
            
        case 'POST':
            if (empty($subPath)) {
                return handleCreateQuestion($input, $authorization);
            }
            break;
            
        case 'PUT':
            if (is_numeric($subPath)) {
                return handleUpdateQuestion($subPath, $input, $authorization);
            }
            break;
            
        case 'DELETE':
            if (is_numeric($subPath)) {
                return handleDeleteQuestion($subPath, $authorization);
            }
            break;
    }
    
    http_response_code(404);
    return ['error' => 'Question endpoint not found'];
}

function handleGetQuestions($authorization) {
    $user = requireAuth($authorization);
    
    $surveyId = $_GET['survey_id'] ?? null;
    
    if (!$surveyId) {
        http_response_code(400);
        return ['error' => 'Survey ID is required'];
    }
    
    // Check if user has access to this survey
    $survey = queryOne(
        'SELECT created_by FROM surveys WHERE id = ? AND is_deleted = 0',
        [$surveyId]
    );
    
    if (!$survey) {
        http_response_code(404);
        return ['error' => 'Survey not found'];
    }
    
    if ($user['role'] === 'user' && $survey['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    $questions = query(
        'SELECT id, type, title, options, required, order_index, created_at, updated_at 
         FROM questions 
         WHERE survey_id = ? AND is_deleted = 0 
         ORDER BY order_index ASC',
        [$surveyId]
    );
    
    // Transform questions data
    foreach ($questions as &$question) {
        if ($question['options']) {
            $question['options'] = json_decode($question['options'], true);
        }
        // Map to frontend expectations
        $question['question_type'] = $question['type'];
        $question['question_text'] = $question['title'];
    }
    
    return $questions;
}

function handleGetQuestion($questionId, $authorization) {
    $user = requireAuth($authorization);
    
    $question = queryOne(
        'SELECT q.*, s.created_by, s.title as survey_title 
         FROM questions q 
         JOIN surveys s ON q.survey_id = s.id 
         WHERE q.id = ? AND q.is_deleted = 0',
        [$questionId]
    );
    
    if (!$question) {
        http_response_code(404);
        return ['error' => 'Question not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user' && $question['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    if ($question['options']) {
        $question['options'] = json_decode($question['options'], true);
    }
    
    // Map to frontend expectations
    $question['question_type'] = $question['type'];
    $question['question_text'] = $question['title'];
    
    return $question;
}

function handleCreateQuestion($input, $authorization) {
    $user = requireAuth($authorization);
    
    $surveyId = $input['survey_id'] ?? null;
    $type = $input['type'] ?? null;
    $title = $input['title'] ?? null;
    $options = $input['options'] ?? null;
    $required = $input['required'] ?? 0;
    $orderIndex = $input['order_index'] ?? null;
    
    if (!$surveyId || !$type || !$title) {
        http_response_code(400);
        return ['error' => 'Survey ID, type, and title are required'];
    }
    
    // Check if user has access to this survey
    $survey = queryOne(
        'SELECT created_by FROM surveys WHERE id = ? AND is_deleted = 0',
        [$surveyId]
    );
    
    if (!$survey) {
        http_response_code(404);
        return ['error' => 'Survey not found'];
    }
    
    if ($user['role'] === 'user' && $survey['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    // Get next order index if not provided
    if ($orderIndex === null) {
        $maxOrder = queryOne(
            'SELECT MAX(order_index) as max_order FROM questions WHERE survey_id = ? AND is_deleted = 0',
            [$surveyId]
        );
        $orderIndex = ($maxOrder['max_order'] ?? 0) + 1;
    }
    
    try {
        $result = query(
            'INSERT INTO questions (survey_id, type, title, options, required, order_index, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [
                $surveyId,
                $type,
                $title,
                $options ? json_encode($options) : null,
                $required,
                $orderIndex
            ]
        );
        
        // Update survey questions_data
        updateSurveyQuestionsData($surveyId);
        
        return [
            'message' => 'Question created successfully',
            'question_id' => $result['last_insert_id']
        ];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to create question: ' . $e->getMessage()];
    }
}

function handleUpdateQuestion($questionId, $input, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if question exists and user has permission
    $question = queryOne(
        'SELECT q.*, s.created_by FROM questions q 
         JOIN surveys s ON q.survey_id = s.id 
         WHERE q.id = ? AND q.is_deleted = 0',
        [$questionId]
    );
    
    if (!$question) {
        http_response_code(404);
        return ['error' => 'Question not found'];
    }
    
    if ($user['role'] === 'user' && $question['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    $type = $input['type'] ?? $question['type'];
    $title = $input['title'] ?? $question['title'];
    $options = $input['options'] ?? null;
    $required = $input['required'] ?? $question['required'];
    $orderIndex = $input['order_index'] ?? $question['order_index'];
    
    if (empty($title)) {
        http_response_code(400);
        return ['error' => 'Question title is required'];
    }
    
    try {
        query(
            'UPDATE questions 
             SET type = ?, title = ?, options = ?, required = ?, order_index = ?, updated_at = NOW()
             WHERE id = ?',
            [
                $type,
                $title,
                $options ? json_encode($options) : null,
                $required,
                $orderIndex,
                $questionId
            ]
        );
        
        // Update survey questions_data
        updateSurveyQuestionsData($question['survey_id']);
        
        return ['message' => 'Question updated successfully'];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to update question: ' . $e->getMessage()];
    }
}

function handleDeleteQuestion($questionId, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if question exists and user has permission
    $question = queryOne(
        'SELECT q.*, s.created_by FROM questions q 
         JOIN surveys s ON q.survey_id = s.id 
         WHERE q.id = ? AND q.is_deleted = 0',
        [$questionId]
    );
    
    if (!$question) {
        http_response_code(404);
        return ['error' => 'Question not found'];
    }
    
    if ($user['role'] === 'user' && $question['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    try {
        // Soft delete question
        query(
            'UPDATE questions SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
            [$questionId]
        );
        
        // Update survey questions_data
        updateSurveyQuestionsData($question['survey_id']);
        
        return ['message' => 'Question deleted successfully'];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to delete question: ' . $e->getMessage()];
    }
}

function updateSurveyQuestionsData($surveyId) {
    // Get all questions for this survey
    $questions = query(
        'SELECT id, type, title, options, required, order_index 
         FROM questions 
         WHERE survey_id = ? AND is_deleted = 0 
         ORDER BY order_index',
        [$surveyId]
    );
    
    // Update survey questions_data
    $questionsData = json_encode($questions);
    query(
        'UPDATE surveys SET questions_data = ?, updated_at = NOW() WHERE id = ?',
        [$questionsData, $surveyId]
    );
}
?>
