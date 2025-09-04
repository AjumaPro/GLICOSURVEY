<?php
/**
 * Setup Verification Script
 * This script verifies that the PHP backend is properly configured
 */

echo "🔍 Verifying PHP Backend Setup\n";
echo "==============================\n\n";

// 1. Check PHP version
echo "1. PHP Version Check\n";
echo "   Current PHP version: " . phpversion() . "\n";
if (version_compare(phpversion(), '8.0.0', '>=')) {
    echo "   ✅ PHP version is compatible\n";
} else {
    echo "   ❌ PHP version must be 8.0.0 or higher\n";
}
echo "\n";

// 2. Check required PHP extensions
echo "2. PHP Extensions Check\n";
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'openssl'];
foreach ($requiredExtensions as $ext) {
    if (extension_loaded($ext)) {
        echo "   ✅ $ext extension loaded\n";
    } else {
        echo "   ❌ $ext extension missing\n";
    }
}
echo "\n";

// 3. Check environment file
echo "3. Environment Configuration\n";
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    echo "   ✅ .env file exists\n";
    
    // Load environment variables
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
            putenv(trim($key) . '=' . trim($value));
        }
    }
    
    // Check required environment variables
    $requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER'];
    foreach ($requiredEnvVars as $var) {
        $value = getenv($var);
        if ($value) {
            echo "   ✅ $var is set\n";
        } else {
            echo "   ❌ $var is missing\n";
        }
    }
} else {
    echo "   ❌ .env file missing\n";
}
echo "\n";

// 4. Test database connection
echo "4. Database Connection Test\n";
try {
    require_once 'config/database.php';
    echo "   ✅ Database connection successful\n";
    
    // Test basic query
    $result = query("SELECT 1 as test");
    if ($result && $result[0]['test'] == 1) {
        echo "   ✅ Database queries working\n";
    } else {
        echo "   ❌ Database queries not working\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "\n";
    echo "   🔧 Troubleshooting:\n";
    echo "   - Check if MySQL is running\n";
    echo "   - Verify database credentials in .env\n";
    echo "   - Ensure database 'glico_survey' exists\n";
    echo "   - Check MySQL user permissions\n";
    echo "\n";
    exit(1);
}
echo "\n";

// 5. Check database tables
echo "5. Database Tables Check\n";
$requiredTables = [
    'users' => ['id', 'email', 'full_name', 'role', 'password_hash'],
    'surveys' => ['id', 'title', 'description', 'is_public', 'status', 'questions_data'],
    'questions' => ['id', 'survey_id', 'type', 'title', 'options', 'required'],
    'responses' => ['id', 'survey_id', 'question_id', 'session_id', 'response_data'],
    'sessions' => ['id', 'session_id', 'survey_id', 'started_at', 'completed_at'],
    'survey_templates' => ['id', 'title', 'description', 'category', 'is_public', 'questions_data']
];

foreach ($requiredTables as $table => $columns) {
    try {
        $result = query("SHOW TABLES LIKE ?", [$table]);
        if (!empty($result)) {
            echo "   ✅ Table '$table' exists\n";
            
            // Check columns
            $tableColumns = query("DESCRIBE $table");
            $columnNames = array_column($tableColumns, 'Field');
            
            foreach ($columns as $column) {
                if (in_array($column, $columnNames)) {
                    echo "     ✅ Column '$column' exists\n";
                } else {
                    echo "     ❌ Column '$column' missing\n";
                }
            }
        } else {
            echo "   ❌ Table '$table' missing\n";
        }
    } catch (Exception $e) {
        echo "   ❌ Error checking table '$table': " . $e->getMessage() . "\n";
    }
}
echo "\n";

// 6. Check if admin user exists
echo "6. Admin User Check\n";
try {
    $adminUser = queryOne("SELECT id, email, role FROM users WHERE email = ?", ['admin@glico.com']);
    if ($adminUser) {
        echo "   ✅ Admin user exists (ID: {$adminUser['id']}, Role: {$adminUser['role']})\n";
    } else {
        echo "   ❌ Admin user missing\n";
        echo "   🔧 Run setup_php.sh to create admin user\n";
    }
} catch (Exception $e) {
    echo "   ❌ Error checking admin user: " . $e->getMessage() . "\n";
}
echo "\n";

// 7. Test survey creation
echo "7. Survey Creation Test\n";
try {
    $testTitle = 'Test Survey ' . date('Y-m-d H:i:s');
    $testDescription = 'Test survey for verification';
    $testQuestions = [
        [
            'type' => 'text',
            'title' => 'Test Question',
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
    echo "   ✅ Test survey created (ID: $surveyId)\n";
    
    // Clean up
    query('DELETE FROM surveys WHERE id = ?', [$surveyId]);
    echo "   ✅ Test survey cleaned up\n";
    
} catch (Exception $e) {
    echo "   ❌ Survey creation failed: " . $e->getMessage() . "\n";
}
echo "\n";

// 8. Check file permissions
echo "8. File Permissions Check\n";
$directories = ['uploads', 'logs'];
foreach ($directories as $dir) {
    $path = __DIR__ . '/' . $dir;
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
        echo "   📁 Created directory '$dir'\n";
    }
    
    if (is_writable($path)) {
        echo "   ✅ Directory '$dir' is writable\n";
    } else {
        echo "   ❌ Directory '$dir' is not writable\n";
    }
}
echo "\n";

echo "🎉 Setup verification completed!\n";
echo "\n📋 Summary:\n";
echo "If you see any ❌ errors above, please fix them before proceeding.\n";
echo "If everything shows ✅, your PHP backend is ready to use!\n";
echo "\n🚀 Next steps:\n";
echo "1. Start the PHP server: ./start_server.sh\n";
echo "2. Test the frontend with the new backend\n";
echo "3. Create and save surveys\n";
?>
