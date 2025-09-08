<?php

namespace GlicoSurvey\Core;

class SVGEmojis {
    
    private static $emoji_svgs = array(
        'very_sad' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/><path d="M8.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
            'label' => 'Very Sad',
            'color' => '#ef4444'
        ),
        'sad' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/><path d="M8.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
            'label' => 'Sad',
            'color' => '#f97316'
        ),
        'neutral' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/><path d="M8.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
            'label' => 'Neutral',
            'color' => '#6b7280'
        ),
        'happy' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/><path d="M8.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
            'label' => 'Happy',
            'color' => '#22c55e'
        ),
        'very_happy' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/><path d="M8.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
            'label' => 'Very Happy',
            'color' => '#16a34a'
        ),
        'thumbs_up' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>',
            'label' => 'Thumbs Up',
            'color' => '#22c55e'
        ),
        'thumbs_down' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>',
            'label' => 'Thumbs Down',
            'color' => '#ef4444'
        ),
        'star' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            'label' => 'Star',
            'color' => '#fbbf24'
        ),
        'heart' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
            'label' => 'Heart',
            'color' => '#ef4444'
        ),
        'check' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
            'label' => 'Check',
            'color' => '#22c55e'
        ),
        'cross' => array(
            'svg' => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
            'label' => 'Cross',
            'color' => '#ef4444'
        )
    );
    
    /**
     * Get SVG emoji by key
     */
    public static function getEmoji($key) {
        return isset(self::$emoji_svgs[$key]) ? self::$emoji_svgs[$key] : null;
    }
    
    /**
     * Get all available emojis
     */
    public static function getAllEmojis() {
        return self::$emoji_svgs;
    }
    
    /**
     * Render SVG emoji with custom styling
     */
    public static function renderEmoji($key, $size = 32, $color = null) {
        $emoji = self::getEmoji($key);
        if (!$emoji) {
            return '';
        }
        
        $color = $color ?: $emoji['color'];
        $svg = str_replace('width="32" height="32"', "width=\"{$size}\" height=\"{$size}\"", $emoji['svg']);
        $svg = str_replace('fill="currentColor"', "fill=\"{$color}\"", $svg);
        
        return $svg;
    }
    
    /**
     * Get emoji label
     */
    public static function getEmojiLabel($key) {
        $emoji = self::getEmoji($key);
        return $emoji ? $emoji['label'] : '';
    }
    
    /**
     * Get emoji color
     */
    public static function getEmojiColor($key) {
        $emoji = self::getEmoji($key);
        return $emoji ? $emoji['color'] : '#6b7280';
    }
    
    /**
     * Create custom emoji scale options
     */
    public static function createEmojiScale($type = 'satisfaction') {
        switch ($type) {
            case 'satisfaction':
                return array(
                    array('key' => 'very_sad', 'value' => 1, 'label' => 'Very Unsatisfied'),
                    array('key' => 'sad', 'value' => 2, 'label' => 'Unsatisfied'),
                    array('key' => 'neutral', 'value' => 3, 'label' => 'Neutral'),
                    array('key' => 'happy', 'value' => 4, 'label' => 'Satisfied'),
                    array('key' => 'very_happy', 'value' => 5, 'label' => 'Very Satisfied')
                );
                
            case 'recommendation':
                return array(
                    array('key' => 'very_sad', 'value' => 1, 'label' => 'Very Unlikely'),
                    array('key' => 'sad', 'value' => 2, 'label' => 'Unlikely'),
                    array('key' => 'neutral', 'value' => 3, 'label' => 'Neutral'),
                    array('key' => 'happy', 'value' => 4, 'label' => 'Likely'),
                    array('key' => 'very_happy', 'value' => 5, 'label' => 'Very Likely')
                );
                
            case 'thumbs':
                return array(
                    array('key' => 'thumbs_down', 'value' => 0, 'label' => 'Dislike'),
                    array('key' => 'thumbs_up', 'value' => 1, 'label' => 'Like')
                );
                
            case 'stars':
                return array(
                    array('key' => 'star', 'value' => 1, 'label' => '1 Star'),
                    array('key' => 'star', 'value' => 2, 'label' => '2 Stars'),
                    array('key' => 'star', 'value' => 3, 'label' => '3 Stars'),
                    array('key' => 'star', 'value' => 4, 'label' => '4 Stars'),
                    array('key' => 'star', 'value' => 5, 'label' => '5 Stars')
                );
                
            case 'yes_no':
                return array(
                    array('key' => 'cross', 'value' => 0, 'label' => 'No'),
                    array('key' => 'check', 'value' => 1, 'label' => 'Yes')
                );
                
            default:
                return self::createEmojiScale('satisfaction');
        }
    }
    
    /**
     * Render emoji scale HTML
     */
    public static function renderEmojiScale($question_id, $type = 'satisfaction', $required = '') {
        $options = self::createEmojiScale($type);
        $html = '<div class="glico-svg-emoji-scale">';
        
        foreach ($options as $option) {
            $emoji_html = self::renderEmoji($option['key'], 40);
            $html .= sprintf(
                '<div class="glico-svg-emoji-item" data-question-id="%d" data-value="%s">
                    <div class="glico-svg-emoji">%s</div>
                    <div class="glico-svg-emoji-label">%s</div>
                </div>',
                $question_id,
                esc_attr($option['value']),
                $emoji_html,
                esc_html($option['label'])
            );
        }
        
        $html .= '</div>';
        return $html;
    }
}
