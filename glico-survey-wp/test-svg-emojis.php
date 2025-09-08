<?php
/**
 * Test file for SVG Emojis functionality
 * This file can be accessed directly to test the SVG emoji system
 */

// Include WordPress if not already loaded
if (!function_exists('wp_loaded')) {
    // For testing purposes, we'll include the SVG emojis class directly
    require_once 'includes/Core/SVGEmojis.php';
}

use GlicoSurvey\Core\SVGEmojis;

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG Emojis Test - Glico Survey</title>
    <link rel="stylesheet" href="assets/css/frontend.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8fafc;
        }
        .test-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .test-section h2 {
            color: #1e293b;
            margin-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .emoji-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .emoji-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .emoji-card h3 {
            color: #1e293b;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="test-section">
        <h1>🎨 SVG Emojis Test - Glico Survey</h1>
        <p>This page demonstrates the SVG emoji system for the WordPress plugin.</p>
    </div>

    <div class="test-section">
        <h2>📊 Satisfaction Scale</h2>
        <p>Standard satisfaction rating scale with SVG emojis:</p>
        <?php echo SVGEmojis::renderEmojiScale(1, 'satisfaction', 'required'); ?>
    </div>

    <div class="test-section">
        <h2>👍 Thumbs Rating</h2>
        <p>Simple thumbs up/down rating:</p>
        <?php echo SVGEmojis::renderEmojiScale(2, 'thumbs', 'required'); ?>
    </div>

    <div class="test-section">
        <h2>⭐ Star Rating</h2>
        <p>5-star rating system:</p>
        <?php echo SVGEmojis::renderEmojiScale(3, 'stars', 'required'); ?>
    </div>

    <div class="test-section">
        <h2>✅ Yes/No Rating</h2>
        <p>Simple yes/no choice:</p>
        <?php echo SVGEmojis::renderEmojiScale(4, 'yes_no', 'required'); ?>
    </div>

    <div class="test-section">
        <h2>🎯 Individual Emojis</h2>
        <p>All available SVG emojis:</p>
        <div class="emoji-grid">
            <?php 
            $emojis = SVGEmojis::getAllEmojis();
            foreach ($emojis as $key => $emoji): 
            ?>
                <div class="emoji-card">
                    <h3><?php echo esc_html($emoji['label']); ?></h3>
                    <div style="margin: 15px 0;">
                        <?php echo SVGEmojis::renderEmoji($key, 48); ?>
                    </div>
                    <p><strong>Key:</strong> <?php echo esc_html($key); ?></p>
                    <p><strong>Color:</strong> <span style="color: <?php echo esc_attr($emoji['color']); ?>"><?php echo esc_html($emoji['color']); ?></span></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <div class="test-section">
        <h2>🔧 Custom Sizes and Colors</h2>
        <p>SVG emojis with custom sizes and colors:</p>
        <div style="display: flex; gap: 20px; align-items: center; margin: 20px 0;">
            <div style="text-align: center;">
                <p>Small (24px)</p>
                <?php echo SVGEmojis::renderEmoji('happy', 24); ?>
            </div>
            <div style="text-align: center;">
                <p>Medium (40px)</p>
                <?php echo SVGEmojis::renderEmoji('happy', 40); ?>
            </div>
            <div style="text-align: center;">
                <p>Large (64px)</p>
                <?php echo SVGEmojis::renderEmoji('happy', 64); ?>
            </div>
            <div style="text-align: center;">
                <p>Custom Color</p>
                <?php echo SVGEmojis::renderEmoji('happy', 40, '#ff6b6b'); ?>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        $(document).ready(function() {
            // Handle SVG emoji interactions
            $('.glico-svg-emoji-item').click(function() {
                const questionId = $(this).data('question-id');
                const value = $(this).data('value');
                
                // Remove selected class from all items in this question
                $(`.glico-svg-emoji-item[data-question-id="${questionId}"]`).removeClass('selected');
                
                // Add selected class to clicked item
                $(this).addClass('selected');
                
                console.log(`Question ${questionId}: Selected value ${value}`);
            });
        });
    </script>
</body>
</html>
