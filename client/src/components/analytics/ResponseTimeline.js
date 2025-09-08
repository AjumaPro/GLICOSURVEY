import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ResponseTimeline = ({ data = [] }) => {
  const [timeRange, setTimeRange] = useState('daily');

  const processData = (rawData, range) => {
    if (!rawData || rawData.length === 0) return { labels: [], datasets: [] };

    // Group data by time range
    const grouped = {};
    rawData.forEach(item => {
      const date = new Date(item.date);
      let key;
      
      switch (range) {
        case 'hourly':
          key = date.toISOString().slice(0, 13) + ':00:00';
          break;
        case 'daily':
          key = date.toISOString().slice(0, 10);
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'monthly':
          key = date.toISOString().slice(0, 7);
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }
      
      grouped[key] = (grouped[key] || 0) + item.count;
    });

    // Sort by date
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => new Date(a) - new Date(b));
    
    return {
      labels: sortedEntries.map(([date]) => {
        const d = new Date(date);
        switch (range) {
          case 'hourly':
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          case 'daily':
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          case 'weekly':
            return `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          case 'monthly':
            return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          default:
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }),
      data: sortedEntries.map(([, count]) => count)
    };
  };

  const processedData = processData(data, timeRange);
  const totalResponses = processedData.data.reduce((sum, count) => sum + count, 0);
  const averageResponses = totalResponses / processedData.data.length || 0;

  const chartData = {
    labels: processedData.labels,
    datasets: [
      {
        label: 'Responses',
        data: processedData.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Response Timeline (${timeRange})`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `${context.parsed.y} response${context.parsed.y !== 1 ? 's' : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Responses'
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          stepSize: 1
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Timeline</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p>No timeline data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Response Timeline</h3>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">View:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{totalResponses}</div>
          <div className="text-sm text-gray-600">Total Responses</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{Math.round(averageResponses)}</div>
          <div className="text-sm text-gray-600">Average per {timeRange.slice(0, -2)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {processedData.data.length > 0 ? Math.max(...processedData.data) : 0}
          </div>
          <div className="text-sm text-gray-600">Peak {timeRange.slice(0, -2)}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>

      {/* Insights */}
      {processedData.data.length > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Trend Analysis</h5>
              <p className="text-sm text-blue-800">
                {processedData.data.length > 1 && 
                  processedData.data[processedData.data.length - 1] > processedData.data[0]
                  ? 'Responses are increasing over time'
                  : 'Responses are decreasing over time'
                }
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">Peak Activity</h5>
              <p className="text-sm text-green-800">
                Highest activity: {Math.max(...processedData.data)} responses
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseTimeline;

