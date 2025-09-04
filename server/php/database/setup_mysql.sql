-- MySQL Database Setup for GLICO Survey System
-- Run this script to create the database and tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS glico_survey CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE glico_survey;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Survey templates table
CREATE TABLE IF NOT EXISTS survey_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public TINYINT(1) DEFAULT 0,
    questions_data JSON NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public TINYINT(1) DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    questions_data JSON NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    options JSON NULL,
    required TINYINT(1) DEFAULT 0,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    question_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    response_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value JSON NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- Sessions table for tracking survey responses
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    survey_id INT NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- Tasks table for task management
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    survey_id INT NULL,
    assigned_to INT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    due_date TIMESTAMP NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_surveys_created_by ON surveys(created_by);
CREATE INDEX idx_surveys_is_public ON surveys(is_public);
CREATE INDEX idx_questions_survey_id ON questions(survey_id);
CREATE INDEX idx_questions_order_index ON questions(order_index);
CREATE INDEX idx_responses_survey_id ON responses(survey_id);
CREATE INDEX idx_responses_session_id ON responses(session_id);
CREATE INDEX idx_templates_created_by ON survey_templates(created_by);
CREATE INDEX idx_templates_is_public ON survey_templates(is_public);
CREATE INDEX idx_uploads_uploaded_by ON uploads(uploaded_by);
CREATE INDEX idx_tasks_survey_id ON tasks(survey_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Insert default super admin user
INSERT INTO users (email, password_hash, full_name, role, created_at) VALUES 
('admin@glico.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin', 'super_admin', NOW())
ON DUPLICATE KEY UPDATE id = id;

-- Insert sample survey templates
INSERT INTO survey_templates (title, description, category, is_public, questions_data, created_by, created_at) VALUES
('Customer Feedback Survey', 'Comprehensive customer satisfaction survey', 'Customer Service', 1, '[]', 1, NOW()),
('Employee Feedback Form', 'Internal employee satisfaction and feedback', 'Human Resources', 1, '[]', 1, NOW()),
('Product Feedback Survey', 'Product evaluation and improvement feedback', 'Product Development', 1, '[]', 1, NOW()),
('Event Feedback Survey', 'Post-event evaluation and feedback', 'Events', 1, '[]', 1, NOW()),
('Website Usability Survey', 'Website user experience and navigation feedback', 'Digital', 1, '[]', 1, NOW()),
('Restaurant Experience Survey', 'Dining experience and food quality feedback', 'Hospitality', 1, '[]', 1, NOW()),
('Hotel Stay Feedback', 'Accommodation and service quality feedback', 'Hospitality', 1, '[]', 1, NOW()),
('Mobile App Feedback', 'Mobile application user experience feedback', 'Digital', 1, '[]', 1, NOW()),
('Educational Course Feedback', 'Course content and instructor evaluation', 'Education', 1, '[]', 1, NOW()),
('Healthcare Feedback Survey', 'Medical service and patient experience feedback', 'Healthcare', 1, '[]', 1, NOW())
ON DUPLICATE KEY UPDATE id = id;

-- Insert sample surveys
INSERT INTO surveys (title, description, is_public, questions_data, created_by, created_at) VALUES
('Sample Survey', 'A sample survey for testing purposes', 0, '[]', 1, NOW()),
('Customer Satisfaction Survey', 'Measure customer satisfaction with our services', 1, '[]', 1, NOW()),
('Employee Feedback Form', 'Internal feedback from our team members', 0, '[]', 1, NOW()),
('Product Feedback Survey', 'Gather feedback on our product features', 1, '[]', 1, NOW()),
('Event Feedback Survey', 'Evaluate our recent event success', 0, '[]', 1, NOW()),
('Website Usability Survey', 'Improve our website user experience', 1, '[]', 1, NOW()),
('Restaurant Experience Survey', 'Dining experience evaluation', 1, '[]', 1, NOW()),
('Hotel Stay Feedback', 'Accommodation service feedback', 0, '[]', 1, NOW()),
('Mobile App Feedback', 'Mobile application user experience', 1, '[]', 1, NOW()),
('Educational Course Feedback', 'Course evaluation and improvement', 0, '[]', 1, NOW()),
('GLICO Banking Services Survey', 'Customer feedback on banking services', 1, '[]', 1, NOW()),
('GLICO Insurance Feedback', 'Insurance service evaluation', 1, '[]', 1, NOW())
ON DUPLICATE KEY UPDATE id = id;

-- Insert sample questions for GLICO surveys
INSERT INTO questions (survey_id, type, title, options, required, order_index, created_at) VALUES
(11, 'multiple_choice', 'Which banking service do you use most frequently?', '["Online Banking", "Mobile App", "Branch Services", "ATM Services", "Phone Banking"]', 1, 1, NOW()),
(11, 'emoji_scale', 'How satisfied are you with our mobile banking app?', '["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"]', 1, 2, NOW()),
(11, 'likert_scale', 'How would you rate the security of our banking services?', '["Poor", "Fair", "Good", "Very Good", "Excellent"]', 1, 3, NOW()),
(11, 'text', 'What additional banking features would you like to see?', NULL, 0, 4, NOW()),
(11, 'multiple_choice', 'How likely are you to recommend GLICO Banking to others?', '["Very Unlikely", "Unlikely", "Neutral", "Likely", "Very Likely"]', 1, 5, NOW()),
(12, 'multiple_choice', 'Which insurance product do you have?', '["Life Insurance", "Health Insurance", "Auto Insurance", "Home Insurance", "Business Insurance"]', 1, 1, NOW()),
(12, 'emoji_scale', 'How satisfied are you with your insurance coverage?', '["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"]', 1, 2, NOW()),
(12, 'likert_scale', 'How would you rate our claims processing service?', '["Poor", "Fair", "Good", "Very Good", "Excellent"]', 1, 3, NOW()),
(12, 'text', 'What improvements would you suggest for our insurance services?', NULL, 0, 4, NOW())
ON DUPLICATE KEY UPDATE id = id;

-- Update questions_data in surveys with the actual questions
UPDATE surveys SET questions_data = (
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', q.id,
            'type', q.type,
            'title', q.title,
            'options', q.options,
            'required', q.required,
            'order_index', q.order_index
        )
    )
    FROM questions q
    WHERE q.survey_id = surveys.id AND q.is_deleted = 0
    ORDER BY q.order_index
) WHERE id IN (11, 12);

-- Update questions_data in templates with sample questions
UPDATE survey_templates SET questions_data = (
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'type', 'multiple_choice',
            'title', 'Sample Question',
            'options', '["Option 1", "Option 2", "Option 3"]',
            'required', 1
        )
    )
) WHERE id <= 10;

COMMIT;
