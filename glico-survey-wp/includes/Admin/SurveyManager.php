<?php

namespace GlicoSurvey\Admin;

class SurveyManager {
    
    private $database;
    
    public function __construct() {
        $this->database = new \GlicoSurvey\Core\Database();
        $this->init();
    }
    
    private function init() {
        // Handle AJAX requests
        add_action('wp_ajax_glico_survey_admin_action', array($this, 'handleAjaxRequest'));
        
        // Handle form submissions
        add_action('admin_post_glico_save_survey', array($this, 'handleSaveSurvey'));
        add_action('admin_post_glico_delete_survey', array($this, 'handleDeleteSurvey'));
        add_action('admin_post_glico_publish_survey', array($this, 'handlePublishSurvey'));
    }
    
    public function handleAjaxRequest() {
        check_ajax_referer('glico_survey_admin_nonce', 'nonce');
        
        $action = sanitize_text_field($_POST['action_type'] ?? '');
        
        switch ($action) {
            case 'save_survey':
                $this->ajaxSaveSurvey();
                break;
            case 'delete_survey':
                $this->ajaxDeleteSurvey();
                break;
            case 'publish_survey':
                $this->ajaxPublishSurvey();
                break;
            case 'unpublish_survey':
                $this->ajaxUnpublishSurvey();
                break;
            case 'duplicate_survey':
                $this->ajaxDuplicateSurvey();
                break;
            case 'auto_save':
                $this->ajaxAutoSave();
                break;
            default:
                wp_send_json_error(__('Invalid action.', 'glico-survey'));
        }
    }
    
    private function ajaxSaveSurvey() {
        $survey_data = $this->sanitizeSurveyData($_POST);
        
        if (empty($survey_data['title'])) {
            wp_send_json_error(__('Survey title is required.', 'glico-survey'));
        }
        
        $survey_id = isset($_POST['survey_id']) ? intval($_POST['survey_id']) : 0;
        
        if ($survey_id > 0) {
            // Update existing survey
            $result = $this->database->updateSurvey($survey_id, $survey_data);
            if ($result) {
                $this->saveSurveyQuestions($survey_id, $_POST['questions'] ?? array());
                wp_send_json_success(array(
                    'message' => __('Survey updated successfully.', 'glico-survey'),
                    'survey_id' => $survey_id
                ));
            } else {
                wp_send_json_error(__('Failed to update survey.', 'glico-survey'));
            }
        } else {
            // Create new survey
            $survey_id = $this->database->createSurvey($survey_data);
            if ($survey_id) {
                $this->saveSurveyQuestions($survey_id, $_POST['questions'] ?? array());
                wp_send_json_success(array(
                    'message' => __('Survey created successfully.', 'glico-survey'),
                    'survey_id' => $survey_id,
                    'redirect_url' => admin_url('admin.php?page=glico-survey-surveys&action=edit&id=' . $survey_id)
                ));
            } else {
                wp_send_json_error(__('Failed to create survey.', 'glico-survey'));
            }
        }
    }
    
    private function ajaxDeleteSurvey() {
        $survey_id = intval($_POST['survey_id'] ?? 0);
        
        if (!$survey_id) {
            wp_send_json_error(__('Invalid survey ID.', 'glico-survey'));
        }
        
        $result = $this->database->deleteSurvey($survey_id);
        
        if ($result) {
            wp_send_json_success(__('Survey deleted successfully.', 'glico-survey'));
        } else {
            wp_send_json_error(__('Failed to delete survey.', 'glico-survey'));
        }
    }
    
    private function ajaxPublishSurvey() {
        $survey_id = intval($_POST['survey_id'] ?? 0);
        
        if (!$survey_id) {
            wp_send_json_error(__('Invalid survey ID.', 'glico-survey'));
        }
        
        $result = $this->database->updateSurvey($survey_id, array('status' => 'published'));
        
        if ($result) {
            wp_send_json_success(__('Survey published successfully.', 'glico-survey'));
        } else {
            wp_send_json_error(__('Failed to publish survey.', 'glico-survey'));
        }
    }
    
    private function ajaxUnpublishSurvey() {
        $survey_id = intval($_POST['survey_id'] ?? 0);
        
        if (!$survey_id) {
            wp_send_json_error(__('Invalid survey ID.', 'glico-survey'));
        }
        
        $result = $this->database->updateSurvey($survey_id, array('status' => 'draft'));
        
        if ($result) {
            wp_send_json_success(__('Survey unpublished successfully.', 'glico-survey'));
        } else {
            wp_send_json_error(__('Failed to unpublish survey.', 'glico-survey'));
        }
    }
    
    private function ajaxDuplicateSurvey() {
        $survey_id = intval($_POST['survey_id'] ?? 0);
        
        if (!$survey_id) {
            wp_send_json_error(__('Invalid survey ID.', 'glico-survey'));
        }
        
        $original_survey = $this->database->getSurvey($survey_id);
        if (!$original_survey) {
            wp_send_json_error(__('Survey not found.', 'glico-survey'));
        }
        
        // Create new survey
        $new_survey_data = array(
            'title' => $original_survey['title'] . ' (Copy)',
            'description' => $original_survey['description'],
            'status' => 'draft',
            'settings' => $original_survey['settings']
        );
        
        $new_survey_id = $this->database->createSurvey($new_survey_data);
        
        if ($new_survey_id) {
            // Copy questions
            foreach ($original_survey['questions'] as $question) {
                unset($question['id']);
                $question['survey_id'] = $new_survey_id;
                $this->database->createQuestion($question);
            }
            
            wp_send_json_success(array(
                'message' => __('Survey duplicated successfully.', 'glico-survey'),
                'edit_url' => admin_url('admin.php?page=glico-survey-surveys&action=edit&id=' . $new_survey_id)
            ));
        } else {
            wp_send_json_error(__('Failed to duplicate survey.', 'glico-survey'));
        }
    }
    
    private function ajaxAutoSave() {
        $survey_data = $this->sanitizeSurveyData($_POST);
        $survey_id = intval($_POST['survey_id'] ?? 0);
        
        if ($survey_id > 0 && !empty($survey_data['title'])) {
            $this->database->updateSurvey($survey_id, $survey_data);
            wp_send_json_success(__('Auto-saved.', 'glico-survey'));
        } else {
            wp_send_json_error(__('Nothing to save.', 'glico-survey'));
        }
    }
    
    private function saveSurveyQuestions($survey_id, $questions_data) {
        // Delete existing questions
        $this->database->deleteSurveyQuestions($survey_id);
        
        // Add new questions
        if (is_array($questions_data)) {
            foreach ($questions_data as $question_data) {
                $question_data['survey_id'] = $survey_id;
                $sanitized_question = $this->sanitizeQuestionData($question_data);
                $this->database->createQuestion($sanitized_question);
            }
        }
    }
    
    private function sanitizeSurveyData($data) {
        return \GlicoSurvey\Core\Security::sanitizeSurveyData($data);
    }
    
    private function sanitizeQuestionData($data) {
        return \GlicoSurvey\Core\Security::sanitizeQuestionData($data);
    }
    
    public function handleSaveSurvey() {
        \GlicoSurvey\Core\Security::validateCSRF();
        \GlicoSurvey\Core\Security::checkPermissions();
        
        $survey_data = $this->sanitizeSurveyData($_POST);
        $survey_id = intval($_POST['survey_id'] ?? 0);
        
        if ($survey_id > 0) {
            $result = $this->database->updateSurvey($survey_id, $survey_data);
        } else {
            $result = $this->database->createSurvey($survey_data);
        }
        
        if ($result) {
            wp_redirect(admin_url('admin.php?page=glico-survey-surveys&message=saved'));
        } else {
            wp_redirect(admin_url('admin.php?page=glico-survey-surveys&message=error'));
        }
        exit;
    }
    
    public function handleDeleteSurvey() {
        \GlicoSurvey\Core\Security::validateCSRF();
        \GlicoSurvey\Core\Security::checkPermissions();
        
        $survey_id = intval($_GET['id'] ?? 0);
        
        if ($survey_id > 0) {
            $this->database->deleteSurvey($survey_id);
        }
        
        wp_redirect(admin_url('admin.php?page=glico-survey-surveys&message=deleted'));
        exit;
    }
    
    public function handlePublishSurvey() {
        \GlicoSurvey\Core\Security::validateCSRF();
        \GlicoSurvey\Core\Security::checkPermissions();
        
        $survey_id = intval($_GET['id'] ?? 0);
        $action = sanitize_text_field($_GET['action'] ?? '');
        
        if ($survey_id > 0) {
            $status = $action === 'unpublish' ? 'draft' : 'published';
            $this->database->updateSurvey($survey_id, array('status' => $status));
        }
        
        wp_redirect(admin_url('admin.php?page=glico-survey-surveys&message=' . $action));
        exit;
    }
    
    public function getSurveyStats($survey_id) {
        $survey = $this->database->getSurvey($survey_id);
        if (!$survey) {
            return false;
        }
        
        return array(
            'total_questions' => count($survey['questions']),
            'total_responses' => $survey['response_count'],
            'completion_rate' => $this->calculateCompletionRate($survey_id),
            'avg_time' => $this->calculateAverageTime($survey_id)
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
    
    private function calculateAverageTime($survey_id) {
        global $wpdb;
        $sessions_table = $wpdb->prefix . 'glico_response_sessions';
        
        $avg_time = $wpdb->get_var($wpdb->prepare(
            "SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, completed_at)) 
             FROM $sessions_table 
             WHERE survey_id = %d AND completed = 1 AND completed_at IS NOT NULL",
            $survey_id
        ));
        
        return $avg_time ? round($avg_time, 1) : 0;
    }
}
