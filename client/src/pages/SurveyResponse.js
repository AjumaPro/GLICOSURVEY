import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiScale from '../components/EmojiScale';
import GlicoLogo from '../components/GlicoLogo';
import website3Image from '../assets/website-3.jpg';

const SurveyResponse = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchSurvey = async () => {
    try {
      // Use the public endpoint for published surveys
      const response = await axios.get(`/api/surveys/public/${id}`);
      setSurvey(response.data);
    } catch (error) {
      console.error('Error fetching survey:', error);
      if (error.response?.status === 404) {
        toast.error('Survey not found or not published');
      } else {
        toast.error('Failed to load survey');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Filter out null/undefined responses and ensure all required questions are answered
      const validResponses = Object.entries(responses)
        .filter(([questionId, value]) => value !== null && value !== undefined && value !== '')
        .map(([questionId, value]) => ({
          questionId: parseInt(questionId),
          answer: value
        }));

      // Check if all required questions are answered
      const requiredQuestions = survey.questions.filter(q => q.required);
      const answeredRequiredQuestions = validResponses.length;
      
      if (answeredRequiredQuestions < requiredQuestions.length) {
        toast.error(`Please answer all required questions. You have answered ${answeredRequiredQuestions} out of ${requiredQuestions.length} required questions.`);
        setSubmitting(false);
        return;
      }

      const responseData = {
        surveyId: parseInt(id),
        sessionId,
        responses: validResponses
      };

      console.log('Submitting response data:', responseData);

      const submitResponse = await axios.post('/api/responses', responseData);
      toast.success('Survey submitted successfully!');
      setSubmitted(true);
      
      // Trigger a refresh of survey data to update response counts
      try {
        // This will help update the response count in other parts of the app
        window.dispatchEvent(new CustomEvent('surveyResponseSubmitted', {
          detail: { surveyId: id, sessionId: submitResponse.data.sessionId }
        }));
      } catch (error) {
        console.log('Error dispatching event:', error);
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to submit survey');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Check if survey has dark theme
  const isDarkTheme = survey?.theme?.darkMode || survey?.theme?.backgroundColor === '#111827';
  const themeClasses = isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';

  if (loading) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center ${themeClasses} relative`}
        style={{
          backgroundImage: `url(${website3Image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-85"></div>
        <div className="relative z-10 text-center">
          <GlicoLogo size="medium" className="mx-auto mb-4" />
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className={isDarkTheme ? "text-gray-300" : "text-gray-600"}>Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center ${themeClasses} relative`}
        style={{
          backgroundImage: `url(${website3Image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-85"></div>
        <div className="relative z-10 text-center">
          <GlicoLogo size="medium" className="mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-4 ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Survey not found</h2>
          <p className={isDarkTheme ? "text-gray-300" : "text-gray-600"}>The survey you're looking for doesn't exist or has not been published yet.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center ${themeClasses} relative`}
        style={{
          backgroundImage: `url(${website3Image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-85"></div>
        <div className="relative z-10 text-center">
          <GlicoLogo size="medium" className="mx-auto mb-4" />
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-4 ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Thank you!</h2>
          <p className={`mb-6 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>Your survey response has been submitted successfully.</p>
          <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>We appreciate your feedback.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'text':
        return (
          <textarea
            value={responses[currentQuestion.id] || ''}
            onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              isDarkTheme 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                : "border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
            rows={4}
            placeholder="Enter your response..."
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const value = typeof option === 'object' ? option.value : option;
              const label = typeof option === 'object' ? option.label : option;
              return (
                <label key={index} className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  isDarkTheme 
                    ? "border-gray-600 hover:bg-gray-700" 
                    : "border-gray-200 hover:bg-gray-50"
                }`}>
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value={value}
                    checked={responses[currentQuestion.id] === value}
                    onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className={`ml-3 ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
                </label>
              );
            })}
          </div>
        );

      case 'emoji_scale':
        return (
          <EmojiScale
            options={currentQuestion.options || []}
            value={responses[currentQuestion.id]}
            onChange={(value) => handleResponseChange(currentQuestion.id, value)}
            layout="horizontal"
            size="large"
          />
        );

      case 'scale':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>1 - Strongly Disagree</span>
              <span className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>5 - Strongly Agree</span>
            </div>
            <div className="flex justify-center space-x-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className="flex flex-col items-center">
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value={value}
                    checked={responses[currentQuestion.id] === value}
                    onChange={(e) => handleResponseChange(currentQuestion.id, parseInt(e.target.value))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className={`mt-1 text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>{value}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'likert_scale':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <span className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>
                {currentQuestion.options?.[0]?.label || "Strongly Disagree"}
              </span>
              <span className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>
                {currentQuestion.options?.[currentQuestion.options.length - 1]?.label || "Strongly Agree"}
              </span>
            </div>
            <div className="flex justify-center space-x-4">
              {(currentQuestion.options || [1, 2, 3, 4, 5]).map((option, index) => {
                const value = typeof option === 'object' ? option.value : option;
                const label = typeof option === 'object' ? option.label : option;
                return (
                  <label key={index} className="flex flex-col items-center">
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      value={value}
                      checked={responses[currentQuestion.id] === value}
                      onChange={(e) => handleResponseChange(currentQuestion.id, parseInt(e.target.value))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className={`mt-1 text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'contact_followup':
        return (
          <div className="space-y-4">
            <textarea
              value={responses[`${currentQuestion.id}_comments`] || ''}
              onChange={(e) => handleResponseChange(`${currentQuestion.id}_comments`, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                isDarkTheme 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                  : "border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              rows={4}
              placeholder={currentQuestion.commentsPlaceholder || "We would love to hear from you, please provide your comments. (Optional)"}
            />
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-3 py-2 border rounded-md ${
                isDarkTheme 
                  ? "border-gray-600 bg-gray-700" 
                  : "border-gray-300 bg-gray-50"
              }`}>
                <span className="text-sm">🇬🇭</span>
                <span className={`text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>{currentQuestion.countryCode || "+233"}</span>
              </div>
              <input
                type="tel"
                value={responses[`${currentQuestion.id}_phone`] || ''}
                onChange={(e) => handleResponseChange(`${currentQuestion.id}_phone`, e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  isDarkTheme 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder={currentQuestion.phonePlaceholder || "Phone number"}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 italic">
            Question type "{currentQuestion.type}" is not supported.
          </div>
        );
    }
  };

  return (
    <div 
      className={`min-h-screen ${themeClasses} relative`}
      style={{
        backgroundImage: `url(${website3Image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-white bg-opacity-85"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <GlicoLogo size="medium" className="mx-auto mb-4" />
          <h1 className={`text-3xl font-bold mb-2 ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{survey.title}</h1>
          {survey.description && (
            <p className={isDarkTheme ? "text-gray-300" : "text-gray-600"}>{survey.description}</p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>
              Question {currentQuestionIndex + 1} of {survey.questions.length}
            </span>
            <span className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>
              {Math.round(((currentQuestionIndex + 1) / survey.questions.length) * 100)}% Complete
            </span>
          </div>
          <div className={`w-full rounded-full h-2 ${isDarkTheme ? "bg-gray-700" : "bg-gray-200"}`}>
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className={`rounded-lg shadow-sm border p-6 mb-8 ${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
            {currentQuestion.title}
          </h2>

          {renderQuestionInput()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className={`flex items-center px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkTheme 
                ? "text-gray-300 bg-gray-800 border-gray-600 hover:bg-gray-700" 
                : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="spinner w-4 h-4 mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Survey
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-sm text-gray-500">
        <GlicoLogo size="small" className="mx-auto mb-2" />
        <p>Powered by GLICO LIFE</p>
      </div>
    </div>
  );
};

export default SurveyResponse; 