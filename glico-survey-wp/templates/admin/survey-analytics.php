<?php
/**
 * Admin Survey Analytics Template
 */

if (!defined('ABSPATH')) {
    exit;
}

$analytics_dashboard = new \GlicoSurvey\Admin\AnalyticsDashboard();
$analytics_data = $analytics_dashboard->getSurveyAnalyticsData($survey['id']);
$insights = $analytics_dashboard->getResponseInsights($survey['id']);
?>

<div class="glico-admin-wrapper">
    <div class="glico-admin-container">
        <!-- Header -->
        <div class="glico-admin-header">
            <div class="glico-admin-header-content">
                <h1 class="glico-admin-title"><?php echo esc_html($survey['title']); ?> - <?php _e('Analytics', 'glico-survey'); ?></h1>
                <p class="glico-admin-subtitle"><?php _e('Detailed analytics and insights for this survey', 'glico-survey'); ?></p>
            </div>
            <div class="glico-admin-header-actions">
                <a href="<?php echo admin_url('admin.php?page=glico-survey-analytics&action=export&survey_id=' . $survey['id'] . '&format=csv'); ?>" 
                   class="glico-btn glico-btn-secondary">
                    <span class="dashicons dashicons-download"></span>
                    <?php _e('Export CSV', 'glico-survey'); ?>
                </a>
                <a href="<?php echo admin_url('admin.php?page=glico-survey-surveys'); ?>" class="glico-btn glico-btn-secondary">
                    <?php _e('Back to Surveys', 'glico-survey'); ?>
                </a>
            </div>
        </div>

        <!-- Overview Stats -->
        <div class="glico-stats-grid">
            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Total Responses', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon primary">
                        <span class="dashicons dashicons-chart-bar"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($analytics_data['overview']['total_responses']); ?></p>
            </div>

            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Completion Rate', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon success">
                        <span class="dashicons dashicons-yes-alt"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($analytics_data['overview']['completion_rate']); ?>%</p>
            </div>

            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Avg. Time', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon warning">
                        <span class="dashicons dashicons-clock"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($analytics_data['overview']['avg_completion_time']); ?>m</p>
            </div>

            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Started Sessions', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon primary">
                        <span class="dashicons dashicons-admin-users"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($analytics_data['overview']['started_sessions']); ?></p>
            </div>
        </div>

        <!-- Insights -->
        <?php if (!empty($insights)): ?>
            <div class="glico-content-card">
                <div class="glico-content-card-header">
                    <h2 class="glico-content-card-title"><?php _e('Insights & Recommendations', 'glico-survey'); ?></h2>
                </div>
                <div class="glico-content-card-body">
                    <div class="glico-insights">
                        <?php foreach ($insights as $insight): ?>
                            <div class="glico-insight-item glico-insight-<?php echo esc_attr($insight['type']); ?>">
                                <div class="glico-insight-icon">
                                    <?php if ($insight['type'] === 'success'): ?>
                                        <span class="dashicons dashicons-yes-alt"></span>
                                    <?php elseif ($insight['type'] === 'warning'): ?>
                                        <span class="dashicons dashicons-warning"></span>
                                    <?php elseif ($insight['type'] === 'error'): ?>
                                        <span class="dashicons dashicons-dismiss"></span>
                                    <?php else: ?>
                                        <span class="dashicons dashicons-info"></span>
                                    <?php endif; ?>
                                </div>
                                <div class="glico-insight-content">
                                    <h4><?php echo esc_html($insight['title']); ?></h4>
                                    <p><?php echo esc_html($insight['message']); ?></p>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>

        <!-- Question Analytics -->
        <div class="glico-content-card">
            <div class="glico-content-card-header">
                <h2 class="glico-content-card-title"><?php _e('Question Analytics', 'glico-survey'); ?></h2>
            </div>
            <div class="glico-content-card-body">
                <?php if (!empty($analytics_data['questions'])): ?>
                    <div class="glico-questions-analytics">
                        <?php foreach ($analytics_data['questions'] as $question_id => $question_data): ?>
                            <div class="glico-question-analytics">
                                <div class="glico-question-header">
                                    <h3><?php echo esc_html($question_data['title']); ?></h3>
                                    <div class="glico-question-meta">
                                        <span class="glico-question-type"><?php echo esc_html(ucfirst(str_replace('_', ' ', $question_data['type']))); ?></span>
                                        <span class="glico-response-count"><?php echo esc_html($question_data['response_count']); ?> <?php _e('responses', 'glico-survey'); ?></span>
                                        <span class="glico-completion-rate"><?php echo esc_html($question_data['completion_rate']); ?>% <?php _e('completion', 'glico-survey'); ?></span>
                                    </div>
                                </div>
                                
                                <div class="glico-question-chart">
                                    <canvas id="question-chart-<?php echo esc_attr($question_id); ?>" 
                                            class="glico-chart" 
                                            data-chart-type="<?php echo esc_attr($question_data['chart_data']['type'] ?? 'bar'); ?>" 
                                            data-chart-data='<?php echo wp_json_encode($question_data['chart_data']); ?>'></canvas>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="glico-empty-state">
                        <p><?php _e('No question data available.', 'glico-survey'); ?></p>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Response Trends -->
        <div class="glico-content-card">
            <div class="glico-content-card-header">
                <h2 class="glico-content-card-title"><?php _e('Response Trends', 'glico-survey'); ?></h2>
            </div>
            <div class="glico-content-card-body">
                <div class="glico-chart-container">
                    <canvas id="response-trends-chart" class="glico-chart" 
                            data-chart-type="line" 
                            data-chart-data='<?php echo wp_json_encode($this->formatTrendsChartData($analytics_data['response_trends'])); ?>'></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize question charts
    document.querySelectorAll('.glico-chart').forEach(function(canvas) {
        if (typeof Chart !== 'undefined') {
            const chartData = JSON.parse(canvas.dataset.chartData);
            new Chart(canvas, {
                type: chartData.type,
                data: chartData.data,
                options: chartData.options || {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    });
});
</script>

<style>
.glico-insights {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.glico-insight-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    border-radius: var(--glico-admin-radius);
    border-left: 4px solid;
}

.glico-insight-item.glico-insight-success {
    background: #d1fae5;
    border-left-color: var(--glico-admin-success);
    color: #065f46;
}

.glico-insight-item.glico-insight-warning {
    background: #fef3c7;
    border-left-color: var(--glico-admin-warning);
    color: #92400e;
}

.glico-insight-item.glico-insight-error {
    background: #fee2e2;
    border-left-color: var(--glico-admin-error);
    color: #991b1b;
}

.glico-insight-item.glico-insight-info {
    background: #dbeafe;
    border-left-color: var(--glico-admin-primary);
    color: #1e40af;
}

.glico-insight-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.glico-insight-content h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
}

.glico-insight-content p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.4;
}

.glico-questions-analytics {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.glico-question-analytics {
    border: 1px solid var(--glico-admin-border);
    border-radius: var(--glico-admin-radius);
    padding: 1.5rem;
    background: #f9f9f9;
}

.glico-question-header {
    margin-bottom: 1rem;
}

.glico-question-header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--glico-admin-text);
}

.glico-question-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.glico-question-meta span {
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--glico-admin-radius);
    background: white;
    border: 1px solid var(--glico-admin-border);
}

.glico-question-type {
    color: var(--glico-admin-primary);
    font-weight: 500;
}

.glico-response-count {
    color: var(--glico-admin-success);
    font-weight: 500;
}

.glico-completion-rate {
    color: var(--glico-admin-warning);
    font-weight: 500;
}

.glico-question-chart {
    height: 200px;
    position: relative;
}

.glico-chart-container {
    height: 300px;
    position: relative;
}

@media (max-width: 768px) {
    .glico-question-meta {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .glico-insight-item {
        flex-direction: column;
        text-align: center;
    }
}
</style>

<?php
// Helper function to format trends chart data
function formatTrendsChartData($trends) {
    $labels = array();
    $data = array();
    
    foreach ($trends as $trend) {
        $labels[] = date('M j', strtotime($trend['date']));
        $data[] = intval($trend['responses']);
    }
    
    return array(
        'labels' => $labels,
        'datasets' => array(array(
            'label' => 'Responses',
            'data' => $data,
            'borderColor' => '#3b82f6',
            'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
            'tension' => 0.4,
            'fill' => true
        ))
    );
}
?>
