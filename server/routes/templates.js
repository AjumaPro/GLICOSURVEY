const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query } = require('../database/connection');

// Predefined survey templates with professional emoji scales
const surveyTemplates = {
  customer_satisfaction: {
    title: "Customer Satisfaction Survey",
    description: "Measure customer satisfaction with your products or services",
    questions: [
      {
        type: "emoji_scale",
        text: "How satisfied are you with our overall service?",
        required: true,
        options: [
          { value: 1, label: "Very Unsatisfied", emoji: "😠" },
          { value: 2, label: "Unsatisfied", emoji: "😞" },
          { value: 3, label: "Neutral", emoji: "😐" },
          { value: 4, label: "Satisfied", emoji: "🙂" },
          { value: 5, label: "Very Satisfied", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How likely are you to recommend us to others?",
        required: true,
        options: [
          { value: 1, label: "1", emoji: "😞" },
          { value: 2, label: "2", emoji: "😞" },
          { value: 3, label: "3", emoji: "😞" },
          { value: 4, label: "4", emoji: "😞" },
          { value: 5, label: "5", emoji: "😞" },
          { value: 6, label: "6", emoji: "😞" },
          { value: 7, label: "7", emoji: "😐" },
          { value: 8, label: "8", emoji: "😐" },
          { value: 9, label: "9", emoji: "😊" },
          { value: 10, label: "10", emoji: "😊" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How easy was it to interact with us?",
        required: true,
        options: [
          { value: 1, label: "Very Difficult", emoji: "😠" },
          { value: 2, label: "Difficult", emoji: "😞" },
          { value: 3, label: "Moderate", emoji: "😐" },
          { value: 4, label: "Easy", emoji: "🙂" },
          { value: 5, label: "Very Easy", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the quality of our products?",
        required: true,
        options: [
          { value: 1, label: "Very Poor", emoji: "😠" },
          { value: 2, label: "Poor", emoji: "😞" },
          { value: 3, label: "Average", emoji: "😐" },
          { value: 4, label: "Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How satisfied are you with our customer support?",
        required: true,
        options: [
          { value: 1, label: "Very Unsatisfied", emoji: "😠" },
          { value: 2, label: "Unsatisfied", emoji: "😞" },
          { value: 3, label: "Neutral", emoji: "😐" },
          { value: 4, label: "Satisfied", emoji: "🙂" },
          { value: 5, label: "Very Satisfied", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How likely are you to purchase from us again?",
        required: true,
        options: [
          { value: 1, label: "1", emoji: "😞" },
          { value: 2, label: "2", emoji: "😞" },
          { value: 3, label: "3", emoji: "😞" },
          { value: 4, label: "4", emoji: "😞" },
          { value: 5, label: "5", emoji: "😞" },
          { value: 6, label: "6", emoji: "😞" },
          { value: 7, label: "7", emoji: "😐" },
          { value: 8, label: "8", emoji: "😐" },
          { value: 9, label: "9", emoji: "😊" },
          { value: 10, label: "10", emoji: "😊" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate our pricing compared to competitors?",
        required: true,
        options: [
          { value: 1, label: "Very Expensive", emoji: "😠" },
          { value: 2, label: "Expensive", emoji: "😞" },
          { value: 3, label: "Fair", emoji: "😐" },
          { value: 4, label: "Good Value", emoji: "🙂" },
          { value: 5, label: "Excellent Value", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How satisfied are you with our delivery speed?",
        required: true,
        options: [
          { value: 1, label: "Very Unsatisfied", emoji: "😠" },
          { value: 2, label: "Unsatisfied", emoji: "😞" },
          { value: 3, label: "Neutral", emoji: "😐" },
          { value: 4, label: "Satisfied", emoji: "🙂" },
          { value: 5, label: "Very Satisfied", emoji: "🥰" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What aspect of our service impressed you the most?",
        required: false,
        options: [
          { value: "quality", label: "Product Quality" },
          { value: "service", label: "Customer Service" },
          { value: "price", label: "Competitive Pricing" },
          { value: "delivery", label: "Fast Delivery" },
          { value: "website", label: "Website Experience" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "multiple_choice",
        text: "How did you first hear about our company?",
        required: false,
        options: [
          { value: "social", label: "Social Media" },
          { value: "search", label: "Search Engine" },
          { value: "referral", label: "Friend/Family" },
          { value: "advertising", label: "Advertisement" },
          { value: "email", label: "Email Marketing" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "text",
        text: "We would love to hear from you, please provide your comments. (Optional)",
        required: false
      }
    ]
  },
  restaurant_feedback: {
    title: "Restaurant Experience Survey",
    description: "Gather feedback about dining experience, food quality, and service",
    questions: [
      {
        type: "emoji_scale",
        text: "How would you rate your overall dining experience?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the food quality?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the service quality?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the cleanliness of the restaurant?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the value for money?",
        required: true,
        options: [
          { value: 1, label: "Poor Value", emoji: "😠" },
          { value: 2, label: "Fair Value", emoji: "😞" },
          { value: 3, label: "Good Value", emoji: "😐" },
          { value: 4, label: "Very Good Value", emoji: "🙂" },
          { value: 5, label: "Excellent Value", emoji: "🥰" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What type of cuisine did you order?",
        required: false,
        options: [
          { value: "local", label: "Local Cuisine" },
          { value: "international", label: "International" },
          { value: "fast_food", label: "Fast Food" },
          { value: "fine_dining", label: "Fine Dining" },
          { value: "casual", label: "Casual Dining" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What was the main reason for your visit?",
        required: false,
        options: [
          { value: "dinner", label: "Dinner" },
          { value: "lunch", label: "Lunch" },
          { value: "breakfast", label: "Breakfast" },
          { value: "special_occasion", label: "Special Occasion" },
          { value: "business", label: "Business Meeting" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "text",
        text: "What dishes would you recommend to other customers?",
        required: false
      },
      {
        type: "text",
        text: "How can we improve your dining experience?",
        required: false
      }
    ]
  },
  hotel_experience: {
    title: "Hotel Experience Survey",
    description: "Collect feedback about hotel stay, amenities, and service quality",
    questions: [
      {
        type: "emoji_scale",
        text: "How would you rate your overall hotel experience?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the cleanliness of your room?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the staff friendliness?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the hotel amenities?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the check-in/check-out process?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What type of room did you stay in?",
        required: false,
        options: [
          { value: "standard", label: "Standard Room" },
          { value: "deluxe", label: "Deluxe Room" },
          { value: "suite", label: "Suite" },
          { value: "family", label: "Family Room" },
          { value: "business", label: "Business Room" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What was the main purpose of your stay?",
        required: false,
        options: [
          { value: "leisure", label: "Leisure/Vacation" },
          { value: "business", label: "Business Trip" },
          { value: "family", label: "Family Visit" },
          { value: "event", label: "Special Event" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "text",
        text: "What amenities did you use during your stay?",
        required: false
      },
      {
        type: "text",
        text: "How can we improve your hotel experience?",
        required: false
      }
    ]
  },
  ecommerce_feedback: {
    title: "E-commerce Experience Survey",
    description: "Gather feedback about online shopping experience and website usability",
    questions: [
      {
        type: "emoji_scale",
        text: "How would you rate your overall shopping experience?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How easy was it to find the products you were looking for?",
        required: true,
        options: [
          { value: 1, label: "Very Difficult", emoji: "😠" },
          { value: 2, label: "Difficult", emoji: "😞" },
          { value: 3, label: "Moderate", emoji: "😐" },
          { value: 4, label: "Easy", emoji: "🙂" },
          { value: 5, label: "Very Easy", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the checkout process?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How satisfied are you with the product quality?",
        required: true,
        options: [
          { value: 1, label: "Very Unsatisfied", emoji: "😠" },
          { value: 2, label: "Unsatisfied", emoji: "😞" },
          { value: 3, label: "Neutral", emoji: "😐" },
          { value: 4, label: "Satisfied", emoji: "🙂" },
          { value: 5, label: "Very Satisfied", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the delivery speed?",
        required: true,
        options: [
          { value: 1, label: "Very Slow", emoji: "😠" },
          { value: 2, label: "Slow", emoji: "😞" },
          { value: 3, label: "Moderate", emoji: "😐" },
          { value: 4, label: "Fast", emoji: "🙂" },
          { value: 5, label: "Very Fast", emoji: "🥰" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What type of products did you purchase?",
        required: false,
        options: [
          { value: "electronics", label: "Electronics" },
          { value: "clothing", label: "Clothing & Fashion" },
          { value: "home", label: "Home & Garden" },
          { value: "books", label: "Books & Media" },
          { value: "sports", label: "Sports & Outdoor" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "multiple_choice",
        text: "How did you discover our website?",
        required: false,
        options: [
          { value: "search", label: "Search Engine" },
          { value: "social", label: "Social Media" },
          { value: "advertisement", label: "Advertisement" },
          { value: "email", label: "Email Marketing" },
          { value: "referral", label: "Friend/Family" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "text",
        text: "What features would you like to see added to our website?",
        required: false
      },
      {
        type: "text",
        text: "How can we improve your shopping experience?",
        required: false
      }
    ]
  },
  customer_support: {
    title: "Customer Support Experience Survey",
    description: "Evaluate customer support quality, response time, and resolution effectiveness",
    questions: [
      {
        type: "emoji_scale",
        text: "How satisfied are you with our customer support?",
        required: true,
        options: [
          { value: 1, label: "Very Unsatisfied", emoji: "😠" },
          { value: 2, label: "Unsatisfied", emoji: "😞" },
          { value: 3, label: "Neutral", emoji: "😐" },
          { value: 4, label: "Satisfied", emoji: "🙂" },
          { value: 5, label: "Very Satisfied", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How quickly was your issue resolved?",
        required: true,
        options: [
          { value: 1, label: "Very Slow", emoji: "😠" },
          { value: 2, label: "Slow", emoji: "😞" },
          { value: 3, label: "Moderate", emoji: "😐" },
          { value: 4, label: "Fast", emoji: "🙂" },
          { value: 5, label: "Very Fast", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How knowledgeable was the support representative?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😠" },
          { value: 2, label: "Fair", emoji: "😞" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How professional was the support representative?",
        required: true,
        options: [
          { value: 1, label: "Unprofessional", emoji: "😠" },
          { value: 2, label: "Somewhat Professional", emoji: "😞" },
          { value: 3, label: "Professional", emoji: "😐" },
          { value: 4, label: "Very Professional", emoji: "🙂" },
          { value: 5, label: "Extremely Professional", emoji: "🥰" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What was the nature of your support request?",
        required: false,
        options: [
          { value: "technical", label: "Technical Issue" },
          { value: "billing", label: "Billing/Payment" },
          { value: "product", label: "Product Information" },
          { value: "refund", label: "Refund/Return" },
          { value: "account", label: "Account Issue" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "multiple_choice",
        text: "How did you contact our support team?",
        required: false,
        options: [
          { value: "phone", label: "Phone Call" },
          { value: "email", label: "Email" },
          { value: "chat", label: "Live Chat" },
          { value: "ticket", label: "Support Ticket" },
          { value: "social", label: "Social Media" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "text",
        text: "What was your support issue?",
        required: false
      },
      {
        type: "text",
        text: "How can we improve our customer support?",
        required: false
      }
    ]
  },
  employee_feedback: {
    title: "Employee Feedback Survey",
    description: "Gather feedback from your team members",
    questions: [
      {
        type: "emoji_scale",
        text: "How satisfied are you with your current role?",
        required: true,
        options: [
          { value: 1, label: "Very Unsatisfied", emoji: "😠" },
          { value: 2, label: "Unsatisfied", emoji: "😞" },
          { value: 3, label: "Neutral", emoji: "😐" },
          { value: 4, label: "Satisfied", emoji: "🙂" },
          { value: 5, label: "Very Satisfied", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the work-life balance?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "⭐" },
          { value: 2, label: "Fair", emoji: "⭐⭐" },
          { value: 3, label: "Good", emoji: "⭐⭐⭐" },
          { value: 4, label: "Very Good", emoji: "⭐⭐⭐⭐" },
          { value: 5, label: "Excellent", emoji: "⭐⭐⭐⭐⭐" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What would you like to see improved?",
        required: false,
        options: [
          { value: "communication", label: "Communication" },
          { value: "training", label: "Training & Development" },
          { value: "benefits", label: "Benefits & Compensation" },
          { value: "culture", label: "Company Culture" },
          { value: "tools", label: "Tools & Resources" }
        ]
      },
      {
        type: "text",
        text: "Any additional suggestions for improvement?",
        required: false
      }
    ]
  },
  product_feedback: {
    title: "Product Feedback Survey",
    description: "Collect feedback about your products or services",
    questions: [
      {
        type: "emoji_scale",
        text: "How would you rate the overall quality of our product?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "⭐" },
          { value: 2, label: "Fair", emoji: "⭐⭐" },
          { value: 3, label: "Good", emoji: "⭐⭐⭐" },
          { value: 4, label: "Very Good", emoji: "⭐⭐⭐⭐" },
          { value: 5, label: "Excellent", emoji: "⭐⭐⭐⭐⭐" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How easy was it to use our product?",
        required: true,
        options: [
          { value: 1, label: "Very Difficult", emoji: "😠" },
          { value: 2, label: "Difficult", emoji: "😞" },
          { value: 3, label: "Moderate", emoji: "😐" },
          { value: 4, label: "Easy", emoji: "🙂" },
          { value: 5, label: "Very Easy", emoji: "🥰" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What features do you use most often?",
        required: false,
        options: [
          { value: "core", label: "Core Features" },
          { value: "advanced", label: "Advanced Features" },
          { value: "mobile", label: "Mobile App" },
          { value: "web", label: "Web Interface" },
          { value: "api", label: "API Integration" }
        ]
      },
      {
        type: "text",
        text: "What features would you like to see added?",
        required: false
      }
    ]
  },
  event_feedback: {
    title: "Event Feedback Survey",
    description: "Gather feedback from event attendees",
    questions: [
      {
        type: "emoji_scale",
        text: "How would you rate the overall event experience?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "⭐" },
          { value: 2, label: "Fair", emoji: "⭐⭐" },
          { value: 3, label: "Good", emoji: "⭐⭐⭐" },
          { value: 4, label: "Very Good", emoji: "⭐⭐⭐⭐" },
          { value: 5, label: "Excellent", emoji: "⭐⭐⭐⭐⭐" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How likely are you to attend future events?",
        required: true,
        options: [
          { value: 1, label: "Not likely", emoji: "👎" },
          { value: 2, label: "Somewhat likely", emoji: "👍" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What was your favorite part of the event?",
        required: false,
        options: [
          { value: "keynotes", label: "Keynote Speakers" },
          { value: "networking", label: "Networking Sessions" },
          { value: "workshops", label: "Workshops" },
          { value: "exhibits", label: "Exhibits" },
          { value: "food", label: "Food & Refreshments" }
        ]
      },
      {
        type: "text",
        text: "What would you like to see at future events?",
        required: false
      }
    ]
  },
  website_feedback: {
    title: "Website Feedback Survey",
    description: "Get feedback about your website user experience",
    questions: [
      {
        type: "emoji_scale",
        text: "How would you rate the overall website experience?",
        required: true,
        options: [
          { value: 1, label: "Poor", emoji: "😞" },
          { value: 2, label: "Fair", emoji: "😕" },
          { value: 3, label: "Good", emoji: "😐" },
          { value: 4, label: "Very Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "😄" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How easy was it to find what you were looking for?",
        required: true,
        options: [
          { value: 1, label: "Very Difficult", emoji: "😠" },
          { value: 2, label: "Difficult", emoji: "😞" },
          { value: 3, label: "Moderate", emoji: "😐" },
          { value: 4, label: "Easy", emoji: "🙂" },
          { value: 5, label: "Very Easy", emoji: "🥰" }
        ]
      },
      {
        type: "multiple_choice",
        text: "What was the main reason for your visit?",
        required: false,
        options: [
          { value: "information", label: "Find Information" },
          { value: "purchase", label: "Make a Purchase" },
          { value: "support", label: "Get Support" },
          { value: "research", label: "Research Products" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "text",
        text: "What improvements would make our website better?",
        required: false
      }
    ]
  },
  banking_feedback: {
    title: "Banking Experience Survey",
    description: "Gather feedback about your banking experience and services",
    questions: [
      {
        type: "emoji_scale",
        text: "How satisfied are you with the experience you received at Platinum Banking?",
        required: true,
        options: [
          { value: 1, label: "Very Unsatisfied", emoji: "😠" },
          { value: 2, label: "Unsatisfied", emoji: "😞" },
          { value: 3, label: "Neutral", emoji: "😐" },
          { value: 4, label: "Satisfied", emoji: "🙂" },
          { value: 5, label: "Very Satisfied", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "Based on your experience at Platinum Banking, how likely are you to recommend us to your friends and colleagues?",
        required: true,
        options: [
          { value: 1, label: "1", emoji: "😞" },
          { value: 2, label: "2", emoji: "😞" },
          { value: 3, label: "3", emoji: "😞" },
          { value: 4, label: "4", emoji: "😞" },
          { value: 5, label: "5", emoji: "😞" },
          { value: 6, label: "6", emoji: "😞" },
          { value: 7, label: "7", emoji: "😐" },
          { value: 8, label: "8", emoji: "😐" },
          { value: 9, label: "9", emoji: "😊" },
          { value: 10, label: "10", emoji: "😊" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How easy was it to interact with us?",
        required: true,
        options: [
          { value: 1, label: "Very Difficult", emoji: "😠" },
          { value: 2, label: "Difficult", emoji: "😞" },
          { value: 3, label: "Moderate", emoji: "😐" },
          { value: 4, label: "Easy", emoji: "🙂" },
          { value: 5, label: "Very Easy", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the quality of our customer service?",
        required: true,
        options: [
          { value: 1, label: "Very Poor", emoji: "😠" },
          { value: 2, label: "Poor", emoji: "😞" },
          { value: 3, label: "Average", emoji: "😐" },
          { value: 4, label: "Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How satisfied are you with our banking products and services?",
        required: true,
        options: [
          { value: 1, label: "Very Unsatisfied", emoji: "😠" },
          { value: 2, label: "Unsatisfied", emoji: "😞" },
          { value: 3, label: "Neutral", emoji: "😐" },
          { value: 4, label: "Satisfied", emoji: "🙂" },
          { value: 5, label: "Very Satisfied", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How likely are you to use our services again in the future?",
        required: true,
        options: [
          { value: 1, label: "1", emoji: "😞" },
          { value: 2, label: "2", emoji: "😞" },
          { value: 3, label: "3", emoji: "😞" },
          { value: 4, label: "4", emoji: "😞" },
          { value: 5, label: "5", emoji: "😞" },
          { value: 6, label: "6", emoji: "😞" },
          { value: 7, label: "7", emoji: "😐" },
          { value: 8, label: "8", emoji: "😐" },
          { value: 9, label: "9", emoji: "😊" },
          { value: 10, label: "10", emoji: "😊" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the speed of our transaction processing?",
        required: true,
        options: [
          { value: 1, label: "Very Slow", emoji: "😠" },
          { value: 2, label: "Slow", emoji: "😞" },
          { value: 3, label: "Moderate", emoji: "😐" },
          { value: 4, label: "Fast", emoji: "🙂" },
          { value: 5, label: "Very Fast", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How satisfied are you with our online banking platform?",
        required: true,
        options: [
          { value: 1, label: "Very Unsatisfied", emoji: "😠" },
          { value: 2, label: "Unsatisfied", emoji: "😞" },
          { value: 3, label: "Neutral", emoji: "😐" },
          { value: 4, label: "Satisfied", emoji: "🙂" },
          { value: 5, label: "Very Satisfied", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How would you rate the security of our banking services?",
        required: true,
        options: [
          { value: 1, label: "Very Poor", emoji: "😠" },
          { value: 2, label: "Poor", emoji: "😞" },
          { value: 3, label: "Average", emoji: "😐" },
          { value: 4, label: "Good", emoji: "🙂" },
          { value: 5, label: "Excellent", emoji: "🥰" }
        ]
      },
      {
        type: "emoji_scale",
        text: "How likely are you to recommend our mobile banking app?",
        required: true,
        options: [
          { value: 1, label: "1", emoji: "😞" },
          { value: 2, label: "2", emoji: "😞" },
          { value: 3, label: "3", emoji: "😞" },
          { value: 4, label: "4", emoji: "😞" },
          { value: 5, label: "5", emoji: "😞" },
          { value: 6, label: "6", emoji: "😞" },
          { value: 7, label: "7", emoji: "😐" },
          { value: 8, label: "8", emoji: "😐" },
          { value: 9, label: "9", emoji: "😊" },
          { value: 10, label: "10", emoji: "😊" }
        ]
      },
      {
        type: "multiple_choice",
        text: "Which banking service do you use most frequently?",
        required: false,
        options: [
          { value: "savings", label: "Savings Account" },
          { value: "checking", label: "Checking Account" },
          { value: "loans", label: "Personal Loans" },
          { value: "credit", label: "Credit Cards" },
          { value: "investment", label: "Investment Services" },
          { value: "other", label: "Other Services" }
        ]
      },
      {
        type: "multiple_choice",
        text: "How did you first learn about our banking services?",
        required: false,
        options: [
          { value: "referral", label: "Friend/Family Referral" },
          { value: "advertising", label: "Advertising/Marketing" },
          { value: "online", label: "Online Search" },
          { value: "branch", label: "Branch Visit" },
          { value: "social", label: "Social Media" },
          { value: "other", label: "Other" }
        ]
      },
      {
        type: "text",
        text: "We would love to hear from you, please provide your comments. (Optional)",
        required: false
      },
      {
        type: "phone",
        text: "Please provide your phone number for follow-up (Optional)",
        required: false,
        options: [
          { value: "country_code", label: "Country Code", default: "+233" },
          { value: "phone_number", label: "Phone Number" }
        ]
      }
    ]
  }
};

// POST /api/templates - Create a new template
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    if (!title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Title and questions array are required' });
    }
    
    // Generate a unique template ID
    const templateId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add the new template to the templates object
    surveyTemplates[templateId] = {
      id: templateId,
      title,
      description,
      questions: questions.map((q, index) => ({
        ...q,
        id: index + 1
      }))
    };
    
    res.status(201).json({
      message: 'Template created successfully',
      template: surveyTemplates[templateId]
    });
    
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// GET /api/templates - Get all available templates
router.get('/', auth, async (req, res) => {
  try {
    const templates = Object.keys(surveyTemplates).map(key => ({
      id: key,
      ...surveyTemplates[key]
    }));
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/templates/:id - Get a specific template
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!surveyTemplates[id]) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({
      id,
      ...surveyTemplates[id]
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// POST /api/templates/:id/create - Create a survey from template
router.post('/:id/create', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    if (!surveyTemplates[id]) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const template = surveyTemplates[id];
    
    // Create the survey
    const surveyResult = await query(
      `INSERT INTO surveys (user_id, title, description, status, theme, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        req.user.id,
        title || template.title,
        description || template.description,
        'draft',
        JSON.stringify({ primaryColor: '#3B82F6', secondaryColor: '#1E40AF' }),
        JSON.stringify({ allowAnonymous: true, showProgress: true })
      ]
    );
    
    const surveyId = surveyResult.rows[0].id;
    
    // Create questions from template
    for (let i = 0; i < template.questions.length; i++) {
      const question = template.questions[i];
      await query(
        `INSERT INTO questions (survey_id, title, type, required, options, order_index)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          surveyId,
          question.text,
          question.type,
          question.required,
          JSON.stringify(question.options || []),
          i + 1
        ]
      );
    }
    
    res.json({
      message: 'Survey created from template successfully',
      surveyId,
      survey: {
        id: surveyId,
        title: title || template.title,
        description: description || template.description
      }
    });
    
  } catch (error) {
    console.error('Error creating survey from template:', error);
    res.status(500).json({ error: 'Failed to create survey from template' });
  }
});

// POST /api/templates/:id/customize - Save customized template
router.post('/:id/customize', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;
    
    if (!surveyTemplates[id]) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Create a new survey with the customized template
    const surveyResult = await query(
      `INSERT INTO surveys (user_id, title, description, status, theme, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        req.user.id,
        title,
        description,
        'draft',
        JSON.stringify({ primaryColor: '#3B82F6', secondaryColor: '#1E40AF' }),
        JSON.stringify({ allowAnonymous: true, showProgress: true })
      ]
    );
    
    const surveyId = surveyResult.rows[0].id;
    
    // Create questions from customized template
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      await query(
        `INSERT INTO questions (survey_id, title, type, required, options, order_index, settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          surveyId,
          question.text || question.title,
          question.type,
          question.required,
          JSON.stringify(question.options || []),
          i + 1,
          JSON.stringify({
            commentsPlaceholder: question.commentsPlaceholder,
            phonePlaceholder: question.phonePlaceholder,
            countryCode: question.countryCode
          })
        ]
      );
    }
    
    res.json({
      message: 'Customized template saved successfully',
      surveyId,
      survey: {
        id: surveyId,
        title,
        description
      }
    });
    
  } catch (error) {
    console.error('Error saving customized template:', error);
    res.status(500).json({ error: 'Failed to save customized template' });
  }
});

// PUT /api/templates/:id - Update a template
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;
    
    if (!surveyTemplates[id]) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Update template (in a real app, you'd store templates in database)
    surveyTemplates[id] = {
      ...surveyTemplates[id],
      title: title || surveyTemplates[id].title,
      description: description || surveyTemplates[id].description,
      questions: questions || surveyTemplates[id].questions
    };
    
    res.json({
      message: 'Template updated successfully',
      template: { id, ...surveyTemplates[id] }
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// POST /api/templates/:id/duplicate - Duplicate a template
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    if (!surveyTemplates[id]) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const originalTemplate = surveyTemplates[id];
    const newId = `template_${Date.now()}`;
    
    // Create duplicate template
    surveyTemplates[newId] = {
      ...originalTemplate,
      title: title || `${originalTemplate.title} (Copy)`,
      description: description || originalTemplate.description
    };
    
    res.json({
      message: 'Template duplicated successfully',
      template: { id: newId, ...surveyTemplates[newId] }
    });
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

// DELETE /api/templates/:id - Delete a template
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!surveyTemplates[id]) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Delete template (in a real app, you'd delete from database)
    delete surveyTemplates[id];
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

module.exports = router;
