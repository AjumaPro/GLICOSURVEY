/**
 * Glico Survey Frontend JavaScript
 */

(function($) {
    'use strict';

    class GlicoSurvey {
        constructor() {
            this.surveyId = null;
            this.currentQuestion = 0;
            this.totalQuestions = 0;
            this.responses = {};
            this.sessionId = this.generateSessionId();
            this.isSubmitting = false;
            
            this.init();
        }

        init() {
            this.bindEvents();
            this.initializeSurvey();
        }

        bindEvents() {
            // Form submission
            $(document).on('submit', '.glico-survey-form', this.handleFormSubmit.bind(this));
            
            // Radio button changes
            $(document).on('change', '.glico-radio-item input[type="radio"]', this.handleRadioChange.bind(this));
            
            // Checkbox changes
            $(document).on('change', '.glico-checkbox-item input[type="checkbox"]', this.handleCheckboxChange.bind(this));
            
            // Rating scale clicks
            $(document).on('click', '.glico-rating-item', this.handleRatingClick.bind(this));
            
            // Emoji scale clicks
            $(document).on('click', '.glico-emoji-item', this.handleEmojiClick.bind(this));
            
            // Custom emoji scale clicks
            $(document).on('click', '.glico-custom-emoji-item', this.handleCustomEmojiClick.bind(this));
            
            // Navigation buttons
            $(document).on('click', '.glico-btn-next', this.handleNextQuestion.bind(this));
            $(document).on('click', '.glico-btn-prev', this.handlePreviousQuestion.bind(this));
            
            // Input changes
            $(document).on('input change', '.glico-input, .glico-textarea, .glico-select', this.handleInputChange.bind(this));
        }

        initializeSurvey() {
            const surveyContainer = $('.glico-survey-container');
            if (surveyContainer.length === 0) return;

            this.surveyId = surveyContainer.data('survey-id');
            this.totalQuestions = $('.glico-question').length;
            
            if (this.totalQuestions > 0) {
                this.showQuestion(0);
                this.updateProgress();
            }
        }

        handleFormSubmit(e) {
            e.preventDefault();
            
            if (this.isSubmitting) return;
            
            this.isSubmitting = true;
            this.showLoading();
            
            const formData = {
                action: 'glico_survey_action',
                action_type: 'submit_survey',
                survey_id: this.surveyId,
                responses: this.responses,
                session_id: this.sessionId,
                nonce: glicoSurvey.nonce
            };
            
            $.ajax({
                url: glicoSurvey.ajaxUrl,
                type: 'POST',
                data: formData,
                success: (response) => {
                    if (response.success) {
                        this.showSuccessMessage(response.data);
                    } else {
                        this.showErrorMessage(response.data || glicoSurvey.strings.error);
                    }
                },
                error: () => {
                    this.showErrorMessage(glicoSurvey.strings.error);
                },
                complete: () => {
                    this.isSubmitting = false;
                    this.hideLoading();
                }
            });
        }

        handleRadioChange(e) {
            const $item = $(e.target).closest('.glico-radio-item');
            const questionId = $item.data('question-id');
            const value = e.target.value;
            
            // Remove selected class from siblings
            $item.siblings().removeClass('selected');
            
            // Add selected class to current item
            $item.addClass('selected');
            
            // Store response
            this.responses[questionId] = value;
            
            this.validateQuestion(questionId);
        }

        handleCheckboxChange(e) {
            const $item = $(e.target).closest('.glico-checkbox-item');
            const questionId = $item.data('question-id');
            const value = e.target.value;
            
            // Toggle selected class
            if (e.target.checked) {
                $item.addClass('selected');
            } else {
                $item.removeClass('selected');
            }
            
            // Get all checked values for this question
            const checkedValues = [];
            $(`.glico-checkbox-item[data-question-id="${questionId}"] input:checked`).each(function() {
                checkedValues.push($(this).val());
            });
            
            // Store response
            this.responses[questionId] = checkedValues;
            
            this.validateQuestion(questionId);
        }

        handleRatingClick(e) {
            const $item = $(e.currentTarget);
            const questionId = $item.data('question-id');
            const value = $item.data('value');
            
            // Remove selected class from siblings
            $item.siblings().removeClass('selected');
            
            // Add selected class to current item
            $item.addClass('selected');
            
            // Store response
            this.responses[questionId] = value;
            
            this.validateQuestion(questionId);
        }

        handleEmojiClick(e) {
            const $item = $(e.currentTarget);
            const questionId = $item.data('question-id');
            const value = $item.data('value');
            
            // Remove selected class from siblings
            $item.siblings().removeClass('selected');
            
            // Add selected class to current item
            $item.addClass('selected');
            
            // Store response
            this.responses[questionId] = value;
            
            this.validateQuestion(questionId);
        }

        handleCustomEmojiClick(e) {
            const $item = $(e.currentTarget);
            const questionId = $item.data('question-id');
            const value = $item.data('value');
            
            // Remove selected class from siblings
            $item.siblings().removeClass('selected');
            
            // Add selected class to current item
            $item.addClass('selected');
            
            // Store response
            this.responses[questionId] = value;
            
            this.validateQuestion(questionId);
        }

        handleInputChange(e) {
            const $input = $(e.target);
            const questionId = $input.data('question-id');
            const value = $input.val();
            
            // Store response
            this.responses[questionId] = value;
            
            this.validateQuestion(questionId);
        }

        handleNextQuestion() {
            if (this.currentQuestion < this.totalQuestions - 1) {
                this.currentQuestion++;
                this.showQuestion(this.currentQuestion);
                this.updateProgress();
            }
        }

        handlePreviousQuestion() {
            if (this.currentQuestion > 0) {
                this.currentQuestion--;
                this.showQuestion(this.currentQuestion);
                this.updateProgress();
            }
        }

        showQuestion(index) {
            $('.glico-question').hide().removeClass('active');
            $(`.glico-question:eq(${index})`).show().addClass('active');
            
            // Update navigation buttons
            $('.glico-btn-prev').toggle(index > 0);
            $('.glico-btn-next').toggle(index < this.totalQuestions - 1);
            
            // Show submit button on last question
            $('.glico-btn-submit').toggle(index === this.totalQuestions - 1);
        }

        updateProgress() {
            const progress = ((this.currentQuestion + 1) / this.totalQuestions) * 100;
            $('.glico-survey-progress-bar').css('width', progress + '%');
        }

        validateQuestion(questionId) {
            const $question = $(`.glico-question[data-question-id="${questionId}"]`);
            const isRequired = $question.data('required');
            const hasResponse = this.responses[questionId] && 
                               (Array.isArray(this.responses[questionId]) ? 
                                this.responses[questionId].length > 0 : 
                                this.responses[questionId] !== '');
            
            if (isRequired && !hasResponse) {
                $question.addClass('error');
                this.showFieldError(questionId, glicoSurvey.strings.required);
            } else {
                $question.removeClass('error');
                this.hideFieldError(questionId);
            }
        }

        showFieldError(questionId, message) {
            let $error = $(`.glico-question[data-question-id="${questionId}"] .glico-error`);
            if ($error.length === 0) {
                $error = $(`<div class="glico-error">${message}</div>`);
                $(`.glico-question[data-question-id="${questionId}"]`).append($error);
            } else {
                $error.text(message);
            }
        }

        hideFieldError(questionId) {
            $(`.glico-question[data-question-id="${questionId}"] .glico-error`).remove();
        }

        showLoading() {
            $('.glico-survey-form').addClass('loading');
            $('.glico-btn-submit').prop('disabled', true).html(`
                <span class="glico-loading">
                    <span class="glico-spinner"></span>
                    ${glicoSurvey.strings.loading}
                </span>
            `);
        }

        hideLoading() {
            $('.glico-survey-form').removeClass('loading');
            $('.glico-btn-submit').prop('disabled', false).html('Submit Survey');
        }

        showSuccessMessage(message) {
            const successHtml = `
                <div class="glico-success-message">
                    <h3>Thank You!</h3>
                    <p>${message || glicoSurvey.strings.success}</p>
                </div>
            `;
            
            $('.glico-survey-form').html(successHtml);
            
            // Scroll to top
            $('html, body').animate({
                scrollTop: $('.glico-survey-container').offset().top
            }, 500);
        }

        showErrorMessage(message) {
            const errorHtml = `
                <div class="glico-notice error">
                    <p>${message}</p>
                </div>
            `;
            
            $('.glico-survey-form').prepend(errorHtml);
            
            // Remove error after 5 seconds
            setTimeout(() => {
                $('.glico-notice.error').fadeOut();
            }, 5000);
        }

        generateSessionId() {
            return 'glico_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    }

    // Initialize when document is ready
    $(document).ready(function() {
        new GlicoSurvey();
    });

    // Survey list functionality
    class GlicoSurveyList {
        constructor() {
            this.init();
        }

        init() {
            this.bindEvents();
        }

        bindEvents() {
            // Survey card clicks
            $(document).on('click', '.glico-survey-card', this.handleSurveyClick.bind(this));
            
            // Filter changes
            $(document).on('change', '.glico-survey-filter', this.handleFilterChange.bind(this));
            
            // Search input
            $(document).on('input', '.glico-survey-search', this.handleSearchInput.bind(this));
        }

        handleSurveyClick(e) {
            const $card = $(e.currentTarget);
            const surveyId = $card.data('survey-id');
            const surveyUrl = $card.data('survey-url');
            
            if (surveyUrl) {
                window.location.href = surveyUrl;
            }
        }

        handleFilterChange(e) {
            const filter = $(e.target).val();
            this.filterSurveys(filter);
        }

        handleSearchInput(e) {
            const searchTerm = $(e.target).val().toLowerCase();
            this.searchSurveys(searchTerm);
        }

        filterSurveys(filter) {
            $('.glico-survey-card').each(function() {
                const $card = $(this);
                const status = $card.data('status');
                
                if (filter === 'all' || status === filter) {
                    $card.show();
                } else {
                    $card.hide();
                }
            });
        }

        searchSurveys(searchTerm) {
            $('.glico-survey-card').each(function() {
                const $card = $(this);
                const title = $card.find('.glico-survey-title').text().toLowerCase();
                const description = $card.find('.glico-survey-description').text().toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    $card.show();
                } else {
                    $card.hide();
                }
            });
        }
    }

    // Initialize survey list if present
    if ($('.glico-survey-list').length > 0) {
        new GlicoSurveyList();
    }

    // Utility functions
    window.GlicoSurveyUtils = {
        // Format date
        formatDate: function(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },

        // Format number
        formatNumber: function(num) {
            return new Intl.NumberFormat('en-US').format(num);
        },

        // Debounce function
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

})(jQuery);
