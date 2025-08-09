import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiScale from '../components/EmojiScale';
import GlicoLogo from '../components/GlicoLogo';

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
      
      const responseData = {
        surveyId: id,
        sessionId,
        responses: Object.entries(responses).map(([questionId, value]) => ({
          questionId: parseInt(questionId),
          answer: value
        }))
      };

      await axios.post('/api/responses', responseData);
      toast.success('Survey submitted successfully!');
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <GlicoLogo size="medium" className="mx-auto mb-4" />
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <GlicoLogo size="medium" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Survey not found</h2>
          <p className="text-gray-600">The survey you're looking for doesn't exist or has not been published yet.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <GlicoLogo size="medium" className="mx-auto mb-4" />
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank you!</h2>
          <p className="text-gray-600 mb-6">Your survey response has been submitted successfully.</p>
          <p className="text-sm text-gray-500">We appreciate your feedback.</p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={4}
            placeholder="Enter your response..."
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question_${currentQuestion.id}`}
                  value={option.value}
                  checked={responses[currentQuestion.id] === option.value}
                  onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-3 text-gray-700">{option.label}</span>
              </label>
            ))}
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
              <span className="text-sm text-gray-600">1 - Strongly Disagree</span>
              <span className="text-sm text-gray-600">5 - Strongly Agree</span>
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
                  <span className="mt-1 text-sm text-gray-700">{value}</span>
                </label>
              ))}
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <GlicoLogo size="medium" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-600">{survey.description}</p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {survey.questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentQuestionIndex + 1) / survey.questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQuestion.title}
          </h2>

          {renderQuestionInput()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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