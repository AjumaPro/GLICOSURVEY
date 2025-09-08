<?php
/**
 * Plugin Name: Glico Survey
 * Plugin URI: https://github.com/AjumaPro/GLICOSURVEY
 * Description: A comprehensive survey management system with modern UI, analytics, and emoji-based rating scales.
 * Version: 1.0.0
 * Author: AjumaPro
 * Author URI: https://github.com/AjumaPro
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: glico-survey
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Check if WordPress functions are available
if (!function_exists('plugin_dir_path') || !function_exists('add_action')) {
    return;
}

// Define plugin constants
define('GLICO_SURVEY_VERSION', '1.0.0');
define('GLICO_SURVEY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GLICO_SURVEY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GLICO_SURVEY_PLUGIN_FILE', __FILE__);
define('GLICO_SURVEY_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'GlicoSurvey\\';
    $base_dir = GLICO_SURVEY_PLUGIN_DIR . 'includes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// Main plugin class
class GlicoSurvey {
    
    private static $instance = null;
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init();
    }
    
    private function init() {
        // Load text domain
        add_action('init', array($this, 'loadTextDomain'));
        
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Initialize components
        add_action('init', array($this, 'initComponents'));
        
        // Admin initialization
        if (is_admin()) {
            add_action('admin_init', array($this, 'initAdmin'));
        }
        
        // Frontend initialization
        add_action('wp', array($this, 'initFrontend'));
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueueFrontendAssets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueueAdminAssets'));
        
        // AJAX handlers
        add_action('wp_ajax_glico_survey_action', array($this, 'handleAjaxRequest'));
        add_action('wp_ajax_nopriv_glico_survey_action', array($this, 'handleAjaxRequest'));
        
        // REST API
        add_action('rest_api_init', array($this, 'registerRestRoutes'));
        
        // Shortcodes
        add_shortcode('glico_survey', array($this, 'renderSurveyShortcode'));
        add_shortcode('glico_survey_list', array($this, 'renderSurveyListShortcode'));
    }
    
    public function loadTextDomain() {
        load_plugin_textdomain('glico-survey', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function activate() {
        // Create database tables
        $this->createTables();
        
        // Set default options
        $this->setDefaultOptions();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    private function createTables() {
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
    
    private function setDefaultOptions() {
        $default_options = array(
            'glico_survey_version' => GLICO_SURVEY_VERSION,
            'glico_survey_settings' => array(
                'enable_analytics' => true,
                'enable_export' => true,
                'default_emoji_scale' => 'happy_sad',
                'allow_anonymous' => true,
                'require_login' => false,
                'max_responses_per_ip' => 0,
                'response_timeout' => 3600
            )
        );
        
        foreach ($default_options as $option_name => $option_value) {
            if (get_option($option_name) === false) {
                add_option($option_name, $option_value);
            }
        }
    }
    
    public function initComponents() {
        // Initialize core components
        new \GlicoSurvey\Core\Database();
        new \GlicoSurvey\Core\Security();
        new \GlicoSurvey\Core\Analytics();
    }
    
    public function initAdmin() {
        new \GlicoSurvey\Admin\AdminMenu();
        new \GlicoSurvey\Admin\SurveyManager();
        new \GlicoSurvey\Admin\AnalyticsDashboard();
    }
    
    public function initFrontend() {
        new \GlicoSurvey\Frontend\SurveyRenderer();
        new \GlicoSurvey\Frontend\SurveyHandler();
    }
    
    public function enqueueFrontendAssets() {
        wp_enqueue_style(
            'glico-survey-frontend',
            GLICO_SURVEY_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            GLICO_SURVEY_VERSION
        );
        
        wp_enqueue_script(
            'glico-survey-frontend',
            GLICO_SURVEY_PLUGIN_URL . 'assets/js/frontend.js',
            array('jquery'),
            GLICO_SURVEY_VERSION,
            true
        );
        
        wp_localize_script('glico-survey-frontend', 'glicoSurvey', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('glico_survey_nonce'),
            'strings' => array(
                'loading' => __('Loading...', 'glico-survey'),
                'error' => __('An error occurred. Please try again.', 'glico-survey'),
                'success' => __('Thank you for your response!', 'glico-survey'),
                'required' => __('This field is required.', 'glico-survey')
            )
        ));
    }
    
    public function enqueueAdminAssets($hook) {
        if (strpos($hook, 'glico-survey') === false) {
            return;
        }
        
        wp_enqueue_style(
            'glico-survey-admin',
            GLICO_SURVEY_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            GLICO_SURVEY_VERSION
        );
        
        wp_enqueue_script(
            'glico-survey-admin',
            GLICO_SURVEY_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery', 'wp-util'),
            GLICO_SURVEY_VERSION,
            true
        );
        
        wp_localize_script('glico-survey-admin', 'glicoSurveyAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('glico_survey_admin_nonce'),
            'strings' => array(
                'confirmDelete' => __('Are you sure you want to delete this item?', 'glico-survey'),
                'saving' => __('Saving...', 'glico-survey'),
                'saved' => __('Saved successfully!', 'glico-survey'),
                'error' => __('An error occurred. Please try again.', 'glico-survey')
            )
        ));
    }
    
    public function handleAjaxRequest() {
        check_ajax_referer('glico_survey_nonce', 'nonce');
        
        $action = sanitize_text_field($_POST['action_type'] ?? '');
        
        switch ($action) {
            case 'submit_survey':
                $this->handleSurveySubmission();
                break;
            case 'get_survey':
                $this->getSurveyData();
                break;
            default:
                wp_send_json_error(__('Invalid action.', 'glico-survey'));
        }
    }
    
    private function handleSurveySubmission() {
        $survey_id = intval($_POST['survey_id'] ?? 0);
        $responses = $_POST['responses'] ?? array();
        
        if (!$survey_id || empty($responses)) {
            wp_send_json_error(__('Invalid survey data.', 'glico-survey'));
        }
        
        $handler = new \GlicoSurvey\Core\SurveyHandler();
        $result = $handler->processSubmission($survey_id, $responses);
        
        if ($result['success']) {
            wp_send_json_success($result['message']);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    private function getSurveyData() {
        $survey_id = intval($_POST['survey_id'] ?? 0);
        
        if (!$survey_id) {
            wp_send_json_error(__('Invalid survey ID.', 'glico-survey'));
        }
        
        $database = new \GlicoSurvey\Core\Database();
        $survey = $database->getSurvey($survey_id);
        
        if ($survey) {
            wp_send_json_success($survey);
        } else {
            wp_send_json_error(__('Survey not found.', 'glico-survey'));
        }
    }
    
    public function registerRestRoutes() {
        register_rest_route('glico-survey/v1', '/surveys', array(
            'methods' => 'GET',
            'callback' => array($this, 'getSurveys'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('glico-survey/v1', '/surveys/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'getSurvey'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('glico-survey/v1', '/surveys/(?P<id>\d+)/submit', array(
            'methods' => 'POST',
            'callback' => array($this, 'submitSurvey'),
            'permission_callback' => '__return_true'
        ));
    }
    
    public function getSurveys($request) {
        $database = new \GlicoSurvey\Core\Database();
        $surveys = $database->getSurveys(array('status' => 'published'));
        return new WP_REST_Response($surveys, 200);
    }
    
    public function getSurvey($request) {
        $survey_id = $request['id'];
        $database = new \GlicoSurvey\Core\Database();
        $survey = $database->getSurvey($survey_id);
        
        if (!$survey) {
            return new WP_Error('not_found', __('Survey not found.', 'glico-survey'), array('status' => 404));
        }
        
        return new WP_REST_Response($survey, 200);
    }
    
    public function submitSurvey($request) {
        $survey_id = $request['id'];
        $responses = $request->get_json_params();
        
        $handler = new \GlicoSurvey\Core\SurveyHandler();
        $result = $handler->processSubmission($survey_id, $responses);
        
        if ($result['success']) {
            return new WP_REST_Response($result, 200);
        } else {
            return new WP_Error('submission_failed', $result['message'], array('status' => 400));
        }
    }
    
    public function renderSurveyShortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => 0,
            'title' => '',
            'description' => ''
        ), $atts);
        
        $survey_id = intval($atts['id']);
        
        if (!$survey_id) {
            return '<p>' . __('Invalid survey ID.', 'glico-survey') . '</p>';
        }
        
        $renderer = new \GlicoSurvey\Frontend\SurveyRenderer();
        return $renderer->renderSurvey($survey_id);
    }
    
    public function renderSurveyListShortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 10,
            'status' => 'published',
            'show_description' => true
        ), $atts);
        
        $renderer = new \GlicoSurvey\Frontend\SurveyRenderer();
        return $renderer->renderSurveyList($atts);
    }
}

// Initialize the plugin
function glico_survey_init() {
    return GlicoSurvey::getInstance();
}

// Start the plugin
add_action('plugins_loaded', 'glico_survey_init');
