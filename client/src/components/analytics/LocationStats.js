import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LocationStats = ({ data = {}, detailed = false }) => {
  const locationData = data.locations || {};
  const totalResponses = Object.values(locationData).reduce((sum, count) => sum + count, 0);

  if (totalResponses === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Statistics</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🌍</div>
            <p>No location data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Sort locations by count and take top 10
  const sortedLocations = Object.entries(locationData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const chartData = {
    labels: sortedLocations.map(([location]) => location),
    datasets: [
      {
        label: 'Responses',
        data: sortedLocations.map(([, count]) => count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
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
      tooltip: {
        callbacks: {
          label: function(context) {
            const percentage = ((context.parsed.y / totalResponses) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.y} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const getCountryFlag = (country) => {
    // Simple flag emoji mapping for common countries
    const flags = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Japan': '🇯🇵',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'Netherlands': '🇳🇱',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Poland': '🇵🇱',
      'Russia': '🇷🇺'
    };
    return flags[country] || '🌍';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Statistics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>

        {/* Location List */}
        <div className="space-y-3">
          {sortedLocations.map(([location, count]) => {
            const percentage = ((count / totalResponses) * 100).toFixed(1);
            return (
              <div key={location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCountryFlag(location)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{location}</div>
                    <div className="text-sm text-gray-600">{count} responses</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {percentage}%
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {detailed && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Detailed Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Top Country</h5>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getCountryFlag(sortedLocations[0]?.[0] || 'Unknown')}</span>
                <div>
                  <div className="font-medium">{sortedLocations[0]?.[0] || 'Unknown'}</div>
                  <div className="text-sm text-gray-600">
                    {sortedLocations[0]?.[1] || 0} responses
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Total Countries</h5>
              <div className="text-2xl font-bold text-gray-900">{Object.keys(locationData).length}</div>
              <div className="text-sm text-gray-600">represented</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Total Responses</h5>
              <div className="text-2xl font-bold text-gray-900">{totalResponses}</div>
              <div className="text-sm text-gray-600">worldwide</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationStats;

