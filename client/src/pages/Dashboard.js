import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Activity,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Surveys',
      value: dashboardData?.summary?.total_surveys || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Published Surveys',
      value: dashboardData?.summary?.published_surveys || 0,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Total Responses',
      value: dashboardData?.summary?.total_respondents || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  // Calculate additional metrics with safe division
  const totalQuestions = dashboardData?.top_surveys?.reduce((sum, survey) => sum + (survey.question_count || 0), 0) || 0;
  const avgResponsesPerSurvey = dashboardData?.summary?.published_surveys > 0 
    ? Math.round((dashboardData.summary.total_respondents || 0) / dashboardData.summary.published_surveys)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your surveys.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/templates"
            className="btn-secondary"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Use Templates
          </Link>
          <Link
            to="/builder"
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Survey
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-indigo-600">{totalQuestions}</p>
            </div>
            <div className="text-indigo-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Responses/Survey</p>
              <p className="text-2xl font-bold text-emerald-600">{avgResponsesPerSurvey}</p>
            </div>
            <div className="text-emerald-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-amber-600">
                {dashboardData?.summary?.published_surveys > 0 
                  ? Math.round(((dashboardData.summary.total_respondents || 0) / dashboardData.summary.published_surveys) * 10)
                  : 0}%
              </p>
            </div>
            <div className="text-amber-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Section for First-time Users */}
      {(dashboardData?.summary?.total_surveys || 0) === 0 && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Welcome to SurveyGuy! 🎉</h3>
                <p className="text-gray-600">Get started quickly with our pre-built survey templates</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">Customer Satisfaction</h4>
                </div>
                <p className="text-sm text-gray-600">Measure customer satisfaction with your products or services</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">Employee Feedback</h4>
                </div>
                <p className="text-sm text-gray-600">Gather feedback from your team members</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">Product Feedback</h4>
                </div>
                <p className="text-sm text-gray-600">Collect feedback about your products or services</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/templates"
                className="btn-primary"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Browse Templates
              </Link>
              <Link
                to="/builder"
                className="btn-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Survey
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity & Top Surveys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-body">
            {dashboardData?.recent_activity?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.survey_title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.new_responses} new responses
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Link
                        to={`/analytics/${activity.survey_id}`}
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Top Performing Surveys */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Top Performing Surveys</h3>
          </div>
          <div className="card-body">
            {dashboardData?.top_surveys?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.top_surveys.map((survey, index) => (
                  <div key={survey.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {survey.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {survey.respondent_count} respondents
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/analytics/${survey.id}`}
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        Analytics
                      </Link>
                      <Link
                        to={`/builder/${survey.id}`}
                        className="text-gray-600 hover:text-gray-500"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No surveys yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/builder"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Create New Survey</p>
                <p className="text-sm text-gray-500">Start building your survey</p>
              </div>
            </Link>
            
            <Link
              to="/builder"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <FileText className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Use Template</p>
                <p className="text-sm text-gray-500">Start with a template</p>
              </div>
            </Link>
            
            <Link
              to="/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-500">Check your survey results</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 