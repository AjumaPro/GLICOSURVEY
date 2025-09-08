<?php

namespace GlicoSurvey\Admin;

class AnalyticsDashboard {
    
    private $analytics;
    private $database;
    
    public function __construct() {
        $this->analytics = new \GlicoSurvey\Core\Analytics();
        $this->database = new \GlicoSurvey\Core\Database();
        $this->init();
    }
    
    private function init() {
        // Handle export requests
        add_action('admin_post_glico_export_survey', array($this, 'handleExportSurvey'));
    }
    
    public function handleExportSurvey() {
        \GlicoSurvey\Core\Security::checkPermissions();
        
        $survey_id = intval($_GET['survey_id'] ?? 0);
        $format = sanitize_text_field($_GET['format'] ?? 'csv');
        
        if ($survey_id > 0) {
            $this->analytics->exportSurveyData($survey_id, $format);
        }
        
        wp_redirect(admin_url('admin.php?page=glico-survey-analytics&message=export_failed'));
        exit;
    }
    
    public function getDashboardData() {
        return array(
            'overview' => $this->analytics->getDashboardStats(),
            'recent_surveys' => $this->getRecentSurveys(),
            'top_performing' => $this->getTopPerformingSurveys(),
            'response_trends' => $this->getResponseTrends()
        );
    }
    
    private function getRecentSurveys() {
        return $this->database->getSurveys(array(
            'limit' => 5,
            'orderby' => 'created_at',
            'order' => 'DESC'
        ));
    }
    
    private function getTopPerformingSurveys() {
        $surveys = $this->database->getSurveys(array(
            'status' => 'published',
            'limit' => 10
        ));
        
        // Sort by response count
        usort($surveys, function($a, $b) {
            return $b['response_count'] - $a['response_count'];
        });
        
        return array_slice($surveys, 0, 5);
    }
    
    private function getResponseTrends() {
        global $wpdb;
        $responses_table = $wpdb->prefix . 'glico_responses';
        
        return $wpdb->get_results(
            "SELECT DATE(created_at) as date, COUNT(DISTINCT user_ip) as responses 
             FROM $responses_table 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at) 
             ORDER BY date ASC",
            ARRAY_A
        );
    }
    
    public function getSurveyAnalyticsData($survey_id) {
        $analytics = $this->analytics->getSurveyAnalytics($survey_id);
        
        if (!$analytics) {
            return false;
        }
        
        // Format data for charts
        $chart_data = array(
            'overview' => $analytics['overview'],
            'questions' => array(),
            'response_trends' => $analytics['trends']
        );
        
        foreach ($analytics['questions'] as $question_id => $question_data) {
            $chart_data['questions'][$question_id] = array(
                'title' => $question_data['question']['title'],
                'type' => $question_data['question']['type'],
                'response_count' => $question_data['response_count'],
                'completion_rate' => $question_data['completion_rate'],
                'chart_data' => $this->formatQuestionChartData($question_data)
            );
        }
        
        return $chart_data;
    }
    
    private function formatQuestionChartData($question_data) {
        $question = $question_data['question'];
        $response_data = $question_data['response_data'];
        
        switch ($question['type']) {
            case 'radio':
            case 'select':
            case 'checkbox':
                return $this->formatChoiceChartData($response_data);
                
            case 'rating':
                return $this->formatRatingChartData($response_data);
                
            case 'emoji_scale':
            case 'custom_emoji_scale':
                return $this->formatEmojiChartData($response_data);
                
            default:
                return array();
        }
    }
    
    private function formatChoiceChartData($response_data) {
        $labels = array();
        $data = array();
        $colors = array();
        
        $color_palette = array(
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
        );
        
        $index = 0;
        foreach ($response_data as $option => $count) {
            $labels[] = $option;
            $data[] = $count;
            $colors[] = $color_palette[$index % count($color_palette)];
            $index++;
        }
        
        return array(
            'type' => 'doughnut',
            'data' => array(
                'labels' => $labels,
                'datasets' => array(array(
                    'data' => $data,
                    'backgroundColor' => $colors,
                    'borderWidth' => 2,
                    'borderColor' => '#ffffff'
                ))
            ),
            'options' => array(
                'responsive' => true,
                'maintainAspectRatio' => false,
                'plugins' => array(
                    'legend' => array(
                        'position' => 'bottom'
                    )
                )
            )
        );
    }
    
    private function formatRatingChartData($response_data) {
        $labels = array();
        $data = array();
        
        for ($i = 1; $i <= 10; $i++) {
            $labels[] = $i;
            $data[] = $response_data[$i] ?? 0;
        }
        
        return array(
            'type' => 'bar',
            'data' => array(
                'labels' => $labels,
                'datasets' => array(array(
                    'label' => 'Responses',
                    'data' => $data,
                    'backgroundColor' => '#3b82f6',
                    'borderColor' => '#2563eb',
                    'borderWidth' => 1
                ))
            ),
            'options' => array(
                'responsive' => true,
                'maintainAspectRatio' => false,
                'scales' => array(
                    'y' => array(
                        'beginAtZero' => true,
                        'ticks' => array(
                            'stepSize' => 1
                        )
                    )
                )
            )
        );
    }
    
    private function formatEmojiChartData($response_data) {
        $labels = array();
        $data = array();
        $colors = array();
        
        $emoji_colors = array(
            '😢' => '#ef4444',
            '😞' => '#f97316',
            '😐' => '#f59e0b',
            '😊' => '#10b981',
            '😄' => '#3b82f6'
        );
        
        foreach ($response_data as $emoji => $count) {
            $labels[] = $emoji;
            $data[] = $count;
            $colors[] = $emoji_colors[$emoji] ?? '#6b7280';
        }
        
        return array(
            'type' => 'doughnut',
            'data' => array(
                'labels' => $labels,
                'datasets' => array(array(
                    'data' => $data,
                    'backgroundColor' => $colors,
                    'borderWidth' => 2,
                    'borderColor' => '#ffffff'
                ))
            ),
            'options' => array(
                'responsive' => true,
                'maintainAspectRatio' => false,
                'plugins' => array(
                    'legend' => array(
                        'position' => 'bottom'
                    )
                )
            )
        );
    }
    
    public function getResponseInsights($survey_id) {
        $analytics = $this->analytics->getSurveyAnalytics($survey_id);
        
        if (!$analytics) {
            return false;
        }
        
        $insights = array();
        
        // Completion rate insight
        $completion_rate = $analytics['overview']['completion_rate'];
        if ($completion_rate < 50) {
            $insights[] = array(
                'type' => 'warning',
                'title' => 'Low Completion Rate',
                'message' => "Your survey has a completion rate of {$completion_rate}%. Consider shortening the survey or improving the questions."
            );
        } elseif ($completion_rate > 80) {
            $insights[] = array(
                'type' => 'success',
                'title' => 'High Completion Rate',
                'message' => "Great! Your survey has a completion rate of {$completion_rate}%."
            );
        }
        
        // Response volume insight
        $total_responses = $analytics['overview']['total_responses'];
        if ($total_responses < 10) {
            $insights[] = array(
                'type' => 'info',
                'title' => 'Low Response Volume',
                'message' => "You have {$total_responses} responses. Consider promoting your survey to get more feedback."
            );
        }
        
        // Question analysis
        foreach ($analytics['questions'] as $question_id => $question_data) {
            $completion_rate = $question_data['completion_rate'];
            if ($completion_rate < 70) {
                $insights[] = array(
                    'type' => 'warning',
                    'title' => 'Question Skipped Frequently',
                    'message' => "Question '{$question_data['question']['title']}' is skipped by " . (100 - $completion_rate) . "% of respondents."
                );
            }
        }
        
        return $insights;
    }
}
