// Template Service
// Defines predefined survey templates

export const SURVEY_TEMPLATES = {
  CUSTOMER_SATISFACTION: {
    id: 'customer_satisfaction',
    name: 'Customer Satisfaction Survey',
    description: 'Measure customer satisfaction with your products or services',
    category: 'business',
    icon: '😊',
    questions: [
      {
        type: 'emoji_scale',
        title: 'How satisfied are you with our service?',
        description: 'Please rate your overall satisfaction',
        required: true,
        settings: {
          scale: 'satisfaction',
          showLabels: true
        }
      },
      {
        type: 'radio',
        title: 'How did you hear about us?',
        description: 'Help us understand our marketing effectiveness',
        required: true,
        options: [
          'Social Media',
          'Search Engine',
          'Friend/Family Recommendation',
          'Advertisement',
          'Other'
        ],
        settings: {
          allowOther: true,
          otherLabel: 'Other (please specify)'
        }
      },
      {
        type: 'checkbox',
        title: 'What features do you value most?',
        description: 'Select all that apply',
        required: false,
        options: [
          'Quality',
          'Price',
          'Customer Service',
          'Speed',
          'Innovation',
          'Reliability'
        ],
        settings: {
          minSelections: 1,
          maxSelections: 3
        }
      },
      {
        type: 'rating',
        title: 'How likely are you to recommend us to others?',
        description: 'Rate from 1 (not likely) to 10 (very likely)',
        required: true,
        settings: {
          maxRating: 10,
          showLabels: true,
          labels: ['Not Likely', '', '', '', '', '', '', '', '', 'Very Likely']
        }
      },
      {
        type: 'textarea',
        title: 'What could we improve?',
        description: 'Your feedback helps us serve you better',
        required: false,
        settings: {
          placeholder: 'Please share your suggestions...',
          maxLength: 500
        }
      }
    ],
    settings: {
      allowAnonymous: true,
      showProgress: true,
      theme: 'modern'
    }
  },

  EMPLOYEE_FEEDBACK: {
    id: 'employee_feedback',
    name: 'Employee Feedback Survey',
    description: 'Gather feedback from your team members',
    category: 'hr',
    icon: '👥',
    questions: [
      {
        type: 'radio',
        title: 'How would you rate your overall job satisfaction?',
        required: true,
        options: [
          'Very Satisfied',
          'Satisfied',
          'Neutral',
          'Dissatisfied',
          'Very Dissatisfied'
        ]
      },
      {
        type: 'rating',
        title: 'How would you rate your work-life balance?',
        required: true,
        settings: {
          maxRating: 5,
          showLabels: true,
          labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
        }
      },
      {
        type: 'checkbox',
        title: 'What motivates you most at work?',
        required: false,
        options: [
          'Recognition',
          'Career Growth',
          'Salary/Benefits',
          'Work Environment',
          'Team Collaboration',
          'Challenging Projects',
          'Work-Life Balance'
        ],
        settings: {
          minSelections: 1,
          maxSelections: 3
        }
      },
      {
        type: 'radio',
        title: 'How often do you receive feedback from your manager?',
        required: true,
        options: [
          'Daily',
          'Weekly',
          'Monthly',
          'Quarterly',
          'Rarely',
          'Never'
        ]
      },
      {
        type: 'textarea',
        title: 'What suggestions do you have for improving our workplace?',
        required: false,
        settings: {
          placeholder: 'Share your ideas for improvement...',
          maxLength: 1000
        }
      }
    ],
    settings: {
      allowAnonymous: true,
      showProgress: true,
      theme: 'corporate'
    }
  },

  EVENT_FEEDBACK: {
    id: 'event_feedback',
    name: 'Event Feedback Survey',
    description: 'Collect feedback from event attendees',
    category: 'events',
    icon: '🎉',
    questions: [
      {
        type: 'emoji_scale',
        title: 'How was your overall experience at the event?',
        required: true,
        settings: {
          scale: 'happy_sad',
          showLabels: true
        }
      },
      {
        type: 'rating',
        title: 'Rate the event organization',
        required: true,
        settings: {
          maxRating: 5,
          showLabels: true,
          labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
        }
      },
      {
        type: 'checkbox',
        title: 'What did you enjoy most about the event?',
        required: false,
        options: [
          'Keynote Speakers',
          'Networking Opportunities',
          'Workshops/Sessions',
          'Venue/Location',
          'Food & Beverages',
          'Entertainment',
          'Swag/Giveaways'
        ]
      },
      {
        type: 'radio',
        title: 'How likely are you to attend future events?',
        required: true,
        options: [
          'Very Likely',
          'Likely',
          'Neutral',
          'Unlikely',
          'Very Unlikely'
        ]
      },
      {
        type: 'textarea',
        title: 'Any additional comments or suggestions?',
        required: false,
        settings: {
          placeholder: 'Share your thoughts...',
          maxLength: 500
        }
      }
    ],
    settings: {
      allowAnonymous: true,
      showProgress: true,
      theme: 'colorful'
    }
  },

  PRODUCT_FEEDBACK: {
    id: 'product_feedback',
    name: 'Product Feedback Survey',
    description: 'Gather user feedback on your product',
    category: 'product',
    icon: '📱',
    questions: [
      {
        type: 'radio',
        title: 'How often do you use our product?',
        required: true,
        options: [
          'Daily',
          'Weekly',
          'Monthly',
          'Rarely',
          'This is my first time'
        ]
      },
      {
        type: 'rating',
        title: 'Rate the ease of use',
        required: true,
        settings: {
          maxRating: 5,
          showLabels: true,
          labels: ['Very Difficult', 'Difficult', 'Neutral', 'Easy', 'Very Easy']
        }
      },
      {
        type: 'checkbox',
        title: 'What features do you use most?',
        required: false,
        options: [
          'Dashboard',
          'Reports',
          'Notifications',
          'Settings',
          'Help/Support',
          'Mobile App',
          'API Integration'
        ]
      },
      {
        type: 'radio',
        title: 'How would you rate the value for money?',
        required: true,
        options: [
          'Excellent Value',
          'Good Value',
          'Fair Value',
          'Poor Value',
          'Too Expensive'
        ]
      },
      {
        type: 'textarea',
        title: 'What features would you like to see added?',
        required: false,
        settings: {
          placeholder: 'Describe the features you need...',
          maxLength: 1000
        }
      }
    ],
    settings: {
      allowAnonymous: true,
      showProgress: true,
      theme: 'modern'
    }
  },

  MARKET_RESEARCH: {
    id: 'market_research',
    name: 'Market Research Survey',
    description: 'Conduct market research and gather consumer insights',
    category: 'research',
    icon: '📊',
    questions: [
      {
        type: 'radio',
        title: 'What is your age range?',
        required: true,
        options: [
          '18-24',
          '25-34',
          '35-44',
          '45-54',
          '55-64',
          '65+'
        ]
      },
      {
        type: 'radio',
        title: 'What is your annual household income?',
        required: true,
        options: [
          'Under $25,000',
          '$25,000 - $49,999',
          '$50,000 - $74,999',
          '$75,000 - $99,999',
          '$100,000 - $149,999',
          '$150,000+',
          'Prefer not to say'
        ]
      },
      {
        type: 'checkbox',
        title: 'Which of these products interest you?',
        required: false,
        options: [
          'Electronics',
          'Clothing & Fashion',
          'Home & Garden',
          'Health & Beauty',
          'Sports & Fitness',
          'Books & Media',
          'Food & Beverages',
          'Automotive'
        ]
      },
      {
        type: 'radio',
        title: 'How do you typically discover new products?',
        required: true,
        options: [
          'Social Media',
          'Online Search',
          'TV/Radio Ads',
          'Print Media',
          'Word of Mouth',
          'In-Store',
          'Other'
        ]
      },
      {
        type: 'rating',
        title: 'How important is brand reputation when making purchases?',
        required: true,
        settings: {
          maxRating: 5,
          showLabels: true,
          labels: ['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Extremely Important']
        }
      }
    ],
    settings: {
      allowAnonymous: true,
      showProgress: true,
      theme: 'default'
    }
  },

  NPS_SURVEY: {
    id: 'nps_survey',
    name: 'Net Promoter Score (NPS) Survey',
    description: 'Measure customer loyalty and satisfaction',
    category: 'business',
    icon: '⭐',
    questions: [
      {
        type: 'rating',
        title: 'How likely are you to recommend our company to a friend or colleague?',
        description: 'Rate from 0 (not at all likely) to 10 (extremely likely)',
        required: true,
        settings: {
          maxRating: 10,
          showLabels: true,
          labels: ['Not at all likely', '', '', '', '', '', '', '', '', 'Extremely likely']
        }
      },
      {
        type: 'textarea',
        title: 'What is the primary reason for your score?',
        description: 'Help us understand what drives your recommendation',
        required: false,
        settings: {
          placeholder: 'Please explain your rating...',
          maxLength: 500
        }
      },
      {
        type: 'radio',
        title: 'How long have you been a customer?',
        required: true,
        options: [
          'Less than 1 month',
          '1-6 months',
          '6-12 months',
          '1-2 years',
          '2-5 years',
          'More than 5 years'
        ]
      }
    ],
    settings: {
      allowAnonymous: true,
      showProgress: true,
      theme: 'modern'
    }
  },

  CONTACT_FORM: {
    id: 'contact_form',
    name: 'Contact Form',
    description: 'Simple contact form for inquiries and support',
    category: 'forms',
    icon: '📞',
    questions: [
      {
        type: 'text',
        title: 'Full Name',
        required: true,
        settings: {
          placeholder: 'Enter your full name'
        }
      },
      {
        type: 'email',
        title: 'Email Address',
        required: true,
        settings: {
          placeholder: 'Enter your email address'
        }
      },
      {
        type: 'phone',
        title: 'Phone Number',
        required: false,
        settings: {
          placeholder: 'Enter your phone number'
        }
      },
      {
        type: 'select',
        title: 'Subject',
        required: true,
        options: [
          'General Inquiry',
          'Support Request',
          'Sales Question',
          'Partnership',
          'Feedback',
          'Other'
        ],
        settings: {
          placeholder: 'Select a subject'
        }
      },
      {
        type: 'textarea',
        title: 'Message',
        required: true,
        settings: {
          placeholder: 'Please describe your inquiry...',
          rows: 5,
          maxLength: 1000
        }
      }
    ],
    settings: {
      allowAnonymous: true,
      showProgress: true,
      theme: 'default'
    }
  }
};

export const TEMPLATE_CATEGORIES = {
  business: {
    name: 'Business',
    icon: '💼',
    description: 'Business and customer-related surveys'
  },
  hr: {
    name: 'Human Resources',
    icon: '👥',
    description: 'Employee and HR surveys'
  },
  events: {
    name: 'Events',
    icon: '🎉',
    description: 'Event feedback and planning surveys'
  },
  product: {
    name: 'Product',
    icon: '📱',
    description: 'Product feedback and user research'
  },
  research: {
    name: 'Research',
    icon: '📊',
    description: 'Market research and data collection'
  },
  forms: {
    name: 'Forms',
    icon: '📋',
    description: 'Contact forms and simple surveys'
  }
};

// Helper functions
export function getAllTemplates() {
  return Object.values(SURVEY_TEMPLATES);
}

export function getTemplatesByCategory(category) {
  return Object.values(SURVEY_TEMPLATES).filter(template => template.category === category);
}

export function getTemplateById(id) {
  return SURVEY_TEMPLATES[id] || null;
}

export function getTemplateCategories() {
  return Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => ({
    key,
    ...category
  }));
}

export function createSurveyFromTemplate(templateId, customizations = {}) {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const survey = {
    title: customizations.title || template.name,
    description: customizations.description || template.description,
    status: 'draft',
    settings: { ...template.settings, ...customizations.settings },
    questions: template.questions.map((question, index) => ({
      ...question,
      id: `temp_${Date.now()}_${index}`,
      order: index,
      created_at: new Date().toISOString()
    })),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return survey;
}

export function searchTemplates(query) {
  const searchTerm = query.toLowerCase();
  return Object.values(SURVEY_TEMPLATES).filter(template =>
    template.name.toLowerCase().includes(searchTerm) ||
    template.description.toLowerCase().includes(searchTerm) ||
    template.category.toLowerCase().includes(searchTerm)
  );
}

export function getTemplatePreview(templateId) {
  const template = getTemplateById(templateId);
  if (!template) return null;

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    icon: template.icon,
    questionCount: template.questions.length,
    estimatedTime: Math.ceil(template.questions.length * 0.5), // 30 seconds per question
    features: [
      template.questions.some(q => q.type === 'rating') && 'Rating Questions',
      template.questions.some(q => q.type === 'emoji_scale') && 'Emoji Scales',
      template.questions.some(q => q.type === 'checkbox') && 'Multiple Choice',
      template.questions.some(q => q.type === 'textarea') && 'Text Responses',
      template.questions.some(q => q.required) && 'Required Questions'
    ].filter(Boolean)
  };
}

// Additional methods needed by SurveyTemplates component
export function duplicateTemplate(templateId, customizations = {}) {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  // Create a new template with customizations
  const duplicatedTemplate = {
    ...template,
    id: `${template.id}_copy_${Date.now()}`,
    name: customizations.name || `${template.name} (Copy)`,
    description: customizations.description || template.description,
    questions: template.questions.map(q => ({ ...q }))
  };

  return duplicatedTemplate;
}

export function deleteTemplate(templateId) {
  // For now, this is a no-op since we're working with static templates
  // In a real implementation, this would make an API call to delete the template
  console.log(`Template ${templateId} would be deleted`);
  return Promise.resolve();
}

export function customizeTemplate(templateId, customizations) {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  return {
    ...template,
    ...customizations,
    questions: template.questions.map(q => ({ ...q }))
  };
}

export function createTemplate(templateData) {
  // Make API call to create template
  return fetch('/api/templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(templateData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to create template');
    }
    return response.json();
  });
}

export function updateTemplate(templateId, templateData) {
  // Make API call to update template
  return fetch(`/api/templates/${templateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(templateData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to update template');
    }
    return response.json();
  });
}

export function publishTemplate(templateId) {
  // Make API call to publish template
  return fetch(`/api/templates/${templateId}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to publish template');
    }
    return response.json();
  });
}

export function unpublishTemplate(templateId) {
  // Make API call to unpublish template
  return fetch(`/api/templates/${templateId}/unpublish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to unpublish template');
    }
    return response.json();
  });
}

const templateService = {
  SURVEY_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getAllTemplates,
  getTemplatesByCategory,
  getTemplateById,
  getTemplateCategories,
  createSurveyFromTemplate,
  searchTemplates,
  getTemplatePreview,
  duplicateTemplate,
  deleteTemplate,
  customizeTemplate,
  createTemplate,
  updateTemplate,
  publishTemplate,
  unpublishTemplate
};

export { templateService };
export default templateService;

