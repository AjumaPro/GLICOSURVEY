<?php

namespace GlicoSurvey\Frontend;

class SurveyRenderer {
    
    public function renderSurvey($survey_id) {
        $database = new \GlicoSurvey\Core\Database();
        $survey = $database->getSurvey($survey_id);
        
        if (!$survey || $survey['status'] !== 'published') {
            return '<p>' . __('Survey not found or not published.', 'glico-survey') . '</p>';
        }
        
        ob_start();
        include GLICO_SURVEY_PLUGIN_DIR . 'templates/frontend/survey.php';
        return ob_get_clean();
    }
    
    public function renderSurveyList($args = array()) {
        $database = new \GlicoSurvey\Core\Database();
        $surveys = $database->getSurveys($args);
        
        if (empty($surveys)) {
            return '<p>' . __('No surveys found.', 'glico-survey') . '</p>';
        }
        
        ob_start();
        ?>
        <div class="glico-survey-list">
            <div class="glico-survey-filters">
                <input type="text" class="glico-survey-search" placeholder="<?php _e('Search surveys...', 'glico-survey'); ?>">
                <select class="glico-survey-filter">
                    <option value="all"><?php _e('All Surveys', 'glico-survey'); ?></option>
                    <option value="published"><?php _e('Published', 'glico-survey'); ?></option>
                    <option value="draft"><?php _e('Draft', 'glico-survey'); ?></option>
                </select>
            </div>
            
            <div class="glico-survey-grid">
                <?php foreach ($surveys as $survey): ?>
                    <div class="glico-survey-card" 
                         data-survey-id="<?php echo esc_attr($survey['id']); ?>"
                         data-status="<?php echo esc_attr($survey['status']); ?>"
                         data-survey-url="<?php echo $this->getSurveyUrl($survey['id']); ?>">
                        
                        <div class="glico-survey-card-header">
                            <h3 class="glico-survey-title"><?php echo esc_html($survey['title']); ?></h3>
                            <span class="glico-status-badge <?php echo esc_attr($survey['status']); ?>">
                                <?php echo esc_html(ucfirst($survey['status'])); ?>
                            </span>
                        </div>
                        
                        <?php if ($survey['description']): ?>
                            <p class="glico-survey-description"><?php echo esc_html($survey['description']); ?></p>
                        <?php endif; ?>
                        
                        <div class="glico-survey-stats">
                            <div class="glico-stat">
                                <span class="glico-stat-label"><?php _e('Questions', 'glico-survey'); ?>:</span>
                                <span class="glico-stat-value"><?php echo count($survey['questions']); ?></span>
                            </div>
                            <div class="glico-stat">
                                <span class="glico-stat-label"><?php _e('Responses', 'glico-survey'); ?>:</span>
                                <span class="glico-stat-value"><?php echo esc_html($survey['response_count']); ?></span>
                            </div>
                        </div>
                        
                        <div class="glico-survey-actions">
                            <a href="<?php echo $this->getSurveyUrl($survey['id']); ?>" class="glico-btn glico-btn-primary">
                                <?php _e('Take Survey', 'glico-survey'); ?>
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function renderQuestion($question) {
        $type = $question['type'];
        $question_id = $question['id'];
        $options = $question['options'] ?? array();
        $required = $question['required'] ? 'required' : '';
        
        switch ($type) {
            case 'text':
                return $this->renderTextInput($question_id, $required);
                
            case 'textarea':
                return $this->renderTextarea($question_id, $required);
                
            case 'radio':
                return $this->renderRadioButtons($question_id, $options, $required);
                
            case 'checkbox':
                return $this->renderCheckboxes($question_id, $options, $required);
                
            case 'select':
                return $this->renderSelect($question_id, $options, $required);
                
            case 'rating':
                return $this->renderRatingScale($question_id, $required);
                
            case 'emoji_scale':
                return $this->renderEmojiScale($question_id, $required);
                
            case 'custom_emoji_scale':
                return $this->renderCustomEmojiScale($question_id, $options, $required);
                
            case 'thumbs_rating':
                return $this->renderThumbsRating($question_id, $required);
                
            case 'star_rating':
                return $this->renderStarRating($question_id, $required);
                
            case 'yes_no':
                return $this->renderYesNo($question_id, $required);
                
            case 'likert_scale':
                return $this->renderLikertScale($question_id, $options, $required);
                
            default:
                return '<p>' . __('Unsupported question type.', 'glico-survey') . '</p>';
        }
    }
    
    private function renderTextInput($question_id, $required) {
        return sprintf(
            '<input type="text" class="glico-input" name="question_%d" data-question-id="%d" %s>',
            $question_id,
            $question_id,
            $required
        );
    }
    
    private function renderTextarea($question_id, $required) {
        return sprintf(
            '<textarea class="glico-textarea" name="question_%d" data-question-id="%d" %s></textarea>',
            $question_id,
            $question_id,
            $required
        );
    }
    
    private function renderRadioButtons($question_id, $options, $required) {
        $html = '<div class="glico-radio-group">';
        
        foreach ($options as $index => $option) {
            $html .= sprintf(
                '<label class="glico-radio-item" data-question-id="%d">
                    <input type="radio" name="question_%d" value="%s" %s>
                    <span>%s</span>
                </label>',
                $question_id,
                $question_id,
                esc_attr($option),
                $required,
                esc_html($option)
            );
        }
        
        $html .= '</div>';
        return $html;
    }
    
    private function renderCheckboxes($question_id, $options, $required) {
        $html = '<div class="glico-checkbox-group">';
        
        foreach ($options as $index => $option) {
            $html .= sprintf(
                '<label class="glico-checkbox-item" data-question-id="%d">
                    <input type="checkbox" name="question_%d[]" value="%s">
                    <span>%s</span>
                </label>',
                $question_id,
                $question_id,
                esc_attr($option),
                esc_html($option)
            );
        }
        
        $html .= '</div>';
        return $html;
    }
    
    private function renderSelect($question_id, $options, $required) {
        $html = sprintf('<select class="glico-select" name="question_%d" data-question-id="%d" %s>', $question_id, $question_id, $required);
        $html .= '<option value="">' . __('Select an option...', 'glico-survey') . '</option>';
        
        foreach ($options as $option) {
            $html .= sprintf('<option value="%s">%s</option>', esc_attr($option), esc_html($option));
        }
        
        $html .= '</select>';
        return $html;
    }
    
    private function renderRatingScale($question_id, $required) {
        $html = '<div class="glico-rating-scale">';
        
        for ($i = 1; $i <= 10; $i++) {
            $html .= sprintf(
                '<div class="glico-rating-item" data-question-id="%d" data-value="%d">
                    <div class="glico-rating-number">%d</div>
                    <div class="glico-rating-label">%s</div>
                </div>',
                $question_id,
                $i,
                $i,
                $i === 1 ? __('Poor', 'glico-survey') : ($i === 10 ? __('Excellent', 'glico-survey') : '')
            );
        }
        
        $html .= '</div>';
        return $html;
    }
    
    private function renderEmojiScale($question_id, $required) {
        return \GlicoSurvey\Core\SVGEmojis::renderEmojiScale($question_id, 'satisfaction', $required);
    }
    
    private function renderCustomEmojiScale($question_id, $options, $required) {
        $html = '<div class="glico-custom-emoji-scale">';
        
        foreach ($options as $index => $option) {
            $emoji = $option['emoji'] ?? '😐';
            $label = $option['label'] ?? __('Option', 'glico-survey') . ' ' . ($index + 1);
            $value = $option['value'] ?? $index;
            
            $html .= sprintf(
                '<div class="glico-custom-emoji-item" data-question-id="%d" data-value="%s">
                    <img src="%s" alt="%s" class="glico-custom-emoji">
                    <div class="glico-emoji-label">%s</div>
                </div>',
                $question_id,
                esc_attr($value),
                esc_url($emoji),
                esc_attr($label),
                esc_html($label)
            );
        }
        
        $html .= '</div>';
        return $html;
    }
    
    private function renderThumbsRating($question_id, $required) {
        return \GlicoSurvey\Core\SVGEmojis::renderEmojiScale($question_id, 'thumbs', $required);
    }
    
    private function renderStarRating($question_id, $required) {
        return \GlicoSurvey\Core\SVGEmojis::renderEmojiScale($question_id, 'stars', $required);
    }
    
    private function renderYesNo($question_id, $required) {
        return \GlicoSurvey\Core\SVGEmojis::renderEmojiScale($question_id, 'yes_no', $required);
    }
    
    private function renderLikertScale($question_id, $options, $required) {
        $html = '<div class="glico-likert-scale">';
        
        // Default Likert scale options if none provided
        if (empty($options)) {
            $options = array(
                array('value' => 1, 'label' => __('Strongly Disagree', 'glico-survey')),
                array('value' => 2, 'label' => __('Disagree', 'glico-survey')),
                array('value' => 3, 'label' => __('Neutral', 'glico-survey')),
                array('value' => 4, 'label' => __('Agree', 'glico-survey')),
                array('value' => 5, 'label' => __('Strongly Agree', 'glico-survey'))
            );
        }
        
        foreach ($options as $option) {
            $html .= sprintf(
                '<div class="glico-likert-item" data-question-id="%d" data-value="%s">
                    <div class="glico-likert-number">%d</div>
                    <div class="glico-likert-label">%s</div>
                </div>',
                $question_id,
                esc_attr($option['value']),
                intval($option['value']),
                esc_html($option['label'])
            );
        }
        
        $html .= '</div>';
        return $html;
    }
    
    private function getSurveyUrl($survey_id) {
        return home_url('/survey/' . $survey_id);
    }
}
