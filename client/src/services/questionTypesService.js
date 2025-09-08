// Question Types Service
// Defines all available question types and their configurations

export const QUESTION_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  EMAIL: 'email',
  NUMBER: 'number',
  PHONE: 'phone',
  URL: 'url',
  DATE: 'date',
  TIME: 'time',
  DATETIME: 'datetime',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  RATING: 'rating',
  EMOJI_SCALE: 'emoji_scale',
  CUSTOM_EMOJI_SCALE: 'custom_emoji_scale',
  SLIDER: 'slider',
  RANKING: 'ranking',
  MATRIX: 'matrix',
  FILE_UPLOAD: 'file_upload',
  SIGNATURE: 'signature',
  LOCATION: 'location',
  CONTACT_INFO: 'contact_info',
  PAYMENT: 'payment',
  CALCULATED: 'calculated',
  CONDITIONAL: 'conditional'
};

export const QUESTION_CATEGORIES = {
  TEXT_INPUT: 'text_input',
  CHOICE: 'choice',
  RATING: 'rating',
  SPECIAL: 'special',
  ADVANCED: 'advanced'
};

export const QUESTION_TYPE_CONFIGS = {
  [QUESTION_TYPES.TEXT]: {
    name: 'Short Text',
    description: 'Single line text input',
    category: QUESTION_CATEGORIES.TEXT_INPUT,
    icon: '📝',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      placeholder: 'Enter your answer...',
      maxLength: 255,
      minLength: 0,
      required: false
    },
    validationRules: {
      maxLength: { type: 'number', min: 1, max: 1000 },
      minLength: { type: 'number', min: 0, max: 999 },
      pattern: { type: 'string' }
    }
  },
  
  [QUESTION_TYPES.TEXTAREA]: {
    name: 'Long Text',
    description: 'Multi-line text input',
    category: QUESTION_CATEGORIES.TEXT_INPUT,
    icon: '📄',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      placeholder: 'Enter your answer...',
      maxLength: 2000,
      minLength: 0,
      rows: 4,
      required: false
    },
    validationRules: {
      maxLength: { type: 'number', min: 1, max: 10000 },
      minLength: { type: 'number', min: 0, max: 9999 },
      rows: { type: 'number', min: 2, max: 20 }
    }
  },
  
  [QUESTION_TYPES.EMAIL]: {
    name: 'Email',
    description: 'Email address input',
    category: QUESTION_CATEGORIES.TEXT_INPUT,
    icon: '📧',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      placeholder: 'Enter your email...',
      required: false
    },
    validationRules: {
      pattern: { type: 'string', default: '^[^@]+@[^@]+\\.[^@]+$' }
    }
  },
  
  [QUESTION_TYPES.NUMBER]: {
    name: 'Number',
    description: 'Numeric input',
    category: QUESTION_CATEGORIES.TEXT_INPUT,
    icon: '🔢',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      placeholder: 'Enter a number...',
      min: null,
      max: null,
      step: 1,
      required: false
    },
    validationRules: {
      min: { type: 'number' },
      max: { type: 'number' },
      step: { type: 'number', min: 0.01 }
    }
  },
  
  [QUESTION_TYPES.PHONE]: {
    name: 'Phone Number',
    description: 'Phone number input',
    category: QUESTION_CATEGORIES.TEXT_INPUT,
    icon: '📞',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      placeholder: 'Enter your phone number...',
      format: 'international',
      required: false
    },
    validationRules: {
      format: { type: 'select', options: ['international', 'national', 'custom'] }
    }
  },
  
  [QUESTION_TYPES.URL]: {
    name: 'Website URL',
    description: 'Website URL input',
    category: QUESTION_CATEGORIES.TEXT_INPUT,
    icon: '🌐',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      placeholder: 'https://example.com',
      required: false
    },
    validationRules: {
      protocol: { type: 'select', options: ['any', 'https', 'http'] }
    }
  },
  
  [QUESTION_TYPES.DATE]: {
    name: 'Date',
    description: 'Date picker',
    category: QUESTION_CATEGORIES.TEXT_INPUT,
    icon: '📅',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      minDate: null,
      maxDate: null,
      required: false
    },
    validationRules: {
      minDate: { type: 'date' },
      maxDate: { type: 'date' }
    }
  },
  
  [QUESTION_TYPES.TIME]: {
    name: 'Time',
    description: 'Time picker',
    category: QUESTION_CATEGORIES.TEXT_INPUT,
    icon: '🕐',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      format: '24h',
      required: false
    },
    validationRules: {
      format: { type: 'select', options: ['12h', '24h'] }
    }
  },
  
  [QUESTION_TYPES.DATETIME]: {
    name: 'Date & Time',
    description: 'Date and time picker',
    category: QUESTION_CATEGORIES.TEXT_INPUT,
    icon: '📅🕐',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      minDate: null,
      maxDate: null,
      format: '24h',
      required: false
    },
    validationRules: {
      minDate: { type: 'datetime' },
      maxDate: { type: 'datetime' },
      format: { type: 'select', options: ['12h', '24h'] }
    }
  },
  
  [QUESTION_TYPES.RADIO]: {
    name: 'Single Choice',
    description: 'Select one option from a list',
    category: QUESTION_CATEGORIES.CHOICE,
    icon: '🔘',
    hasOptions: true,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      options: ['Option 1', 'Option 2', 'Option 3'],
      allowOther: false,
      otherLabel: 'Other',
      required: false,
      randomize: false
    },
    validationRules: {
      minOptions: { type: 'number', min: 2 },
      maxOptions: { type: 'number', max: 20 }
    }
  },
  
  [QUESTION_TYPES.CHECKBOX]: {
    name: 'Multiple Choice',
    description: 'Select multiple options from a list',
    category: QUESTION_CATEGORIES.CHOICE,
    icon: '☑️',
    hasOptions: true,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      options: ['Option 1', 'Option 2', 'Option 3'],
      allowOther: false,
      otherLabel: 'Other',
      minSelections: 0,
      maxSelections: null,
      required: false,
      randomize: false
    },
    validationRules: {
      minOptions: { type: 'number', min: 2 },
      maxOptions: { type: 'number', max: 20 },
      minSelections: { type: 'number', min: 0 },
      maxSelections: { type: 'number', min: 1 }
    }
  },
  
  [QUESTION_TYPES.SELECT]: {
    name: 'Dropdown',
    description: 'Select one option from a dropdown',
    category: QUESTION_CATEGORIES.CHOICE,
    icon: '📋',
    hasOptions: true,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      options: ['Option 1', 'Option 2', 'Option 3'],
      placeholder: 'Select an option...',
      required: false,
      searchable: false
    },
    validationRules: {
      minOptions: { type: 'number', min: 2 },
      maxOptions: { type: 'number', max: 50 }
    }
  },
  
  [QUESTION_TYPES.MULTISELECT]: {
    name: 'Multi-Select Dropdown',
    description: 'Select multiple options from a dropdown',
    category: QUESTION_CATEGORIES.CHOICE,
    icon: '📋☑️',
    hasOptions: true,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      options: ['Option 1', 'Option 2', 'Option 3'],
      placeholder: 'Select options...',
      minSelections: 0,
      maxSelections: null,
      required: false,
      searchable: true
    },
    validationRules: {
      minOptions: { type: 'number', min: 2 },
      maxOptions: { type: 'number', max: 50 },
      minSelections: { type: 'number', min: 0 },
      maxSelections: { type: 'number', min: 1 }
    }
  },
  
  [QUESTION_TYPES.RATING]: {
    name: 'Star Rating',
    description: 'Rate using stars',
    category: QUESTION_CATEGORIES.RATING,
    icon: '⭐',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      maxRating: 5,
      allowHalfStars: false,
      showLabels: true,
      labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
      required: false
    },
    validationRules: {
      maxRating: { type: 'number', min: 2, max: 10 }
    }
  },
  
  [QUESTION_TYPES.EMOJI_SCALE]: {
    name: 'Emoji Scale',
    description: 'Rate using emoji expressions',
    category: QUESTION_CATEGORIES.RATING,
    icon: '😊',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      scale: 'happy_sad',
      showLabels: true,
      required: false
    },
    validationRules: {
      scale: { type: 'select', options: ['happy_sad', 'satisfaction', 'agreement', 'frequency'] }
    }
  },
  
  [QUESTION_TYPES.CUSTOM_EMOJI_SCALE]: {
    name: 'Custom Emoji Scale',
    description: 'Create custom emoji rating scale',
    category: QUESTION_CATEGORIES.RATING,
    icon: '🎭',
    hasOptions: true,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      emojis: ['😞', '😐', '😊', '😄', '🤩'],
      labels: ['Very Poor', 'Poor', 'Good', 'Very Good', 'Excellent'],
      showLabels: true,
      required: false
    },
    validationRules: {
      minEmojis: { type: 'number', min: 2 },
      maxEmojis: { type: 'number', max: 10 }
    }
  },
  
  [QUESTION_TYPES.SLIDER]: {
    name: 'Slider',
    description: 'Rate using a slider',
    category: QUESTION_CATEGORIES.RATING,
    icon: '🎚️',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      min: 0,
      max: 100,
      step: 1,
      showValue: true,
      showLabels: true,
      leftLabel: 'Low',
      rightLabel: 'High',
      required: false
    },
    validationRules: {
      min: { type: 'number' },
      max: { type: 'number' },
      step: { type: 'number', min: 0.1 }
    }
  },
  
  [QUESTION_TYPES.RANKING]: {
    name: 'Ranking',
    description: 'Rank options in order of preference',
    category: QUESTION_CATEGORIES.CHOICE,
    icon: '🔢',
    hasOptions: true,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      options: ['Option 1', 'Option 2', 'Option 3'],
      allowTies: false,
      required: false
    },
    validationRules: {
      minOptions: { type: 'number', min: 2 },
      maxOptions: { type: 'number', max: 10 }
    }
  },
  
  [QUESTION_TYPES.MATRIX]: {
    name: 'Matrix',
    description: 'Rate multiple items on multiple criteria',
    category: QUESTION_CATEGORIES.ADVANCED,
    icon: '📊',
    hasOptions: true,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      rows: ['Item 1', 'Item 2'],
      columns: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
      type: 'radio',
      required: false
    },
    validationRules: {
      minRows: { type: 'number', min: 1 },
      maxRows: { type: 'number', max: 20 },
      minColumns: { type: 'number', min: 2 },
      maxColumns: { type: 'number', max: 10 }
    }
  },
  
  [QUESTION_TYPES.FILE_UPLOAD]: {
    name: 'File Upload',
    description: 'Upload files',
    category: QUESTION_CATEGORIES.SPECIAL,
    icon: '📎',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx'],
      maxSize: 10, // MB
      maxFiles: 1,
      required: false
    },
    validationRules: {
      maxSize: { type: 'number', min: 1, max: 100 },
      maxFiles: { type: 'number', min: 1, max: 10 }
    }
  },
  
  [QUESTION_TYPES.SIGNATURE]: {
    name: 'Signature',
    description: 'Digital signature capture',
    category: QUESTION_CATEGORIES.SPECIAL,
    icon: '✍️',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      required: false
    },
    validationRules: {}
  },
  
  [QUESTION_TYPES.LOCATION]: {
    name: 'Location',
    description: 'Capture location coordinates',
    category: QUESTION_CATEGORIES.SPECIAL,
    icon: '📍',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      accuracy: 'high',
      required: false
    },
    validationRules: {
      accuracy: { type: 'select', options: ['low', 'medium', 'high'] }
    }
  },
  
  [QUESTION_TYPES.CONTACT_INFO]: {
    name: 'Contact Information',
    description: 'Collect contact details',
    category: QUESTION_CATEGORIES.SPECIAL,
    icon: '👤',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      fields: ['name', 'email', 'phone'],
      required: false
    },
    validationRules: {
      fields: { type: 'array', options: ['name', 'email', 'phone', 'company', 'address'] }
    }
  },
  
  [QUESTION_TYPES.PAYMENT]: {
    name: 'Payment',
    description: 'Collect payment information',
    category: QUESTION_CATEGORIES.SPECIAL,
    icon: '💳',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      amount: 0,
      currency: 'USD',
      required: false
    },
    validationRules: {
      amount: { type: 'number', min: 0 },
      currency: { type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] }
    }
  },
  
  [QUESTION_TYPES.CALCULATED]: {
    name: 'Calculated Field',
    description: 'Auto-calculated value based on other answers',
    category: QUESTION_CATEGORIES.ADVANCED,
    icon: '🧮',
    hasOptions: false,
    hasValidation: true,
    hasConditional: true,
    defaultSettings: {
      formula: '',
      decimalPlaces: 2,
      required: false
    },
    validationRules: {
      decimalPlaces: { type: 'number', min: 0, max: 10 }
    }
  },
  
  [QUESTION_TYPES.CONDITIONAL]: {
    name: 'Conditional Logic',
    description: 'Show/hide based on previous answers',
    category: QUESTION_CATEGORIES.ADVANCED,
    icon: '🔀',
    hasOptions: false,
    hasValidation: true,
    hasConditional: false,
    defaultSettings: {
      conditions: [],
      required: false
    },
    validationRules: {}
  }
};

export const EMOJI_SCALES = {
  happy_sad: {
    name: 'Happy to Sad',
    emojis: ['😞', '😐', '😊', '😄', '🤩'],
    labels: ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy']
  },
  satisfaction: {
    name: 'Satisfaction',
    emojis: ['😞', '😐', '😊', '😄', '🤩'],
    labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']
  },
  agreement: {
    name: 'Agreement',
    emojis: ['😞', '😐', '😊', '😄', '🤩'],
    labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  frequency: {
    name: 'Frequency',
    emojis: ['😞', '😐', '😊', '😄', '🤩'],
    labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
  }
};

export const SURVEY_THEMES = {
  default: {
    name: 'Default',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      text: '#1e293b'
    }
  },
  modern: {
    name: 'Modern',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      background: '#f8fafc',
      text: '#0f172a'
    }
  },
  corporate: {
    name: 'Corporate',
    colors: {
      primary: '#1e40af',
      secondary: '#374151',
      success: '#047857',
      warning: '#b45309',
      error: '#b91c1c',
      background: '#ffffff',
      text: '#111827'
    }
  },
  colorful: {
    name: 'Colorful',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#fef3c7',
      text: '#1e293b'
    }
  }
};

// Helper functions
export function getQuestionTypeConfig(type) {
  return QUESTION_TYPE_CONFIGS[type] || null;
}

export function getQuestionTypesByCategory(category) {
  return Object.entries(QUESTION_TYPE_CONFIGS)
    .filter(([_, config]) => config.category === category)
    .map(([type, config]) => ({ type, ...config }));
}

export function getAllQuestionTypes() {
  return Object.entries(QUESTION_TYPE_CONFIGS).map(([type, config]) => ({
    type,
    ...config
  }));
}

export function getQuestionTypeIcon(type) {
  const config = getQuestionTypeConfig(type);
  return config ? config.icon : '❓';
}

export function getQuestionTypeName(type) {
  const config = getQuestionTypeConfig(type);
  return config ? config.name : 'Unknown';
}

export function validateQuestionSettings(type, settings) {
  const config = getQuestionTypeConfig(type);
  if (!config) return { valid: false, errors: ['Invalid question type'] };
  
  const errors = [];
  const validationRules = config.validationRules || {};
  
  Object.entries(validationRules).forEach(([key, rule]) => {
    const value = settings[key];
    
    if (rule.type === 'number') {
      if (value !== null && value !== undefined) {
        if (typeof value !== 'number') {
          errors.push(`${key} must be a number`);
        } else if (rule.min !== undefined && value < rule.min) {
          errors.push(`${key} must be at least ${rule.min}`);
        } else if (rule.max !== undefined && value > rule.max) {
          errors.push(`${key} must be at most ${rule.max}`);
        }
      }
    } else if (rule.type === 'string') {
      if (value !== null && value !== undefined && typeof value !== 'string') {
        errors.push(`${key} must be a string`);
      }
    } else if (rule.type === 'select') {
      if (value !== null && value !== undefined && !rule.options.includes(value)) {
        errors.push(`${key} must be one of: ${rule.options.join(', ')}`);
      }
    } else if (rule.type === 'array') {
      if (value !== null && value !== undefined && !Array.isArray(value)) {
        errors.push(`${key} must be an array`);
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function getDefaultQuestionSettings(type) {
  const config = getQuestionTypeConfig(type);
  return config ? { ...config.defaultSettings } : {};
}

export function createQuestion(type, overrides = {}) {
  const config = getQuestionTypeConfig(type);
  if (!config) {
    throw new Error(`Invalid question type: ${type}`);
  }
  
  const defaultSettings = getDefaultQuestionSettings(type);
  
  return {
    id: Date.now().toString(),
    type,
    title: '',
    description: '',
    required: false,
    options: config.hasOptions ? defaultSettings.options || [] : [],
    settings: { ...defaultSettings, ...overrides.settings },
    order: 0,
    created_at: new Date().toISOString(),
    ...overrides
  };
}

const questionTypesService = {
  QUESTION_TYPES,
  QUESTION_CATEGORIES,
  QUESTION_TYPE_CONFIGS,
  EMOJI_SCALES,
  SURVEY_THEMES,
  getQuestionTypeConfig,
  getQuestionTypesByCategory,
  getAllQuestionTypes,
  getQuestionTypeIcon,
  getQuestionTypeName,
  validateQuestionSettings,
  getDefaultQuestionSettings,
  createQuestion
};

export { questionTypesService };
export default questionTypesService;

