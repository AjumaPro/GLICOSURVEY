<?php
/**
 * Migration Script: SQLite to MySQL
 * This script helps migrate data from the existing SQLite database to MySQL
 */

require_once 'config/database.php';

echo "🔄 Starting migration from SQLite to MySQL...\n";

// Check if SQLite database exists
$sqlitePath = __DIR__ . '/../../glico_survey.db';
if (!file_exists($sqlitePath)) {
    echo "❌ SQLite database not found at: $sqlitePath\n";
    echo "Please ensure the SQLite database exists before running this migration.\n";
    exit(1);
}

try {
    // Connect to SQLite database
    $sqliteDb = new PDO("sqlite:$sqlitePath");
    $sqliteDb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connected to SQLite database\n";
    
    // Check if MySQL database is ready
    $mysqlTables = query("SHOW TABLES");
    if (empty($mysqlTables)) {
        echo "❌ MySQL database appears to be empty. Please run the setup script first.\n";
        exit(1);
    }
    echo "✅ MySQL database is ready\n";
    
    // Start migration
    echo "\n📊 Starting data migration...\n";
    
    // Migrate users
    echo "👥 Migrating users...\n";
    $sqliteUsers = $sqliteDb->query("SELECT * FROM users WHERE is_deleted = 0")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($sqliteUsers as $user) {
        // Check if user already exists
        $existingUser = queryOne("SELECT id FROM users WHERE email = ?", [$user['email']]);
        if (!$existingUser) {
            query(
                "INSERT INTO users (email, password_hash, full_name, role, created_by, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    $user['email'],
                    $user['password_hash'],
                    $user['full_name'],
                    $user['role'],
                    $user['created_by'] ?: null,
                    $user['created_at'],
                    $user['updated_at'] ?: $user['created_at']
                ]
            );
            echo "  ✅ Created user: {$user['email']}\n";
        } else {
            echo "  ⏭️  User already exists: {$user['email']}\n";
        }
    }
    
    // Migrate survey templates
    echo "\n📋 Migrating survey templates...\n";
    $sqliteTemplates = $sqliteDb->query("SELECT * FROM survey_templates WHERE is_deleted = 0")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($sqliteTemplates as $template) {
        // Check if template already exists
        $existingTemplate = queryOne("SELECT id FROM survey_templates WHERE title = ? AND created_by = ?", [$template['title'], $template['created_by']]);
        if (!$existingTemplate) {
            query(
                "INSERT INTO survey_templates (title, description, category, is_public, questions_data, created_by, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $template['title'],
                    $template['description'],
                    $template['category'],
                    $template['is_public'],
                    $template['questions_data'],
                    $template['created_by'],
                    $template['created_at'],
                    $template['updated_at'] ?: $template['created_at']
                ]
            );
            echo "  ✅ Created template: {$template['title']}\n";
        } else {
            echo "  ⏭️  Template already exists: {$template['title']}\n";
        }
    }
    
    // Migrate surveys
    echo "\n📝 Migrating surveys...\n";
    $sqliteSurveys = $sqliteDb->query("SELECT * FROM surveys WHERE is_deleted = 0")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($sqliteSurveys as $survey) {
        // Check if survey already exists
        $existingSurvey = queryOne("SELECT id FROM surveys WHERE title = ? AND created_by = ?", [$survey['title'], $survey['created_by']]);
        if (!$existingSurvey) {
            $result = query(
                "INSERT INTO surveys (title, description, is_public, questions_data, created_by, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    $survey['title'],
                    $survey['description'],
                    $survey['is_public'],
                    $survey['questions_data'],
                    $survey['created_by'],
                    $survey['created_at'],
                    $survey['updated_at'] ?: $survey['created_at']
                ]
            );
            $newSurveyId = (int)$result['last_insert_id'];
            echo "  ✅ Created survey: {$survey['title']} (ID: $newSurveyId)\n";
            
            // Migrate questions for this survey
            $surveyId = (int)$survey['id'];
            if ($surveyId > 0 && $newSurveyId > 0) {
                $sqliteQuestions = $sqliteDb->query("SELECT * FROM questions WHERE survey_id = $surveyId AND is_deleted = 0 ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
                foreach ($sqliteQuestions as $question) {
                    query(
                        "INSERT INTO questions (survey_id, type, title, options, required, order_index, created_at, updated_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            $newSurveyId,
                            $question['type'],
                            $question['title'],
                            $question['options'],
                            $question['required'],
                            $question['order_index'],
                            $question['created_at'],
                            $question['updated_at'] ?: $question['created_at']
                        ]
                    );
                }
                echo "    📝 Migrated " . count($sqliteQuestions) . " questions\n";
            }
        } else {
            echo "  ⏭️  Survey already exists: {$survey['title']}\n";
        }
    }
    
    // Migrate responses (if any)
    echo "\n📊 Migrating responses...\n";
    $sqliteResponses = $sqliteDb->query("SELECT * FROM responses WHERE is_deleted = 0")->fetchAll(PDO::FETCH_ASSOC);
    if (!empty($sqliteResponses)) {
        foreach ($sqliteResponses as $response) {
            // Note: This is a simplified migration. In production, you might want to handle
            // survey_id and question_id mapping more carefully
            try {
                query(
                    "INSERT INTO responses (survey_id, question_id, session_id, response_data, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, ?, ?)",
                    [
                        $response['survey_id'],
                        $response['question_id'],
                        $response['session_id'],
                        $response['response_data'],
                        $response['created_at'],
                        $response['updated_at'] ?: $response['created_at']
                    ]
                );
            } catch (Exception $e) {
                echo "    ⚠️  Could not migrate response: " . $e->getMessage() . "\n";
            }
        }
        echo "  ✅ Migrated " . count($sqliteResponses) . " responses\n";
    } else {
        echo "  ℹ️  No responses to migrate\n";
    }
    
    // Update questions_data in surveys with migrated questions
    echo "\n🔄 Updating survey questions data...\n";
    $surveys = query("SELECT id FROM surveys");
    foreach ($surveys as $survey) {
        $questions = query(
            "SELECT id, type, title, options, required, order_index 
             FROM questions 
             WHERE survey_id = ? AND is_deleted = 0 
             ORDER BY order_index",
            [$survey['id']]
        );
        
        if (!empty($questions)) {
            $questionsData = json_encode($questions);
            query(
                "UPDATE surveys SET questions_data = ?, updated_at = NOW() WHERE id = ?",
                [$questionsData, $survey['id']]
            );
            echo "  ✅ Updated survey ID {$survey['id']} with " . count($questions) . " questions\n";
        }
    }
    
    echo "\n🎉 Migration completed successfully!\n";
    echo "\n📋 Summary:\n";
    echo "  - Users: " . count($sqliteUsers) . " migrated\n";
    echo "  - Templates: " . count($sqliteTemplates) . " migrated\n";
    echo "  - Surveys: " . count($sqliteSurveys) . " migrated\n";
    echo "  - Responses: " . count($sqliteResponses) . " migrated\n";
    
    echo "\n🔗 Next steps:\n";
    echo "1. Test the API endpoints\n";
    echo "2. Verify data integrity\n";
    echo "3. Update frontend configuration if needed\n";
    echo "4. Start using the new MySQL backend\n";
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
