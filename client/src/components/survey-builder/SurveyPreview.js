import React, { useState, useEffect } from 'react';
import { useSurveyBuilder } from '../../contexts/SurveyBuilderContext';
import { getQuestionTypeConfig, getQuestionTypeIcon } from '../../services/questionTypesService';
import { 
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const SurveyPreview = ({ onClose }) => {
  const { state } = useSurveyBuilder();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = state.survey.questions[currentQuestionIndex];
  const totalQuestions = state.survey.questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (isPlaying && currentQuestionIndex < totalQuestions - 1) {
      const timer = setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 3000); // Auto-advance every 3 seconds
      
      return () => clearTimeout(timer);
    } else if (isPlaying && currentQuestionIndex === totalQuestions - 1) {
      setIsPlaying(false);
      setShowResults(true);
    }
  }, [isPlaying, currentQuestionIndex, totalQuestions]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setShowResults(false);
    setIsPlaying(false);
  };

  const renderQuestion = (question) => {
    if (!question) return null;

    const typeConfig = getQuestionTypeConfig(question.type);
    const response = responses[question.id] || '';

    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'phone':
      case 'url':
        return (
          <input
            type={question.type === 'email' ? 'email' : question.type === 'number' ? 'number' : 'text'}
            value={response}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.settings?.placeholder || 'Enter your answer...'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={response}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.settings?.placeholder || 'Enter your answer...'}
            rows={question.settings?.rows || 4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={response === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(response) && response.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(response) ? response : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleResponseChange(question.id, newValues);
                  }}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'select':
        return (
          <select
            value={response}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{question.settings?.placeholder || 'Select an option...'}</option>
            {question.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'rating':
        return (
          <div className="flex space-x-2">
            {Array.from({ length: question.settings?.maxRating || 5 }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleResponseChange(question.id, index + 1)}
                className={`text-3xl transition-colors ${
                  response >= index + 1 ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        );

      case 'emoji_scale':
        const emojis = ['😞', '😐', '😊', '😄', '🤩'];
        return (
          <div className="flex space-x-4">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleResponseChange(question.id, index)}
                className={`text-4xl transition-transform hover:scale-110 ${
                  response === index ? 'scale-110' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={question.settings?.min || 0}
              max={question.settings?.max || 100}
              step={question.settings?.step || 1}
              value={response || question.settings?.min || 0}
              onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{question.settings?.leftLabel || 'Low'}</span>
              {question.settings?.showValue && (
                <span className="font-medium">{response || question.settings?.min || 0}</span>
              )}
              <span>{question.settings?.rightLabel || 'High'}</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 italic">
            {typeConfig?.name || 'Unknown question type'}
          </div>
        );
    }
  };

  const renderResults = () => {
    const answeredQuestions = Object.keys(responses).length;
    const completionRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Survey Complete!</h2>
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{answeredQuestions}</div>
              <div className="text-sm text-gray-500">Questions Answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{Math.round(completionRate)}%</div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Survey Again
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    );
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="p-6">
            {renderResults()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Survey Preview</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePlayPause}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentQuestion ? (
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  {getQuestionTypeIcon(currentQuestion.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {currentQuestion.title}
                    {currentQuestion.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  {currentQuestion.description && (
                    <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                {renderQuestion(currentQuestion)}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
              <p className="text-gray-500">Add some questions to preview your survey.</p>
            </div>
          )}
        </div>

        {currentQuestion && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-2">
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Complete</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyPreview;

