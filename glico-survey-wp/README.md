# Glico Survey WordPress Plugin

A comprehensive survey management system for WordPress with modern UI, analytics, and emoji-based rating scales.

## Features

### 🎯 Core Features
- **Modern Survey Builder**: Drag-and-drop interface for creating surveys
- **Multiple Question Types**: Text, textarea, radio, checkbox, select, rating scales, and emoji scales
- **Custom Emoji Scales**: Upload custom emoji images for unique rating experiences
- **Real-time Analytics**: Comprehensive analytics dashboard with charts and insights
- **Responsive Design**: Mobile-first design that works on all devices
- **Multi-language Support**: Full internationalization support

### 📊 Question Types
1. **Text Input**: Single-line text responses
2. **Text Area**: Multi-line text responses
3. **Radio Buttons**: Single choice selection
4. **Checkboxes**: Multiple choice selection
5. **Dropdown**: Select from a list
6. **Rating Scale**: 1-10 numerical rating
7. **Emoji Scale**: Happy to sad emoji rating
8. **Custom Emoji Scale**: Upload custom emoji images

### 🎨 Modern UI Features
- **Gradient Headers**: Beautiful gradient backgrounds
- **Smooth Animations**: CSS transitions and hover effects
- **Progress Indicators**: Visual progress bars and question counters
- **Interactive Elements**: Hover states and selection feedback
- **Accessibility**: WCAG compliant with keyboard navigation
- **Dark Mode Ready**: CSS variables for easy theming

### 📈 Analytics & Reporting
- **Response Analytics**: Detailed response breakdowns
- **Visual Charts**: Bar charts, pie charts, and trend analysis
- **Export Options**: CSV export for data analysis
- **Real-time Updates**: Live response tracking
- **Response Rates**: Completion rate calculations

## Installation

### Method 1: WordPress Admin (Recommended)
1. Download the plugin ZIP file
2. Go to WordPress Admin → Plugins → Add New
3. Click "Upload Plugin" and select the ZIP file
4. Click "Install Now" and then "Activate"

### Method 2: FTP Upload
1. Extract the plugin files
2. Upload the `glico-survey-wp` folder to `/wp-content/plugins/`
3. Activate the plugin through the WordPress admin

### Method 3: WP-CLI
```bash
wp plugin install glico-survey-wp.zip --activate
```

## Configuration

### Initial Setup
1. Go to **Glico Survey** in your WordPress admin menu
2. Configure your settings in **Settings** → **Glico Survey Settings**
3. Set up your first survey in **Surveys** → **Create Survey**

### Settings Options
- **Enable Analytics**: Turn on/off analytics tracking
- **Enable Export**: Allow CSV export of responses
- **Default Emoji Scale**: Choose default emoji scale type
- **Allow Anonymous**: Allow anonymous responses
- **Require Login**: Require user login to respond
- **Max Responses per IP**: Limit responses per IP address
- **Response Timeout**: Set session timeout duration

## Usage

### Creating Surveys

1. **Navigate to Surveys**
   - Go to WordPress Admin → Glico Survey → Create Survey

2. **Basic Information**
   - Enter survey title and description
   - Choose survey status (Draft/Published)

3. **Add Questions**
   - Click "Add Question" to create new questions
   - Select question type from the available options
   - Configure question settings and options
   - Set questions as required if needed

4. **Question Types Setup**
   - **Text/Textarea**: Simple text input fields
   - **Radio/Checkbox**: Add multiple options
   - **Select**: Create dropdown options
   - **Rating Scale**: 1-10 numerical scale
   - **Emoji Scale**: Pre-defined happy/sad emojis
   - **Custom Emoji Scale**: Upload custom emoji images

5. **Publish Survey**
   - Save as draft or publish immediately
   - Get survey URL for sharing

### Displaying Surveys

#### Shortcodes
```php
// Display a specific survey
[glico_survey id="123"]

// Display survey list
[glico_survey_list limit="10" status="published"]
```

#### PHP Template
```php
// In your theme files
echo do_shortcode('[glico_survey id="123"]');
```

#### REST API
```javascript
// Get survey data
fetch('/wp-json/glico-survey/v1/surveys/123')
  .then(response => response.json())
  .then(data => console.log(data));

// Submit survey response
fetch('/wp-json/glico-survey/v1/surveys/123/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    responses: {
      '1': 'answer1',
      '2': 'answer2'
    }
  })
});
```

### Analytics & Reports

1. **View Analytics**
   - Go to Glico Survey → Analytics
   - Select survey to view detailed analytics
   - View response charts and statistics

2. **Export Data**
   - Click "Export" button on survey analytics page
   - Download CSV file with all responses
   - Use for external analysis

## Customization

### CSS Customization
The plugin uses CSS variables for easy theming:

```css
:root {
    --glico-primary: #3b82f6;
    --glico-primary-dark: #2563eb;
    --glico-secondary: #64748b;
    --glico-success: #10b981;
    --glico-warning: #f59e0b;
    --glico-error: #ef4444;
    --glico-background: #f8fafc;
    --glico-surface: #ffffff;
    --glico-border: #e2e8f0;
    --glico-text: #1e293b;
    --glico-text-light: #64748b;
}
```

### Hooks & Filters

#### Actions
```php
// Before survey submission
do_action('glico_survey_before_submit', $survey_id, $responses);

// After survey submission
do_action('glico_survey_after_submit', $survey_id, $responses, $result);

// Before survey display
do_action('glico_survey_before_display', $survey_id);
```

#### Filters
```php
// Modify survey data before display
$survey = apply_filters('glico_survey_data', $survey, $survey_id);

// Modify question HTML
$html = apply_filters('glico_question_html', $html, $question, $type);

// Modify survey settings
$settings = apply_filters('glico_survey_settings', $settings);
```

## Database Schema

The plugin creates the following database tables:

### `wp_glico_surveys`
- `id`: Survey ID
- `title`: Survey title
- `description`: Survey description
- `status`: Survey status (draft/published/archived)
- `settings`: JSON settings
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `created_by`: User ID who created the survey

### `wp_glico_questions`
- `id`: Question ID
- `survey_id`: Parent survey ID
- `title`: Question title
- `type`: Question type
- `options`: JSON options array
- `required`: Whether question is required
- `order_index`: Display order
- `settings`: JSON settings
- `created_at`: Creation timestamp

### `wp_glico_responses`
- `id`: Response ID
- `survey_id`: Survey ID
- `question_id`: Question ID
- `response_value`: Response value
- `user_ip`: User IP address
- `user_agent`: User agent string
- `created_at`: Response timestamp

### `wp_glico_response_sessions`
- `id`: Session ID
- `survey_id`: Survey ID
- `session_id`: Unique session identifier
- `user_ip`: User IP address
- `user_agent`: User agent string
- `completed`: Whether survey was completed
- `created_at`: Session start timestamp
- `completed_at`: Completion timestamp

## Security Features

- **Nonce Verification**: All forms use WordPress nonces
- **Data Sanitization**: All input data is sanitized
- **SQL Injection Protection**: Uses WordPress $wpdb methods
- **XSS Protection**: All output is escaped
- **Rate Limiting**: Configurable response limits per IP
- **Session Management**: Secure session handling

## Performance

- **Optimized Queries**: Efficient database queries
- **Caching Ready**: Compatible with caching plugins
- **Minified Assets**: Compressed CSS and JavaScript
- **Lazy Loading**: Images and assets loaded on demand
- **CDN Ready**: Assets can be served from CDN

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 60+
- **Accessibility**: WCAG 2.1 AA compliant
- **Progressive Enhancement**: Works without JavaScript

## Troubleshooting

### Common Issues

1. **Surveys not displaying**
   - Check if survey is published
   - Verify shortcode syntax
   - Check for theme conflicts

2. **Responses not saving**
   - Check database permissions
   - Verify nonce configuration
   - Check for plugin conflicts

3. **Styling issues**
   - Clear cache if using caching plugin
   - Check for theme CSS conflicts
   - Verify CSS files are loading

### Debug Mode
Enable WordPress debug mode to see detailed error messages:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Support

### Documentation
- [Plugin Documentation](https://github.com/AjumaPro/GLICOSURVEY/wiki)
- [API Reference](https://github.com/AjumaPro/GLICOSURVEY/wiki/API-Reference)
- [FAQ](https://github.com/AjumaPro/GLICOSURVEY/wiki/FAQ)

### Community
- [GitHub Issues](https://github.com/AjumaPro/GLICOSURVEY/issues)
- [WordPress Support Forum](https://wordpress.org/support/plugin/glico-survey)

### Professional Support
For custom development and priority support, contact [AjumaPro](https://github.com/AjumaPro).

## Changelog

### Version 1.0.0
- Initial release
- Complete survey management system
- Modern UI with CSS variables
- Multiple question types
- Analytics dashboard
- REST API endpoints
- Shortcode support
- Multi-language ready

## License

This plugin is licensed under the GPL v2 or later.

## Credits

- **Developer**: AjumaPro
- **Design**: Modern CSS with accessibility focus
- **Icons**: WordPress Dashicons
- **Charts**: Chart.js integration
- **Emojis**: Unicode emoji support

---

**Made with ❤️ by AjumaPro**
