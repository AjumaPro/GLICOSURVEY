<?php

namespace GlicoSurvey\Core;

class Security {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Add security headers
        add_action('send_headers', array($this, 'addSecurityHeaders'));
        
        // Sanitize all inputs
        add_filter('glico_survey_sanitize_input', array($this, 'sanitizeInput'));
        
        // Validate nonces
        add_action('glico_survey_validate_nonce', array($this, 'validateNonce'));
    }
    
    public function addSecurityHeaders() {
        if (is_admin() && isset($_GET['page']) && strpos($_GET['page'], 'glico-survey') !== false) {
            // Add security headers for admin pages
            header('X-Content-Type-Options: nosniff');
            header('X-Frame-Options: SAMEORIGIN');
            header('X-XSS-Protection: 1; mode=block');
        }
    }
    
    public function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map(array($this, 'sanitizeInput'), $input);
        }
        
        if (is_string($input)) {
            // Remove any potential XSS attempts
            $input = wp_strip_all_tags($input);
            $input = sanitize_text_field($input);
        }
        
        return $input;
    }
    
    public function validateNonce($nonce, $action = 'glico_survey_nonce') {
        return wp_verify_nonce($nonce, $action);
    }
    
    public static function checkPermissions($capability = 'manage_options') {
        if (!current_user_can($capability)) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'glico-survey'));
        }
    }
    
    public static function sanitizeSurveyData($data) {
        $sanitized = array();
        
        if (isset($data['title'])) {
            $sanitized['title'] = sanitize_text_field($data['title']);
        }
        
        if (isset($data['description'])) {
            $sanitized['description'] = sanitize_textarea_field($data['description']);
        }
        
        if (isset($data['status'])) {
            $allowed_statuses = array('draft', 'published', 'archived');
            $sanitized['status'] = in_array($data['status'], $allowed_statuses) ? $data['status'] : 'draft';
        }
        
        if (isset($data['settings'])) {
            $sanitized['settings'] = self::sanitizeSettings($data['settings']);
        }
        
        return $sanitized;
    }
    
    public static function sanitizeQuestionData($data) {
        $sanitized = array();
        
        if (isset($data['title'])) {
            $sanitized['title'] = sanitize_textarea_field($data['title']);
        }
        
        if (isset($data['type'])) {
            $allowed_types = array('text', 'textarea', 'radio', 'checkbox', 'select', 'rating', 'emoji_scale', 'custom_emoji_scale');
            $sanitized['type'] = in_array($data['type'], $allowed_types) ? $data['type'] : 'text';
        }
        
        if (isset($data['options'])) {
            $sanitized['options'] = self::sanitizeOptions($data['options']);
        }
        
        if (isset($data['required'])) {
            $sanitized['required'] = (bool) $data['required'];
        }
        
        if (isset($data['order_index'])) {
            $sanitized['order_index'] = intval($data['order_index']);
        }
        
        if (isset($data['settings'])) {
            $sanitized['settings'] = self::sanitizeSettings($data['settings']);
        }
        
        return $sanitized;
    }
    
    private static function sanitizeSettings($settings) {
        if (!is_array($settings)) {
            return array();
        }
        
        $sanitized = array();
        
        foreach ($settings as $key => $value) {
            $key = sanitize_key($key);
            
            if (is_string($value)) {
                $sanitized[$key] = sanitize_text_field($value);
            } elseif (is_array($value)) {
                $sanitized[$key] = self::sanitizeSettings($value);
            } elseif (is_bool($value)) {
                $sanitized[$key] = (bool) $value;
            } elseif (is_numeric($value)) {
                $sanitized[$key] = is_float($value) ? floatval($value) : intval($value);
            }
        }
        
        return $sanitized;
    }
    
    private static function sanitizeOptions($options) {
        if (!is_array($options)) {
            return array();
        }
        
        $sanitized = array();
        
        foreach ($options as $option) {
            if (is_string($option)) {
                $sanitized[] = sanitize_text_field($option);
            } elseif (is_array($option)) {
                $sanitized[] = self::sanitizeSettings($option);
            }
        }
        
        return $sanitized;
    }
    
    public static function escapeOutput($output) {
        if (is_array($output)) {
            return array_map(array(__CLASS__, 'escapeOutput'), $output);
        }
        
        if (is_string($output)) {
            return esc_html($output);
        }
        
        return $output;
    }
    
    public static function validateCSRF() {
        if (!wp_verify_nonce($_POST['_wpnonce'] ?? '', 'glico_survey_nonce')) {
            wp_die(__('Security check failed. Please try again.', 'glico-survey'));
        }
    }
    
    public static function logSecurityEvent($event, $details = array()) {
        $log_entry = array(
            'timestamp' => current_time('mysql'),
            'event' => $event,
            'user_id' => get_current_user_id(),
            'ip_address' => self::getUserIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'details' => $details
        );
        
        error_log('Glico Survey Security: ' . wp_json_encode($log_entry));
    }
    
    private static function getUserIP() {
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
