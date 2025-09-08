/**
 * Glico Survey Admin JavaScript
 */

(function($) {
    'use strict';

    class GlicoSurveyAdmin {
        constructor() {
            this.currentPage = this.getCurrentPage();
            this.init();
        }

        init() {
            this.bindEvents();
            this.initializePage();
        }

        bindEvents() {
            // Survey actions
            $(document).on('click', '.glico-btn-delete', this.handleDeleteSurvey.bind(this));
            $(document).on('click', '.glico-btn-publish', this.handlePublishSurvey.bind(this));
            $(document).on('click', '.glico-btn-unpublish', this.handleUnpublishSurvey.bind(this));
            $(document).on('click', '.glico-btn-duplicate', this.handleDuplicateSurvey.bind(this));
            
            // Question builder
            $(document).on('change', '.glico-question-type input[type="radio"]', this.handleQuestionTypeChange.bind(this));
            $(document).on('click', '.glico-add-option', this.handleAddOption.bind(this));
            $(document).on('click', '.glico-option-remove', this.handleRemoveOption.bind(this));
            $(document).on('click', '.glico-add-question', this.handleAddQuestion.bind(this));
            $(document).on('click', '.glico-remove-question', this.handleRemoveQuestion.bind(this));
            
            // Form submissions
            $(document).on('submit', '.glico-survey-form', this.handleSurveyFormSubmit.bind(this));
            $(document).on('submit', '.glico-settings-form', this.handleSettingsFormSubmit.bind(this));
            
            // Sortable questions
            this.initializeSortable();
            
            // Auto-save
            this.initializeAutoSave();
        }

        initializePage() {
            switch (this.currentPage) {
                case 'surveys':
                    this.initializeSurveysPage();
                    break;
                case 'create':
                case 'edit':
                    this.initializeSurveyBuilder();
                    break;
                case 'analytics':
                    this.initializeAnalyticsPage();
                    break;
                case 'settings':
                    this.initializeSettingsPage();
                    break;
            }
        }

        initializeSurveysPage() {
            // Initialize data tables if needed
            if ($.fn.DataTable) {
                $('.glico-table').DataTable({
                    pageLength: 25,
                    responsive: true,
                    order: [[0, 'desc']],
                    language: {
                        search: "Search surveys:",
                        lengthMenu: "Show _MENU_ surveys per page",
                        info: "Showing _START_ to _END_ of _TOTAL_ surveys",
                        paginate: {
                            first: "First",
                            last: "Last",
                            next: "Next",
                            previous: "Previous"
                        }
                    }
                });
            }
        }

        initializeSurveyBuilder() {
            // Initialize question type selector
            this.updateQuestionTypeOptions();
            
            // Initialize emoji picker if needed
            this.initializeEmojiPicker();
        }

        initializeAnalyticsPage() {
            // Initialize charts if Chart.js is available
            if (typeof Chart !== 'undefined') {
                this.initializeCharts();
            }
        }

        initializeSettingsPage() {
            // Initialize color pickers if needed
            this.initializeColorPickers();
        }

        initializeSortable() {
            if ($.fn.sortable) {
                $('.glico-sortable-list').sortable({
                    handle: '.glico-sortable-handle',
                    placeholder: 'glico-sortable-placeholder',
                    update: this.handleQuestionReorder.bind(this)
                });
            }
        }

        initializeAutoSave() {
            // Auto-save every 30 seconds
            setInterval(() => {
                if (this.currentPage === 'create' || this.currentPage === 'edit') {
                    this.autoSave();
                }
            }, 30000);
        }

        initializeEmojiPicker() {
            // Initialize emoji picker for custom emoji scales
            $('.glico-emoji-picker').each(function() {
                const $picker = $(this);
                const $input = $picker.find('input');
                
                $picker.find('.glico-emoji-option').on('click', function() {
                    const emoji = $(this).data('emoji');
                    $input.val(emoji);
                    $picker.find('.glico-emoji-preview').text(emoji);
                });
            });
        }

        initializeColorPickers() {
            // Initialize color pickers for theme customization
            if ($.fn.wpColorPicker) {
                $('.glico-color-picker').wpColorPicker();
            }
        }

        initializeCharts() {
            // Initialize analytics charts
            $('.glico-chart').each(function() {
                const $chart = $(this);
                const chartData = $chart.data('chart-data');
                const chartType = $chart.data('chart-type') || 'bar';
                
                if (chartData) {
                    new Chart($chart[0], {
                        type: chartType,
                        data: chartData,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                }
                            }
                        }
                    });
                }
            });
        }

        handleDeleteSurvey(e) {
            e.preventDefault();
            
            if (!confirm(glicoSurveyAdmin.strings.confirmDelete)) {
                return;
            }
            
            const $btn = $(e.currentTarget);
            const surveyId = $btn.data('survey-id');
            
            this.showLoading($btn);
            
            $.ajax({
                url: glicoSurveyAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'glico_survey_admin_action',
                    action_type: 'delete_survey',
                    survey_id: surveyId,
                    nonce: glicoSurveyAdmin.nonce
                },
                success: (response) => {
                    if (response.success) {
                        $btn.closest('tr, .glico-survey-card').fadeOut(300, function() {
                            $(this).remove();
                        });
                        this.showNotice('success', response.data);
                    } else {
                        this.showNotice('error', response.data);
                    }
                },
                error: () => {
                    this.showNotice('error', glicoSurveyAdmin.strings.error);
                },
                complete: () => {
                    this.hideLoading($btn);
                }
            });
        }

        handlePublishSurvey(e) {
            e.preventDefault();
            
            const $btn = $(e.currentTarget);
            const surveyId = $btn.data('survey-id');
            
            this.showLoading($btn);
            
            $.ajax({
                url: glicoSurveyAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'glico_survey_admin_action',
                    action_type: 'publish_survey',
                    survey_id: surveyId,
                    nonce: glicoSurveyAdmin.nonce
                },
                success: (response) => {
                    if (response.success) {
                        $btn.removeClass('glico-btn-publish').addClass('glico-btn-unpublish')
                            .text('Unpublish').data('action', 'unpublish');
                        $btn.closest('tr, .glico-survey-card').find('.glico-status-badge')
                            .removeClass('draft').addClass('published').text('Published');
                        this.showNotice('success', response.data);
                    } else {
                        this.showNotice('error', response.data);
                    }
                },
                error: () => {
                    this.showNotice('error', glicoSurveyAdmin.strings.error);
                },
                complete: () => {
                    this.hideLoading($btn);
                }
            });
        }

        handleUnpublishSurvey(e) {
            e.preventDefault();
            
            const $btn = $(e.currentTarget);
            const surveyId = $btn.data('survey-id');
            
            this.showLoading($btn);
            
            $.ajax({
                url: glicoSurveyAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'glico_survey_admin_action',
                    action_type: 'unpublish_survey',
                    survey_id: surveyId,
                    nonce: glicoSurveyAdmin.nonce
                },
                success: (response) => {
                    if (response.success) {
                        $btn.removeClass('glico-btn-unpublish').addClass('glico-btn-publish')
                            .text('Publish').data('action', 'publish');
                        $btn.closest('tr, .glico-survey-card').find('.glico-status-badge')
                            .removeClass('published').addClass('draft').text('Draft');
                        this.showNotice('success', response.data);
                    } else {
                        this.showNotice('error', response.data);
                    }
                },
                error: () => {
                    this.showNotice('error', glicoSurveyAdmin.strings.error);
                },
                complete: () => {
                    this.hideLoading($btn);
                }
            });
        }

        handleDuplicateSurvey(e) {
            e.preventDefault();
            
            const $btn = $(e.currentTarget);
            const surveyId = $btn.data('survey-id');
            
            this.showLoading($btn);
            
            $.ajax({
                url: glicoSurveyAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'glico_survey_admin_action',
                    action_type: 'duplicate_survey',
                    survey_id: surveyId,
                    nonce: glicoSurveyAdmin.nonce
                },
                success: (response) => {
                    if (response.success) {
                        window.location.href = response.data.edit_url;
                    } else {
                        this.showNotice('error', response.data);
                    }
                },
                error: () => {
                    this.showNotice('error', glicoSurveyAdmin.strings.error);
                },
                complete: () => {
                    this.hideLoading($btn);
                }
            });
        }

        handleQuestionTypeChange(e) {
            const $type = $(e.currentTarget);
            const type = $type.val();
            const $question = $type.closest('.glico-question-builder');
            
            // Update question type
            $question.data('question-type', type);
            
            // Show/hide relevant options
            this.updateQuestionTypeOptions($question);
        }

        updateQuestionTypeOptions($question = null) {
            const $questions = $question ? $question : $('.glico-question-builder');
            
            $questions.each(function() {
                const $q = $(this);
                const type = $q.data('question-type') || $q.find('.glico-question-type input:checked').val();
                const $optionsBuilder = $q.find('.glico-options-builder');
                
                // Show/hide options builder based on question type
                if (['radio', 'checkbox', 'select'].includes(type)) {
                    $optionsBuilder.show();
                } else {
                    $optionsBuilder.hide();
                }
                
                // Show/hide emoji picker for emoji scale types
                if (type === 'custom_emoji_scale') {
                    $q.find('.glico-emoji-picker').show();
                } else {
                    $q.find('.glico-emoji-picker').hide();
                }
            });
        }

        handleAddOption(e) {
            e.preventDefault();
            
            const $btn = $(e.currentTarget);
            const $optionsList = $btn.siblings('.glico-options-list');
            const optionIndex = $optionsList.find('.glico-option-item').length;
            
            const optionHtml = `
                <div class="glico-option-item">
                    <input type="text" class="glico-option-input" placeholder="Option ${optionIndex + 1}" name="options[${optionIndex}]">
                    <button type="button" class="glico-option-remove">×</button>
                </div>
            `;
            
            $optionsList.append(optionHtml);
        }

        handleRemoveOption(e) {
            e.preventDefault();
            
            const $item = $(e.currentTarget).closest('.glico-option-item');
            $item.fadeOut(300, function() {
                $(this).remove();
            });
        }

        handleAddQuestion(e) {
            e.preventDefault();
            
            const questionIndex = $('.glico-question-builder').length;
            const questionHtml = this.getQuestionTemplate(questionIndex);
            
            $('.glico-questions-list').append(questionHtml);
            
            // Reinitialize sortable
            this.initializeSortable();
        }

        handleRemoveQuestion(e) {
            e.preventDefault();
            
            const $question = $(e.currentTarget).closest('.glico-question-builder');
            $question.fadeOut(300, function() {
                $(this).remove();
            });
        }

        handleQuestionReorder(e, ui) {
            // Update order indices
            $('.glico-question-builder').each(function(index) {
                $(this).find('input[name*="[order_index]"]').val(index);
            });
        }

        handleSurveyFormSubmit(e) {
            e.preventDefault();
            
            const $form = $(e.currentTarget);
            const $submitBtn = $form.find('button[type="submit"]');
            
            this.showLoading($submitBtn);
            
            const formData = new FormData($form[0]);
            formData.append('action', 'glico_survey_admin_action');
            formData.append('action_type', 'save_survey');
            formData.append('nonce', glicoSurveyAdmin.nonce);
            
            $.ajax({
                url: glicoSurveyAdmin.ajaxUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: (response) => {
                    if (response.success) {
                        this.showNotice('success', response.data);
                        if (response.data.redirect_url) {
                            setTimeout(() => {
                                window.location.href = response.data.redirect_url;
                            }, 1500);
                        }
                    } else {
                        this.showNotice('error', response.data);
                    }
                },
                error: () => {
                    this.showNotice('error', glicoSurveyAdmin.strings.error);
                },
                complete: () => {
                    this.hideLoading($submitBtn);
                }
            });
        }

        handleSettingsFormSubmit(e) {
            e.preventDefault();
            
            const $form = $(e.currentTarget);
            const $submitBtn = $form.find('button[type="submit"]');
            
            this.showLoading($submitBtn);
            
            $.ajax({
                url: glicoSurveyAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'glico_survey_admin_action',
                    action_type: 'save_settings',
                    settings: $form.serialize(),
                    nonce: glicoSurveyAdmin.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.showNotice('success', response.data);
                    } else {
                        this.showNotice('error', response.data);
                    }
                },
                error: () => {
                    this.showNotice('error', glicoSurveyAdmin.strings.error);
                },
                complete: () => {
                    this.hideLoading($submitBtn);
                }
            });
        }

        autoSave() {
            const $form = $('.glico-survey-form');
            if ($form.length === 0) return;
            
            const formData = new FormData($form[0]);
            formData.append('action', 'glico_survey_admin_action');
            formData.append('action_type', 'auto_save');
            formData.append('nonce', glicoSurveyAdmin.nonce);
            
            $.ajax({
                url: glicoSurveyAdmin.ajaxUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: (response) => {
                    if (response.success) {
                        this.showAutoSaveNotice();
                    }
                }
            });
        }

        getQuestionTemplate(index) {
            return `
                <div class="glico-question-builder" data-question-index="${index}">
                    <div class="glico-question-builder-header">
                        <h4 class="glico-question-builder-title">Question ${index + 1}</h4>
                        <button type="button" class="glico-btn glico-btn-error glico-btn-sm glico-remove-question">Remove</button>
                    </div>
                    <div class="glico-question-builder-body">
                        <div class="glico-form-group">
                            <label class="glico-form-label required">Question Title</label>
                            <input type="text" class="glico-form-input" name="questions[${index}][title]" required>
                        </div>
                        
                        <div class="glico-form-group">
                            <label class="glico-form-label">Question Type</label>
                            <div class="glico-question-type-selector">
                                <label class="glico-question-type">
                                    <input type="radio" name="questions[${index}][type]" value="text" checked>
                                    <div>
                                        <div class="glico-question-type-label">Text Input</div>
                                        <div class="glico-question-type-description">Single line text</div>
                                    </div>
                                </label>
                                <label class="glico-question-type">
                                    <input type="radio" name="questions[${index}][type]" value="textarea">
                                    <div>
                                        <div class="glico-question-type-label">Text Area</div>
                                        <div class="glico-question-type-description">Multi-line text</div>
                                    </div>
                                </label>
                                <label class="glico-question-type">
                                    <input type="radio" name="questions[${index}][type]" value="radio">
                                    <div>
                                        <div class="glico-question-type-label">Radio Buttons</div>
                                        <div class="glico-question-type-description">Single choice</div>
                                    </div>
                                </label>
                                <label class="glico-question-type">
                                    <input type="radio" name="questions[${index}][type]" value="checkbox">
                                    <div>
                                        <div class="glico-question-type-label">Checkboxes</div>
                                        <div class="glico-question-type-description">Multiple choice</div>
                                    </div>
                                </label>
                                <label class="glico-question-type">
                                    <input type="radio" name="questions[${index}][type]" value="select">
                                    <div>
                                        <div class="glico-question-type-label">Dropdown</div>
                                        <div class="glico-question-type-description">Select from list</div>
                                    </div>
                                </label>
                                <label class="glico-question-type">
                                    <input type="radio" name="questions[${index}][type]" value="rating">
                                    <div>
                                        <div class="glico-question-type-label">Rating Scale</div>
                                        <div class="glico-question-type-description">1-10 scale</div>
                                    </div>
                                </label>
                                <label class="glico-question-type">
                                    <input type="radio" name="questions[${index}][type]" value="emoji_scale">
                                    <div>
                                        <div class="glico-question-type-label">Emoji Scale</div>
                                        <div class="glico-question-type-description">Happy to sad</div>
                                    </div>
                                </label>
                                <label class="glico-question-type">
                                    <input type="radio" name="questions[${index}][type]" value="custom_emoji_scale">
                                    <div>
                                        <div class="glico-question-type-label">Custom Emoji</div>
                                        <div class="glico-question-type-description">Custom emoji scale</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="glico-options-builder" style="display: none;">
                            <label class="glico-form-label">Options</label>
                            <div class="glico-options-list">
                                <div class="glico-option-item">
                                    <input type="text" class="glico-option-input" placeholder="Option 1" name="questions[${index}][options][0]">
                                    <button type="button" class="glico-option-remove">×</button>
                                </div>
                                <div class="glico-option-item">
                                    <input type="text" class="glico-option-input" placeholder="Option 2" name="questions[${index}][options][1]">
                                    <button type="button" class="glico-option-remove">×</button>
                                </div>
                            </div>
                            <button type="button" class="glico-add-option">Add Option</button>
                        </div>
                        
                        <div class="glico-form-group">
                            <label class="glico-form-label">
                                <input type="checkbox" name="questions[${index}][required]" value="1">
                                Required question
                            </label>
                        </div>
                        
                        <input type="hidden" name="questions[${index}][order_index]" value="${index}">
                    </div>
                </div>
            `;
        }

        showLoading($btn) {
            $btn.prop('disabled', true).data('original-text', $btn.text());
            $btn.html(`<span class="glico-loading"><span class="glico-spinner"></span>${glicoSurveyAdmin.strings.saving}</span>`);
        }

        hideLoading($btn) {
            $btn.prop('disabled', false).text($btn.data('original-text'));
        }

        showNotice(type, message) {
            const noticeHtml = `
                <div class="glico-notice ${type} is-dismissible">
                    <p>${message}</p>
                    <button type="button" class="notice-dismiss">
                        <span class="screen-reader-text">Dismiss this notice.</span>
                    </button>
                </div>
            `;
            
            $('.glico-admin-container').prepend(noticeHtml);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                $('.glico-notice').fadeOut();
            }, 5000);
        }

        showAutoSaveNotice() {
            const noticeHtml = `
                <div class="glico-notice info" style="position: fixed; top: 32px; right: 20px; z-index: 9999;">
                    <p>Auto-saved</p>
                </div>
            `;
            
            $('body').append(noticeHtml);
            
            setTimeout(() => {
                $('.glico-notice.info').fadeOut();
            }, 2000);
        }

        getCurrentPage() {
            const url = window.location.href;
            if (url.includes('glico-survey-create')) return 'create';
            if (url.includes('glico-survey-surveys')) return 'surveys';
            if (url.includes('glico-survey-analytics')) return 'analytics';
            if (url.includes('glico-survey-settings')) return 'settings';
            return 'dashboard';
        }
    }

    // Initialize when document is ready
    $(document).ready(function() {
        new GlicoSurveyAdmin();
    });

})(jQuery);
