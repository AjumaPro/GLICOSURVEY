<?php
// @phpstan-ignore-file

namespace GlicoSurvey\Core;

class NodeJSSync {
    
    private $nodejs_api_url;
    private $api_key;
    
    public function __construct() {
        $this->nodejs_api_url = get_option('glico_survey_nodejs_url', 'http://localhost:5000/api');
        $this->api_key = get_option('glico_survey_api_key', '');
    }
    
    /**
     * Sync surveys from Node.js system
     */
    public function syncSurveys() {
        try {
            $response = wp_remote_get($this->nodejs_api_url . '/wordpress/surveys', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'Content-Type' => 'application/json'
                ],
                'timeout' => 30
            ]);
            
            if (is_wp_error($response)) {
                throw new \Exception('Failed to connect to Node.js API: ' . $response->get_error_message());
            }
            
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if (!$data['success']) {
                throw new \Exception('API returned error: ' . ($data['error'] ?? 'Unknown error'));
            }
            
            $imported_count = 0;
            $skipped_count = 0;
            
            foreach ($data['data'] as $survey_data) {
                if ($this->importSurvey($survey_data)) {
                    $imported_count++;
                } else {
                    $skipped_count++;
                }
            }
            
            return [
                'success' => true,
                'imported' => $imported_count,
                'skipped' => $skipped_count,
                'total' => count($data['data'])
            ];
            
        } catch (\Exception $e) {
            error_log('Glico Survey Sync Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Import a single survey
     */
    private function importSurvey($survey_data) {
        global $wpdb;
        
        // Check if survey already exists
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}glico_surveys WHERE title = %s",
            $survey_data['title']
        ));
        
        if ($existing) {
            return false; // Skip existing surveys
        }
        
        // Insert survey
        $result = $wpdb->insert(
            $wpdb->prefix . 'glico_surveys',
            [
                'title' => sanitize_text_field($survey_data['title']),
                'description' => sanitize_textarea_field($survey_data['description']),
                'status' => sanitize_text_field($survey_data['status']),
                'settings' => wp_json_encode($survey_data['settings']),
                'created_by' => get_current_user_id(),
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql')
            ],
            ['%s', '%s', '%s', '%s', '%d', '%s', '%s']
        );
        
        if ($result === false) {
            return false;
        }
        
        $survey_id = $wpdb->insert_id;
        
        // Import questions
        if (!empty($survey_data['questions'])) {
            foreach ($survey_data['questions'] as $question_data) {
                $wpdb->insert(
                    $wpdb->prefix . 'glico_questions',
                    [
                        'survey_id' => $survey_id,
                        'title' => sanitize_textarea_field($question_data['question_text']),
                        'type' => sanitize_text_field($question_data['question_type']),
                        'options' => wp_json_encode($question_data['options'] ?? []),
                        'required' => intval($question_data['required'] ?? 0),
                        'order_index' => intval($question_data['order_index'] ?? 0),
                        'created_at' => current_time('mysql')
                    ],
                    ['%d', '%s', '%s', '%s', '%d', '%d', '%s']
                );
            }
        }
        
        return true;
    }
    
    /**
     * Sync themes from Node.js system
     */
    public function syncThemes() {
        try {
            $response = wp_remote_get($this->nodejs_api_url . '/wordpress/themes', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'Content-Type' => 'application/json'
                ],
                'timeout' => 30
            ]);
            
            if (is_wp_error($response)) {
                throw new \Exception('Failed to connect to Node.js API: ' . $response->get_error_message());
            }
            
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if (!$data['success']) {
                throw new \Exception('API returned error: ' . ($data['error'] ?? 'Unknown error'));
            }
            
            $imported_count = 0;
            $skipped_count = 0;
            
            foreach ($data['data'] as $theme_data) {
                if ($this->importTheme($theme_data)) {
                    $imported_count++;
                } else {
                    $skipped_count++;
                }
            }
            
            return [
                'success' => true,
                'imported' => $imported_count,
                'skipped' => $skipped_count,
                'total' => count($data['data'])
            ];
            
        } catch (\Exception $e) {
            error_log('Glico Survey Theme Sync Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Import a single theme
     */
    private function importTheme($theme_data) {
        global $wpdb;
        
        // Check if theme already exists
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}glico_themes WHERE name = %s",
            $theme_data['name']
        ));
        
        if ($existing) {
            return false; // Skip existing themes
        }
        
        // Insert theme
        $result = $wpdb->insert(
            $wpdb->prefix . 'glico_themes',
            [
                'name' => sanitize_text_field($theme_data['name']),
                'description' => sanitize_textarea_field($theme_data['description']),
                'category' => sanitize_text_field($theme_data['category']),
                'colors' => wp_json_encode($theme_data['colors']),
                'typography' => wp_json_encode($theme_data['typography']),
                'layout' => wp_json_encode($theme_data['layout']),
                'components' => wp_json_encode($theme_data['components']),
                'is_default' => intval($theme_data['is_default'] ?? 0),
                'is_premium' => intval($theme_data['is_premium'] ?? 0),
                'created_by' => get_current_user_id(),
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql')
            ],
            ['%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%d', '%s', '%s']
        );
        
        return $result !== false;
    }
    
    /**
     * Export survey to Node.js system
     */
    public function exportSurvey($survey_id) {
        try {
            global $wpdb;
            
            // Get survey data
            $survey = $wpdb->get_row($wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}glico_surveys WHERE id = %d",
                $survey_id
            ), ARRAY_A);
            
            if (!$survey) {
                throw new \Exception('Survey not found');
            }
            
            // Get questions
            $questions = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}glico_questions WHERE survey_id = %d ORDER BY order_index ASC",
                $survey_id
            ), ARRAY_A);
            
            $survey_data = [
                'title' => $survey['title'],
                'description' => $survey['description'],
                'status' => $survey['status'],
                'settings' => json_decode($survey['settings'], true),
                'questions' => array_map(function($q) {
                    return [
                        'question_text' => $q['title'],
                        'question_type' => $q['type'],
                        'options' => json_decode($q['options'], true),
                        'required' => intval($q['required']),
                        'order_index' => intval($q['order_index'])
                    ];
                }, $questions)
            ];
            
            $response = wp_remote_post($this->nodejs_api_url . '/wordpress/import', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'Content-Type' => 'application/json'
                ],
                'body' => wp_json_encode([
                    'type' => 'survey',
                    'data' => $survey_data
                ]),
                'timeout' => 30
            ]);
            
            if (is_wp_error($response)) {
                throw new \Exception('Failed to connect to Node.js API: ' . $response->get_error_message());
            }
            
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if (!$data['success']) {
                throw new \Exception('API returned error: ' . ($data['error'] ?? 'Unknown error'));
            }
            
            return [
                'success' => true,
                'message' => 'Survey exported successfully',
                'nodejs_survey_id' => $data['survey_id']
            ];
            
        } catch (\Exception $e) {
            error_log('Glico Survey Export Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Test connection to Node.js API
     */
    public function testConnection() {
        try {
            $response = wp_remote_get($this->nodejs_api_url . '/health', [
                'timeout' => 10
            ]);
            
            if (is_wp_error($response)) {
                return [
                    'success' => false,
                    'error' => $response->get_error_message()
                ];
            }
            
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            return [
                'success' => true,
                'message' => 'Connection successful',
                'data' => $data
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
