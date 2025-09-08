import React, { useState, useEffect } from 'react';
import {
  CodeBracketIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const EmbedCode = ({ survey, onClose }) => {
  const [embedOptions, setEmbedOptions] = useState({
    width: '100%',
    height: '600px',
    theme: 'light',
    showTitle: true,
    showProgress: true,
    showBranding: true,
    responsive: true,
    autoResize: true
  });
  const [embedCode, setEmbedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('iframe');
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const surveyUrl = `${baseUrl}/survey/${survey.id}`;
    
    // Generate iframe embed code
    const iframeCode = `<iframe 
  src="${surveyUrl}?embed=true&theme=${embedOptions.theme}&showTitle=${embedOptions.showTitle}&showProgress=${embedOptions.showProgress}&showBranding=${embedOptions.showBranding}"
  width="${embedOptions.width}"
  height="${embedOptions.height}"
  frameborder="0"
  scrolling="auto"
  ${embedOptions.responsive ? 'style="max-width: 100%; height: auto; min-height: 400px;"' : ''}
  ${embedOptions.autoResize ? 'onload="this.style.height=this.contentWindow.document.body.scrollHeight+\'px\'"' : ''}
></iframe>`;

    // Generate JavaScript embed code
    const jsCode = `<div id="glico-survey-${survey.id}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/js/survey-embed.js';
    script.onload = function() {
      GlicoSurvey.embed({
        containerId: 'glico-survey-${survey.id}',
        surveyId: '${survey.id}',
        theme: '${embedOptions.theme}',
        showTitle: ${embedOptions.showTitle},
        showProgress: ${embedOptions.showProgress},
        showBranding: ${embedOptions.showBranding},
        responsive: ${embedOptions.responsive},
        width: '${embedOptions.width}',
        height: '${embedOptions.height}'
      });
    };
    document.head.appendChild(script);
  })();
</script>`;

    // Generate WordPress shortcode
    const shortcode = `[glico_survey id="${survey.id}" theme="${embedOptions.theme}" show_title="${embedOptions.showTitle}" show_progress="${embedOptions.showProgress}" show_branding="${embedOptions.showBranding}"]`;

    // Generate React component code
    const reactCode = `import React from 'react';
import { GlicoSurveyEmbed } from '@glico/survey-react';

const MySurvey = () => {
  return (
    <GlicoSurveyEmbed
      surveyId="${survey.id}"
      theme="${embedOptions.theme}"
      showTitle={${embedOptions.showTitle}}
      showProgress={${embedOptions.showProgress}}
      showBranding={${embedOptions.showBranding}}
      width="${embedOptions.width}"
      height="${embedOptions.height}"
      responsive={${embedOptions.responsive}}
    />
  );
};

export default MySurvey;`;

    setEmbedCode({
      iframe: iframeCode,
      javascript: jsCode,
      shortcode: shortcode,
      react: reactCode
    });

    // Generate preview URL
    const previewParams = new URLSearchParams({
      embed: 'true',
      theme: embedOptions.theme,
      showTitle: embedOptions.showTitle,
      showProgress: embedOptions.showProgress,
      showBranding: embedOptions.showBranding,
      preview: 'true'
    });
    setPreviewUrl(`${surveyUrl}?${previewParams.toString()}`);
  };

  useEffect(() => {
    generateEmbedCode();
  }, [survey, embedOptions, generateEmbedCode]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleOptionChange = (option, value) => {
    setEmbedOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'mobile': return <DevicePhoneMobileIcon className="w-5 h-5" />;
      case 'tablet': return <DeviceTabletIcon className="w-5 h-5" />;
      default: return <ComputerDesktopIcon className="w-5 h-5" />;
    }
  };

  const getDeviceDimensions = (device) => {
    switch (device) {
      case 'mobile': return { width: '375px', height: '667px' };
      case 'tablet': return { width: '768px', height: '1024px' };
      default: return { width: '100%', height: '600px' };
    }
  };

  const tabs = [
    { id: 'iframe', name: 'Iframe', icon: <CodeBracketIcon className="w-4 h-4" /> },
    { id: 'javascript', name: 'JavaScript', icon: <CodeBracketIcon className="w-4 h-4" /> },
    { id: 'shortcode', name: 'WordPress', icon: <GlobeAltIcon className="w-4 h-4" /> },
    { id: 'react', name: 'React', icon: <CodeBracketIcon className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Embed Survey</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Embed Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Embed Options</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width
                    </label>
                    <input
                      type="text"
                      value={embedOptions.width}
                      onChange={(e) => handleOptionChange('width', e.target.value)}
                      placeholder="100% or 800px"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      value={embedOptions.height}
                      onChange={(e) => handleOptionChange('height', e.target.value)}
                      placeholder="600px"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={embedOptions.theme}
                    onChange={(e) => handleOptionChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show Title</label>
                      <p className="text-sm text-gray-500">Display survey title</p>
                    </div>
                    <button
                      onClick={() => handleOptionChange('showTitle', !embedOptions.showTitle)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        embedOptions.showTitle ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          embedOptions.showTitle ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show Progress</label>
                      <p className="text-sm text-gray-500">Display progress bar</p>
                    </div>
                    <button
                      onClick={() => handleOptionChange('showProgress', !embedOptions.showProgress)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        embedOptions.showProgress ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          embedOptions.showProgress ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show Branding</label>
                      <p className="text-sm text-gray-500">Display Glico Survey branding</p>
                    </div>
                    <button
                      onClick={() => handleOptionChange('showBranding', !embedOptions.showBranding)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        embedOptions.showBranding ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          embedOptions.showBranding ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Responsive</label>
                      <p className="text-sm text-gray-500">Adapt to container size</p>
                    </div>
                    <button
                      onClick={() => handleOptionChange('responsive', !embedOptions.responsive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        embedOptions.responsive ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          embedOptions.responsive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto Resize</label>
                      <p className="text-sm text-gray-500">Automatically adjust height</p>
                    </div>
                    <button
                      onClick={() => handleOptionChange('autoResize', !embedOptions.autoResize)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        embedOptions.autoResize ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          embedOptions.autoResize ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Embed Code and Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Embed Code</h3>
              
              {/* Code Tabs */}
              <div className="mb-4">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Display */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {tabs.find(tab => tab.id === activeTab)?.name} Code
                  </label>
                  <button
                    onClick={() => copyToClipboard(embedCode[activeTab])}
                    className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{embedCode[activeTab]}</code>
                </pre>
              </div>

              {/* Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Preview</label>
                  <div className="flex space-x-1">
                    {['desktop', 'tablet', 'mobile'].map((device) => (
                      <button
                        key={device}
                        onClick={() => setPreviewDevice(device)}
                        className={`p-2 rounded-lg transition-colors ${
                          previewDevice === device
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {getDeviceIcon(device)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-100 p-2 text-center text-sm text-gray-600"
                    style={{ width: getDeviceDimensions(previewDevice).width }}
                  >
                    Preview
                  </div>
                  <div 
                    className="bg-white"
                    style={{ 
                      width: getDeviceDimensions(previewDevice).width,
                      height: getDeviceDimensions(previewDevice).height,
                      overflow: 'hidden'
                    }}
                  >
                    <iframe
                      src={previewUrl}
                      width="100%"
                      height="100%"
                      title="Survey Preview"
                      frameBorder="0"
                      className="pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Copy the code above and paste it into your website to embed this survey.</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedCode;

