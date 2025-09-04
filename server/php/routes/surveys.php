<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleSurveyRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('surveys/', '', $path);
    
    switch ($method) {
        case 'GET':
            if (empty($subPath)) {
                return handleGetSurveys($authorization);
            } else {
                return handleGetSurvey($subPath, $authorization);
            }
            break;
            
        case 'POST':
            if (empty($subPath)) {
                return handleCreateSurvey($input, $authorization);
            }
            break;
            
        case 'PUT':
            if (is_numeric($subPath)) {
                return handleUpdateSurvey($subPath, $input, $authorization);
            }
            break;
            
        case 'DELETE':
            if (is_numeric($subPath)) {
                return handleDeleteSurvey($subPath, $authorization);
            }
            break;
    }
    
    // Handle special endpoints
    if (strpos($subPath, '/publish') !== false) {
        $surveyId = str_replace('/publish', '', $subPath);
        return handlePublishSurvey($surveyId, $authorization);
    }
    
    if (strpos($subPath, '/unpublish') !== false) {
        $surveyId = str_replace('/unpublish', '', $subPath);
        return handleUnpublishSurvey($surveyId, $authorization);
    }
    
    if (strpos($subPath, '/duplicate') !== false) {
        $surveyId = str_replace('/duplicate', '', $subPath);
        return handleDuplicateSurvey($surveyId, $authorization);
    }
    
    if (strpos($subPath, '/copy') !== false) {
        $surveyId = str_replace('/copy', '', $subPath);
        return handleCopySurvey($surveyId, $authorization);
    }
    
    http_response_code(404);
    return ['error' => 'Survey endpoint not found'];
}

function handleGetSurveys($authorization) {
    $user = requireAuth($authorization);
    
    $sql = 'SELECT s.*, u.full_name as creator_name 
            FROM surveys s 
            LEFT JOIN users u ON s.created_by = u.id 
            WHERE s.is_deleted = 0';
    
    $params = [];
    
    // Filter by user role
    if ($user['role'] === 'user') {
        $sql .= ' AND s.created_by = ?';
        $params[] = $user['id'];
    } elseif ($user['role'] === 'admin') {
        $sql .= ' AND (s.created_by = ? OR s.is_public = 1)';
        $params[] = $user['id'];
    }
    
    $sql .= ' ORDER BY s.created_at DESC';
    
    $surveys = query($sql, $params);
    
    // Transform data to match frontend expectations
    foreach ($surveys as &$survey) {
        $survey['questions_data'] = json_decode($survey['questions_data'], true);
        $survey['created_at'] = $survey['created_at'];
        $survey['updated_at'] = $survey['updated_at'];
    }
    
    return $surveys;
}

function handleGetSurvey($surveyId, $authorization) {
    $user = requireAuth($authorization);
    
    $survey = queryOne(
        'SELECT s.*, u.full_name as creator_name 
         FROM surveys s 
         LEFT JOIN users u ON s.created_by = u.id 
         WHERE s.id = ? AND s.is_deleted = 0',
        [$surveyId]
    );
    
    if (!$survey) {
        http_response_code(404);
        return ['error' => 'Survey not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user' && $survey['created_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
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

function handleCreateSurvey($input, $authorization) {
    $user = requireAuth($authorization);
    
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $isPublic = $input['is_public'] ?? 0;
    $questions = $input['questions'] ?? [];
    
    if (empty($title)) {
        http_response_code(400);
        return ['error' => 'Survey title is required'];
    }
    
    try {
        $result = transaction(function() use ($user, $title, $description, $isPublic, $questions) {
            // Create survey
            $surveyResult = query(
                'INSERT INTO surveys (title, description, is_public, status, created_by, created_at, updated_at, questions_data) 
                 VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)',
                [$title, $description, $isPublic, 'draft', $user['id'], json_encode($questions)]
            );
            
            $surveyId = $surveyResult['last_insert_id'];
            
            // Create questions
            foreach ($questions as $index => $question) {
                $options = isset($question['options']) ? json_encode($question['options']) : null;
                
                query(
                    'INSERT INTO questions (survey_id, type, title, options, required, order_index, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW())',
                    [
                        $surveyId,
                        $question['type'],
                        $question['title'],
                        $options,
                        $question['required'] ?? 0,
                        $index + 1
                    ]
                );
            }
            
            return $surveyId;
        });
        
        return [
            'message' => 'Survey created successfully',
            'survey_id' => $result
        ];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to create survey: ' . $e->getMessage()];
    }
}

function handleUpdateSurvey($surveyId, $input, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if survey exists and user has permission
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
    
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $isPublic = $input['is_public'] ?? 0;
    $questions = $input['questions'] ?? [];
    
    if (empty($title)) {
        http_response_code(400);
        return ['error' => 'Survey title is required'];
    }
    
    try {
        transaction(function() use ($surveyId, $title, $description, $isPublic, $questions) {
            // Update survey
            query(
                'UPDATE surveys 
                 SET title = ?, description = ?, is_public = ?, updated_at = NOW(), questions_data = ?
                 WHERE id = ?',
                [$title, $description, $isPublic, json_encode($questions), $surveyId]
            );
            
            // Delete existing questions
            query('DELETE FROM questions WHERE survey_id = ?', [$surveyId]);
            
            // Create new questions
            foreach ($questions as $index => $question) {
                $options = isset($question['options']) ? json_encode($question['options']) : null;
                
                query(
                    'INSERT INTO questions (survey_id, type, title, options, required, order_index, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW())',
                    [
                        $surveyId,
                        $question['type'],
                        $question['title'],
                        $options,
                        $question['required'] ?? 0,
                        $index + 1
                    ]
                );
            }
        });
        
        return ['message' => 'Survey updated successfully'];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to update survey: ' . $e->getMessage()];
    }
}

function handleDeleteSurvey($surveyId, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if survey exists and user has permission
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
    
    // Soft delete survey
    query(
        'UPDATE surveys SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
        [$surveyId]
    );
    
    // Soft delete questions
    query(
        'UPDATE questions SET is_deleted = 1 WHERE survey_id = ?',
        [$surveyId]
    );
    
    return ['message' => 'Survey deleted successfully'];
}

function handlePublishSurvey($surveyId, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if survey exists and user has permission
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
    
    // Check if survey has questions
    $questions = query(
        'SELECT COUNT(*) as count FROM questions WHERE survey_id = ? AND is_deleted = 0',
        [$surveyId]
    );
    
    if ($questions[0]['count'] == 0) {
        http_response_code(400);
        return ['error' => 'Cannot publish survey without questions'];
    }
    
    try {
        // Publish the survey
        query(
            'UPDATE surveys SET is_public = 1, status = "published", updated_at = NOW() WHERE id = ?',
            [$surveyId]
        );
        
        return ['message' => 'Survey published successfully'];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to publish survey: ' . $e->getMessage()];
    }
}

function handleUnpublishSurvey($surveyId, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if survey exists and user has permission
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
    
    try {
        // Unpublish the survey
        query(
            'UPDATE surveys SET is_public = 0, status = "draft", updated_at = NOW() WHERE id = ?',
            [$surveyId]
        );
        
        return ['message' => 'Survey unpublished successfully'];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to unpublish survey: ' . $e->getMessage()];
    }
}

function handleDuplicateSurvey($surveyId, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if survey exists and user has permission
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
    
    try {
        $result = transaction(function() use ($user, $survey) {
            // Create duplicate survey
            $duplicateResult = query(
                'INSERT INTO surveys (title, description, is_public, questions_data, created_by, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())',
                [
                    $survey['title'] . ' (Copy)',
                    $survey['description'],
                    0, // Start as unpublished
                    $survey['questions_data'],
                    $user['id']
                ]
            );
            
            $newSurveyId = $duplicateResult['last_insert_id'];
            
            // Duplicate questions
            $questions = query(
                'SELECT * FROM questions WHERE survey_id = ? AND is_deleted = 0 ORDER BY order_index',
                [$survey['id']]
            );
            
            foreach ($questions as $question) {
                query(
                    'INSERT INTO questions (survey_id, type, title, options, required, order_index, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW())',
                    [
                        $newSurveyId,
                        $question['type'],
                        $question['title'],
                        $question['options'],
                        $question['required'],
                        $question['order_index']
                    ]
                );
            }
            
            return $newSurveyId;
        });
        
        return [
            'message' => 'Survey duplicated successfully',
            'survey_id' => $result
        ];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to duplicate survey: ' . $e->getMessage()];
    }
}

function handleCopySurvey($surveyId, $authorization) {
    // This is an alias for duplicate survey
    return handleDuplicateSurvey($surveyId, $authorization);
}
?>
