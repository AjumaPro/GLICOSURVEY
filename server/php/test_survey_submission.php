<?php
/**
 * Test Survey Submission
 * This script tests the survey submission functionality
 */

require_once 'config/database.php';

echo "🧪 Testing Survey Submission\n";
echo "============================\n\n";

// Test data
$testSurveyId = 1; // Make sure this survey exists and is public
$testSessionId = 'test_session_' . time();
$testResponses = [
    [
        'question_id' => 1,
        'response_data' => 'Test Answer 1'
    ],
    [
        'question_id' => 2,
        'response_data' => 'Test Answer 2'
    ]
];

echo "📝 Test Data:\n";
echo "Survey ID: $testSurveyId\n";
echo "Session ID: $testSessionId\n";
echo "Responses: " . json_encode($testResponses) . "\n\n";

// Check if survey exists and is public
echo "🔍 Checking survey availability...\n";
$survey = queryOne(
    'SELECT id, title, is_public, status FROM surveys WHERE id = ? AND is_deleted = 0',
    [$testSurveyId]
);

if (!$survey) {
    echo "❌ Survey not found\n";
    exit(1);
}

echo "✅ Survey found: {$survey['title']}\n";
echo "   Public: " . ($survey['is_public'] ? 'Yes' : 'No') . "\n";
echo "   Status: {$survey['status']}\n\n";

if (!$survey['is_public']) {
    echo "⚠️  Survey is not public. Making it public for testing...\n";
    query(
        'UPDATE surveys SET is_public = 1, status = "published" WHERE id = ?',
        [$testSurveyId]
    );
    echo "✅ Survey made public\n\n";
}

// Check if questions exist
echo "🔍 Checking questions...\n";
$questions = query(
    'SELECT id, title FROM questions WHERE survey_id = ? AND is_deleted = 0 ORDER BY order_index',
    [$testSurveyId]
);

if (empty($questions)) {
    echo "❌ No questions found for this survey\n";
    exit(1);
}

echo "✅ Found " . count($questions) . " questions:\n";
foreach ($questions as $question) {
    echo "   - {$question['title']} (ID: {$question['id']})\n";
}
echo "\n";

// Test submission
echo "📤 Testing survey submission...\n";
try {
    $result = transaction(function() use ($testSurveyId, $testSessionId, $testResponses) {
        // Create session record
        query(
            'INSERT INTO sessions (session_id, survey_id, user_agent, ip_address, started_at, completed_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())',
            [$testSessionId, $testSurveyId, 'Test Script', '127.0.0.1']
        );
        
        // Insert responses
        foreach ($testResponses as $response) {
            query(
                'INSERT INTO responses (survey_id, question_id, session_id, response_data, created_at) 
                 VALUES (?, ?, ?, ?, NOW())',
                [$testSurveyId, $response['question_id'], $testSessionId, json_encode($response['response_data'])]
            );
        }
        
        return true;
    });
    
    echo "✅ Survey submission successful!\n\n";
    
    // Verify data was saved
    echo "🔍 Verifying saved data...\n";
    
    // Check session
    $session = queryOne(
        'SELECT * FROM sessions WHERE session_id = ?',
        [$testSessionId]
    );
    echo "✅ Session created: {$session['session_id']}\n";
    
    // Check responses
    $responses = query(
        'SELECT * FROM responses WHERE session_id = ?',
        [$testSessionId]
    );
    echo "✅ Responses saved: " . count($responses) . " responses\n";
    
    // Display response details
    foreach ($responses as $response) {
        $question = queryOne(
            'SELECT title FROM questions WHERE id = ?',
            [$response['question_id']]
        );
        $responseData = json_decode($response['response_data'], true);
        echo "   - {$question['title']}: {$responseData}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Survey submission failed: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n🎉 Survey submission test completed successfully!\n";
echo "\n📋 Next steps:\n";
echo "1. Start the PHP server: ./start_server.sh\n";
echo "2. Test the frontend survey submission\n";
echo "3. Check the database for saved responses\n";
?>
