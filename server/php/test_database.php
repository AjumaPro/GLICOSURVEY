<?php
/**
 * Database Test Script
 * This script tests database connectivity and table structure
 */

echo "🧪 Testing Database Connectivity and Structure\n";
echo "=============================================\n\n";

// Test database connection
echo "1. Testing database connection...\n";
try {
    require_once 'config/database.php';
    echo "✅ Database connection successful\n\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Test table existence
echo "2. Testing table existence...\n";
$tables = ['users', 'surveys', 'questions', 'responses', 'sessions', 'survey_templates'];
foreach ($tables as $table) {
    try {
        $result = query("SHOW TABLES LIKE ?", [$table]);
        if (!empty($result)) {
            echo "✅ Table '$table' exists\n";
        } else {
            echo "❌ Table '$table' missing\n";
        }
    } catch (Exception $e) {
        echo "❌ Error checking table '$table': " . $e->getMessage() . "\n";
    }
}
echo "\n";

// Test surveys table structure
echo "3. Testing surveys table structure...\n";
try {
    $columns = query("DESCRIBE surveys");
    echo "✅ Surveys table columns:\n";
    foreach ($columns as $column) {
        echo "   - {$column['Field']}: {$column['Type']} {$column['Null']} {$column['Key']} {$column['Default']}\n";
    }
    echo "\n";
} catch (Exception $e) {
    echo "❌ Error checking surveys table structure: " . $e->getMessage() . "\n";
}

// Test inserting a survey
echo "4. Testing survey creation...\n";
try {
    $testTitle = 'Test Survey ' . date('Y-m-d H:i:s');
    $testDescription = 'This is a test survey created by the test script';
    $testQuestions = [
        [
            'type' => 'text',
            'title' => 'Test Question 1',
            'required' => true,
            'options' => null
        ]
    ];
    
    $result = query(
        'INSERT INTO surveys (title, description, is_public, status, created_by, created_at, updated_at, questions_data) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)',
        [$testTitle, $testDescription, 0, 'draft', 1, json_encode($testQuestions)]
    );
    
    $surveyId = $result['last_insert_id'];
    echo "✅ Test survey created with ID: $surveyId\n";
    
    // Verify the survey was created
    $createdSurvey = queryOne(
        'SELECT id, title, description, is_public, status FROM surveys WHERE id = ?',
        [$surveyId]
    );
    
    if ($createdSurvey) {
        echo "✅ Survey verified in database:\n";
        echo "   - ID: {$createdSurvey['id']}\n";
        echo "   - Title: {$createdSurvey['title']}\n";
        echo "   - Description: {$createdSurvey['description']}\n";
        echo "   - Public: " . ($createdSurvey['is_public'] ? 'Yes' : 'No') . "\n";
        echo "   - Status: {$createdSurvey['status']}\n";
    } else {
        echo "❌ Survey not found after creation\n";
    }
    
    // Clean up test data
    query('DELETE FROM surveys WHERE id = ?', [$surveyId]);
    echo "✅ Test survey cleaned up\n";
    
} catch (Exception $e) {
    echo "❌ Error creating test survey: " . $e->getMessage() . "\n";
    echo "   Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n🎉 Database test completed!\n";
?>
