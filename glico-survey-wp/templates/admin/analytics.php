<?php
/**
 * Admin Analytics Template
 */

if (!defined('ABSPATH')) {
    exit;
}

$analytics_dashboard = new \GlicoSurvey\Admin\AnalyticsDashboard();
$dashboard_data = $analytics_dashboard->getDashboardData();
?>

<div class="glico-admin-wrapper">
    <div class="glico-admin-container">
        <!-- Header -->
        <div class="glico-admin-header">
            <div class="glico-admin-header-content">
                <h1 class="glico-admin-title"><?php _e('Analytics', 'glico-survey'); ?></h1>
                <p class="glico-admin-subtitle"><?php _e('Track survey performance and analyze response data', 'glico-survey'); ?></p>
            </div>
        </div>

        <!-- Overview Stats -->
        <div class="glico-stats-grid">
            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Total Surveys', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon primary">
                        <span class="dashicons dashicons-feedback"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($dashboard_data['overview']['total_surveys']); ?></p>
            </div>

            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Published Surveys', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon success">
                        <span class="dashicons dashicons-yes-alt"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($dashboard_data['overview']['published_surveys']); ?></p>
            </div>

            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Total Responses', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon primary">
                        <span class="dashicons dashicons-chart-bar"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($dashboard_data['overview']['total_responses']); ?></p>
            </div>

            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Today\'s Responses', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon warning">
                        <span class="dashicons dashicons-calendar-alt"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($dashboard_data['overview']['today_responses']); ?></p>
            </div>
        </div>

        <!-- Response Trends Chart -->
        <div class="glico-content-card">
            <div class="glico-content-card-header">
                <h2 class="glico-content-card-title"><?php _e('Response Trends (Last 30 Days)', 'glico-survey'); ?></h2>
            </div>
            <div class="glico-content-card-body">
                <div class="glico-chart-container">
                    <canvas id="response-trends-chart" class="glico-chart" 
                            data-chart-type="line" 
                            data-chart-data='<?php echo wp_json_encode($this->formatTrendsChartData($dashboard_data['response_trends'])); ?>'></canvas>
                </div>
            </div>
        </div>

        <!-- Top Performing Surveys -->
        <div class="glico-content-card">
            <div class="glico-content-card-header">
                <h2 class="glico-content-card-title"><?php _e('Top Performing Surveys', 'glico-survey'); ?></h2>
            </div>
            <div class="glico-content-card-body">
                <?php if (!empty($dashboard_data['top_performing'])): ?>
                    <div class="glico-table-wrapper">
                        <table class="glico-table">
                            <thead>
                                <tr>
                                    <th><?php _e('Survey', 'glico-survey'); ?></th>
                                    <th><?php _e('Responses', 'glico-survey'); ?></th>
                                    <th><?php _e('Questions', 'glico-survey'); ?></th>
                                    <th><?php _e('Created', 'glico-survey'); ?></th>
                                    <th><?php _e('Actions', 'glico-survey'); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($dashboard_data['top_performing'] as $survey): ?>
                                    <tr>
                                        <td>
                                            <div class="glico-survey-title-cell">
                                                <strong><?php echo esc_html($survey['title']); ?></strong>
                                                <?php if ($survey['description']): ?>
                                                    <br><small class="glico-text-light"><?php echo esc_html($survey['description']); ?></small>
                                                <?php endif; ?>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="glico-response-count"><?php echo esc_html($survey['response_count']); ?></span>
                                        </td>
                                        <td><?php echo count($survey['questions']); ?></td>
                                        <td><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($survey['created_at']))); ?></td>
                                        <td>
                                            <div class="glico-action-buttons">
                                                <a href="<?php echo admin_url('admin.php?page=glico-survey-surveys&action=analytics&id=' . $survey['id']); ?>" 
                                                   class="glico-btn glico-btn-secondary glico-btn-sm">
                                                    <?php _e('View Analytics', 'glico-survey'); ?>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="glico-empty-state">
                        <p><?php _e('No surveys with responses found.', 'glico-survey'); ?></p>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Recent Surveys -->
        <div class="glico-content-card">
            <div class="glico-content-card-header">
                <h2 class="glico-content-card-title"><?php _e('Recent Surveys', 'glico-survey'); ?></h2>
                <a href="<?php echo admin_url('admin.php?page=glico-survey-surveys'); ?>" class="glico-btn glico-btn-secondary">
                    <?php _e('View All', 'glico-survey'); ?>
                </a>
            </div>
            <div class="glico-content-card-body">
                <?php if (!empty($dashboard_data['recent_surveys'])): ?>
                    <div class="glico-recent-surveys">
                        <?php foreach ($dashboard_data['recent_surveys'] as $survey): ?>
                            <div class="glico-recent-survey-item">
                                <div class="glico-survey-info">
                                    <h4><?php echo esc_html($survey['title']); ?></h4>
                                    <p class="glico-survey-meta">
                                        <?php echo count($survey['questions']); ?> <?php _e('questions', 'glico-survey'); ?> • 
                                        <?php echo esc_html($survey['response_count']); ?> <?php _e('responses', 'glico-survey'); ?> • 
                                        <?php echo esc_html(date_i18n(get_option('date_format'), strtotime($survey['created_at']))); ?>
                                    </p>
                                </div>
                                <div class="glico-survey-actions">
                                    <a href="<?php echo admin_url('admin.php?page=glico-survey-surveys&action=analytics&id=' . $survey['id']); ?>" 
                                       class="glico-btn glico-btn-secondary glico-btn-sm">
                                        <?php _e('Analytics', 'glico-survey'); ?>
                                    </a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="glico-empty-state">
                        <p><?php _e('No recent surveys found.', 'glico-survey'); ?></p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize response trends chart
    const trendsCanvas = document.getElementById('response-trends-chart');
    if (trendsCanvas && typeof Chart !== 'undefined') {
        const chartData = JSON.parse(trendsCanvas.dataset.chartData);
        new Chart(trendsCanvas, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
});
</script>

<style>
.glico-chart-container {
    height: 300px;
    position: relative;
}

.glico-recent-surveys {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.glico-recent-survey-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid var(--glico-admin-border);
    border-radius: var(--glico-admin-radius);
    background: #f9f9f9;
}

.glico-survey-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--glico-admin-text);
}

.glico-survey-meta {
    margin: 0;
    font-size: 0.9rem;
    color: var(--glico-admin-text-light);
}

.glico-survey-actions {
    flex-shrink: 0;
}

@media (max-width: 768px) {
    .glico-recent-survey-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }
    
    .glico-survey-actions {
        align-self: flex-end;
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
