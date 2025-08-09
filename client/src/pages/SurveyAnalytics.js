import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Download,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import EmojiScale from '../components/EmojiScale';

const SurveyAnalytics = () => {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics/survey/${id}`);
      setAnalytics(response.data);
      if (response.data.questions.length > 0) {
        setSelectedQuestion(response.data.questions[0]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportResponses = async (format = 'csv') => {
    try {
      const response = await axios.get(`/api/responses/export/${id}?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `survey_${id}_responses.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting responses:', error);
      toast.error('Failed to export responses');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics available</h3>
        <p className="text-gray-600">This survey doesn't have any responses yet.</p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const renderQuestionAnalytics = (question) => {
    if (!question.analytics) return null;

    switch (question.type) {
      case 'emoji_scale':
      case 'likert_scale':
        return renderScaleAnalytics(question);
      case 'multiple_choice':
        return renderMultipleChoiceAnalytics(question);
      case 'text':
        return renderTextAnalytics(question);
      default:
        return <div>Analytics not available for this question type</div>;
    }
  };

  const renderScaleAnalytics = (question) => {
    const { analytics } = question;
    const chartData = Object.keys(analytics.distribution).map(key => ({
      name: analytics.distribution[key].label || key,
      value: analytics.distribution[key].count,
      percentage: analytics.distribution[key].percentage,
      emoji: analytics.distribution[key].emoji
    }));

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="analytics-card">
            <div className="analytics-stat">
              <div className="analytics-stat-value">{analytics.total}</div>
              <div className="analytics-stat-label">Total Responses</div>
            </div>
          </div>
          <div className="analytics-card">
            <div className="analytics-stat">
              <div className="analytics-stat-value">{analytics.average}</div>
              <div className="analytics-stat-label">Average Rating</div>
            </div>
          </div>
          <div className="analytics-card">
            <div className="analytics-stat">
              <div className="analytics-stat-value">{analytics.satisfaction_index}%</div>
              <div className="analytics-stat-label">Satisfaction Index</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="analytics-card">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Response Distribution</h4>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="analytics-card">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Response Percentage</h4>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="analytics-card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Detailed Breakdown</h4>
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{item.value} responses</span>
                  <span className="text-sm font-medium text-gray-900">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMultipleChoiceAnalytics = (question) => {
    const { analytics } = question;
    const chartData = Object.keys(analytics.distribution).map(key => ({
      name: key,
      value: analytics.distribution[key].count,
      percentage: analytics.distribution[key].percentage
    }));

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="analytics-card">
          <div className="analytics-stat">
            <div className="analytics-stat-value">{analytics.total}</div>
            <div className="analytics-stat-label">Total Responses</div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="analytics-card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Response Distribution</h4>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="analytics-card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Response Details</h4>
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{item.name}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{item.value} responses</span>
                  <span className="text-sm font-medium text-gray-900">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTextAnalytics = (question) => {
    const { analytics } = question;

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="analytics-card">
          <div className="analytics-stat">
            <div className="analytics-stat-value">{analytics.total}</div>
            <div className="analytics-stat-label">Text Responses</div>
          </div>
        </div>

        {/* Text Responses */}
        <div className="analytics-card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Responses</h4>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analytics.responses.map((response, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <p className="text-gray-900 mb-2">{response.text}</p>
                <p className="text-sm text-gray-500">
                  {new Date(response.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Survey Analytics</h1>
          <p className="text-gray-600">{analytics.survey.title}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportResponses('csv')}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="analytics-card">
          <div className="analytics-stat">
            <div className="analytics-stat-value">{analytics.completion.total_sessions}</div>
            <div className="analytics-stat-label">Total Sessions</div>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-stat">
            <div className="analytics-stat-value">{analytics.completion.completed_sessions}</div>
            <div className="analytics-stat-label">Completed</div>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-stat">
            <div className="analytics-stat-value">{analytics.completion.completion_rate}%</div>
            <div className="analytics-stat-label">Completion Rate</div>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-stat">
            <div className="analytics-stat-value">{analytics.questions.length}</div>
            <div className="analytics-stat-label">Questions</div>
          </div>
        </div>
      </div>

      {/* Response Trends */}
      {analytics.trends && analytics.trends.length > 0 && (
        <div className="analytics-card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Response Trends</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="daily_respondents" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Question Analytics */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Question Analytics</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question List */}
            <div className="lg:col-span-1">
              <h4 className="font-medium text-gray-900 mb-3">Questions</h4>
              <div className="space-y-2">
                {analytics.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setSelectedQuestion(question)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedQuestion?.id === question.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Q{index + 1}</p>
                        <p className="text-sm text-gray-600 truncate">{question.title}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{question.respondent_count}</span>
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Analytics */}
            <div className="lg:col-span-2">
              {selectedQuestion ? (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    {selectedQuestion.title}
                  </h4>
                  {renderQuestionAnalytics(selectedQuestion)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Select a question to view analytics</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyAnalytics; 