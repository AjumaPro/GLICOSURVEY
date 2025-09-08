<?php

namespace GlicoSurvey\Admin;

class AdminMenu {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'addAdminMenu'));
    }
    
    public function addAdminMenu() {
        // Main menu
        add_menu_page(
            __('Glico Survey', 'glico-survey'),
            __('Glico Survey', 'glico-survey'),
            'manage_options',
            'glico-survey',
            array($this, 'renderDashboard'),
            'dashicons-feedback',
            30
        );
        
        // Dashboard submenu
        add_submenu_page(
            'glico-survey',
            __('Dashboard', 'glico-survey'),
            __('Dashboard', 'glico-survey'),
            'manage_options',
            'glico-survey',
            array($this, 'renderDashboard')
        );
        
        // Surveys submenu
        add_submenu_page(
            'glico-survey',
            __('Surveys', 'glico-survey'),
            __('Surveys', 'glico-survey'),
            'manage_options',
            'glico-survey-surveys',
            array($this, 'renderSurveys')
        );
        
        // Create Survey submenu
        add_submenu_page(
            'glico-survey',
            __('Create Survey', 'glico-survey'),
            __('Create Survey', 'glico-survey'),
            'manage_options',
            'glico-survey-create',
            array($this, 'renderCreateSurvey')
        );
        
        // Analytics submenu
        add_submenu_page(
            'glico-survey',
            __('Analytics', 'glico-survey'),
            __('Analytics', 'glico-survey'),
            'manage_options',
            'glico-survey-analytics',
            array($this, 'renderAnalytics')
        );
        
        // Settings submenu
        add_submenu_page(
            'glico-survey',
            __('Settings', 'glico-survey'),
            __('Settings', 'glico-survey'),
            'manage_options',
            'glico-survey-settings',
            array($this, 'renderSettings')
        );
    }
    
    public function renderDashboard() {
        $database = new \GlicoSurvey\Core\Database();
        
        $stats = array(
            'total_surveys' => count($database->getSurveys(array('limit' => 1000))),
            'published_surveys' => count($database->getSurveys(array('status' => 'published', 'limit' => 1000))),
            'draft_surveys' => count($database->getSurveys(array('status' => 'draft', 'limit' => 1000))),
            'total_responses' => $this->getTotalResponses()
        );
        
        $recent_surveys = $database->getSurveys(array('limit' => 5));
        
        include GLICO_SURVEY_PLUGIN_DIR . 'templates/admin/dashboard.php';
    }
    
    public function renderSurveys() {
        $database = new \GlicoSurvey\Core\Database();
        
        $action = $_GET['action'] ?? 'list';
        $survey_id = intval($_GET['id'] ?? 0);
        
        switch ($action) {
            case 'edit':
                if ($survey_id) {
                    $survey = $database->getSurvey($survey_id);
                    if ($survey) {
                        include GLICO_SURVEY_PLUGIN_DIR . 'templates/admin/survey-edit.php';
                    } else {
                        wp_die(__('Survey not found.', 'glico-survey'));
                    }
                } else {
                    wp_die(__('Invalid survey ID.', 'glico-survey'));
                }
                break;
            case 'analytics':
                if ($survey_id) {
                    $survey = $database->getSurvey($survey_id);
                    if ($survey) {
                        $analytics = $database->getSurveyAnalytics($survey_id);
                        include GLICO_SURVEY_PLUGIN_DIR . 'templates/admin/survey-analytics.php';
                    } else {
                        wp_die(__('Survey not found.', 'glico-survey'));
                    }
                } else {
                    wp_die(__('Invalid survey ID.', 'glico-survey'));
                }
                break;
            default:
                $surveys = $database->getSurveys();
                include GLICO_SURVEY_PLUGIN_DIR . 'templates/admin/surveys-list.php';
                break;
        }
    }
    
    public function renderCreateSurvey() {
        include GLICO_SURVEY_PLUGIN_DIR . 'templates/admin/survey-create.php';
    }
    
    public function renderAnalytics() {
        $database = new \GlicoSurvey\Core\Database();
        $surveys = $database->getSurveys();
        
        include GLICO_SURVEY_PLUGIN_DIR . 'templates/admin/analytics.php';
    }
    
    public function renderSettings() {
        if (isset($_POST['submit'])) {
            $this->saveSettings();
        }
        
        $settings = get_option('glico_survey_settings', array());
        
        include GLICO_SURVEY_PLUGIN_DIR . 'templates/admin/settings.php';
    }
    
    private function saveSettings() {
        $settings = array(
            'enable_analytics' => isset($_POST['enable_analytics']),
            'enable_export' => isset($_POST['enable_export']),
            'default_emoji_scale' => sanitize_text_field($_POST['default_emoji_scale']),
            'allow_anonymous' => isset($_POST['allow_anonymous']),
            'require_login' => isset($_POST['require_login']),
            'max_responses_per_ip' => intval($_POST['max_responses_per_ip']),
            'response_timeout' => intval($_POST['response_timeout'])
        );
        
        update_option('glico_survey_settings', $settings);
        
        add_action('admin_notices', function() {
            echo '<div class="notice notice-success is-dismissible"><p>' . __('Settings saved successfully!', 'glico-survey') . '</p></div>';
        });
    }
    
    private function getTotalResponses() {
        global $wpdb;
        $table = $wpdb->prefix . 'glico_responses';
        
        return $wpdb->get_var("SELECT COUNT(DISTINCT user_ip) FROM $table");
    }
}
