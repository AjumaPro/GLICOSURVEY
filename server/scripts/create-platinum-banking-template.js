const { query } = require('../database/connection');
require('dotenv').config();

const createPlatinumBankingTemplate = async () => {
  try {
    console.log('🏦 Creating Platinum Banking survey template...');

    // Create the survey
    const surveyResult = await query(
      `INSERT INTO surveys (title, description, status, theme, settings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        'Platinum Banking Customer Satisfaction Survey',
        'Help us improve your banking experience by providing your valuable feedback.',
        'published',
        JSON.stringify({
          primaryColor: '#1f2937',
          backgroundColor: '#111827',
          textColor: '#ffffff',
          accentColor: '#3b82f6'
        }),
        JSON.stringify({
          allowAnonymous: true,
          showProgress: true,
          darkMode: true
        })
      ]
    );

    const surveyId = surveyResult.rows[0].id;

    // Create questions based on the image
    const questions = [
      {
        type: 'emoji_scale',
        title: 'How satisfied are you with the experience you received at Platinum Banking?',
        description: '',
        required: true,
        options: [
          { value: 1, label: 'Very Unsatisfied', emoji: '😠' },
          { value: 2, label: 'Unsatisfied', emoji: '😞' },
          { value: 3, label: 'Neutral', emoji: '😐' },
          { value: 4, label: 'Satisfied', emoji: '🙂' },
          { value: 5, label: 'Very Satisfied', emoji: '😊' }
        ],
        order_index: 0
      },
      {
        type: 'emoji_scale',
        title: 'Based on your experience at Platinum Banking, how likely are you to recommend us to your friends and colleagues?',
        description: '',
        required: true,
        options: [
          { value: 1, label: 'Unlikely', emoji: '😞' },
          { value: 2, label: 'Unlikely', emoji: '😞' },
          { value: 3, label: 'Unlikely', emoji: '😞' },
          { value: 4, label: 'Unlikely', emoji: '😞' },
          { value: 5, label: 'Unlikely', emoji: '😞' },
          { value: 6, label: 'Unlikely', emoji: '😞' },
          { value: 7, label: 'Neutral', emoji: '😐' },
          { value: 8, label: 'Neutral', emoji: '😐' },
          { value: 9, label: 'Likely', emoji: '😊' },
          { value: 10, label: 'Likely', emoji: '😊' }
        ],
        order_index: 1
      },
      {
        type: 'emoji_scale',
        title: 'How easy was it to interact with us?',
        description: '',
        required: true,
        options: [
          { value: 1, label: 'Very Difficult', emoji: '😠' },
          { value: 2, label: 'Difficult', emoji: '😞' },
          { value: 3, label: 'Moderate', emoji: '😐' },
          { value: 4, label: 'Easy', emoji: '🙂' },
          { value: 5, label: 'Very Easy', emoji: '😊' }
        ],
        order_index: 2
      },
      {
        type: 'contact_followup',
        title: 'Additional Feedback',
        description: '',
        required: false,
        commentsPlaceholder: 'We would love to hear from you, please provide your comments. (Optional)',
        phonePlaceholder: 'Phone number',
        countryCode: '+233',
        order_index: 3
      }
    ];

    // Insert questions
    for (const question of questions) {
      await query(
        `INSERT INTO questions (survey_id, type, title, description, required, options, settings, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          surveyId,
          question.type,
          question.title,
          question.description,
          question.required,
          JSON.stringify(question.options),
          JSON.stringify({
            commentsPlaceholder: question.commentsPlaceholder,
            phonePlaceholder: question.phonePlaceholder,
            countryCode: question.countryCode
          }),
          question.order_index
        ]
      );
    }

    console.log('✅ Platinum Banking survey template created successfully!');
    console.log('📊 Survey ID:', surveyId);
    console.log('🔗 Survey URL:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/survey/${surveyId}`);
    console.log('');
    console.log('📋 Template includes:');
    console.log('   • Satisfaction rating (5-point emoji scale)');
    console.log('   • Recommendation likelihood (10-point emoji scale)');
    console.log('   • Ease of interaction (5-point emoji scale)');
    console.log('   • Comments and phone number for follow-up');

  } catch (error) {
    console.error('❌ Error creating Platinum Banking template:', error);
    process.exit(1);
  }
};

// Run the script
createPlatinumBankingTemplate().then(() => {
  console.log('🎉 Script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 