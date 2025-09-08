<?php

namespace GlicoSurvey\Core;

class Analytics {
    
    private $database;
    
    public function __construct() {
        $this->database = new Database();
    }
    
    public function getSurveyAnalytics($survey_id) {
        $survey = $this->database->getSurvey($survey_id);
        if (!$survey) {
            return false;
        }
        
        $analytics = array(
            'survey' => $survey,
            'overview' => $this->getOverviewStats($survey_id),
            'questions' => $this->getQuestionAnalytics($survey_id),
            'responses' => $this->getResponseAnalytics($survey_id),
            'trends' => $this->getTrendAnalytics($survey_id)
        );
        
        return $analytics;
    }
    
    private function getOverviewStats($survey_id) {
        global $wpdb;
        
        $responses_table = $wpdb->prefix . 'glico_responses';
        $sessions_table = $wpdb->prefix . 'glico_response_sessions';
        
        $stats = array();
        
        // Total responses
        $stats['total_responses'] = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(DISTINCT user_ip) FROM $responses_table WHERE survey_id = %d",
            $survey_id
        ));
        
        // Completed sessions
        $stats['completed_sessions'] = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $sessions_table WHERE survey_id = %d AND completed = 1",
            $survey_id
        ));
        
        // Started sessions
        $stats['started_sessions'] = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $sessions_table WHERE survey_id = %d",
            $survey_id
        ));
        
        // Completion rate
        $stats['completion_rate'] = $stats['started_sessions'] > 0 
            ? round(($stats['completed_sessions'] / $stats['started_sessions']) * 100, 2)
            : 0;
        
        // Average completion time
        $avg_time = $wpdb->get_var($wpdb->prepare(
            "SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, completed_at)) 
             FROM $sessions_table 
             WHERE survey_id = %d AND completed = 1 AND completed_at IS NOT NULL",
            $survey_id
        ));
        
        $stats['avg_completion_time'] = $avg_time ? round($avg_time, 1) : 0;
        
        return $stats;
    }
    
    private function getQuestionAnalytics($survey_id) {
        $questions = $this->database->getSurveyQuestions($survey_id);
        $analytics = array();
        
        foreach ($questions as $question) {
            $analytics[$question['id']] = array(
                'question' => $question,
                'response_count' => $this->getQuestionResponseCount($question['id']),
                'response_data' => $this->getQuestionResponseData($question['id']),
                'completion_rate' => $this->getQuestionCompletionRate($question['id'])
            );
        }
        
        return $analytics;
    }
    
    private function getQuestionResponseCount($question_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'glico_responses';
        
        return $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table WHERE question_id = %d",
            $question_id
        ));
    }
    
    private function getQuestionResponseData($question_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'glico_responses';
        
        $responses = $wpdb->get_results($wpdb->prepare(
            "SELECT response_value FROM $table WHERE question_id = %d",
            $question_id
        ), ARRAY_A);
        
        $data = array();
        foreach ($responses as $response) {
            $value = $response['response_value'];
            if (!isset($data[$value])) {
                $data[$value] = 0;
            }
            $data[$value]++;
        }
        
        return $data;
    }
    
    private function getQuestionCompletionRate($question_id) {
        global $wpdb;
        $responses_table = $wpdb->prefix . 'glico_responses';
        $sessions_table = $wpdb->prefix . 'glico_response_sessions';
        
        $total_sessions = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $sessions_table s 
             INNER JOIN $responses_table r ON s.survey_id = r.survey_id 
             WHERE r.question_id = %d",
            $question_id
        ));
        
        $answered_sessions = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(DISTINCT s.session_id) FROM $sessions_table s 
             INNER JOIN $responses_table r ON s.survey_id = r.survey_id 
             WHERE r.question_id = %d AND r.response_value IS NOT NULL AND r.response_value != ''",
            $question_id
        ));
        
        return $total_sessions > 0 ? round(($answered_sessions / $total_sessions) * 100, 2) : 0;
    }
    
    private function getResponseAnalytics($survey_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'glico_responses';
        
        // Response distribution by day
        $daily_responses = $wpdb->get_results($wpdb->prepare(
            "SELECT DATE(created_at) as date, COUNT(DISTINCT user_ip) as count 
             FROM $table 
             WHERE survey_id = %d 
             GROUP BY DATE(created_at) 
             ORDER BY date ASC",
            $survey_id
        ), ARRAY_A);
        
        // Response distribution by hour
        $hourly_responses = $wpdb->get_results($wpdb->prepare(
            "SELECT HOUR(created_at) as hour, COUNT(DISTINCT user_ip) as count 
             FROM $table 
             WHERE survey_id = %d 
             GROUP BY HOUR(created_at) 
             ORDER BY hour ASC",
            $survey_id
        ), ARRAY_A);
        
        return array(
            'daily' => $daily_responses,
            'hourly' => $hourly_responses
        );
    }
    
    private function getTrendAnalytics($survey_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'glico_responses';
        
        // Get responses over time
        $trends = $wpdb->get_results($wpdb->prepare(
            "SELECT DATE(created_at) as date, COUNT(DISTINCT user_ip) as responses 
             FROM $table 
             WHERE survey_id = %d 
             AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at) 
             ORDER BY date ASC",
            $survey_id
        ), ARRAY_A);
        
        return $trends;
    }
    
    public function exportSurveyData($survey_id, $format = 'csv') {
        $survey = $this->database->getSurvey($survey_id);
        if (!$survey) {
            return false;
        }
        
        $responses = $this->database->getSurveyResponses($survey_id, array('limit' => 10000));
        
        if ($format === 'csv') {
            return $this->exportToCSV($survey, $responses);
        }
        
        return false;
    }
    
    private function exportToCSV($survey, $responses) {
        $filename = 'survey_' . $survey['id'] . '_responses_' . date('Y-m-d') . '.csv';
        
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        
        $output = fopen('php://output', 'w');
        
        // Headers
        $headers = array('Response ID', 'Question ID', 'Question Title', 'Response Value', 'User IP', 'Date');
        fputcsv($output, $headers);
        
        // Data
        foreach ($responses as $response) {
            $question = $this->findQuestionById($survey['questions'], $response['question_id']);
            $question_title = $question ? $question['title'] : 'Unknown Question';
            
            fputcsv($output, array(
                $response['id'],
                $response['question_id'],
                $question_title,
                $response['response_value'],
                $response['user_ip'],
                $response['created_at']
            ));
        }
        
        fclose($output);
        exit;
    }
    
    private function findQuestionById($questions, $question_id) {
        foreach ($questions as $question) {
            if ($question['id'] == $question_id) {
                return $question;
            }
        }
        return null;
    }
    
    public function getDashboardStats() {
        global $wpdb;
        
        $surveys_table = $wpdb->prefix . 'glico_surveys';
        $responses_table = $wpdb->prefix . 'glico_responses';
        $sessions_table = $wpdb->prefix . 'glico_response_sessions';
        
        $stats = array();
        
        // Total surveys
        $stats['total_surveys'] = $wpdb->get_var("SELECT COUNT(*) FROM $surveys_table");
        
        // Published surveys
        $stats['published_surveys'] = $wpdb->get_var("SELECT COUNT(*) FROM $surveys_table WHERE status = 'published'");
        
        // Total responses
        $stats['total_responses'] = $wpdb->get_var("SELECT COUNT(DISTINCT user_ip) FROM $responses_table");
        
        // Today's responses
        $stats['today_responses'] = $wpdb->get_var(
            "SELECT COUNT(DISTINCT user_ip) FROM $responses_table WHERE DATE(created_at) = CURDATE()"
        );
        
        // This week's responses
        $stats['week_responses'] = $wpdb->get_var(
            "SELECT COUNT(DISTINCT user_ip) FROM $responses_table WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        );
        
        // Average responses per survey
        $stats['avg_responses_per_survey'] = $stats['published_surveys'] > 0 
            ? round($stats['total_responses'] / $stats['published_surveys'], 1)
            : 0;
        
        return $stats;
    }
}
