import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DeviceStats = ({ data = {}, detailed = false }) => {
  const deviceData = data.devices || {};
  const totalResponses = Object.values(deviceData).reduce((sum, count) => sum + count, 0);

  if (totalResponses === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Statistics</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📱</div>
            <p>No device data available</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(deviceData),
    datasets: [
      {
        data: Object.values(deviceData),
        backgroundColor: [
          '#3B82F6', // Blue for Desktop
          '#10B981', // Green for Mobile
          '#F59E0B', // Yellow for Tablet
          '#EF4444', // Red for Other
          '#8B5CF6'  // Purple for Unknown
        ],
        borderColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ],
        borderWidth: 2
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
          usePointStyle: true,
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / totalResponses) * 100).toFixed(1);
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
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

  const getDeviceIcon = (device) => {
    switch (device.toLowerCase()) {
      case 'desktop': return '🖥️';
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      default: return '💻';
    }
  };

  const getDeviceColor = (device) => {
    switch (device.toLowerCase()) {
      case 'desktop': return 'text-blue-600';
      case 'mobile': return 'text-green-600';
      case 'tablet': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Statistics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="h-64">
          <Doughnut data={chartData} options={options} />
        </div>

        {/* Device List */}
        <div className="space-y-3">
          {Object.entries(deviceData)
            .sort(([,a], [,b]) => b - a)
            .map(([device, count]) => {
              const percentage = ((count / totalResponses) * 100).toFixed(1);
              return (
                <div key={device} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getDeviceIcon(device)}</span>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{device}</div>
                      <div className="text-sm text-gray-600">{count} responses</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getDeviceColor(device)}`}>
                      {percentage}%
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          device.toLowerCase() === 'desktop' ? 'bg-blue-600' :
                          device.toLowerCase() === 'mobile' ? 'bg-green-600' :
                          device.toLowerCase() === 'tablet' ? 'bg-yellow-600' :
                          'bg-gray-600'
                        }`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Mobile vs Desktop</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mobile</span>
                  <span className="text-sm font-medium">
                    {deviceData.mobile || 0} ({(((deviceData.mobile || 0) / totalResponses) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Desktop</span>
                  <span className="text-sm font-medium">
                    {deviceData.desktop || 0} ({(((deviceData.desktop || 0) / totalResponses) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Total Responses</h5>
              <div className="text-2xl font-bold text-gray-900">{totalResponses}</div>
              <div className="text-sm text-gray-600">across all devices</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceStats;

