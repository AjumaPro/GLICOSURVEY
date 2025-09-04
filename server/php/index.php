<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';
require_once 'config/cors.php';
require_once 'middleware/auth.php';
require_once 'routes/auth.php';
require_once 'routes/surveys.php';
require_once 'routes/templates.php';
require_once 'routes/admin.php';
require_once 'routes/analytics.php';
require_once 'routes/upload.php';
require_once 'routes/responses.php';
require_once 'routes/questions.php';
require_once 'routes/public.php';
require_once 'routes/tasks.php';
require_once 'routes/users.php';

// Get the request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api/', '', $path);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get request body
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// Get headers
$headers = getallheaders();
$authorization = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Route the request
try {
    $response = routeRequest($path, $method, $input, $authorization);
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function routeRequest($path, $method, $input, $authorization) {
    global $pdo;
    
    // Health check
    if ($path === 'health' && $method === 'GET') {
        return [
            'status' => 'OK',
            'timestamp' => date('c'),
            'version' => '1.0.0',
            'environment' => getenv('NODE_ENV') ?: 'development'
        ];
    }
    
    // Auth routes
    if (strpos($path, 'auth') === 0) {
        return handleAuthRoutes($path, $method, $input, $authorization);
    }
    
    // Surveys routes
    if (strpos($path, 'surveys') === 0) {
        return handleSurveyRoutes($path, $method, $input, $authorization);
    }
    
    // Templates routes
    if (strpos($path, 'templates') === 0) {
        return handleTemplateRoutes($path, $method, $input, $authorization);
    }
    
    // Admin routes
    if (strpos($path, 'admin') === 0) {
        return handleAdminRoutes($path, $method, $input, $authorization);
    }
    
    // Analytics routes
    if (strpos($path, 'analytics') === 0) {
        return handleAnalyticsRoutes($path, $method, $input, $authorization);
    }
    
    // Upload routes
    if (strpos($path, 'upload') === 0) {
        return handleUploadRoutes($path, $method, $input, $authorization);
    }
    
    // Responses routes
    if (strpos($path, 'responses') === 0) {
        return handleResponseRoutes($path, $method, $input, $authorization);
    }
    
    // Questions routes
    if (strpos($path, 'questions') === 0) {
        return handleQuestionRoutes($path, $method, $input, $authorization);
    }
    
    // Public routes (no authentication required)
    if (strpos($path, 'public') === 0) {
        return handlePublicRoutes($path, $method, $input, $authorization);
    }
    
    // Tasks routes
    if (strpos($path, 'tasks') === 0) {
        return handleTaskRoutes($path, $method, $input, $authorization);
    }
    
    // Users routes
    if (strpos($path, 'users') === 0) {
        return handleUserRoutes($path, $method, $input, $authorization);
    }
    
    // Default response
    http_response_code(404);
    return ['error' => 'Endpoint not found'];
}
?>
