<?php
// Public routes that don't require authentication

function handlePublicRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('public/', '', $path);
    
    switch ($method) {
        case 'GET':
            if ($subPath === 'surveys') {
                return handleGetPublicSurveys();
            } elseif (strpos($subPath, 'surveys/') === 0) {
                $surveyId = str_replace('surveys/', '', $subPath);
                return handleGetPublicSurvey($surveyId);
            } elseif (strpos($subPath, 'surveys/') === 0 && strpos($subPath, '/status') !== false) {
                $surveyId = str_replace(['surveys/', '/status'], '', $subPath);
                return handleGetSurveyStatus($surveyId);
            }
            break;
            
        case 'POST':
            if (strpos($subPath, 'surveys/') === 0 && strpos($subPath, '/submit') !== false) {
                $surveyId = str_replace(['surveys/', '/submit'], '', $subPath);
                return handleSubmitPublicSurvey($surveyId, $input);
            }
            break;
    }
    
    http_response_code(404);
    return ['error' => 'Public endpoint not found'];
}

function handleGetPublicSurveys() {
    // Get only public surveys
    $surveys = query(
        'SELECT s.*, u.full_name as creator_name 
         FROM surveys s 
         LEFT JOIN users u ON s.created_by = u.id 
         WHERE s.is_deleted = 0 AND s.is_public = 1 AND s.status = "published"
         ORDER BY s.created_at DESC'
    );
    
    // Transform data to match frontend expectations
    foreach ($surveys as &$survey) {
        $survey['questions_data'] = json_decode($survey['questions_data'], true);
        $survey['created_at'] = $survey['created_at'];
        $survey['updated_at'] = $survey['updated_at'];
    }
    
    return $surveys;
}

function handleGetPublicSurvey($surveyId) {
    // Get public survey with questions
    $survey = queryOne(
        'SELECT s.*, u.full_name as creator_name 
         FROM surveys s 
         LEFT JOIN users u ON s.created_by = u.id 
         WHERE s.id = ? AND s.is_deleted = 0 AND s.is_public = 1',
        [$surveyId]
    );
    
    if (!$survey) {
        http_response_code(404);
        return ['error' => 'Survey not found or not public'];
    }
    
    // Get questions for this survey
    $questions = query(
        'SELECT id, type, title, options, required, order_index 
         FROM questions 
         WHERE survey_id = ? AND is_deleted = 0 
         ORDER BY order_index ASC',
        [$surveyId]
    );
    
    // Transform questions to match frontend expectations
    foreach ($questions as &$question) {
        if ($question['options']) {
            $question['options'] = json_decode($question['options'], true);
        }
        // Map question_type to type and question_text to title
        $question['question_type'] = $question['type'];
        $question['question_text'] = $question['title'];
    }
    
    $survey['questions'] = $questions;
    $survey['questions_data'] = json_decode($survey['questions_data'], true);
    
    return $survey;
}

function handleSubmitPublicSurvey($surveyId, $input) {
    // Validate input
    $sessionId = $input['session_id'] ?? null;
    $responses = $input['responses'] ?? [];
    
    if (!$sessionId || empty($responses)) {
        http_response_code(400);
        return ['error' => 'Session ID and responses are required'];
    }
    
    // Check if survey exists and is public
    $survey = queryOne(
        'SELECT * FROM surveys WHERE id = ? AND is_deleted = 0 AND is_public = 1 AND status = "published"',
        [$surveyId]
    );
    
    if (!$survey) {
        http_response_code(404);
        return ['error' => 'Survey not found or not public'];
    }
    
    // Validate responses structure
    if (!is_array($responses)) {
        http_response_code(400);
        return ['error' => 'Responses must be an array'];
    }
    
    try {
        // Start transaction
        transaction(function() use ($surveyId, $sessionId, $responses) {
            // Create or update session record
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
            
            // Check if session already exists
            $existingSession = queryOne(
                'SELECT id FROM sessions WHERE session_id = ?',
                [$sessionId]
            );
            
            if (!$existingSession) {
                // Create new session
                query(
                    'INSERT INTO sessions (session_id, survey_id, user_agent, ip_address, started_at, completed_at) 
                     VALUES (?, ?, ?, ?, NOW(), NOW())',
                    [$sessionId, $surveyId, $userAgent, $ipAddress]
                );
            } else {
                // Update existing session completion time
                query(
                    'UPDATE sessions SET completed_at = NOW() WHERE session_id = ?',
                    [$sessionId]
                );
            }
            
            foreach ($responses as $response) {
                $questionId = $response['question_id'] ?? null;
                $responseData = $response['response_data'] ?? null;
                
                if (!$questionId || !$responseData) {
                    throw new Exception('Invalid response data');
                }
                
                // Check if question exists and belongs to this survey
                $question = queryOne(
                    'SELECT * FROM questions WHERE id = ? AND survey_id = ? AND is_deleted = 0',
                    [$questionId, $surveyId]
                );
                
                if (!$question) {
                    throw new Exception('Question not found');
                }
                
                // Insert response
                query(
                    'INSERT INTO responses (survey_id, question_id, session_id, response_data, created_at) 
                     VALUES (?, ?, ?, ?, NOW())',
                    [$surveyId, $questionId, $sessionId, json_encode($responseData)]
                );
            }
        });
        
        return [
            'message' => 'Survey submitted successfully',
            'session_id' => $sessionId
        ];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to submit survey: ' . $e->getMessage()];
    }
}

function handleGetSurveyStatus($surveyId) {
    // Check if survey exists and is accessible
    $survey = queryOne(
        'SELECT id, title, is_public, status FROM surveys WHERE id = ? AND is_deleted = 0',
        [$surveyId]
    );
    
    if (!$survey) {
        http_response_code(404);
        return ['error' => 'Survey not found'];
    }
    
    $isAccessible = $survey['is_public'] && $survey['status'] === 'published';
    
    return [
        'survey_id' => $surveyId,
        'title' => $survey['title'],
        'is_public' => (bool)$survey['is_public'],
        'status' => $survey['status'],
        'accessible' => $isAccessible,
        'message' => $isAccessible ? 'Survey is accessible' : 'Survey is not accessible'
    ];
}
?>
