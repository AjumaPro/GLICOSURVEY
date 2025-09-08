import React, { useState, useRef } from 'react';
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
  Line,
  Area,
  ComposedChart
} from 'recharts';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  Clock, 
  MapPin, 
  Smartphone,
  Globe,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';
import ReportService from '../services/reportService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const AnalyticsDashboard = ({ analytics, surveyTitle = "Survey Analytics", survey = null }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const dashboardRef = useRef(null);

  // Helper function to sanitize numeric values
  const sanitizeValue = (value) => {
    if (value === null || value === undefined || isNaN(value) || value === Infinity || value === -Infinity) {
      return 0;
    }
    return Number(value);
  };

  // Helper function to sanitize array data
  const sanitizeArrayData = (array, numericKeys = ['count', 'responses', 'completion_rate', 'value', 'percent']) => {
    if (!Array.isArray(array)) return [];
    return array.map(item => {
      const sanitized = { ...item };
      numericKeys.forEach(key => {
        if (sanitized[key] !== undefined) {
          sanitized[key] = sanitizeValue(sanitized[key]);
        }
      });
      return sanitized;
    });
  };

  // Add fallback values to prevent crashes and sanitize all data
  const safeAnalytics = {
    completion: { 
      total_sessions: sanitizeValue(analytics?.completion?.total_sessions) || 0, 
      completed_sessions: sanitizeValue(analytics?.completion?.completed_sessions) || 0, 
      completion_rate: sanitizeValue(analytics?.completion?.completion_rate) || 0
    },
    questions: sanitizeArrayData(analytics?.questions || []),
    hourlyDistribution: sanitizeArrayData(analytics?.hourlyDistribution || [], ['responses', 'count']),
    deviceAnalytics: sanitizeArrayData(analytics?.deviceAnalytics || [], ['count', 'percent']),
    browserAnalytics: sanitizeArrayData(analytics?.browserAnalytics || [], ['count']),
    questionCompletion: sanitizeArrayData(analytics?.questionCompletion || [], ['completion_rate', 'count']),
    locationAnalytics: sanitizeArrayData(analytics?.locationAnalytics || [], ['count']),
    responseTimeAnalysis: { 
      avg_time_between_questions: sanitizeValue(analytics?.responseTimeAnalysis?.avg_time_between_questions) || 0, 
      min_time_between_questions: sanitizeValue(analytics?.responseTimeAnalysis?.min_time_between_questions) || 0, 
      max_time_between_questions: sanitizeValue(analytics?.responseTimeAnalysis?.max_time_between_questions) || 0, 
      total_transitions: sanitizeValue(analytics?.responseTimeAnalysis?.total_transitions) || 0
    },
    weeklyPatterns: sanitizeArrayData(analytics?.weeklyPatterns || [], ['responses', 'count']),
    questionDifficulty: sanitizeArrayData(analytics?.questionDifficulty || [], ['count', 'difficulty']),
    engagementScore: { 
      engagement_score: sanitizeValue(analytics?.engagementScore?.engagement_score) || 0
    }
  };


  // Helper function to format time
  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = await ReportService.generatePDFReport(safeAnalytics, survey, {
        includeCharts: true,
        includeMetrics: true,
        includeTables: true
      });
      
      const filename = `${surveyTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analytics_report.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const exportCSV = async () => {
    try {
      const csv = ReportService.generateCSVReport(safeAnalytics, survey);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${surveyTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analytics_report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (!analytics) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8" ref={dashboardRef}>
      {/* Header with Export Options */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Responses</p>
              <p className="text-3xl font-bold">{safeAnalytics.completion?.total_sessions || 0}</p>
              <p className="text-blue-200 text-sm mt-1">All time responses</p>
            </div>
            <div className="text-blue-200">
              <Users className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Completion Rate</span>
              <span className="font-semibold">{safeAnalytics.completion?.completion_rate || 0}%</span>
            </div>
            <div className="bg-blue-400 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${safeAnalytics.completion?.completion_rate || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Completed Sessions</p>
              <p className="text-3xl font-bold">{safeAnalytics.completion?.completed_sessions || 0}</p>
              <p className="text-green-200 text-sm mt-1">Successful completions</p>
            </div>
            <div className="text-green-200">
              <Target className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold">{formatTime(safeAnalytics.responseTimeAnalysis?.avg_time_between_questions || 0)}</p>
              <p className="text-purple-200 text-sm mt-1">Between questions</p>
            </div>
            <div className="text-purple-200">
              <Clock className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Engagement Score</p>
              <p className="text-3xl font-bold">{Math.round(safeAnalytics.engagementScore?.engagement_score || 0)}%</p>
              <p className="text-orange-200 text-sm mt-1">User engagement</p>
            </div>
            <div className="text-orange-200">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Device & Browser Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Device Usage</h3>
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {safeAnalytics.deviceAnalytics.length > 0 ? (
              <PieChart>
                <Pie
                  data={safeAnalytics.deviceAnalytics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {safeAnalytics.deviceAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No device data available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Browser Distribution</h3>
            <Globe className="w-6 h-6 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {safeAnalytics.browserAnalytics.length > 0 ? (
              <BarChart data={safeAnalytics.browserAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="browser" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No browser data available
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Trends & Hourly Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Response Trends</h3>
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {safeAnalytics.hourlyDistribution.length > 0 ? (
              <ComposedChart data={safeAnalytics.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="responses" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" />
                <Line type="monotone" dataKey="responses" stroke="#ef4444" strokeWidth={2} />
              </ComposedChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hourly data available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Weekly Patterns</h3>
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {safeAnalytics.weeklyPatterns.length > 0 ? (
              <BarChart data={safeAnalytics.weeklyPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="responses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No weekly data available
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Question Performance & Location Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Question Completion Rates</h3>
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {safeAnalytics.questionCompletion.length > 0 ? (
              <BarChart data={safeAnalytics.questionCompletion} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="question" type="category" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completion_rate" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No question completion data available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Top Locations</h3>
            <MapPin className="w-6 h-6 text-red-600" />
          </div>
          <div className="space-y-4">
            {safeAnalytics.locationAnalytics.length > 0 ? (
              safeAnalytics.locationAnalytics.slice(0, 5).map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{location.country || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{location.city || 'Unknown City'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{location.count}</p>
                    <p className="text-sm text-gray-500">responses</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No location data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatTime(safeAnalytics.responseTimeAnalysis?.min_time_between_questions || 0)}
            </div>
            <p className="text-sm text-gray-600">Fastest Response Time</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatTime(safeAnalytics.responseTimeAnalysis?.max_time_between_questions || 0)}
            </div>
            <p className="text-sm text-gray-600">Slowest Response Time</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {safeAnalytics.responseTimeAnalysis?.total_transitions || 0}
            </div>
            <p className="text-sm text-gray-600">Total Question Transitions</p>
          </div>
        </div>
      </div>

      {/* Question Difficulty Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Question Difficulty Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          {safeAnalytics.questionDifficulty.length > 0 ? (
            <BarChart data={safeAnalytics.questionDifficulty}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="difficulty" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No difficulty data available
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 