import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QuestionUpload = ({ onQuestionsUploaded, onClose }) => {
  const [uploadMethod, setUploadMethod] = useState('csv');
  const [file, setFile] = useState(null);
  const [bulkText, setBulkText] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      
      try {
        let questions = [];
        
        if (uploadMethod === 'csv') {
          questions = parseCSV(content);
        } else if (uploadMethod === 'json') {
          questions = parseJSON(content);
        }
        
        setPreviewQuestions(questions);
        toast.success(`Parsed ${questions.length} questions`);
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Error parsing file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  const parseCSV = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    const questions = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      
      if (columns.length >= 3) {
        const question = {
          title: columns[0],
          type: columns[1],
          required: columns[2].toLowerCase() === 'true',
          description: columns[3] || '',
          options: parseOptions(columns[4] || '')
        };
        
        questions.push(question);
      }
    }
    
    return questions;
  };

  const parseJSON = (content) => {
    const data = JSON.parse(content);
    
    if (Array.isArray(data)) {
      return data.map(item => ({
        title: item.title || item.question || '',
        type: item.type || 'text',
        required: item.required || false,
        description: item.description || '',
        options: item.options || []
      }));
    } else if (data.questions && Array.isArray(data.questions)) {
      return data.questions;
    }
    
    throw new Error('Invalid JSON format');
  };

  const parseOptions = (optionsString) => {
    if (!optionsString) return [];
    
    if (optionsString.startsWith('[') && optionsString.endsWith(']')) {
      try {
        return JSON.parse(optionsString);
      } catch {
        // Fallback to simple array
        return optionsString.split('|').map(opt => opt.trim());
      }
    }
    
    // Simple pipe-separated values
    return optionsString.split('|').map(opt => opt.trim());
  };

  const handleBulkTextChange = (e) => {
    const text = e.target.value;
    setBulkText(text);
    
    if (text.trim()) {
      const questions = parseBulkText(text);
      setPreviewQuestions(questions);
    } else {
      setPreviewQuestions([]);
    }
  };

  const parseBulkText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const questions = [];
    
    for (const line of lines) {
      if (line.startsWith('Q:')) {
        const questionText = line.substring(2).trim();
        const question = {
          title: questionText,
          type: 'text',
          required: false,
          description: '',
          options: []
        };
        questions.push(question);
      } else if (line.startsWith('MC:')) {
        const parts = line.substring(3).split('|');
        const questionText = parts[0].trim();
        const options = parts.slice(1).map(opt => opt.trim());
        
        const question = {
          title: questionText,
          type: 'multiple_choice',
          required: false,
          description: '',
          options: options
        };
        questions.push(question);
      } else if (line.startsWith('ES:')) {
        const questionText = line.substring(3).trim();
        const question = {
          title: questionText,
          type: 'emoji_scale',
          required: false,
          description: '',
          options: [
            { emoji: '😠', label: 'Very Unsatisfied', value: 1 },
            { emoji: '😞', label: 'Unsatisfied', value: 2 },
            { emoji: '😐', label: 'Neutral', value: 3 },
            { emoji: '🙂', label: 'Satisfied', value: 4 },
            { emoji: '🥰', label: 'Very Satisfied', value: 5 }
          ]
        };
        questions.push(question);
      }
    }
    
    return questions;
  };

  const handleUpload = () => {
    if (previewQuestions.length === 0) {
      toast.error('No questions to upload');
      return;
    }
    
    setUploading(true);
    
    try {
      onQuestionsUploaded(previewQuestions);
      toast.success(`Successfully uploaded ${previewQuestions.length} questions`);
      onClose();
    } catch (error) {
      console.error('Error uploading questions:', error);
      toast.error('Error uploading questions');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    let template = '';
    
    if (uploadMethod === 'csv') {
      template = 'Question,Type,Required,Description,Options\n"What is your name?",text,false,"Optional description",""\n"How satisfied are you?,multiple_choice,true,"Rate your satisfaction","Very Satisfied|Satisfied|Neutral|Dissatisfied|Very Dissatisfied"\n';
    } else if (uploadMethod === 'json') {
      template = JSON.stringify([
        {
          "title": "What is your name?",
          "type": "text",
          "required": false,
          "description": "Optional description"
        },
        {
          "title": "How satisfied are you?",
          "type": "multiple_choice",
          "required": true,
          "description": "Rate your satisfaction",
          "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
        }
      ], null, 2);
    } else if (uploadMethod === 'bulk') {
      template = 'Q: What is your name?\nMC: How satisfied are you?|Very Satisfied|Satisfied|Neutral|Dissatisfied|Very Dissatisfied\nES: Rate your overall experience\n';
    }
    
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question_template.${uploadMethod === 'json' ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Upload Questions</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setUploadMethod('csv')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    uploadMethod === 'csv'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  CSV File
                </button>
                <button
                  onClick={() => setUploadMethod('json')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    uploadMethod === 'json'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  JSON File
                </button>
                <button
                  onClick={() => setUploadMethod('bulk')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    uploadMethod === 'bulk'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Bulk Text
                </button>
              </div>
            </div>

            {uploadMethod !== 'bulk' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept={uploadMethod === 'csv' ? '.csv' : '.json'}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Choose a file
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    or drag and drop
                  </p>
                  {file && (
                    <p className="text-sm text-green-600 mt-2">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      {file.name}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulk Text Input
                </label>
                <textarea
                  value={bulkText}
                  onChange={handleBulkTextChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="10"
                  placeholder={`Format:
Q: What is your name?
MC: How satisfied are you?|Very Satisfied|Satisfied|Neutral|Dissatisfied|Very Dissatisfied
ES: Rate your overall experience`}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={downloadTemplate}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Download Template
              </button>
              
              <button
                onClick={handleUpload}
                disabled={uploading || previewQuestions.length === 0}
                className="btn-primary"
              >
                {uploading ? 'Uploading...' : `Upload ${previewQuestions.length} Questions`}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Preview ({previewQuestions.length} questions)
            </h4>
            
            {previewQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>No questions to preview</p>
                <p className="text-sm">Upload a file or enter text to see preview</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {previewQuestions.map((question, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">
                          {question.title}
                        </h5>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                            {question.type}
                          </span>
                          {question.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full">
                              Required
                            </span>
                          )}
                          {question.options && question.options.length > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full">
                              {question.options.length} options
                            </span>
                          )}
                        </div>
                        {question.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {question.description}
                          </p>
                        )}
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
          <div className="text-sm text-gray-600 space-y-2">
            {uploadMethod === 'csv' && (
              <div>
                <p><strong>CSV Format:</strong> Question,Type,Required,Description,Options</p>
                <p>Types: text, multiple_choice, emoji_scale</p>
                <p>Options: Use | to separate multiple choice options</p>
              </div>
            )}
            {uploadMethod === 'json' && (
              <div>
                <p><strong>JSON Format:</strong> Array of question objects</p>
                <p>Each question should have: title, type, required, description, options</p>
              </div>
            )}
            {uploadMethod === 'bulk' && (
              <div>
                <p><strong>Bulk Text Format:</strong></p>
                <p>• Q: for text questions</p>
                <p>• MC: for multiple choice (use | to separate options)</p>
                <p>• ES: for emoji scale questions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionUpload; 