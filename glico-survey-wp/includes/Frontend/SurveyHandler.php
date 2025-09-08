<?php

namespace GlicoSurvey\Frontend;

class SurveyHandler {
    
    private $database;
    private $survey_handler;
    
    public function __construct() {
        $this->database = new \GlicoSurvey\Core\Database();
        $this->survey_handler = new \GlicoSurvey\Core\SurveyHandler();
        $this->init();
    }
    
    private function init() {
        // Handle survey submissions
        add_action('wp_ajax_glico_survey_submit', array($this, 'handleSurveySubmission'));
        add_action('wp_ajax_nopriv_glico_survey_submit', array($this, 'handleSurveySubmission'));
        
        // Handle survey preview
        add_action('wp_ajax_glico_survey_preview', array($this, 'handleSurveyPreview'));
        add_action('wp_ajax_nopriv_glico_survey_preview', array($this, 'handleSurveyPreview'));
        
        // Add rewrite rules for survey URLs
        add_action('init', array($this, 'addRewriteRules'));
        add_filter('query_vars', array($this, 'addQueryVars'));
        add_action('template_redirect', array($this, 'handleSurveyPage'));
    }
    
    public function addRewriteRules() {
        add_rewrite_rule(
            '^survey/([0-9]+)/?$',
            'index.php?glico_survey_id=$matches[1]',
            'top'
        );
        
        add_rewrite_rule(
            '^survey/([0-9]+)/preview/?$',
            'index.php?glico_survey_id=$matches[1]&glico_preview=1',
            'top'
        );
    }
    
    public function addQueryVars($vars) {
        $vars[] = 'glico_survey_id';
        $vars[] = 'glico_preview';
        return $vars;
    }
    
    public function handleSurveyPage() {
        $survey_id = get_query_var('glico_survey_id');
        $is_preview = get_query_var('glico_preview');
        
        if ($survey_id) {
            $this->displaySurveyPage($survey_id, $is_preview);
        }
    }
    
    private function displaySurveyPage($survey_id, $is_preview = false) {
        $survey = $this->database->getSurvey($survey_id);
        
        if (!$survey) {
            $this->display404();
            return;
        }
        
        // Check if survey is published (unless preview)
        if (!$is_preview && $survey['status'] !== 'published') {
            $this->display404();
            return;
        }
        
        // Check permissions for preview
        if ($is_preview && !current_user_can('manage_options')) {
            $this->display404();
            return;
        }
        
        // Set page title
        add_filter('wp_title', function($title) use ($survey) {
            return $survey['title'] . ' - ' . get_bloginfo('name');
        });
        
        // Load survey template
        $this->loadSurveyTemplate($survey, $is_preview);
    }
    
    private function loadSurveyTemplate($survey, $is_preview = false) {
        // Set up template variables
        $template_vars = array(
            'survey' => $survey,
            'is_preview' => $is_preview,
            'survey_url' => home_url('/survey/' . $survey['id']),
            'preview_url' => home_url('/survey/' . $survey['id'] . '/preview')
        );
        
        // Load custom template if exists
        $custom_template = locate_template('glico-survey/survey.php');
        if ($custom_template) {
            include $custom_template;
        } else {
            // Load plugin template
            $renderer = new SurveyRenderer();
            echo $renderer->renderSurvey($survey['id']);
        }
        
        exit;
    }
    
    private function display404() {
        status_header(404);
        get_template_part('404');
        exit;
    }
    
    public function handleSurveySubmission() {
        check_ajax_referer('glico_survey_nonce', 'nonce');
        
        $survey_id = intval($_POST['survey_id'] ?? 0);
        $responses = $_POST['responses'] ?? array();
        
        if (!$survey_id || empty($responses)) {
            wp_send_json_error(__('Invalid survey data.', 'glico-survey'));
        }
        
        $result = $this->survey_handler->processSubmission($survey_id, $responses);
        
        if ($result['success']) {
            wp_send_json_success($result['message']);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    public function handleSurveyPreview() {
        check_ajax_referer('glico_survey_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions.', 'glico-survey'));
        }
        
        $survey_id = intval($_POST['survey_id'] ?? 0);
        
        if (!$survey_id) {
            wp_send_json_error(__('Invalid survey ID.', 'glico-survey'));
        }
        
        $survey = $this->database->getSurvey($survey_id);
        
        if ($survey) {
            $renderer = new SurveyRenderer();
            $html = $renderer->renderSurvey($survey_id);
            wp_send_json_success(array('html' => $html));
        } else {
            wp_send_json_error(__('Survey not found.', 'glico-survey'));
        }
    }
    
    public function getSurveyData($survey_id) {
        $survey = $this->database->getSurvey($survey_id);
        
        if (!$survey) {
            return false;
        }
        
        // Filter out sensitive data
        unset($survey['created_by']);
        
        return $survey;
    }
    
    public function validateSurveyAccess($survey_id, $user_id = null) {
        $survey = $this->database->getSurvey($survey_id);
        
        if (!$survey) {
            return false;
        }
        
        // Check if survey is published
        if ($survey['status'] !== 'published') {
            return false;
        }
        
        // Check user permissions if required
        $settings = get_option('glico_survey_settings', array());
        if ($settings['require_login'] && !is_user_logged_in()) {
            return false;
        }
        
        return true;
    }
    
    public function trackSurveyView($survey_id) {
        // Track survey views for analytics
        $views = get_transient('glico_survey_views_' . $survey_id);
        if ($views === false) {
            $views = 0;
        }
        $views++;
        set_transient('glico_survey_views_' . $survey_id, $views, HOUR_IN_SECONDS);
        
        // Store in database for permanent tracking
        global $wpdb;
        $table = $wpdb->prefix . 'glico_survey_views';
        
        $wpdb->insert(
            $table,
            array(
                'survey_id' => $survey_id,
                'user_ip' => $this->getUserIP(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
                'viewed_at' => current_time('mysql')
            ),
            array('%d', '%s', '%s', '%s')
        );
    }
    
    public function getSurveyViews($survey_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'glico_survey_views';
        
        return $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(DISTINCT user_ip) FROM $table WHERE survey_id = %d",
            $survey_id
        ));
    }
    
    public function getSurveyStats($survey_id) {
        $survey = $this->database->getSurvey($survey_id);
        
        if (!$survey) {
            return false;
        }
        
        return array(
            'total_questions' => count($survey['questions']),
            'total_responses' => $survey['response_count'],
            'total_views' => $this->getSurveyViews($survey_id),
            'completion_rate' => $this->calculateCompletionRate($survey_id)
        );
    }
    
    private function calculateCompletionRate($survey_id) {
        global $wpdb;
        $sessions_table = $wpdb->prefix . 'glico_response_sessions';
        
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $sessions_table WHERE survey_id = %d",
            $survey_id
        ));
        
        $completed = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $sessions_table WHERE survey_id = %d AND completed = 1",
            $survey_id
        ));
        
        return $total > 0 ? round(($completed / $total) * 100, 2) : 0;
    }
    
    private function getUserIP() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}
