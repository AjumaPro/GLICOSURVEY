# Glico Survey WordPress Plugin - Installation Guide

## 🚀 Quick Installation

### Method 1: Manual Installation
1. Download the `glico-survey-wp` folder
2. Upload it to your WordPress `wp-content/plugins/` directory
3. Activate the plugin in WordPress Admin → Plugins
4. The plugin will automatically create database tables

### Method 2: WordPress Admin Upload
1. Go to WordPress Admin → Plugins → Add New
2. Click "Upload Plugin"
3. Select the `glico-survey-wp.zip` file
4. Click "Install Now" and then "Activate"

## 📋 Requirements

- **WordPress**: 5.0 or higher
- **PHP**: 7.4 or higher
- **MySQL**: 5.6 or higher
- **Memory**: 128MB minimum

## 🔧 Configuration

### 1. Plugin Settings
After activation, go to **Glico Survey → Settings** to configure:
- Default emoji scale
- Rate limiting
- Analytics settings
- Export options

### 2. User Permissions
The plugin creates the following user roles:
- **Survey Creator**: Can create and manage surveys
- **Survey Viewer**: Can view survey analytics
- **Survey Admin**: Full access to all features

## 📝 Usage

### Creating Surveys
1. Go to **Glico Survey → Surveys**
2. Click "Add New Survey"
3. Add questions using the question builder
4. Configure survey settings
5. Publish your survey

### Displaying Surveys

#### Using Shortcodes
```php
// Display a specific survey
[glico_survey id="1"]

// Display survey list
[glico_survey_list limit="5" status="published"]
```

#### Using PHP
```php
// In your theme files
$renderer = new \GlicoSurvey\Frontend\SurveyRenderer();
echo $renderer->renderSurvey(1);
```

#### Using REST API
```javascript
// Get all surveys
fetch('/wp-json/glico-survey/v1/surveys')

// Get specific survey
fetch('/wp-json/glico-survey/v1/surveys/1')

// Submit survey response
fetch('/wp-json/glico-survey/v1/surveys/1/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responses: {...} })
})
```

## 🎨 Customization

### CSS Customization
Override the default styles by adding CSS to your theme:

```css
/* Customize survey colors */
:root {
    --glico-primary: #your-color;
    --glico-secondary: #your-color;
}

/* Customize survey container */
.glico-survey-container {
    max-width: 1000px; /* Adjust width */
}
```

### Template Customization
Copy templates to your theme directory:
```
your-theme/glico-survey/
├── survey.php
└── survey-list.php
```

## 🔌 Integration

### Elementor
The plugin includes Elementor widgets:
- Survey Display Widget
- Survey List Widget
- Analytics Widget

### Gutenberg
Gutenberg blocks are available:
- Survey Block
- Survey List Block

### Third-party Plugins
Compatible with:
- WooCommerce
- Contact Form 7
- Gravity Forms
- WPForms

## 📊 Analytics

### Viewing Analytics
1. Go to **Glico Survey → Analytics**
2. Select a survey
3. View response statistics
4. Export data as CSV/PDF

### Analytics Features
- Response counts
- Question-by-question analysis
- Time-based trends
- User demographics
- Export capabilities

## 🛠️ Troubleshooting

### Common Issues

#### Plugin Not Activating
- Check PHP version (7.4+ required)
- Check WordPress version (5.0+ required)
- Check file permissions

#### Database Errors
- Ensure MySQL 5.6+ is installed
- Check database user permissions
- Verify WordPress database connection

#### Styling Issues
- Clear any caching plugins
- Check for theme conflicts
- Verify CSS file loading

### Debug Mode
Enable WordPress debug mode to see detailed error messages:
```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## 🔒 Security

### Best Practices
- Keep WordPress and plugins updated
- Use strong passwords
- Enable two-factor authentication
- Regular backups
- SSL certificate

### Plugin Security Features
- Nonce verification
- Input sanitization
- Output escaping
- Rate limiting
- IP tracking

## 📞 Support

### Documentation
- [Plugin Documentation](https://github.com/AjumaPro/GLICOSURVEY)
- [API Reference](https://github.com/AjumaPro/GLICOSURVEY/wiki/API)
- [FAQ](https://github.com/AjumaPro/GLICOSURVEY/wiki/FAQ)

### Getting Help
- GitHub Issues: [Report bugs](https://github.com/AjumaPro/GLICOSURVEY/issues)
- Email: support@ajumapro.com
- Community: [WordPress.org Forums](https://wordpress.org/support/plugin/glico-survey)

## 🚀 Advanced Features

### Hooks and Filters
```php
// Modify survey data before display
add_filter('glico_survey_data', function($survey) {
    // Your custom modifications
    return $survey;
});

// Action after survey submission
add_action('glico_survey_after_submit', function($survey_id, $responses) {
    // Your custom logic
}, 10, 2);
```

### Custom Question Types
```php
// Register custom question type
add_filter('glico_question_types', function($types) {
    $types['custom_type'] = 'Custom Question Type';
    return $types;
});
```

### Webhook Integration
```php
// Send data to external service after submission
add_action('glico_survey_after_submit', function($survey_id, $responses) {
    wp_remote_post('https://your-service.com/webhook', [
        'body' => json_encode([
            'survey_id' => $survey_id,
            'responses' => $responses
        ])
    ]);
}, 10, 2);
```

## 📈 Performance

### Optimization Tips
- Use caching plugins
- Optimize images
- Minify CSS/JS
- Use CDN
- Database optimization

### Performance Monitoring
- Monitor response times
- Check database queries
- Use profiling tools
- Monitor server resources

---

**Need more help?** Check out our [comprehensive documentation](https://github.com/AjumaPro/GLICOSURVEY/wiki) or [contact support](mailto:support@ajumapro.com).
