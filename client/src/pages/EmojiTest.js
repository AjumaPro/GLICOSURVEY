import React, { useState } from 'react';
import CustomEmojiScale, { customEmojiScaleTemplates } from '../components/CustomEmojiScale';
import EmojiScale, { emojiScaleTemplates } from '../components/EmojiScale';
import RecommendationScaleSVG from '../components/RecommendationScaleSVG';

const EmojiTest = () => {
  const [selectedValue, setSelectedValue] = useState(null);

  console.log('EmojiTest component rendered');
  console.log('RecommendationScaleSVG component imported:', !!RecommendationScaleSVG);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Emoji Scale Components Test
        </h1>

        {/* Simple Test Section */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-red-900 mb-4 text-center">
            🔍 Simple RecommendationScaleSVG Test
          </h2>
          <p className="text-center text-red-700 mb-4">
            If you can see this section, the page is loading. The component should appear below:
          </p>
          <div className="bg-white rounded-lg p-4 border border-red-300">
            <p className="text-center mb-4 text-gray-600">Component should render below:</p>
            <div style={{ border: '2px dashed blue', padding: '20px', margin: '10px', minHeight: '200px' }}>
              <RecommendationScaleSVG
                value={selectedValue}
                onChange={setSelectedValue}
              />
            </div>
            <div className="text-center mt-4 p-2 bg-blue-50 rounded">
              <p className="text-blue-800">
                Selected Value: {selectedValue || 'None'} / 10
              </p>
            </div>
          </div>
        </div>

        {/* Updated RecommendationScaleSVG Showcase */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🎯 Updated RecommendationScaleSVG Component
          </h2>
          <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
            This component now matches the exact emoji structure from your image: 
            <strong> Red sad faces (1-6) → "Unlikely"</strong>, 
            <strong> Orange neutral faces (7-8) → "Neutral"</strong>, 
            <strong> Green happy faces (9-10) → "Likely"</strong>
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <RecommendationScaleSVG
              value={selectedValue}
              onChange={setSelectedValue}
            />
            {selectedValue && (
              <div className="text-center mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">
                  Selected: {selectedValue}/10
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the existing content */}
        <div className="space-y-8">
          {/* Custom SVG Emoji Scales */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
              Custom SVG Emoji Scales (Round Faces)
            </h2>
            
            {/* Satisfaction Scale */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Customer Satisfaction Scale (Custom SVG)
              </h3>
              <EmojiScale
                options={emojiScaleTemplates.satisfaction}
                value={selectedValue}
                onChange={setSelectedValue}
                size="large"
              />
            </div>

            {/* Agreement Scale */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Agreement Scale (Custom SVG)
              </h3>
              <EmojiScale
                options={emojiScaleTemplates.agreement}
                value={selectedValue}
                onChange={setSelectedValue}
                size="medium"
              />
            </div>

            {/* Quality Scale */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quality Rating Scale (Custom SVG)
              </h3>
              <EmojiScale
                options={emojiScaleTemplates.quality}
                value={selectedValue}
                onChange={setSelectedValue}
                size="small"
              />
            </div>
          </div>

          {/* Regular Emoji Scales */}
          <div className="bg-green-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-900 mb-6 text-center">
              Regular Emoji Scales (Thumbs, Stars, Hearts)
            </h2>
            
            {/* Thumbs Scale */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Thumbs Up/Down Scale
              </h3>
              <EmojiScale
                options={emojiScaleTemplates.thumbs}
                value={selectedValue}
                onChange={setSelectedValue}
                size="large"
              />
            </div>

            {/* Stars Scale */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Star Rating Scale
              </h3>
              <EmojiScale
                options={emojiScaleTemplates.stars}
                value={selectedValue}
                onChange={setSelectedValue}
                size="medium"
              />
            </div>

            {/* Hearts Scale */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Heart Rating Scale
              </h3>
              <EmojiScale
                options={emojiScaleTemplates.hearts}
                value={selectedValue}
                onChange={setSelectedValue}
                size="medium"
              />
            </div>

            {/* Recommendation Scale */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Recommendation Scale (1-5)
              </h3>
              <EmojiScale
                options={emojiScaleTemplates.recommendation_5}
                value={selectedValue}
                onChange={setSelectedValue}
                size="medium"
              />
            </div>

            {/* 10-Option Recommendation Scale */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Recommendation Scale (1-10) - Updated SVG Implementation
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Updated to match the exact emoji structure: Red sad faces (1-6), Orange neutral faces (7-8), Green happy faces (9-10)
              </p>
              <EmojiScale
                options={emojiScaleTemplates.recommendation_10}
                value={selectedValue}
                onChange={setSelectedValue}
                size="medium"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setSelectedValue(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Reset Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmojiTest; 