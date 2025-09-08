import React, { useState } from 'react';
import { useSurveyBuilder } from '../../contexts/SurveyBuilderContext';
import { 
  getAllQuestionTypes, 
  getQuestionTypesByCategory, 
  QUESTION_CATEGORIES,
  getQuestionTypeIcon 
} from '../../services/questionTypesService';
import { 
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const QuestionTypeSelector = ({ onSelectType, onClose }) => {
  const { state } = useSurveyBuilder();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const allQuestionTypes = getAllQuestionTypes();
  const categories = [
    { key: 'all', name: 'All Types', icon: '📋' },
    { key: QUESTION_CATEGORIES.TEXT_INPUT, name: 'Text Input', icon: '📝' },
    { key: QUESTION_CATEGORIES.CHOICE, name: 'Choice', icon: '🔘' },
    { key: QUESTION_CATEGORIES.RATING, name: 'Rating', icon: '⭐' },
    { key: QUESTION_CATEGORIES.SPECIAL, name: 'Special', icon: '🎯' },
    { key: QUESTION_CATEGORIES.ADVANCED, name: 'Advanced', icon: '⚙️' }
  ];

  const filteredQuestionTypes = allQuestionTypes.filter(questionType => {
    const matchesSearch = questionType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         questionType.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || questionType.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectType = (type) => {
    onSelectType && onSelectType(type);
  };

  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Select Question Type</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mt-4 flex space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search question types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.key} value={category.key}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredQuestionTypes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No question types found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuestionTypes.map((questionType) => (
                <div
                  key={questionType.type}
                  onClick={() => handleSelectType(questionType.type)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl group-hover:scale-110 transition-transform">
                      {getQuestionTypeIcon(questionType.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {questionType.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {questionType.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {categories.find(cat => cat.key === questionType.category)?.icon} {categories.find(cat => cat.key === questionType.category)?.name}
                        </span>
                        {questionType.hasOptions && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Has Options
                          </span>
                        )}
                        {questionType.hasValidation && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Validation
                          </span>
                        )}
                        {questionType.hasConditional && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Conditional
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredQuestionTypes.length} question type{filteredQuestionTypes.length !== 1 ? 's' : ''} available
            </p>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionTypeSelector;

