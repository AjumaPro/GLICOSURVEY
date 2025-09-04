import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiScale from '../components/EmojiScale';
import GlicoLogo from '../components/GlicoLogo';


const SurveyPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

    const fetchSurvey = useCallback(async () => {
    try {
      // Use the preview endpoint for draft surveys
      const response = await axios.get(`/api/surveys/preview/${id}`);
      setSurvey(response.data);
    } catch (error) {
      console.error('Error fetching survey:', error);
      if (error.response?.status === 404) {
        toast.error('Survey not found');
      } else {
        toast.error('Failed to load survey');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSurvey();
  }, [fetchSurvey]);

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
    if (survey.status === 'draft') {
      toast.info('This is a preview of a draft survey. Responses cannot be submitted.');
      return;
    }

    setSubmitting(true);
    try {
      const responseData = {
        survey_id: parseInt(id),
        responses: Object.entries(responses).map(([questionId, value]) => ({
          question_id: parseInt(questionId),
          response_value: value
        }))
      };

      await axios.post('/api/responses', responseData);
      setSubmitted(true);
      toast.success('Survey submitted successfully!');
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'emoji_scale':
        return (
            <EmojiScale
            options={question.options}
            onSelect={(value) => handleResponseChange(question.id, value)}
            selectedValue={responses[question.id]}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.value}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  checked={responses[question.id] === option.value}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
            <textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={4}
          />
        );
      
      case 'likert_scale':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.value}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  checked={responses[question.id] === option.value}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'image_upload':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600">
                  {question.instructions || "Click to upload an image"}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Convert file to base64 for storage
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        handleResponseChange(question.id, event.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>
            {responses[question.id] && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Uploaded image:</p>
                <img 
                  src={responses[question.id]} 
                  alt="Uploaded" 
                  className="max-w-full h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        );

      case 'contact_followup':
        return (
          <div className="space-y-4">
            <textarea
              value={responses[`${question.id}_comments`] || ''}
              onChange={(e) => handleResponseChange(`${question.id}_comments`, e.target.value)}
              placeholder={question.commentsPlaceholder || "Your comments..."}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <span className="text-sm">🇬🇭</span>
                <span className="text-sm font-medium text-gray-700">+233</span>
              </div>
              <input
                type="tel"
                value={responses[`${question.id}_phone`] || ''}
                onChange={(e) => handleResponseChange(`${question.id}_phone`, e.target.value)}
                placeholder={question.phonePlaceholder || "Phone number (optional)"}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">Question type "{question.type}" not supported in preview</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey preview...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Survey not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your response has been recorded successfully.</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <GlicoLogo className="h-8" />
            </div>
            <div className="text-sm text-gray-500">
              {survey.status === 'draft' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Draft Preview
                </span>
              )}
            </div>
          </div>
                </div>
              </div>

      {/* Survey Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Survey Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
            {survey.description && (
              <p className="text-primary-100 text-lg">{survey.description}</p>
            )}
            {survey.status === 'draft' && (
              <div className="mt-4 p-3 bg-yellow-500 bg-opacity-20 rounded-lg">
                <p className="text-yellow-100 text-sm">
                  <strong>Preview Mode:</strong> This is a draft survey. Responses cannot be submitted.
                </p>
              </div>
            )}
              </div>

          {/* Question Navigation */}
          <div className="px-8 py-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {survey.questions.length}
              </div>
              <div className="flex space-x-2">
                  {survey.questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentQuestionIndex
                        ? 'bg-primary-600'
                          : index < currentQuestionIndex
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Question Content */}
            <div className="p-8">
            {currentQuestion && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {currentQuestion.title}
                </h2>
                {renderQuestion(currentQuestion)}
              </div>
                      )}
                    </div>

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  isFirstQuestion
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Previous
              </button>

              <div className="flex space-x-3">
                {isLastQuestion ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || survey.status === 'draft'}
                    className={`flex items-center px-6 py-2 rounded-lg ${
                      survey.status === 'draft'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Survey
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview; 