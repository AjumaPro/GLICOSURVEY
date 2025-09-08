<?php
/**
 * Admin Surveys List Template
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="glico-admin-wrapper">
    <div class="glico-admin-container">
        <!-- Header -->
        <div class="glico-admin-header">
            <div class="glico-admin-header-content">
                <h1 class="glico-admin-title"><?php _e('Surveys', 'glico-survey'); ?></h1>
                <p class="glico-admin-subtitle"><?php _e('Manage your surveys and track their performance', 'glico-survey'); ?></p>
            </div>
            <div class="glico-admin-header-actions">
                <a href="<?php echo admin_url('admin.php?page=glico-survey-create'); ?>" class="glico-btn glico-btn-primary">
                    <span class="dashicons dashicons-plus-alt"></span>
                    <?php _e('Create Survey', 'glico-survey'); ?>
                </a>
            </div>
        </div>

        <!-- Filters -->
        <div class="glico-content-card">
            <div class="glico-content-card-body">
                <div class="glico-filters">
                    <div class="glico-filter-group">
                        <label for="status-filter"><?php _e('Status:', 'glico-survey'); ?></label>
                        <select id="status-filter" class="glico-form-select">
                            <option value=""><?php _e('All Status', 'glico-survey'); ?></option>
                            <option value="published"><?php _e('Published', 'glico-survey'); ?></option>
                            <option value="draft"><?php _e('Draft', 'glico-survey'); ?></option>
                            <option value="archived"><?php _e('Archived', 'glico-survey'); ?></option>
                        </select>
                    </div>
                    
                    <div class="glico-filter-group">
                        <label for="search-filter"><?php _e('Search:', 'glico-survey'); ?></label>
                        <input type="text" id="search-filter" class="glico-form-input" placeholder="<?php _e('Search surveys...', 'glico-survey'); ?>">
                    </div>
                    
                    <div class="glico-filter-group">
                        <label for="sort-filter"><?php _e('Sort by:', 'glico-survey'); ?></label>
                        <select id="sort-filter" class="glico-form-select">
                            <option value="created_at"><?php _e('Date Created', 'glico-survey'); ?></option>
                            <option value="title"><?php _e('Title', 'glico-survey'); ?></option>
                            <option value="responses"><?php _e('Responses', 'glico-survey'); ?></option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Surveys Table -->
        <div class="glico-content-card">
            <div class="glico-content-card-body">
                <?php if (!empty($surveys)): ?>
                    <div class="glico-table-wrapper">
                        <table class="glico-table" id="surveys-table">
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
                                <?php foreach ($surveys as $survey): ?>
                                    <tr data-survey-id="<?php echo esc_attr($survey['id']); ?>" data-status="<?php echo esc_attr($survey['status']); ?>">
                                        <td>
                                            <div class="glico-survey-title-cell">
                                                <strong><?php echo esc_html($survey['title']); ?></strong>
                                                <?php if ($survey['description']): ?>
                                                    <br><small class="glico-text-light"><?php echo esc_html($survey['description']); ?></small>
                                                <?php endif; ?>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="glico-status-badge <?php echo esc_attr($survey['status']); ?>">
                                                <?php echo esc_html(ucfirst($survey['status'])); ?>
                                            </span>
                                        </td>
                                        <td>
                                            <span class="glico-question-count">
                                                <?php echo count($survey['questions']); ?>
                                            </span>
                                        </td>
                                        <td>
                                            <span class="glico-response-count">
                                                <?php echo esc_html($survey['response_count']); ?>
                                            </span>
                                        </td>
                                        <td>
                                            <span class="glico-date">
                                                <?php echo esc_html(date_i18n(get_option('date_format'), strtotime($survey['created_at']))); ?>
                                            </span>
                                        </td>
                                        <td>
                                            <div class="glico-action-buttons">
                                                <a href="<?php echo admin_url('admin.php?page=glico-survey-surveys&action=edit&id=' . $survey['id']); ?>" 
                                                   class="glico-btn glico-btn-secondary glico-btn-sm" title="<?php _e('Edit Survey', 'glico-survey'); ?>">
                                                    <span class="dashicons dashicons-edit"></span>
                                                </a>
                                                
                                                <a href="<?php echo admin_url('admin.php?page=glico-survey-surveys&action=analytics&id=' . $survey['id']); ?>" 
                                                   class="glico-btn glico-btn-secondary glico-btn-sm" title="<?php _e('View Analytics', 'glico-survey'); ?>">
                                                    <span class="dashicons dashicons-chart-bar"></span>
                                                </a>
                                                
                                                <?php if ($survey['status'] === 'published'): ?>
                                                    <a href="<?php echo home_url('/survey/' . $survey['id']); ?>" 
                                                       class="glico-btn glico-btn-secondary glico-btn-sm" 
                                                       target="_blank" title="<?php _e('View Survey', 'glico-survey'); ?>">
                                                        <span class="dashicons dashicons-external"></span>
                                                    </a>
                                                    
                                                    <button class="glico-btn glico-btn-warning glico-btn-sm glico-btn-unpublish" 
                                                            data-survey-id="<?php echo esc_attr($survey['id']); ?>" 
                                                            title="<?php _e('Unpublish Survey', 'glico-survey'); ?>">
                                                        <span class="dashicons dashicons-hidden"></span>
                                                    </button>
                                                <?php else: ?>
                                                    <button class="glico-btn glico-btn-success glico-btn-sm glico-btn-publish" 
                                                            data-survey-id="<?php echo esc_attr($survey['id']); ?>" 
                                                            title="<?php _e('Publish Survey', 'glico-survey'); ?>">
                                                        <span class="dashicons dashicons-visibility"></span>
                                                    </button>
                                                <?php endif; ?>
                                                
                                                <button class="glico-btn glico-btn-secondary glico-btn-sm glico-btn-duplicate" 
                                                        data-survey-id="<?php echo esc_attr($survey['id']); ?>" 
                                                        title="<?php _e('Duplicate Survey', 'glico-survey'); ?>">
                                                    <span class="dashicons dashicons-admin-page"></span>
                                                </button>
                                                
                                                <button class="glico-btn glico-btn-error glico-btn-sm glico-btn-delete" 
                                                        data-survey-id="<?php echo esc_attr($survey['id']); ?>" 
                                                        title="<?php _e('Delete Survey', 'glico-survey'); ?>">
                                                    <span class="dashicons dashicons-trash"></span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="glico-empty-state">
                        <div class="glico-empty-state-icon">
                            <span class="dashicons dashicons-feedback"></span>
                        </div>
                        <h3><?php _e('No surveys found', 'glico-survey'); ?></h3>
                        <p><?php _e('Create your first survey to start collecting responses and insights.', 'glico-survey'); ?></p>
                        <a href="<?php echo admin_url('admin.php?page=glico-survey-create'); ?>" class="glico-btn glico-btn-primary">
                            <span class="dashicons dashicons-plus-alt"></span>
                            <?php _e('Create Your First Survey', 'glico-survey'); ?>
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<style>
.glico-admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.glico-admin-header-content {
    flex: 1;
}

.glico-admin-header-actions {
    flex-shrink: 0;
}

.glico-filters {
    display: flex;
    gap: 1rem;
    align-items: end;
    flex-wrap: wrap;
}

.glico-filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.glico-filter-group label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--glico-admin-text);
}

.glico-survey-title-cell {
    max-width: 300px;
}

.glico-question-count,
.glico-response-count {
    font-weight: 600;
    color: var(--glico-admin-primary);
}

.glico-date {
    color: var(--glico-admin-text-light);
    font-size: 0.9rem;
}

.glico-empty-state {
    text-align: center;
    padding: 3rem 2rem;
}

.glico-empty-state-icon {
    font-size: 4rem;
    color: var(--glico-admin-text-light);
    margin-bottom: 1rem;
}

.glico-empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--glico-admin-text);
    margin-bottom: 0.5rem;
}

.glico-empty-state p {
    color: var(--glico-admin-text-light);
    margin-bottom: 2rem;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

@media (max-width: 768px) {
    .glico-admin-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .glico-filters {
        flex-direction: column;
        align-items: stretch;
    }
    
    .glico-filter-group {
        width: 100%;
    }
    
    .glico-action-buttons {
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .glico-action-buttons .glico-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
