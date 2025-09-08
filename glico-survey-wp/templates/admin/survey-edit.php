<?php
/**
 * Admin Survey Edit Template
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
                <h1 class="glico-admin-title"><?php _e('Edit Survey', 'glico-survey'); ?>: <?php echo esc_html($survey['title']); ?></h1>
                <p class="glico-admin-subtitle"><?php _e('Modify your survey questions and settings', 'glico-survey'); ?></p>
            </div>
            <div class="glico-admin-header-actions">
                <button type="button" class="glico-btn glico-btn-secondary" id="preview-survey">
                    <span class="dashicons dashicons-visibility"></span>
                    <?php _e('Preview', 'glico-survey'); ?>
                </button>
                <button type="button" class="glico-btn glico-btn-secondary" id="save-draft">
                    <span class="dashicons dashicons-saved"></span>
                    <?php _e('Save Draft', 'glico-survey'); ?>
                </button>
            </div>
        </div>

        <!-- Survey Form -->
        <form class="glico-survey-form" id="survey-builder-form">
            <?php wp_nonce_field('glico_survey_nonce', 'glico_survey_nonce'); ?>
            <input type="hidden" name="survey_id" value="<?php echo esc_attr($survey['id']); ?>">
            
            <!-- Survey Settings -->
            <div class="glico-content-card">
                <div class="glico-content-card-header">
                    <h2 class="glico-content-card-title"><?php _e('Survey Settings', 'glico-survey'); ?></h2>
                </div>
                <div class="glico-content-card-body">
                    <div class="glico-form-grid">
                        <div class="glico-form-group">
                            <label for="survey-title" class="glico-form-label required"><?php _e('Survey Title', 'glico-survey'); ?></label>
                            <input type="text" id="survey-title" name="title" class="glico-form-input" required 
                                   value="<?php echo esc_attr($survey['title']); ?>"
                                   placeholder="<?php _e('Enter survey title...', 'glico-survey'); ?>">
                        </div>
                        
                        <div class="glico-form-group">
                            <label for="survey-status" class="glico-form-label"><?php _e('Status', 'glico-survey'); ?></label>
                            <select id="survey-status" name="status" class="glico-form-select">
                                <option value="draft" <?php selected($survey['status'], 'draft'); ?>><?php _e('Draft', 'glico-survey'); ?></option>
                                <option value="published" <?php selected($survey['status'], 'published'); ?>><?php _e('Published', 'glico-survey'); ?></option>
                                <option value="archived" <?php selected($survey['status'], 'archived'); ?>><?php _e('Archived', 'glico-survey'); ?></option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="glico-form-group">
                        <label for="survey-description" class="glico-form-label"><?php _e('Description', 'glico-survey'); ?></label>
                        <textarea id="survey-description" name="description" class="glico-form-textarea" rows="3" 
                                  placeholder="<?php _e('Enter survey description (optional)...', 'glico-survey'); ?>"><?php echo esc_textarea($survey['description']); ?></textarea>
                    </div>
                </div>
            </div>

            <!-- Questions Builder -->
            <div class="glico-content-card">
                <div class="glico-content-card-header">
                    <h2 class="glico-content-card-title"><?php _e('Questions', 'glico-survey'); ?></h2>
                    <button type="button" class="glico-btn glico-btn-primary" id="add-question">
                        <span class="dashicons dashicons-plus-alt"></span>
                        <?php _e('Add Question', 'glico-survey'); ?>
                    </button>
                </div>
                <div class="glico-content-card-body">
                    <div class="glico-questions-list" id="questions-list">
                        <?php if (!empty($survey['questions'])): ?>
                            <?php foreach ($survey['questions'] as $index => $question): ?>
                                <div class="glico-question-builder" data-question-index="<?php echo $index; ?>" data-question-id="<?php echo esc_attr($question['id']); ?>">
                                    <div class="glico-question-builder-header">
                                        <div class="glico-question-builder-title">
                                            <span class="glico-sortable-handle dashicons dashicons-menu"></span>
                                            <span class="question-number">Question <?php echo $index + 1; ?></span>
                                        </div>
                                        <div class="glico-question-builder-actions">
                                            <button type="button" class="glico-btn glico-btn-secondary glico-btn-sm" onclick="duplicateQuestion(this)">
                                                <span class="dashicons dashicons-admin-page"></span>
                                            </button>
                                            <button type="button" class="glico-btn glico-btn-error glico-btn-sm glico-remove-question">
                                                <span class="dashicons dashicons-trash"></span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="glico-question-builder-body">
                                        <div class="glico-form-group">
                                            <label class="glico-form-label required"><?php _e('Question Title', 'glico-survey'); ?></label>
                                            <input type="text" name="questions[<?php echo $index; ?>][title]" class="glico-form-input" required 
                                                   value="<?php echo esc_attr($question['title']); ?>"
                                                   placeholder="<?php _e('Enter your question...', 'glico-survey'); ?>">
                                        </div>
                                        
                                        <div class="glico-form-group">
                                            <label class="glico-form-label"><?php _e('Question Type', 'glico-survey'); ?></label>
                                            <div class="glico-question-type-selector">
                                                <label class="glico-question-type">
                                                    <input type="radio" name="questions[<?php echo $index; ?>][type]" value="text" <?php checked($question['type'], 'text'); ?>>
                                                    <div>
                                                        <div class="glico-question-type-label"><?php _e('Text Input', 'glico-survey'); ?></div>
                                                        <div class="glico-question-type-description"><?php _e('Single line text', 'glico-survey'); ?></div>
                                                    </div>
                                                </label>
                                                <label class="glico-question-type">
                                                    <input type="radio" name="questions[<?php echo $index; ?>][type]" value="textarea" <?php checked($question['type'], 'textarea'); ?>>
                                                    <div>
                                                        <div class="glico-question-type-label"><?php _e('Text Area', 'glico-survey'); ?></div>
                                                        <div class="glico-question-type-description"><?php _e('Multi-line text', 'glico-survey'); ?></div>
                                                    </div>
                                                </label>
                                                <label class="glico-question-type">
                                                    <input type="radio" name="questions[<?php echo $index; ?>][type]" value="radio" <?php checked($question['type'], 'radio'); ?>>
                                                    <div>
                                                        <div class="glico-question-type-label"><?php _e('Radio Buttons', 'glico-survey'); ?></div>
                                                        <div class="glico-question-type-description"><?php _e('Single choice', 'glico-survey'); ?></div>
                                                    </div>
                                                </label>
                                                <label class="glico-question-type">
                                                    <input type="radio" name="questions[<?php echo $index; ?>][type]" value="checkbox" <?php checked($question['type'], 'checkbox'); ?>>
                                                    <div>
                                                        <div class="glico-question-type-label"><?php _e('Checkboxes', 'glico-survey'); ?></div>
                                                        <div class="glico-question-type-description"><?php _e('Multiple choice', 'glico-survey'); ?></div>
                                                    </div>
                                                </label>
                                                <label class="glico-question-type">
                                                    <input type="radio" name="questions[<?php echo $index; ?>][type]" value="select" <?php checked($question['type'], 'select'); ?>>
                                                    <div>
                                                        <div class="glico-question-type-label"><?php _e('Dropdown', 'glico-survey'); ?></div>
                                                        <div class="glico-question-type-description"><?php _e('Select from list', 'glico-survey'); ?></div>
                                                    </div>
                                                </label>
                                                <label class="glico-question-type">
                                                    <input type="radio" name="questions[<?php echo $index; ?>][type]" value="rating" <?php checked($question['type'], 'rating'); ?>>
                                                    <div>
                                                        <div class="glico-question-type-label"><?php _e('Rating Scale', 'glico-survey'); ?></div>
                                                        <div class="glico-question-type-description"><?php _e('1-10 scale', 'glico-survey'); ?></div>
                                                    </div>
                                                </label>
                                                <label class="glico-question-type">
                                                    <input type="radio" name="questions[<?php echo $index; ?>][type]" value="emoji_scale" <?php checked($question['type'], 'emoji_scale'); ?>>
                                                    <div>
                                                        <div class="glico-question-type-label"><?php _e('Emoji Scale', 'glico-survey'); ?></div>
                                                        <div class="glico-question-type-description"><?php _e('Happy to sad', 'glico-survey'); ?></div>
                                                    </div>
                                                </label>
                                                <label class="glico-question-type">
                                                    <input type="radio" name="questions[<?php echo $index; ?>][type]" value="custom_emoji_scale" <?php checked($question['type'], 'custom_emoji_scale'); ?>>
                                                    <div>
                                                        <div class="glico-question-type-label"><?php _e('Custom Emoji', 'glico-survey'); ?></div>
                                                        <div class="glico-question-type-description"><?php _e('Custom emoji scale', 'glico-survey'); ?></div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div class="glico-options-builder" style="<?php echo in_array($question['type'], ['radio', 'checkbox', 'select']) ? '' : 'display: none;'; ?>">
                                            <label class="glico-form-label"><?php _e('Options', 'glico-survey'); ?></label>
                                            <div class="glico-options-list">
                                                <?php if (!empty($question['options'])): ?>
                                                    <?php foreach ($question['options'] as $option_index => $option): ?>
                                                        <div class="glico-option-item">
                                                            <input type="text" class="glico-option-input" 
                                                                   value="<?php echo esc_attr($option); ?>"
                                                                   name="questions[<?php echo $index; ?>][options][<?php echo $option_index; ?>]">
                                                            <button type="button" class="glico-option-remove">×</button>
                                                        </div>
                                                    <?php endforeach; ?>
                                                <?php else: ?>
                                                    <div class="glico-option-item">
                                                        <input type="text" class="glico-option-input" placeholder="<?php _e('Option 1', 'glico-survey'); ?>" name="questions[<?php echo $index; ?>][options][0]">
                                                        <button type="button" class="glico-option-remove">×</button>
                                                    </div>
                                                    <div class="glico-option-item">
                                                        <input type="text" class="glico-option-input" placeholder="<?php _e('Option 2', 'glico-survey'); ?>" name="questions[<?php echo $index; ?>][options][1]">
                                                        <button type="button" class="glico-option-remove">×</button>
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                            <button type="button" class="glico-add-option"><?php _e('Add Option', 'glico-survey'); ?></button>
                                        </div>
                                        
                                        <div class="glico-form-group">
                                            <label class="glico-form-label">
                                                <input type="checkbox" name="questions[<?php echo $index; ?>][required]" value="1" <?php checked($question['required']); ?>>
                                                <?php _e('Required question', 'glico-survey'); ?>
                                            </label>
                                        </div>
                                        
                                        <input type="hidden" name="questions[<?php echo $index; ?>][id]" value="<?php echo esc_attr($question['id']); ?>">
                                        <input type="hidden" name="questions[<?php echo $index; ?>][order_index]" value="<?php echo $index; ?>">
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                    
                    <div class="glico-empty-questions" id="empty-questions" style="<?php echo !empty($survey['questions']) ? 'display: none;' : ''; ?>">
                        <div class="glico-empty-questions-icon">
                            <span class="dashicons dashicons-feedback"></span>
                        </div>
                        <h3><?php _e('No questions yet', 'glico-survey'); ?></h3>
                        <p><?php _e('Add your first question to start building your survey.', 'glico-survey'); ?></p>
                        <button type="button" class="glico-btn glico-btn-primary" id="add-first-question">
                            <span class="dashicons dashicons-plus-alt"></span>
                            <?php _e('Add First Question', 'glico-survey'); ?>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Survey Settings -->
            <div class="glico-content-card">
                <div class="glico-content-card-header">
                    <h2 class="glico-content-card-title"><?php _e('Advanced Settings', 'glico-survey'); ?></h2>
                </div>
                <div class="glico-content-card-body">
                    <div class="glico-form-grid">
                        <div class="glico-form-group">
                            <label class="glico-form-label">
                                <input type="checkbox" name="settings[show_progress]" value="1" <?php checked($survey['settings']['show_progress'] ?? true); ?>>
                                <?php _e('Show progress bar', 'glico-survey'); ?>
                            </label>
                        </div>
                        
                        <div class="glico-form-group">
                            <label class="glico-form-label">
                                <input type="checkbox" name="settings[allow_back]" value="1" <?php checked($survey['settings']['allow_back'] ?? true); ?>>
                                <?php _e('Allow going back', 'glico-survey'); ?>
                            </label>
                        </div>
                        
                        <div class="glico-form-group">
                            <label class="glico-form-label">
                                <input type="checkbox" name="settings[auto_save]" value="1" <?php checked($survey['settings']['auto_save'] ?? true); ?>>
                                <?php _e('Auto-save responses', 'glico-survey'); ?>
                            </label>
                        </div>
                        
                        <div class="glico-form-group">
                            <label class="glico-form-label">
                                <input type="checkbox" name="settings[randomize_questions]" value="1" <?php checked($survey['settings']['randomize_questions'] ?? false); ?>>
                                <?php _e('Randomize question order', 'glico-survey'); ?>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="glico-form-actions">
                <a href="<?php echo admin_url('admin.php?page=glico-survey-surveys'); ?>" class="glico-btn glico-btn-secondary">
                    <?php _e('Cancel', 'glico-survey'); ?>
                </a>
                <button type="submit" class="glico-btn glico-btn-primary glico-btn-lg">
                    <span class="dashicons dashicons-saved"></span>
                    <?php _e('Update Survey', 'glico-survey'); ?>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Question Template -->
<script type="text/template" id="question-template">
    <div class="glico-question-builder" data-question-index="{{index}}">
        <div class="glico-question-builder-header">
            <div class="glico-question-builder-title">
                <span class="glico-sortable-handle dashicons dashicons-menu"></span>
                <span class="question-number">Question {{index}}</span>
            </div>
            <div class="glico-question-builder-actions">
                <button type="button" class="glico-btn glico-btn-secondary glico-btn-sm" onclick="duplicateQuestion(this)">
                    <span class="dashicons dashicons-admin-page"></span>
                </button>
                <button type="button" class="glico-btn glico-btn-error glico-btn-sm glico-remove-question">
                    <span class="dashicons dashicons-trash"></span>
                </button>
            </div>
        </div>
        
        <div class="glico-question-builder-body">
            <div class="glico-form-group">
                <label class="glico-form-label required"><?php _e('Question Title', 'glico-survey'); ?></label>
                <input type="text" name="questions[{{index}}][title]" class="glico-form-input" required 
                       placeholder="<?php _e('Enter your question...', 'glico-survey'); ?>">
            </div>
            
            <div class="glico-form-group">
                <label class="glico-form-label"><?php _e('Question Type', 'glico-survey'); ?></label>
                <div class="glico-question-type-selector">
                    <label class="glico-question-type">
                        <input type="radio" name="questions[{{index}}][type]" value="text" checked>
                        <div>
                            <div class="glico-question-type-label"><?php _e('Text Input', 'glico-survey'); ?></div>
                            <div class="glico-question-type-description"><?php _e('Single line text', 'glico-survey'); ?></div>
                        </div>
                    </label>
                    <label class="glico-question-type">
                        <input type="radio" name="questions[{{index}}][type]" value="textarea">
                        <div>
                            <div class="glico-question-type-label"><?php _e('Text Area', 'glico-survey'); ?></div>
                            <div class="glico-question-type-description"><?php _e('Multi-line text', 'glico-survey'); ?></div>
                        </div>
                    </label>
                    <label class="glico-question-type">
                        <input type="radio" name="questions[{{index}}][type]" value="radio">
                        <div>
                            <div class="glico-question-type-label"><?php _e('Radio Buttons', 'glico-survey'); ?></div>
                            <div class="glico-question-type-description"><?php _e('Single choice', 'glico-survey'); ?></div>
                        </div>
                    </label>
                    <label class="glico-question-type">
                        <input type="radio" name="questions[{{index}}][type]" value="checkbox">
                        <div>
                            <div class="glico-question-type-label"><?php _e('Checkboxes', 'glico-survey'); ?></div>
                            <div class="glico-question-type-description"><?php _e('Multiple choice', 'glico-survey'); ?></div>
                        </div>
                    </label>
                    <label class="glico-question-type">
                        <input type="radio" name="questions[{{index}}][type]" value="select">
                        <div>
                            <div class="glico-question-type-label"><?php _e('Dropdown', 'glico-survey'); ?></div>
                            <div class="glico-question-type-description"><?php _e('Select from list', 'glico-survey'); ?></div>
                        </div>
                    </label>
                    <label class="glico-question-type">
                        <input type="radio" name="questions[{{index}}][type]" value="rating">
                        <div>
                            <div class="glico-question-type-label"><?php _e('Rating Scale', 'glico-survey'); ?></div>
                            <div class="glico-question-type-description"><?php _e('1-10 scale', 'glico-survey'); ?></div>
                        </div>
                    </label>
                    <label class="glico-question-type">
                        <input type="radio" name="questions[{{index}}][type]" value="emoji_scale">
                        <div>
                            <div class="glico-question-type-label"><?php _e('Emoji Scale', 'glico-survey'); ?></div>
                            <div class="glico-question-type-description"><?php _e('Happy to sad', 'glico-survey'); ?></div>
                        </div>
                    </label>
                    <label class="glico-question-type">
                        <input type="radio" name="questions[{{index}}][type]" value="custom_emoji_scale">
                        <div>
                            <div class="glico-question-type-label"><?php _e('Custom Emoji', 'glico-survey'); ?></div>
                            <div class="glico-question-type-description"><?php _e('Custom emoji scale', 'glico-survey'); ?></div>
                        </div>
                    </label>
                </div>
            </div>
            
            <div class="glico-options-builder" style="display: none;">
                <label class="glico-form-label"><?php _e('Options', 'glico-survey'); ?></label>
                <div class="glico-options-list">
                    <div class="glico-option-item">
                        <input type="text" class="glico-option-input" placeholder="<?php _e('Option 1', 'glico-survey'); ?>" name="questions[{{index}}][options][0]">
                        <button type="button" class="glico-option-remove">×</button>
                    </div>
                    <div class="glico-option-item">
                        <input type="text" class="glico-option-input" placeholder="<?php _e('Option 2', 'glico-survey'); ?>" name="questions[{{index}}][options][1]">
                        <button type="button" class="glico-option-remove">×</button>
                    </div>
                </div>
                <button type="button" class="glico-add-option"><?php _e('Add Option', 'glico-survey'); ?></button>
            </div>
            
            <div class="glico-form-group">
                <label class="glico-form-label">
                    <input type="checkbox" name="questions[{{index}}][required]" value="1">
                    <?php _e('Required question', 'glico-survey'); ?>
                </label>
            </div>
            
            <input type="hidden" name="questions[{{index}}][order_index]" value="{{index}}">
        </div>
    </div>
</script>

<style>
.glico-form-grid {
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: 1rem;
    align-items: end;
}

.glico-questions-list {
    min-height: 200px;
}

.glico-empty-questions {
    text-align: center;
    padding: 3rem 2rem;
    border: 2px dashed var(--glico-admin-border);
    border-radius: var(--glico-admin-radius);
    background: #f9f9f9;
}

.glico-empty-questions-icon {
    font-size: 3rem;
    color: var(--glico-admin-text-light);
    margin-bottom: 1rem;
}

.glico-empty-questions h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--glico-admin-text);
    margin-bottom: 0.5rem;
}

.glico-empty-questions p {
    color: var(--glico-admin-text-light);
    margin-bottom: 1.5rem;
}

.glico-question-builder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.glico-question-builder-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--glico-admin-text);
}

.glico-sortable-handle {
    cursor: move;
    color: var(--glico-admin-text-light);
}

.glico-question-builder-actions {
    display: flex;
    gap: 0.5rem;
}

.glico-form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 0;
    border-top: 1px solid var(--glico-admin-border);
    margin-top: 2rem;
}

@media (max-width: 768px) {
    .glico-form-grid {
        grid-template-columns: 1fr;
    }
    
    .glico-form-actions {
        flex-direction: column;
        gap: 1rem;
    }
    
    .glico-form-actions .glico-btn {
        width: 100%;
    }
}
</style>
