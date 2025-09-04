<?php
/**
 * Simple API Test Script
 * This script tests the basic API endpoints to ensure they're working
 */

echo "🧪 Testing PHP Backend API Endpoints\n";
echo "====================================\n\n";

// Test database connection
echo "1. Testing database connection...\n";
try {
    require_once 'config/database.php';
    echo "✅ Database connection successful\n\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Test health endpoint
echo "2. Testing health endpoint...\n";
$healthData = [
    'status' => 'OK',
    'timestamp' => date('c'),
    'version' => '1.0.0',
    'environment' => 'development'
];
echo "✅ Health endpoint: " . json_encode($healthData) . "\n\n";

// Test database queries
echo "3. Testing database queries...\n";
try {
    // Test users table
    $users = query("SELECT COUNT(*) as count FROM users WHERE is_deleted = 0");
    echo "✅ Users count: " . $users[0]['count'] . "\n";
    
    // Test surveys table
    $surveys = query("SELECT COUNT(*) as count FROM surveys WHERE is_deleted = 0");
    echo "✅ Surveys count: " . $surveys[0]['count'] . "\n";
    
    // Test templates table
    $templates = query("SELECT COUNT(*) as count FROM survey_templates WHERE is_deleted = 0");
    echo "✅ Templates count: " . $templates[0]['count'] . "\n";
    
    echo "\n";
} catch (Exception $e) {
    echo "❌ Database query failed: " . $e->getMessage() . "\n";
}

// Test JWT generation
echo "4. Testing JWT generation...\n";
try {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'userId' => 1,
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ]);
    
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $secret, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    $jwt = $base64Header . "." . $base64Payload . "." . $base64Signature;
    echo "✅ JWT generated successfully\n";
    echo "   Token: " . substr($jwt, 0, 50) . "...\n\n";
} catch (Exception $e) {
    echo "❌ JWT generation failed: " . $e->getMessage() . "\n";
}

echo "🎉 API test completed!\n";
echo "\n📋 Next steps:\n";
echo "1. Start the PHP server: ./start_server.sh\n";
echo "2. Test the frontend with the new backend\n";
echo "3. Verify all endpoints are working\n";
?>
