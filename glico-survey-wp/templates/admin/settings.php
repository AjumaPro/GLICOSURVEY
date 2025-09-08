<?php
/**
 * Admin Settings Template
 */

if (!defined('ABSPATH')) {
    exit;
}

$settings = get_option('glico_survey_settings', array());
$defaults = array(
    'enable_analytics' => true,
    'enable_export' => true,
    'default_emoji_scale' => 'happy_sad',
    'allow_anonymous' => true,
    'require_login' => false,
    'max_responses_per_ip' => 0,
    'response_timeout' => 3600,
    'theme_primary_color' => '#3b82f6',
    'theme_secondary_color' => '#64748b',
    'theme_success_color' => '#10b981',
    'theme_warning_color' => '#f59e0b',
    'theme_error_color' => '#ef4444'
);

$settings = wp_parse_args($settings, $defaults);
?>

<div class="glico-admin-wrapper">
    <div class="glico-admin-container">
        <!-- Header -->
        <div class="glico-admin-header">
            <div class="glico-admin-header-content">
                <h1 class="glico-admin-title"><?php _e('Settings', 'glico-survey'); ?></h1>
                <p class="glico-admin-subtitle"><?php _e('Configure your survey system preferences and appearance', 'glico-survey'); ?></p>
            </div>
        </div>

        <form method="post" action="" class="glico-settings-form">
            <?php wp_nonce_field('glico_survey_settings', 'glico_survey_settings_nonce'); ?>
            
            <!-- General Settings -->
            <div class="glico-content-card">
                <div class="glico-content-card-header">
                    <h2 class="glico-content-card-title"><?php _e('General Settings', 'glico-survey'); ?></h2>
                </div>
                <div class="glico-content-card-body">
                    <div class="glico-settings-grid">
                        <div class="glico-form-group">
                            <label class="glico-form-label">
                                <input type="checkbox" name="enable_analytics" value="1" <?php checked($settings['enable_analytics']); ?>>
                                <?php _e('Enable Analytics', 'glico-survey'); ?>
                            </label>
                            <p class="glico-form-help"><?php _e('Track survey performance and response analytics.', 'glico-survey'); ?></p>
                        </div>
                        
                        <div class="glico-form-group">
                            <label class="glico-form-label">
                                <input type="checkbox" name="enable_export" value="1" <?php checked($settings['enable_export']); ?>>
                                <?php _e('Enable Export', 'glico-survey'); ?>
                            </label>
                            <p class="glico-form-help"><?php _e('Allow exporting survey responses to CSV format.', 'glico-survey'); ?></p>
                        </div>
                        
                        <div class="glico-form-group">
                            <label class="glico-form-label">
                                <input type="checkbox" name="allow_anonymous" value="1" <?php checked($settings['allow_anonymous']); ?>>
                                <?php _e('Allow Anonymous Responses', 'glico-survey'); ?>
                            </label>
                            <p class="glico-form-help"><?php _e('Allow users to respond to surveys without logging in.', 'glico-survey'); ?></p>
                        </div>
                        
                        <div class="glico-form-group">
                            <label class="glico-form-label">
                                <input type="checkbox" name="require_login" value="1" <?php checked($settings['require_login']); ?>>
                                <?php _e('Require User Login', 'glico-survey'); ?>
                            </label>
                            <p class="glico-form-help"><?php _e('Require users to be logged in to respond to surveys.', 'glico-survey'); ?></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Response Settings -->
            <div class="glico-content-card">
                <div class="glico-content-card-header">
                    <h2 class="glico-content-card-title"><?php _e('Response Settings', 'glico-survey'); ?></h2>
                </div>
                <div class="glico-content-card-body">
                    <div class="glico-settings-grid">
                        <div class="glico-form-group">
                            <label for="max_responses_per_ip" class="glico-form-label"><?php _e('Max Responses per IP', 'glico-survey'); ?></label>
                            <input type="number" id="max_responses_per_ip" name="max_responses_per_ip" 
                                   class="glico-form-input" value="<?php echo esc_attr($settings['max_responses_per_ip']); ?>" 
                                   min="0" max="100">
                            <p class="glico-form-help"><?php _e('Limit responses per IP address (0 = unlimited).', 'glico-survey'); ?></p>
                        </div>
                        
                        <div class="glico-form-group">
                            <label for="response_timeout" class="glico-form-label"><?php _e('Response Timeout (seconds)', 'glico-survey'); ?></label>
                            <input type="number" id="response_timeout" name="response_timeout" 
                                   class="glico-form-input" value="<?php echo esc_attr($settings['response_timeout']); ?>" 
                                   min="300" max="86400">
                            <p class="glico-form-help"><?php _e('How long to keep response sessions active.', 'glico-survey'); ?></p>
                        </div>
                        
                        <div class="glico-form-group">
                            <label for="default_emoji_scale" class="glico-form-label"><?php _e('Default Emoji Scale', 'glico-survey'); ?></label>
                            <select id="default_emoji_scale" name="default_emoji_scale" class="glico-form-select">
                                <option value="happy_sad" <?php selected($settings['default_emoji_scale'], 'happy_sad'); ?>><?php _e('Happy to Sad', 'glico-survey'); ?></option>
                                <option value="satisfaction" <?php selected($settings['default_emoji_scale'], 'satisfaction'); ?>><?php _e('Satisfaction Scale', 'glico-survey'); ?></option>
                                <option value="likelihood" <?php selected($settings['default_emoji_scale'], 'likelihood'); ?>><?php _e('Likelihood Scale', 'glico-survey'); ?></option>
                            </select>
                            <p class="glico-form-help"><?php _e('Default emoji scale for new surveys.', 'glico-survey'); ?></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Theme Settings -->
            <div class="glico-content-card">
                <div class="glico-content-card-header">
                    <h2 class="glico-content-card-title"><?php _e('Theme Settings', 'glico-survey'); ?></h2>
                </div>
                <div class="glico-content-card-body">
                    <div class="glico-settings-grid">
                        <div class="glico-form-group">
                            <label for="theme_primary_color" class="glico-form-label"><?php _e('Primary Color', 'glico-survey'); ?></label>
                            <input type="color" id="theme_primary_color" name="theme_primary_color" 
                                   class="glico-color-picker" value="<?php echo esc_attr($settings['theme_primary_color']); ?>">
                            <p class="glico-form-help"><?php _e('Main theme color for buttons and highlights.', 'glico-survey'); ?></p>
                        </div>
                        
                        <div class="glico-form-group">
                            <label for="theme_secondary_color" class="glico-form-label"><?php _e('Secondary Color', 'glico-survey'); ?></label>
                            <input type="color" id="theme_secondary_color" name="theme_secondary_color" 
                                   class="glico-color-picker" value="<?php echo esc_attr($settings['theme_secondary_color']); ?>">
                            <p class="glico-form-help"><?php _e('Secondary color for text and borders.', 'glico-survey'); ?></p>
                        </div>
                        
                        <div class="glico-form-group">
                            <label for="theme_success_color" class="glico-form-label"><?php _e('Success Color', 'glico-survey'); ?></label>
                            <input type="color" id="theme_success_color" name="theme_success_color" 
                                   class="glico-color-picker" value="<?php echo esc_attr($settings['theme_success_color']); ?>">
                            <p class="glico-form-help"><?php _e('Color for success messages and positive indicators.', 'glico-survey'); ?></p>
                        </div>
                        
                        <div class="glico-form-group">
                            <label for="theme_warning_color" class="glico-form-label"><?php _e('Warning Color', 'glico-survey'); ?></label>
                            <input type="color" id="theme_warning_color" name="theme_warning_color" 
                                   class="glico-color-picker" value="<?php echo esc_attr($settings['theme_warning_color']); ?>">
                            <p class="glico-form-help"><?php _e('Color for warning messages and caution indicators.', 'glico-survey'); ?></p>
                        </div>
                        
                        <div class="glico-form-group">
                            <label for="theme_error_color" class="glico-form-label"><?php _e('Error Color', 'glico-survey'); ?></label>
                            <input type="color" id="theme_error_color" name="theme_error_color" 
                                   class="glico-color-picker" value="<?php echo esc_attr($settings['theme_error_color']); ?>">
                            <p class="glico-form-help"><?php _e('Color for error messages and negative indicators.', 'glico-survey'); ?></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Advanced Settings -->
            <div class="glico-content-card">
                <div class="glico-content-card-header">
                    <h2 class="glico-content-card-title"><?php _e('Advanced Settings', 'glico-survey'); ?></h2>
                </div>
                <div class="glico-content-card-body">
                    <div class="glico-form-group">
                        <label class="glico-form-label">
                            <input type="checkbox" name="enable_debug_mode" value="1" <?php checked(get_option('glico_survey_debug_mode', false)); ?>>
                            <?php _e('Enable Debug Mode', 'glico-survey'); ?>
                        </label>
                        <p class="glico-form-help"><?php _e('Enable detailed logging for troubleshooting (not recommended for production).', 'glico-survey'); ?></p>
                    </div>
                    
                    <div class="glico-form-group">
                        <label class="glico-form-label">
                            <input type="checkbox" name="enable_caching" value="1" <?php checked(get_option('glico_survey_enable_caching', true)); ?>>
                            <?php _e('Enable Caching', 'glico-survey'); ?>
                        </label>
                        <p class="glico-form-help"><?php _e('Cache survey data for better performance.', 'glico-survey'); ?></p>
                    </div>
                </div>
            </div>

            <!-- System Information -->
            <div class="glico-content-card">
                <div class="glico-content-card-header">
                    <h2 class="glico-content-card-title"><?php _e('System Information', 'glico-survey'); ?></h2>
                </div>
                <div class="glico-content-card-body">
                    <div class="glico-system-info">
                        <div class="glico-info-item">
                            <strong><?php _e('Plugin Version:', 'glico-survey'); ?></strong>
                            <span><?php echo GLICO_SURVEY_VERSION; ?></span>
                        </div>
                        <div class="glico-info-item">
                            <strong><?php _e('WordPress Version:', 'glico-survey'); ?></strong>
                            <span><?php echo get_bloginfo('version'); ?></span>
                        </div>
                        <div class="glico-info-item">
                            <strong><?php _e('PHP Version:', 'glico-survey'); ?></strong>
                            <span><?php echo PHP_VERSION; ?></span>
                        </div>
                        <div class="glico-info-item">
                            <strong><?php _e('Database Version:', 'glico-survey'); ?></strong>
                            <span><?php echo $GLOBALS['wpdb']->db_version(); ?></span>
                        </div>
                        <div class="glico-info-item">
                            <strong><?php _e('Memory Limit:', 'glico-survey'); ?></strong>
                            <span><?php echo ini_get('memory_limit'); ?></span>
                        </div>
                        <div class="glico-info-item">
                            <strong><?php _e('Upload Max Filesize:', 'glico-survey'); ?></strong>
                            <span><?php echo ini_get('upload_max_filesize'); ?></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="glico-form-actions">
                <button type="submit" name="submit" class="glico-btn glico-btn-primary glico-btn-lg">
                    <span class="dashicons dashicons-saved"></span>
                    <?php _e('Save Settings', 'glico-survey'); ?>
                </button>
            </div>
        </form>
    </div>
</div>

<style>
.glico-settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.glico-form-group {
    margin-bottom: 1.5rem;
}

.glico-form-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: var(--glico-admin-text);
    margin-bottom: 0.5rem;
}

.glico-form-group input[type="checkbox"] {
    margin: 0;
}

.glico-form-help {
    font-size: 0.9rem;
    color: var(--glico-admin-text-light);
    margin-top: 0.25rem;
    line-height: 1.4;
}

.glico-color-picker {
    width: 60px;
    height: 40px;
    border: 1px solid var(--glico-admin-border);
    border-radius: var(--glico-admin-radius);
    cursor: pointer;
}

.glico-system-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.glico-info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f9f9f9;
    border-radius: var(--glico-admin-radius);
    border: 1px solid var(--glico-admin-border);
}

.glico-info-item strong {
    color: var(--glico-admin-text);
}

.glico-info-item span {
    color: var(--glico-admin-text-light);
    font-family: monospace;
}

.glico-form-actions {
    display: flex;
    justify-content: flex-end;
    padding: 2rem 0;
    border-top: 1px solid var(--glico-admin-border);
    margin-top: 2rem;
}

@media (max-width: 768px) {
    .glico-settings-grid {
        grid-template-columns: 1fr;
    }
    
    .glico-system-info {
        grid-template-columns: 1fr;
    }
    
    .glico-info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }
}
</style>
