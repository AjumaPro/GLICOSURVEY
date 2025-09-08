import React, { useState } from 'react';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const QuestionAnalytics = ({ questions = [], responses = [] }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [chartType, setChartType] = useState('bar');

  const getQuestionResponses = (questionId) => {
    return responses.filter(response => response.question_id === questionId);
  };

  const getResponseCounts = (questionId) => {
    const questionResponses = getQuestionResponses(questionId);
    const counts = {};
    
    questionResponses.forEach(response => {
      const value = response.response_value;
      counts[value] = (counts[value] || 0) + 1;
    });
    
    return counts;
  };

  const renderQuestionChart = (question) => {
    const responseCounts = getResponseCounts(question.id);
    const totalResponses = Object.values(responseCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalResponses === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No responses for this question</p>
          </div>
        </div>
      );
    }

    const labels = Object.keys(responseCounts);
    const data = Object.values(responseCounts);
    const backgroundColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
    ];

    const chartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: backgroundColors.slice(0, labels.length).map(color => color),
          borderWidth: 1
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const percentage = ((context.parsed / totalResponses) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} (${percentage}%)`;
            }
          }
        }
      }
    };

    const barOptions = {
      ...options,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };

    return (
      <div className="h-64">
        {chartType === 'bar' ? (
          <Bar data={chartData} options={barOptions} />
        ) : chartType === 'doughnut' ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <Pie data={chartData} options={options} />
        )}
      </div>
    );
  };

  const renderQuestionSummary = (question) => {
    const responseCounts = getResponseCounts(question.id);
    const totalResponses = Object.values(responseCounts).reduce((sum, count) => sum + count, 0);
    const uniqueResponses = Object.keys(responseCounts).length;

    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalResponses}</div>
          <div className="text-sm text-gray-600">Total Responses</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{uniqueResponses}</div>
          <div className="text-sm text-gray-600">Unique Answers</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {totalResponses > 0 ? Math.round((uniqueResponses / totalResponses) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Diversity</div>
        </div>
      </div>
    );
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
        <p className="text-gray-500">Add questions to your survey to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Question to Analyze
        </label>
        <select
          value={selectedQuestion?.id || ''}
          onChange={(e) => {
            const question = questions.find(q => q.id === e.target.value);
            setSelectedQuestion(question);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a question...</option>
          {questions.map(question => (
            <option key={question.id} value={question.id}>
              {question.title}
            </option>
          ))}
        </select>
      </div>

      {selectedQuestion && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedQuestion.title}
              </h3>
              {selectedQuestion.description && (
                <p className="text-gray-600">{selectedQuestion.description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Chart Type:</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bar">Bar Chart</option>
                <option value="doughnut">Doughnut Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
          </div>

          {renderQuestionSummary(selectedQuestion)}
          {renderQuestionChart(selectedQuestion)}
        </div>
      )}

      {/* Questions Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Questions Overview</h3>
        <div className="space-y-4">
          {questions.map(question => {
            const responseCounts = getResponseCounts(question.id);
            const totalResponses = Object.values(responseCounts).reduce((sum, count) => sum + count, 0);
            
            return (
              <div
                key={question.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedQuestion(question)}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{question.title}</h4>
                  <p className="text-sm text-gray-600">
                    {question.type} • {totalResponses} response{totalResponses !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{totalResponses}</div>
                  <div className="text-xs text-gray-500">responses</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionAnalytics;

