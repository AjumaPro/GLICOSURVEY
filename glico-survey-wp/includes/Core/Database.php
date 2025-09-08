<?php

namespace GlicoSurvey\Core;

class Database {
    
    private $wpdb;
    
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
    }
    
    // Survey methods
    public function createSurvey($data) {
        $table = $this->wpdb->prefix . 'glico_surveys';
        
        $result = $this->wpdb->insert(
            $table,
            array(
                'title' => sanitize_text_field($data['title']),
                'description' => sanitize_textarea_field($data['description']),
                'status' => sanitize_text_field($data['status'] ?? 'draft'),
                'settings' => wp_json_encode($data['settings'] ?? array()),
                'created_by' => get_current_user_id()
            ),
            array('%s', '%s', '%s', '%s', '%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        return $this->wpdb->insert_id;
    }
    
    public function updateSurvey($id, $data) {
        $table = $this->wpdb->prefix . 'glico_surveys';
        
        $update_data = array();
        $format = array();
        
        if (isset($data['title'])) {
            $update_data['title'] = sanitize_text_field($data['title']);
            $format[] = '%s';
        }
        
        if (isset($data['description'])) {
            $update_data['description'] = sanitize_textarea_field($data['description']);
            $format[] = '%s';
        }
        
        if (isset($data['status'])) {
            $update_data['status'] = sanitize_text_field($data['status']);
            $format[] = '%s';
        }
        
        if (isset($data['settings'])) {
            $update_data['settings'] = wp_json_encode($data['settings']);
            $format[] = '%s';
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $result = $this->wpdb->update(
            $table,
            $update_data,
            array('id' => intval($id)),
            $format,
            array('%d')
        );
        
        return $result !== false;
    }
    
    public function deleteSurvey($id) {
        $table = $this->wpdb->prefix . 'glico_surveys';
        
        // Delete related questions and responses
        $this->deleteSurveyQuestions($id);
        $this->deleteSurveyResponses($id);
        
        return $this->wpdb->delete(
            $table,
            array('id' => intval($id)),
            array('%d')
        ) !== false;
    }
    
    public function getSurvey($id) {
        $table = $this->wpdb->prefix . 'glico_surveys';
        
        $survey = $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT * FROM $table WHERE id = %d",
                intval($id)
            ),
            ARRAY_A
        );
        
        if ($survey) {
            $survey['settings'] = json_decode($survey['settings'], true);
            $survey['questions'] = $this->getSurveyQuestions($id);
            $survey['response_count'] = $this->getSurveyResponseCount($id);
        }
        
        return $survey;
    }
    
    public function getSurveys($args = array()) {
        $table = $this->wpdb->prefix . 'glico_surveys';
        
        $defaults = array(
            'status' => '',
            'created_by' => '',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'created_at',
            'order' => 'DESC'
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $where_conditions = array('1=1');
        $where_values = array();
        
        if (!empty($args['status'])) {
            $where_conditions[] = 'status = %s';
            $where_values[] = $args['status'];
        }
        
        if (!empty($args['created_by'])) {
            $where_conditions[] = 'created_by = %d';
            $where_values[] = intval($args['created_by']);
        }
        
        $where_clause = implode(' AND ', $where_conditions);
        
        $orderby = sanitize_sql_orderby($args['orderby'] . ' ' . $args['order']);
        if (!$orderby) {
            $orderby = 'created_at DESC';
        }
        
        $limit = intval($args['limit']);
        $offset = intval($args['offset']);
        
        $sql = "SELECT * FROM $table WHERE $where_clause ORDER BY $orderby LIMIT $limit OFFSET $offset";
        
        if (!empty($where_values)) {
            $sql = $this->wpdb->prepare($sql, $where_values);
        }
        
        $surveys = $this->wpdb->get_results($sql, ARRAY_A);
        
        foreach ($surveys as &$survey) {
            $survey['settings'] = json_decode($survey['settings'], true);
            $survey['questions'] = $this->getSurveyQuestions($survey['id']);
            $survey['response_count'] = $this->getSurveyResponseCount($survey['id']);
        }
        
        return $surveys;
    }
    
    // Question methods
    public function createQuestion($data) {
        $table = $this->wpdb->prefix . 'glico_questions';
        
        $result = $this->wpdb->insert(
            $table,
            array(
                'survey_id' => intval($data['survey_id']),
                'title' => sanitize_textarea_field($data['title']),
                'type' => sanitize_text_field($data['type']),
                'options' => wp_json_encode($data['options'] ?? array()),
                'required' => intval($data['required'] ?? 0),
                'order_index' => intval($data['order_index'] ?? 0),
                'settings' => wp_json_encode($data['settings'] ?? array())
            ),
            array('%d', '%s', '%s', '%s', '%d', '%d', '%s')
        );
        
        if ($result === false) {
            return false;
        }
        
        return $this->wpdb->insert_id;
    }
    
    public function updateQuestion($id, $data) {
        $table = $this->wpdb->prefix . 'glico_questions';
        
        $update_data = array();
        $format = array();
        
        if (isset($data['title'])) {
            $update_data['title'] = sanitize_textarea_field($data['title']);
            $format[] = '%s';
        }
        
        if (isset($data['type'])) {
            $update_data['type'] = sanitize_text_field($data['type']);
            $format[] = '%s';
        }
        
        if (isset($data['options'])) {
            $update_data['options'] = wp_json_encode($data['options']);
            $format[] = '%s';
        }
        
        if (isset($data['required'])) {
            $update_data['required'] = intval($data['required']);
            $format[] = '%d';
        }
        
        if (isset($data['order_index'])) {
            $update_data['order_index'] = intval($data['order_index']);
            $format[] = '%d';
        }
        
        if (isset($data['settings'])) {
            $update_data['settings'] = wp_json_encode($data['settings']);
            $format[] = '%s';
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $result = $this->wpdb->update(
            $table,
            $update_data,
            array('id' => intval($id)),
            $format,
            array('%d')
        );
        
        return $result !== false;
    }
    
    public function deleteQuestion($id) {
        $table = $this->wpdb->prefix . 'glico_questions';
        
        // Delete related responses
        $this->deleteQuestionResponses($id);
        
        return $this->wpdb->delete(
            $table,
            array('id' => intval($id)),
            array('%d')
        ) !== false;
    }
    
    public function getSurveyQuestions($survey_id) {
        $table = $this->wpdb->prefix . 'glico_questions';
        
        $questions = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT * FROM $table WHERE survey_id = %d ORDER BY order_index ASC",
                intval($survey_id)
            ),
            ARRAY_A
        );
        
        foreach ($questions as &$question) {
            $question['options'] = json_decode($question['options'], true);
            $question['settings'] = json_decode($question['settings'], true);
        }
        
        return $questions;
    }
    
    public function deleteSurveyQuestions($survey_id) {
        $table = $this->wpdb->prefix . 'glico_questions';
        
        $questions = $this->wpdb->get_col(
            $this->wpdb->prepare(
                "SELECT id FROM $table WHERE survey_id = %d",
                intval($survey_id)
            )
        );
        
        foreach ($questions as $question_id) {
            $this->deleteQuestionResponses($question_id);
        }
        
        return $this->wpdb->delete(
            $table,
            array('survey_id' => intval($survey_id)),
            array('%d')
        ) !== false;
    }
    
    // Response methods
    public function createResponse($data) {
        $table = $this->wpdb->prefix . 'glico_responses';
        
        $result = $this->wpdb->insert(
            $table,
            array(
                'survey_id' => intval($data['survey_id']),
                'question_id' => intval($data['question_id']),
                'response_value' => sanitize_textarea_field($data['response_value']),
                'user_ip' => $this->getUserIP(),
                'user_agent' => sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? '')
            ),
            array('%d', '%d', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            return false;
        }
        
        return $this->wpdb->insert_id;
    }
    
    public function getSurveyResponses($survey_id, $args = array()) {
        $table = $this->wpdb->prefix . 'glico_responses';
        
        $defaults = array(
            'limit' => 100,
            'offset' => 0
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $limit = intval($args['limit']);
        $offset = intval($args['offset']);
        
        $responses = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT * FROM $table WHERE survey_id = %d ORDER BY created_at DESC LIMIT %d OFFSET %d",
                intval($survey_id),
                $limit,
                $offset
            ),
            ARRAY_A
        );
        
        return $responses;
    }
    
    public function getSurveyResponseCount($survey_id) {
        $table = $this->wpdb->prefix . 'glico_responses';
        
        return $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT COUNT(DISTINCT user_ip) FROM $table WHERE survey_id = %d",
                intval($survey_id)
            )
        );
    }
    
    public function deleteSurveyResponses($survey_id) {
        $table = $this->wpdb->prefix . 'glico_responses';
        
        return $this->wpdb->delete(
            $table,
            array('survey_id' => intval($survey_id)),
            array('%d')
        ) !== false;
    }
    
    public function deleteQuestionResponses($question_id) {
        $table = $this->wpdb->prefix . 'glico_responses';
        
        return $this->wpdb->delete(
            $table,
            array('question_id' => intval($question_id)),
            array('%d')
        ) !== false;
    }
    
    // Analytics methods
    public function getSurveyAnalytics($survey_id) {
        $questions = $this->getSurveyQuestions($survey_id);
        $analytics = array();
        
        foreach ($questions as $question) {
            $analytics[$question['id']] = $this->getQuestionAnalytics($question['id']);
        }
        
        return $analytics;
    }
    
    public function getQuestionAnalytics($question_id) {
        $table = $this->wpdb->prefix . 'glico_responses';
        
        $responses = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT response_value FROM $table WHERE question_id = %d",
                intval($question_id)
            ),
            ARRAY_A
        );
        
        $analytics = array(
            'total_responses' => count($responses),
            'responses' => array()
        );
        
        foreach ($responses as $response) {
            $value = $response['response_value'];
            if (!isset($analytics['responses'][$value])) {
                $analytics['responses'][$value] = 0;
            }
            $analytics['responses'][$value]++;
        }
        
        return $analytics;
    }
    
    // Response session methods
    public function createResponseSession($data) {
        $table = $this->wpdb->prefix . 'glico_response_sessions';
        
        $result = $this->wpdb->insert(
            $table,
            array(
                'survey_id' => intval($data['survey_id']),
                'session_id' => sanitize_text_field($data['session_id']),
                'user_ip' => sanitize_text_field($data['user_ip']),
                'user_agent' => sanitize_text_field($data['user_agent']),
                'completed' => intval($data['completed'] ?? 0)
            ),
            array('%d', '%s', '%s', '%s', '%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        return $this->wpdb->insert_id;
    }
    
    public function getResponseCountByIP($survey_id, $user_ip) {
        $table = $this->wpdb->prefix . 'glico_responses';
        
        return $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT COUNT(DISTINCT user_ip) FROM $table WHERE survey_id = %d AND user_ip = %s",
                intval($survey_id),
                sanitize_text_field($user_ip)
            )
        );
    }
    
    // Utility methods
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
