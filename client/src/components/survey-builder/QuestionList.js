import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSurveyBuilder } from '../../contexts/SurveyBuilderContext';
import { getQuestionTypeConfig, getQuestionTypeIcon } from '../../services/questionTypesService';
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const QuestionList = ({ onEditQuestion, onAddQuestion }) => {
  const { state, actions } = useSurveyBuilder();
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(state.survey.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const reorderedQuestions = items.map((question, index) => ({
      ...question,
      order: index
    }));

    actions.reorderQuestions(reorderedQuestions);
  };

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    onEditQuestion && onEditQuestion(question);
  };

  const handleDelete = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      actions.deleteQuestion(questionId);
    }
  };

  const handleDuplicate = (questionId) => {
    actions.duplicateQuestion(questionId);
  };

  const handleMoveUp = (questionId) => {
    const questions = [...state.survey.questions];
    const index = questions.findIndex(q => q.id === questionId);
    
    if (index > 0) {
      [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
      const reorderedQuestions = questions.map((question, idx) => ({
        ...question,
        order: idx
      }));
      actions.reorderQuestions(reorderedQuestions);
    }
  };

  const handleMoveDown = (questionId) => {
    const questions = [...state.survey.questions];
    const index = questions.findIndex(q => q.id === questionId);
    
    if (index < questions.length - 1) {
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
      const reorderedQuestions = questions.map((question, idx) => ({
        ...question,
        order: idx
      }));
      actions.reorderQuestions(reorderedQuestions);
    }
  };

  const renderQuestionPreview = (question) => {
    const typeConfig = getQuestionTypeConfig(question.type);
    
    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'phone':
      case 'url':
        return (
          <input
            type={question.type === 'email' ? 'email' : question.type === 'number' ? 'number' : 'text'}
            placeholder={question.settings?.placeholder || 'Enter your answer...'}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            placeholder={question.settings?.placeholder || 'Enter your answer...'}
            disabled
            rows={question.settings?.rows || 3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`preview-${question.id}`}
                  disabled
                  className="text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  disabled
                  className="text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'select':
        return (
          <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            <option>{question.settings?.placeholder || 'Select an option...'}</option>
            {question.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'rating':
        return (
          <div className="flex space-x-1">
            {Array.from({ length: question.settings?.maxRating || 5 }).map((_, index) => (
              <span key={index} className="text-2xl text-gray-300">⭐</span>
            ))}
          </div>
        );
      
      case 'emoji_scale':
        return (
          <div className="flex space-x-2">
            {['😞', '😐', '😊', '😄', '🤩'].map((emoji, index) => (
              <span key={index} className="text-2xl opacity-50">{emoji}</span>
            ))}
          </div>
        );
      
      case 'slider':
        return (
          <div className="w-full">
            <input
              type="range"
              min={question.settings?.min || 0}
              max={question.settings?.max || 100}
              step={question.settings?.step || 1}
              disabled
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{question.settings?.leftLabel || 'Low'}</span>
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

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Questions ({state.survey.questions.length})
          </h2>
          <button
            onClick={onAddQuestion}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {state.survey.questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-500 mb-6">Start building your survey by adding your first question.</p>
            <button
              onClick={onAddQuestion}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Question
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {state.survey.questions.map((question, index) => (
                    <Draggable key={question.id} draggableId={question.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-gray-50 rounded-lg border-2 transition-all ${
                            snapshot.isDragging
                              ? 'border-blue-500 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${
                            selectedQuestion?.id === question.id
                              ? 'ring-2 ring-blue-500'
                              : ''
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-gray-400 hover:text-gray-600 cursor-grab"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                                  </svg>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-2xl">
                                    {getQuestionTypeIcon(question.type)}
                                  </span>
                                  <div>
                                    <h3 className="font-medium text-gray-900">
                                      {question.title || 'Untitled Question'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      {getQuestionTypeConfig(question.type)?.name}
                                      {question.required && (
                                        <span className="ml-2 text-red-500">*</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleMoveUp(question.id)}
                                  disabled={index === 0}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <ChevronUpIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleMoveDown(question.id)}
                                  disabled={index === state.survey.questions.length - 1}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <ChevronDownIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(question)}
                                  className="p-1 text-gray-400 hover:text-blue-600"
                                  title="Edit question"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDuplicate(question.id)}
                                  className="p-1 text-gray-400 hover:text-green-600"
                                  title="Duplicate question"
                                >
                                  <DocumentDuplicateIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(question.id)}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  title="Delete question"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {question.description && (
                              <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                            )}
                            
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              {renderQuestionPreview(question)}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default QuestionList;

