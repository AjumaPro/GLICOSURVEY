<?php
/**
 * Glico Survey Plugin Installation Script
 * 
 * This script helps with the installation and setup of the Glico Survey plugin
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Check if WordPress functions are available
if (!function_exists('flush_rewrite_rules') || !function_exists('get_option')) {
    return;
}

class GlicoSurveyInstaller {
    
    public static function install() {
        // Create database tables
        self::createTables();
        
        // Set default options
        self::setDefaultOptions();
        
        // Create default admin user if needed
        self::createDefaultAdmin();
        
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Log installation
        error_log('Glico Survey Plugin installed successfully');
    }
    
    public static function uninstall() {
        // Remove database tables (optional - uncomment if you want to remove data on uninstall)
        // self::removeTables();
        
        // Remove options
        self::removeOptions();
        
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Log uninstallation
        error_log('Glico Survey Plugin uninstalled');
    }
    
    private static function createTables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Surveys table
        $surveys_table = $wpdb->prefix . 'glico_surveys';
        $surveys_sql = "CREATE TABLE $surveys_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text,
            status enum('draft','published','archived') DEFAULT 'draft',
            settings longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_by int(11) NOT NULL,
            PRIMARY KEY (id),
            KEY created_by (created_by),
            KEY status (status)
        ) $charset_collate;";
        
        // Questions table
        $questions_table = $wpdb->prefix . 'glico_questions';
        $questions_sql = "CREATE TABLE $questions_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            survey_id int(11) NOT NULL,
            title text NOT NULL,
            type enum('text','textarea','radio','checkbox','select','rating','emoji_scale','custom_emoji_scale') NOT NULL,
            options longtext,
            required tinyint(1) DEFAULT 0,
            order_index int(11) DEFAULT 0,
            settings longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY survey_id (survey_id),
            KEY order_index (order_index)
        ) $charset_collate;";
        
        // Responses table
        $responses_table = $wpdb->prefix . 'glico_responses';
        $responses_sql = "CREATE TABLE $responses_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            survey_id int(11) NOT NULL,
            question_id int(11) NOT NULL,
            response_value longtext,
            user_ip varchar(45),
            user_agent text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY survey_id (survey_id),
            KEY question_id (question_id),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        // Response sessions table
        $sessions_table = $wpdb->prefix . 'glico_response_sessions';
        $sessions_sql = "CREATE TABLE $sessions_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            survey_id int(11) NOT NULL,
            session_id varchar(255) NOT NULL,
            user_ip varchar(45),
            user_agent text,
            completed tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            completed_at datetime NULL,
            PRIMARY KEY (id),
            UNIQUE KEY session_id (session_id),
            KEY survey_id (survey_id),
            KEY completed (completed)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($surveys_sql);
        dbDelta($questions_sql);
        dbDelta($responses_sql);
        dbDelta($sessions_sql);
    }
    
    private static function setDefaultOptions() {
        $default_options = array(
            'glico_survey_version' => '1.0.0',
            'glico_survey_settings' => array(
                'enable_analytics' => true,
                'enable_export' => true,
                'default_emoji_scale' => 'happy_sad',
                'allow_anonymous' => true,
                'require_login' => false,
                'max_responses_per_ip' => 0,
                'response_timeout' => 3600,
                'theme_primary_color' => '#3b82f6',
                'theme_secondary_color' => '#64748b',
                'theme_success_color' => '#10b981',
                'theme_warning_color' => '#f59e0b',
                'theme_error_color' => '#ef4444'
            )
        );
        
        foreach ($default_options as $option_name => $option_value) {
            if (get_option($option_name) === false) {
                add_option($option_name, $option_value);
            }
        }
    }
    
    private static function createDefaultAdmin() {
        // Check if we need to create a default admin user
        $admin_users = get_users(array('role' => 'administrator'));
        
        if (empty($admin_users)) {
            // Create a default admin user for the survey system
            $admin_email = get_option('admin_email');
            $admin_username = 'glico_admin';
            $admin_password = wp_generate_password(12, true, true);
            
            $user_id = wp_create_user($admin_username, $admin_password, $admin_email);
            
            if (!is_wp_error($user_id)) {
                $user = new WP_User($user_id);
                $user->set_role('administrator');
                
                // Send admin credentials via email
                wp_mail(
                    $admin_email,
                    'Glico Survey Admin Account Created',
                    "Your Glico Survey admin account has been created:\n\nUsername: $admin_username\nPassword: $admin_password\n\nPlease log in and change your password immediately."
                );
            }
        }
    }
    
    private static function removeTables() {
        global $wpdb;
        
        $tables = array(
            $wpdb->prefix . 'glico_surveys',
            $wpdb->prefix . 'glico_questions',
            $wpdb->prefix . 'glico_responses',
            $wpdb->prefix . 'glico_response_sessions'
        );
        
        foreach ($tables as $table) {
            $wpdb->query("DROP TABLE IF EXISTS $table");
        }
    }
    
    private static function removeOptions() {
        $options = array(
            'glico_survey_version',
            'glico_survey_settings'
        );
        
        foreach ($options as $option) {
            delete_option($option);
        }
    }
    
    public static function createSampleSurvey() {
        $database = new \GlicoSurvey\Core\Database();
        
        // Create sample survey
        $survey_id = $database->createSurvey(array(
            'title' => 'Customer Satisfaction Survey',
            'description' => 'Help us improve our service by sharing your feedback',
            'status' => 'published',
            'settings' => array(
                'show_progress' => true,
                'allow_back' => true,
                'auto_save' => true
            )
        ));
        
        if ($survey_id) {
            // Add sample questions
            $questions = array(
                array(
                    'survey_id' => $survey_id,
                    'title' => 'How would you rate our overall service?',
                    'type' => 'emoji_scale',
                    'required' => 1,
                    'order_index' => 0
                ),
                array(
                    'survey_id' => $survey_id,
                    'title' => 'What is your age range?',
                    'type' => 'radio',
                    'options' => array('18-25', '26-35', '36-45', '46-55', '55+'),
                    'required' => 1,
                    'order_index' => 1
                ),
                array(
                    'survey_id' => $survey_id,
                    'title' => 'What features do you like most? (Select all that apply)',
                    'type' => 'checkbox',
                    'options' => array('User Interface', 'Performance', 'Customer Support', 'Pricing', 'Features'),
                    'required' => 0,
                    'order_index' => 2
                ),
                array(
                    'survey_id' => $survey_id,
                    'title' => 'Please share any additional comments or suggestions',
                    'type' => 'textarea',
                    'required' => 0,
                    'order_index' => 3
                )
            );
            
            foreach ($questions as $question) {
                $database->createQuestion($question);
            }
            
            return $survey_id;
        }
        
        return false;
    }
    
    public static function checkSystemRequirements() {
        $requirements = array(
            'php_version' => version_compare(PHP_VERSION, '7.4', '>='),
            'wordpress_version' => version_compare(get_bloginfo('version'), '5.0', '>='),
            'mysql_version' => version_compare($GLOBALS['wpdb']->db_version(), '5.6', '>='),
            'memory_limit' => self::checkMemoryLimit(),
            'upload_max_filesize' => self::checkUploadMaxFilesize()
        );
        
        return $requirements;
    }
    
    private static function checkMemoryLimit() {
        $memory_limit = ini_get('memory_limit');
        $memory_limit_bytes = wp_convert_hr_to_bytes($memory_limit);
        return $memory_limit_bytes >= 128 * 1024 * 1024; // 128MB
    }
    
    private static function checkUploadMaxFilesize() {
        $upload_max = ini_get('upload_max_filesize');
        $upload_max_bytes = wp_convert_hr_to_bytes($upload_max);
        return $upload_max_bytes >= 10 * 1024 * 1024; // 10MB
    }
}

// Register activation and deactivation hooks
register_activation_hook(__FILE__, array('GlicoSurveyInstaller', 'install'));
register_deactivation_hook(__FILE__, array('GlicoSurveyInstaller', 'uninstall'));
