import React from 'react';
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
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AnalyticsDashboard = ({ analytics }) => {
  // Add fallback values to prevent crashes
  const safeAnalytics = {
    completion: { total_sessions: 0, completed_sessions: 0, completion_rate: 0, ...analytics?.completion },
    questions: analytics?.questions || [],
    hourlyDistribution: analytics?.hourlyDistribution || [],
    deviceAnalytics: analytics?.deviceAnalytics || [],
    browserAnalytics: analytics?.browserAnalytics || [],
    questionCompletion: analytics?.questionCompletion || [],
    locationAnalytics: analytics?.locationAnalytics || [],
    responseTimeAnalysis: { 
      avg_time_between_questions: 0, 
      min_time_between_questions: 0, 
      max_time_between_questions: 0, 
      total_transitions: 0,
      ...analytics?.responseTimeAnalysis 
    },
    weeklyPatterns: analytics?.weeklyPatterns || [],
    questionDifficulty: analytics?.questionDifficulty || [],
    engagementScore: { engagement_score: 0, ...analytics?.engagementScore }
  };

  // Helper function to safely get max value from array
  const getMaxValue = (array, key) => {
    if (!array || array.length === 0) return 1;
    return Math.max(...array.map(item => item[key] || 0), 1);
  };

  // Helper function to safely calculate percentage
  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.min((value / total) * 100, 100);
  };

  if (!analytics) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Responses</p>
              <p className="text-3xl font-bold">{safeAnalytics.completion?.total_sessions || 0}</p>
            </div>
            <div className="text-blue-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Completion Rate</span>
              <span>{safeAnalytics.completion?.completion_rate || 0}%</span>
            </div>
            <div className="mt-2 bg-blue-400 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
                style={{ width: `${safeAnalytics.completion?.completion_rate || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Questions</p>
              <p className="text-3xl font-bold">{safeAnalytics.questions?.length || 0}</p>
            </div>
            <div className="text-green-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Avg Time</span>
              <span>{Math.round(safeAnalytics.responseTimeAnalysis?.avg_time_between_questions || 0)}s</span>
            </div>
            <div className="mt-2 bg-green-400 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min((safeAnalytics.responseTimeAnalysis?.avg_time_between_questions || 0) / 120 * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Engagement</p>
              <p className="text-3xl font-bold">{Math.round(safeAnalytics.engagementScore?.engagement_score || 0)}</p>
            </div>
            <div className="text-purple-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Score</span>
              <span>/ 100</span>
            </div>
            <div className="mt-2 bg-purple-400 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
                style={{ width: `${safeAnalytics.engagementScore?.engagement_score || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Peak Hour</p>
              <p className="text-3xl font-bold">
                {safeAnalytics.hourlyDistribution?.reduce((max, hour) => 
                  hour.respondent_count > max.respondent_count ? hour : max
                )?.hour || 0}:00
              </p>
            </div>
            <div className="text-orange-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Responses</span>
              <span>
                {safeAnalytics.hourlyDistribution?.reduce((max, hour) => 
                  hour.respondent_count > max.respondent_count ? hour : max
                )?.respondent_count || 0}
              </span>
            </div>
            <div className="mt-2 bg-orange-400 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
                style={{ 
                  width: `${calculatePercentage(
                    safeAnalytics.hourlyDistribution?.reduce((max, hour) => 
                      hour.respondent_count > max.respondent_count ? hour : max
                    )?.respondent_count || 0,
                    getMaxValue(safeAnalytics.hourlyDistribution, 'respondent_count')
                  )}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Trends Over Time */}
      {analytics.trends && analytics.trends.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Response Trends Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="daily_respondents" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  stroke="#3b82f6"
                  name="Daily Respondents"
                />
                <Bar 
                  dataKey="total_responses" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Total Responses"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Device Usage */}
      {safeAnalytics.deviceAnalytics && safeAnalytics.deviceAnalytics.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Device Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeAnalytics.deviceAnalytics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="respondent_count"
                >
                  {safeAnalytics.deviceAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Browser Usage */}
      {safeAnalytics.browserAnalytics && safeAnalytics.browserAnalytics.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Browser Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeAnalytics.browserAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="browser" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="respondent_count" 
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  name="Respondents"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Hourly Distribution */}
      {safeAnalytics.hourlyDistribution && safeAnalytics.hourlyDistribution.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Hourly Response Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={safeAnalytics.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="respondent_count" 
                  fill="#06b6d4" 
                  fillOpacity={0.3}
                  stroke="#06b6d4"
                  name="Respondents"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Question Completion Rates */}
      {safeAnalytics.questionCompletion && safeAnalytics.questionCompletion.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Question Completion Rates</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeAnalytics.questionCompletion} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  dataKey="title" 
                  type="category" 
                  width={150} 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="completion_rate" 
                  fill="#f59e0b"
                  radius={[0, 4, 4, 0]}
                  name="Completion Rate (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Location Analytics */}
      {safeAnalytics.locationAnalytics && safeAnalytics.locationAnalytics.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Geographic Response Distribution</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Top Countries</h4>
              <div className="space-y-3">
                {safeAnalytics.locationAnalytics
                  .filter(loc => loc.country !== 'Unknown')
                  .slice(0, 5)
                  .map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{location.country}</p>
                          <p className="text-sm text-gray-600">{location.city}, {location.region}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{location.respondent_count}</p>
                        <p className="text-sm text-gray-600">
                          {Math.round((location.respondent_count / safeAnalytics.completion.total_sessions) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Response Map</h4>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🌍</div>
                  <p className="text-gray-600">Interactive map coming soon</p>
                  <p className="text-sm text-gray-500">Currently showing {safeAnalytics.locationAnalytics.length} locations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Response Patterns */}
      {safeAnalytics.weeklyPatterns && safeAnalytics.weeklyPatterns.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Weekly Response Patterns</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeAnalytics.weeklyPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day_name" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="respondent_count" 
                  fill="#06b6d4"
                  radius={[4, 4, 0, 0]}
                  name="Respondents"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Response Time Analysis */}
      {safeAnalytics.responseTimeAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Response Time Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Average Time</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round(safeAnalytics.responseTimeAnalysis.avg_time_between_questions || 0)}s
                  </p>
                </div>
                <div className="text-blue-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-600 font-medium">Fastest Response</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.round(safeAnalytics.responseTimeAnalysis.min_time_between_questions || 0)}s
                  </p>
                </div>
                <div className="text-green-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Slowest Response</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {Math.round(safeAnalytics.responseTimeAnalysis.max_time_between_questions || 0)}s
                  </p>
                </div>
                <div className="text-orange-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Engagement Score</h3>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${(safeAnalytics.engagementScore?.engagement_score || 0) * 3.52} 352`}
                    className="text-blue-600"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round(safeAnalytics.engagementScore?.engagement_score || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Score</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Based on completion rate and response time
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Question Difficulty Analysis */}
      {safeAnalytics.questionDifficulty && safeAnalytics.questionDifficulty.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Question Difficulty Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Difficulty Distribution</h4>
              <div className="space-y-3">
                {(() => {
                  const difficultyCounts = safeAnalytics.questionDifficulty.reduce((acc, q) => {
                    acc[q.difficulty_level] = (acc[q.difficulty_level] || 0) + 1;
                    return acc;
                  }, {});
                  
                  return Object.entries(difficultyCounts).map(([difficulty, count]) => (
                    <div key={difficulty} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          difficulty === 'Easy' ? 'bg-green-500' :
                          difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium text-gray-900">{difficulty}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Question Performance</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeAnalytics.questionDifficulty} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      dataKey="title" 
                      type="category" 
                      width={150} 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="completion_rate" 
                      fill={(entry) => {
                        if (entry.completion_rate >= 80) return '#10b981';
                        if (entry.completion_rate >= 60) return '#f59e0b';
                        return '#ef4444';
                      }}
                      radius={[0, 4, 4, 0]}
                      name="Completion Rate (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Heatmap */}
      {safeAnalytics.hourlyDistribution && safeAnalytics.hourlyDistribution.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Response Activity Heatmap</h3>
          <div className="grid grid-cols-24 gap-1 mb-4">
            {safeAnalytics.hourlyDistribution.map((hour, index) => {
              const intensity = hour.respondent_count / getMaxValue(safeAnalytics.hourlyDistribution, 'respondent_count');
              return (
                <div
                  key={index}
                  className="h-8 rounded-sm flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8 + 0.2})`,
                    color: intensity > 0.5 ? 'white' : '#374151'
                  }}
                  title={`${hour.hour}:00 - ${hour.respondent_count} responses`}
                >
                  {hour.hour}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 rounded-sm"></div>
              <span>Low Activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
              <span>Medium Activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
              <span>High Activity</span>
            </div>
          </div>
        </div>
      )}

      {/* Survey Performance Radar Chart */}
      {safeAnalytics.questionCompletion && safeAnalytics.questionCompletion.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Survey Performance Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={safeAnalytics.questionCompletion.slice(0, 6)}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="title" 
                  tick={{ fontSize: 10 }}
                  stroke="#6b7280"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  stroke="#6b7280"
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Completion Rate"
                  dataKey="completion_rate"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 