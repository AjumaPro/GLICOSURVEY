<?php
/**
 * WordPress-Node.js Sync Page
 */

if (!defined('ABSPATH')) {
    exit;
}

$sync = new \GlicoSurvey\Core\NodeJSSync();
$nodejs_url = get_option('glico_survey_nodejs_url', 'http://localhost:5000/api');
$api_key = get_option('glico_survey_api_key', '');

// Handle form submissions
if (isset($_POST['action'])) {
    if ($_POST['action'] === 'save_settings') {
        update_option('glico_survey_nodejs_url', sanitize_url($_POST['nodejs_url']));
        update_option('glico_survey_api_key', sanitize_text_field($_POST['api_key']));
        echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
        
        // Refresh values
        $nodejs_url = get_option('glico_survey_nodejs_url', 'http://localhost:5000/api');
        $api_key = get_option('glico_survey_api_key', '');
    } elseif ($_POST['action'] === 'test_connection') {
        $result = $sync->testConnection();
        if ($result['success']) {
            echo '<div class="notice notice-success"><p>Connection successful! ' . $result['message'] . '</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>Connection failed: ' . $result['error'] . '</p></div>';
        }
    } elseif ($_POST['action'] === 'sync_surveys') {
        $result = $sync->syncSurveys();
        if ($result['success']) {
            echo '<div class="notice notice-success"><p>Sync completed! Imported: ' . $result['imported'] . ', Skipped: ' . $result['skipped'] . ', Total: ' . $result['total'] . '</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>Sync failed: ' . $result['error'] . '</p></div>';
        }
    } elseif ($_POST['action'] === 'sync_themes') {
        $result = $sync->syncThemes();
        if ($result['success']) {
            echo '<div class="notice notice-success"><p>Themes sync completed! Imported: ' . $result['imported'] . ', Skipped: ' . $result['skipped'] . ', Total: ' . $result['total'] . '</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>Themes sync failed: ' . $result['error'] . '</p></div>';
        }
    }
}
?>

<div class="wrap">
    <h1>🔄 WordPress-Node.js Sync</h1>
    <p>Sync surveys and themes between your WordPress site and the Node.js GLICOSURVEY system.</p>
    
    <div class="card" style="max-width: 800px;">
        <h2>📡 Connection Settings</h2>
        <form method="post">
            <input type="hidden" name="action" value="save_settings">
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="nodejs_url">Node.js API URL</label>
                    </th>
                    <td>
                        <input type="url" id="nodejs_url" name="nodejs_url" value="<?php echo esc_attr($nodejs_url); ?>" class="regular-text" required>
                        <p class="description">The URL of your Node.js GLICOSURVEY API (e.g., http://localhost:5000/api)</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="api_key">API Key</label>
                    </th>
                    <td>
                        <input type="password" id="api_key" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text">
                        <p class="description">JWT token or API key for authentication (optional for development)</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Settings'); ?>
        </form>
        
        <form method="post" style="margin-top: 20px;">
            <input type="hidden" name="action" value="test_connection">
            <?php submit_button('Test Connection', 'secondary'); ?>
        </form>
    </div>
    
    <div class="card" style="max-width: 800px; margin-top: 20px;">
        <h2>📥 Import from Node.js</h2>
        <p>Import surveys and themes from your Node.js GLICOSURVEY system to WordPress.</p>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <form method="post">
                <input type="hidden" name="action" value="sync_surveys">
                <?php submit_button('Import Surveys', 'primary'); ?>
            </form>
            
            <form method="post">
                <input type="hidden" name="action" value="sync_themes">
                <?php submit_button('Import Themes', 'primary'); ?>
            </form>
        </div>
    </div>
    
    <div class="card" style="max-width: 800px; margin-top: 20px;">
        <h2>📤 Export to Node.js</h2>
        <p>Export surveys from WordPress to your Node.js GLICOSURVEY system.</p>
        
        <?php
        global $wpdb;
        $surveys = $wpdb->get_results("SELECT id, title, status FROM {$wpdb->prefix}glico_surveys ORDER BY created_at DESC LIMIT 10");
        ?>
        
        <?php if (!empty($surveys)): ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Survey Title</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($surveys as $survey): ?>
                        <tr>
                            <td><?php echo esc_html($survey->title); ?></td>
                            <td>
                                <span class="status-<?php echo esc_attr($survey->status); ?>">
                                    <?php echo esc_html(ucfirst($survey->status)); ?>
                                </span>
                            </td>
                            <td>
                                <form method="post" style="display: inline;">
                                    <input type="hidden" name="action" value="export_survey">
                                    <input type="hidden" name="survey_id" value="<?php echo esc_attr($survey->id); ?>">
                                    <?php submit_button('Export', 'small'); ?>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p>No surveys found. Create some surveys first or import them from Node.js.</p>
        <?php endif; ?>
    </div>
    
    <div class="card" style="max-width: 800px; margin-top: 20px;">
        <h2>ℹ️ How It Works</h2>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <h3>Import Process:</h3>
            <ol>
                <li><strong>Surveys:</strong> Fetches all surveys from Node.js system and imports them to WordPress</li>
                <li><strong>Themes:</strong> Fetches all themes from Node.js system and imports them to WordPress</li>
                <li><strong>Questions:</strong> Automatically imports all questions for each survey</li>
                <li><strong>Duplicates:</strong> Skips surveys/themes that already exist (based on title/name)</li>
            </ol>
            
            <h3>Export Process:</h3>
            <ol>
                <li><strong>Individual Export:</strong> Export specific surveys from WordPress to Node.js</li>
                <li><strong>Data Format:</strong> Converts WordPress data format to Node.js format</li>
                <li><strong>Questions:</strong> Includes all questions and their settings</li>
            </ol>
            
            <h3>Requirements:</h3>
            <ul>
                <li>Node.js GLICOSURVEY system must be running</li>
                <li>API endpoints must be accessible from WordPress</li>
                <li>Both systems should have compatible data structures</li>
            </ul>
        </div>
    </div>
</div>

<style>
.status-published { color: #00a32a; font-weight: bold; }
.status-draft { color: #dba617; font-weight: bold; }
.status-archived { color: #d63638; font-weight: bold; }
</style>
