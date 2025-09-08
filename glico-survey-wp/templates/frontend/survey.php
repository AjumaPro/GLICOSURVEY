<?php
/**
 * Frontend Survey Template
 */

if (!defined('ABSPATH')) {
    exit;
}

$survey = $args['survey'] ?? null;
if (!$survey) {
    echo '<p>' . __('Survey not found.', 'glico-survey') . '</p>';
    return;
}
?>

<div class="glico-survey-container" data-survey-id="<?php echo esc_attr($survey['id']); ?>">
    <div class="glico-survey-wrapper">
        <!-- Survey Header -->
        <div class="glico-survey-header">
            <h1 class="glico-survey-title"><?php echo esc_html($survey['title']); ?></h1>
            <?php if ($survey['description']): ?>
                <p class="glico-survey-description"><?php echo esc_html($survey['description']); ?></p>
            <?php endif; ?>
            
            <!-- Progress Bar -->
            <div class="glico-survey-progress">
                <div class="glico-survey-progress-bar" style="width: 0%"></div>
            </div>
        </div>

        <!-- Survey Form -->
        <form class="glico-survey-form" method="post">
            <?php wp_nonce_field('glico_survey_nonce', 'glico_survey_nonce'); ?>
            <input type="hidden" name="survey_id" value="<?php echo esc_attr($survey['id']); ?>">
            
            <?php if (!empty($survey['questions'])): ?>
                <?php foreach ($survey['questions'] as $index => $question): ?>
                    <div class="glico-question" 
                         data-question-id="<?php echo esc_attr($question['id']); ?>"
                         data-required="<?php echo esc_attr($question['required'] ? 'true' : 'false'); ?>"
                         <?php echo $index > 0 ? 'style="display: none;"' : ''; ?>>
                        
                        <h3 class="glico-question-title <?php echo $question['required'] ? 'required' : ''; ?>">
                            <?php echo esc_html($question['title']); ?>
                        </h3>
                        
                        <?php if (!empty($question['description'])): ?>
                            <p class="glico-question-description"><?php echo esc_html($question['description']); ?></p>
                        <?php endif; ?>
                        
                        <div class="glico-question-content">
                            <?php 
                            $renderer = new \GlicoSurvey\Frontend\SurveyRenderer();
                            echo $renderer->renderQuestion($question); 
                            ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
            
            <!-- Navigation -->
            <div class="glico-survey-navigation">
                <button type="button" class="glico-btn glico-btn-secondary glico-btn-prev" style="display: none;">
                    <?php _e('Previous', 'glico-survey'); ?>
                </button>
                
                <div class="glico-survey-progress-text">
                    <span class="glico-current-question">1</span> / <span class="glico-total-questions"><?php echo count($survey['questions']); ?></span>
                </div>
                
                <button type="button" class="glico-btn glico-btn-primary glico-btn-next">
                    <?php _e('Next', 'glico-survey'); ?>
                </button>
                
                <button type="submit" class="glico-btn glico-btn-primary glico-btn-submit" style="display: none;">
                    <?php _e('Submit Survey', 'glico-survey'); ?>
                </button>
            </div>
        </form>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Update progress text
    const totalQuestions = <?php echo count($survey['questions']); ?>;
    document.querySelector('.glico-total-questions').textContent = totalQuestions;
});
</script>
