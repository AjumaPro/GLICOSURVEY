<?php
/**
 * Admin Dashboard Template
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="glico-admin-wrapper">
    <div class="glico-admin-container">
        <!-- Header -->
        <div class="glico-admin-header">
            <h1 class="glico-admin-title"><?php _e('Glico Survey Dashboard', 'glico-survey'); ?></h1>
            <p class="glico-admin-subtitle"><?php _e('Manage your surveys and track responses', 'glico-survey'); ?></p>
        </div>

        <!-- Stats Grid -->
        <div class="glico-stats-grid">
            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Total Surveys', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon primary">
                        <span class="dashicons dashicons-feedback"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($stats['total_surveys']); ?></p>
            </div>

            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Published Surveys', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon success">
                        <span class="dashicons dashicons-yes-alt"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($stats['published_surveys']); ?></p>
            </div>

            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Draft Surveys', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon warning">
                        <span class="dashicons dashicons-edit"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($stats['draft_surveys']); ?></p>
            </div>

            <div class="glico-stat-card">
                <div class="glico-stat-card-header">
                    <h3 class="glico-stat-card-title"><?php _e('Total Responses', 'glico-survey'); ?></h3>
                    <div class="glico-stat-card-icon primary">
                        <span class="dashicons dashicons-chart-bar"></span>
                    </div>
                </div>
                <p class="glico-stat-card-value"><?php echo esc_html($stats['total_responses']); ?></p>
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
                <?php if (!empty($recent_surveys)): ?>
                    <div class="glico-table-wrapper">
                        <table class="glico-table">
                            <thead>
                                <tr>
                                    <th><?php _e('Title', 'glico-survey'); ?></th>
                                    <th><?php _e('Status', 'glico-survey'); ?></th>
                                    <th><?php _e('Questions', 'glico-survey'); ?></th>
                                    <th><?php _e('Responses', 'glico-survey'); ?></th>
                                    <th><?php _e('Created', 'glico-survey'); ?></th>
                                    <th><?php _e('Actions', 'glico-survey'); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($recent_surveys as $survey): ?>
                                    <tr>
                                        <td>
                                            <strong><?php echo esc_html($survey['title']); ?></strong>
                                            <?php if ($survey['description']): ?>
                                                <br><small class="glico-text-light"><?php echo esc_html($survey['description']); ?></small>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <span class="glico-status-badge <?php echo esc_attr($survey['status']); ?>">
                                                <?php echo esc_html(ucfirst($survey['status'])); ?>
                                            </span>
                                        </td>
                                        <td><?php echo esc_html(count($survey['questions'])); ?></td>
                                        <td><?php echo esc_html($survey['response_count']); ?></td>
                                        <td><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($survey['created_at']))); ?></td>
                                        <td>
                                            <div class="glico-action-buttons">
                                                <a href="<?php echo admin_url('admin.php?page=glico-survey-surveys&action=edit&id=' . $survey['id']); ?>" 
                                                   class="glico-btn glico-btn-secondary glico-btn-sm">
                                                    <?php _e('Edit', 'glico-survey'); ?>
                                                </a>
                                                <a href="<?php echo admin_url('admin.php?page=glico-survey-surveys&action=analytics&id=' . $survey['id']); ?>" 
                                                   class="glico-btn glico-btn-secondary glico-btn-sm">
                                                    <?php _e('Analytics', 'glico-survey'); ?>
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
                        <p><?php _e('No surveys found. Create your first survey to get started!', 'glico-survey'); ?></p>
                        <a href="<?php echo admin_url('admin.php?page=glico-survey-create'); ?>" class="glico-btn glico-btn-primary">
                            <?php _e('Create Survey', 'glico-survey'); ?>
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="glico-content-card">
            <div class="glico-content-card-header">
                <h2 class="glico-content-card-title"><?php _e('Quick Actions', 'glico-survey'); ?></h2>
            </div>
            <div class="glico-content-card-body">
                <div class="glico-quick-actions">
                    <a href="<?php echo admin_url('admin.php?page=glico-survey-create'); ?>" class="glico-btn glico-btn-primary glico-btn-lg">
                        <span class="dashicons dashicons-plus-alt"></span>
                        <?php _e('Create New Survey', 'glico-survey'); ?>
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=glico-survey-surveys'); ?>" class="glico-btn glico-btn-secondary glico-btn-lg">
                        <span class="dashicons dashicons-list-view"></span>
                        <?php _e('Manage Surveys', 'glico-survey'); ?>
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=glico-survey-analytics'); ?>" class="glico-btn glico-btn-secondary glico-btn-lg">
                        <span class="dashicons dashicons-chart-line"></span>
                        <?php _e('View Analytics', 'glico-survey'); ?>
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=glico-survey-settings'); ?>" class="glico-btn glico-btn-secondary glico-btn-lg">
                        <span class="dashicons dashicons-admin-settings"></span>
                        <?php _e('Settings', 'glico-survey'); ?>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.glico-quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.glico-quick-actions .glico-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
}

.glico-empty-state {
    text-align: center;
    padding: 40px 20px;
}

.glico-empty-state p {
    margin-bottom: 20px;
    color: var(--glico-admin-text-light);
}
</style>
