<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleAnalyticsRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('analytics/', '', $path);
    
    switch ($method) {
        case 'GET':
            if (empty($subPath)) {
                return handleGetAnalytics($authorization);
            } elseif ($subPath === 'dashboard') {
                return handleGetDashboard($authorization);
            } elseif (is_numeric($subPath)) {
                return handleGetSurveyAnalytics($subPath, $authorization);
            }
            break;
    }
    
    http_response_code(404);
    return ['error' => 'Analytics endpoint not found'];
}

function handleGetAnalytics($authorization) {
    $user = requireAuth($authorization);
    
    // Get basic analytics
    $totalSurveys = queryOne(
        'SELECT COUNT(*) as count FROM surveys WHERE is_deleted = 0',
        []
    )['count'];
    
    $totalResponses = queryOne(
        'SELECT COUNT(*) as count FROM responses WHERE is_deleted = 0',
        []
    )['count'];
    
    $totalUsers = queryOne(
        'SELECT COUNT(*) as count FROM users WHERE is_deleted = 0',
        []
    )['count'];
    
    // Filter by user role
    if ($user['role'] === 'user') {
        $userSurveys = queryOne(
            'SELECT COUNT(*) as count FROM surveys WHERE created_by = ? AND is_deleted = 0',
            [$user['id']]
        )['count'];
        
        $userResponses = queryOne(
            'SELECT COUNT(*) as count FROM responses WHERE survey_id IN (SELECT id FROM surveys WHERE created_by = ? AND is_deleted = 0) AND is_deleted = 0',
            [$user['id']]
        )['count'];
    } else {
        $userSurveys = $totalSurveys;
        $userResponses = $totalResponses;
    }
    
    return [
        'total_surveys' => $totalSurveys,
        'total_responses' => $totalResponses,
        'total_users' => $totalUsers,
        'user_surveys' => $userSurveys,
        'user_responses' => $userResponses
    ];
}

function handleGetDashboard($authorization) {
    $user = requireAuth($authorization);
    
    // Get recent surveys
    $recentSurveysSql = 'SELECT s.*, COUNT(r.id) as response_count 
                         FROM surveys s 
                         LEFT JOIN responses r ON s.id = r.survey_id AND r.is_deleted = 0
                         WHERE s.is_deleted = 0';
    
    $recentSurveysParams = [];
    
    if ($user['role'] === 'user') {
        $recentSurveysSql .= ' AND s.created_by = ?';
        $recentSurveysParams[] = $user['id'];
    }
    
    $recentSurveysSql .= ' GROUP BY s.id ORDER BY s.created_at DESC LIMIT 5';
    
    $recentSurveys = query($recentSurveysSql, $recentSurveysParams);
    
    // Get response trends (last 7 days)
    $responseTrendsSql = 'SELECT DATE(r.created_at) as date, COUNT(*) as count 
                          FROM responses r 
                          JOIN surveys s ON r.survey_id = s.id 
                          WHERE r.is_deleted = 0 AND r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    
    $responseTrendsParams = [];
    
    if ($user['role'] === 'user') {
        $responseTrendsSql .= ' AND s.created_by = ?';
        $responseTrendsParams[] = $user['id'];
    }
    
    $responseTrendsSql .= ' GROUP BY DATE(r.created_at) ORDER BY date';
    
    $responseTrends = query($responseTrendsSql, $responseTrendsParams);
    
    // Get top performing surveys
    $topSurveysSql = 'SELECT s.title, COUNT(r.id) as response_count 
                       FROM surveys s 
                       LEFT JOIN responses r ON s.id = r.survey_id AND r.is_deleted = 0
                       WHERE s.is_deleted = 0';
    
    $topSurveysParams = [];
    
    if ($user['role'] === 'user') {
        $topSurveysSql .= ' AND s.created_by = ?';
        $topSurveysParams[] = $user['id'];
    }
    
    $topSurveysSql .= ' GROUP BY s.id ORDER BY response_count DESC LIMIT 5';
    
    $topSurveys = query($topSurveysSql, $topSurveysParams);
    
    return [
        'recent_surveys' => $recentSurveys,
        'response_trends' => $responseTrends,
        'top_surveys' => $topSurveys
    ];
}

function handleGetSurveyAnalytics($surveyId, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if survey exists and user has permission
    $survey = queryOne(
        'SELECT * FROM surveys WHERE id = ? AND is_deleted = 0',
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
    
    // Get response count
    $responseCount = queryOne(
        'SELECT COUNT(*) as count FROM responses WHERE survey_id = ? AND is_deleted = 0',
        [$surveyId]
    )['count'];
    
    // Get completion rate
    $totalStarted = queryOne(
        'SELECT COUNT(DISTINCT session_id) as count FROM responses WHERE survey_id = ? AND is_deleted = 0',
        [$surveyId]
    )['count'];
    
    $completedSessions = queryOne(
        'SELECT COUNT(DISTINCT session_id) as count FROM responses r 
         JOIN surveys s ON r.survey_id = s.id 
         WHERE r.survey_id = ? AND r.is_deleted = 0 
         GROUP BY r.session_id 
         HAVING COUNT(*) >= (SELECT COUNT(*) FROM questions WHERE survey_id = ? AND is_deleted = 0)',
        [$surveyId, $surveyId]
    );
    
    $completionRate = $totalStarted > 0 ? ($completedSessions ? $completedSessions['count'] : 0) / $totalStarted * 100 : 0;
    
    // Get question analytics
    $questions = query(
        'SELECT id, type, title FROM questions WHERE survey_id = ? AND is_deleted = 0 ORDER BY order_index',
        [$surveyId]
    );
    
    $questionAnalytics = [];
    foreach ($questions as $question) {
        $responses = query(
            'SELECT response_data FROM responses WHERE survey_id = ? AND question_id = ? AND is_deleted = 0',
            [$surveyId, $question['id']]
        );
        
        $analytics = analyzeQuestionResponses($question, $responses);
        $questionAnalytics[] = [
            'question' => $question,
            'analytics' => $analytics
        ];
    }
    
    // Get response trends
    $responseTrends = query(
        'SELECT DATE(created_at) as date, COUNT(*) as count 
         FROM responses 
         WHERE survey_id = ? AND is_deleted = 0 
         GROUP BY DATE(created_at) 
         ORDER BY date DESC 
         LIMIT 30',
        [$surveyId]
    );
    
    return [
        'survey' => $survey,
        'response_count' => $responseCount,
        'completion_rate' => round($completionRate, 2),
        'question_analytics' => $questionAnalytics,
        'response_trends' => $responseTrends
    ];
}

function analyzeQuestionResponses($question, $responses) {
    $analytics = [
        'total_responses' => count($responses),
        'response_distribution' => [],
        'average_rating' => 0,
        'text_responses' => []
    ];
    
    if (empty($responses)) {
        return $analytics;
    }
    
    switch ($question['type']) {
        case 'multiple_choice':
            $options = json_decode($question['options'] ?? '[]', true);
            $distribution = array_fill_keys($options, 0);
            
            foreach ($responses as $response) {
                $responseData = json_decode($response['response_data'], true);
                $answer = $responseData['answer'] ?? '';
                if (in_array($answer, $options)) {
                    $distribution[$answer]++;
                }
            }
            
            $analytics['response_distribution'] = $distribution;
            break;
            
        case 'emoji_scale':
        case 'likert_scale':
            $ratings = [];
            foreach ($responses as $response) {
                $responseData = json_decode($response['response_data'], true);
                $rating = $responseData['rating'] ?? 0;
                if (is_numeric($rating)) {
                    $ratings[] = $rating;
                }
            }
            
            if (!empty($ratings)) {
                $analytics['average_rating'] = round(array_sum($ratings) / count($ratings), 2);
                $analytics['response_distribution'] = array_count_values($ratings);
            }
            break;
            
        case 'text':
            foreach ($responses as $response) {
                $responseData = json_decode($response['response_data'], true);
                $text = $responseData['answer'] ?? '';
                if (!empty($text)) {
                    $analytics['text_responses'][] = $text;
                }
            }
            break;
    }
    
    return $analytics;
}
?>
