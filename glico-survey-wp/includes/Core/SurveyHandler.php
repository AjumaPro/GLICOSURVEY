<?php

namespace GlicoSurvey\Core;

class SurveyHandler {
    
    private $database;
    
    public function __construct() {
        $this->database = new Database();
    }
    
    public function processSubmission($survey_id, $responses) {
        try {
            // Validate survey exists and is published
            $survey = $this->database->getSurvey($survey_id);
            if (!$survey || $survey['status'] !== 'published') {
                return array(
                    'success' => false,
                    'message' => __('Survey not found or not published.', 'glico-survey')
                );
            }
            
            // Validate responses
            $validation_result = $this->validateResponses($survey, $responses);
            if (!$validation_result['valid']) {
                return array(
                    'success' => false,
                    'message' => $validation_result['message']
                );
            }
            
            // Check rate limiting
            if (!$this->checkRateLimit($survey_id)) {
                return array(
                    'success' => false,
                    'message' => __('Too many responses from this IP address.', 'glico-survey')
                );
            }
            
            // Save responses
            $save_result = $this->saveResponses($survey_id, $responses);
            if (!$save_result) {
                return array(
                    'success' => false,
                    'message' => __('Failed to save responses.', 'glico-survey')
                );
            }
            
            // Trigger hooks
            do_action('glico_survey_after_submit', $survey_id, $responses, $save_result);
            
            return array(
                'success' => true,
                'message' => __('Thank you for your response!', 'glico-survey'),
                'data' => $save_result
            );
            
        } catch (Exception $e) {
            error_log('Glico Survey Error: ' . $e->getMessage());
            return array(
                'success' => false,
                'message' => __('An error occurred while processing your response.', 'glico-survey')
            );
        }
    }
    
    private function validateResponses($survey, $responses) {
        $required_questions = array();
        
        // Get required questions
        foreach ($survey['questions'] as $question) {
            if ($question['required']) {
                $required_questions[$question['id']] = $question;
            }
        }
        
        // Check required questions
        foreach ($required_questions as $question_id => $question) {
            if (!isset($responses[$question_id]) || empty($responses[$question_id])) {
                return array(
                    'valid' => false,
                    'message' => sprintf(__('Question "%s" is required.', 'glico-survey'), $question['title'])
                );
            }
        }
        
        // Validate response formats
        foreach ($responses as $question_id => $response) {
            $question = $this->findQuestionById($survey['questions'], $question_id);
            if (!$question) {
                continue;
            }
            
            $validation = $this->validateQuestionResponse($question, $response);
            if (!$validation['valid']) {
                return array(
                    'valid' => false,
                    'message' => $validation['message']
                );
            }
        }
        
        return array('valid' => true);
    }
    
    private function validateQuestionResponse($question, $response) {
        $type = $question['type'];
        
        switch ($type) {
            case 'text':
            case 'textarea':
                if (!is_string($response)) {
                    return array(
                        'valid' => false,
                        'message' => __('Invalid text response.', 'glico-survey')
                    );
                }
                break;
                
            case 'radio':
            case 'select':
                $options = $question['options'] ?? array();
                if (!in_array($response, $options)) {
                    return array(
                        'valid' => false,
                        'message' => __('Invalid option selected.', 'glico-survey')
                    );
                }
                break;
                
            case 'checkbox':
                if (!is_array($response)) {
                    return array(
                        'valid' => false,
                        'message' => __('Invalid checkbox response.', 'glico-survey')
                    );
                }
                $options = $question['options'] ?? array();
                foreach ($response as $value) {
                    if (!in_array($value, $options)) {
                        return array(
                            'valid' => false,
                            'message' => __('Invalid checkbox option selected.', 'glico-survey')
                        );
                    }
                }
                break;
                
            case 'rating':
                if (!is_numeric($response) || $response < 1 || $response > 10) {
                    return array(
                        'valid' => false,
                        'message' => __('Invalid rating value.', 'glico-survey')
                    );
                }
                break;
        }
        
        return array('valid' => true);
    }
    
    private function checkRateLimit($survey_id) {
        $settings = get_option('glico_survey_settings', array());
        $max_responses = $settings['max_responses_per_ip'] ?? 0;
        
        if ($max_responses <= 0) {
            return true; // No rate limiting
        }
        
        $user_ip = $this->getUserIP();
        $response_count = $this->database->getResponseCountByIP($survey_id, $user_ip);
        
        return $response_count < $max_responses;
    }
    
    private function saveResponses($survey_id, $responses) {
        $session_id = $this->generateSessionId();
        $user_ip = $this->getUserIP();
        
        // Create session
        $this->database->createResponseSession(array(
            'survey_id' => $survey_id,
            'session_id' => $session_id,
            'user_ip' => $user_ip,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'completed' => 1
        ));
        
        // Save individual responses
        foreach ($responses as $question_id => $response_value) {
            if (is_array($response_value)) {
                $response_value = wp_json_encode($response_value);
            }
            
            $this->database->createResponse(array(
                'survey_id' => $survey_id,
                'question_id' => $question_id,
                'response_value' => $response_value,
                'user_ip' => $user_ip,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
            ));
        }
        
        return array(
            'session_id' => $session_id,
            'response_count' => count($responses)
        );
    }
    
    private function findQuestionById($questions, $question_id) {
        foreach ($questions as $question) {
            if ($question['id'] == $question_id) {
                return $question;
            }
        }
        return null;
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
    
    private function generateSessionId() {
        return 'glico_' . time() . '_' . wp_generate_password(12, false);
    }
}
