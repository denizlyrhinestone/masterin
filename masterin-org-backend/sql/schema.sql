-- Users Table (from previous subtask)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('student', 'teacher', 'admin')) NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Modified Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Assuming admin/teacher creates courses
    subject VARCHAR(100),      -- New field
    grade_level VARCHAR(50),   -- New field (e.g., 'Beginner', 'Intermediate', '9-12', 'University')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refined Marketplace Products Table
CREATE TABLE IF NOT EXISTS marketplace_products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_path VARCHAR(1024), -- Path to uploaded file or link
    file_type VARCHAR(50),   -- e.g., 'pdf', 'txt', 'video_link', 'google_doc_link'
    thumbnail_url VARCHAR(1024) NULL,
    tags TEXT[] NULL,        -- For keywords, e.g., ARRAY['math', 'algebra']
    subject VARCHAR(100) NULL,
    grade_level VARCHAR(50) NULL, -- e.g., 'K-2', '6-8', '9-12', 'University'
    status VARCHAR(50) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'archived')),
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id VARCHAR(255) NOT NULL DEFAULT 'diagnostic',
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple-choice',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Question Options Table
CREATE TABLE IF NOT EXISTS question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Quiz Attempts Table
CREATE TABLE IF NOT EXISTS student_quiz_attempts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id VARCHAR(255) NOT NULL,
    score INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Quiz Answers Table
CREATE TABLE IF NOT EXISTS student_quiz_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES student_quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id INTEGER REFERENCES question_options(id) ON DELETE SET NULL,
    answer_text TEXT,
    is_correct BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Career Paths Table
CREATE TABLE IF NOT EXISTS career_paths (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    related_skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning Pathways Table
CREATE TABLE IF NOT EXISTS learning_pathways (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_path_id INTEGER REFERENCES career_paths(id) ON DELETE SET NULL,
    path_data JSONB,
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, career_path_id)
);

-- Student Progress Table
CREATE TABLE IF NOT EXISTS student_progress (
    id SERIAL PRIMARY KEY,
    learning_pathway_id INTEGER NOT NULL REFERENCES learning_pathways(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'skipped')),
    progress_percentage INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(learning_pathway_id, course_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id ON marketplace_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_subject ON marketplace_products(subject);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_grade_level ON marketplace_products(grade_level);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON marketplace_products(status);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_student_quiz_attempts_student_id ON student_quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_quiz_answers_attempt_id ON student_quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_career_paths_name ON career_paths(name);
CREATE INDEX IF NOT EXISTS idx_learning_pathways_student_id ON learning_pathways(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_learning_pathway_id ON student_progress(learning_pathway_id);

-- Function to update 'updated_at' timestamp (from previous subtask, ensure it's here)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables that have updated_at
DO $$
DECLARE
  t_name TEXT;
BEGIN
  FOR t_name IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'updated_at'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_%s_updated_at ON %I; CREATE TRIGGER set_%s_updated_at
                    BEFORE UPDATE ON %I
                    FOR EACH ROW
                    EXECUTE FUNCTION trigger_set_timestamp();',
                    replace(t_name, '_', ''), t_name, replace(t_name, '_', ''), t_name);
  END LOOP;
END;
$$;

-- SEED DATA --

-- Sample Courses (assuming user with ID 1 is an admin/teacher)
-- Ensure user 1 exists and is appropriate for creating courses.
INSERT INTO courses (id, title, description, created_by, subject, grade_level) VALUES
(1, 'Introduction to Python', 'Learn the basics of Python programming, syntax, and control structures.', 1, 'Computer Science', 'High School'),
(2, 'Web Development Fundamentals', 'Understand HTML, CSS, and basic JavaScript for building web pages.', 1, 'Web Development', 'High School'),
(3, 'Data Science 101', 'An introduction to data science concepts, data analysis, and visualization.', 1, 'Data Science', 'University'),
(4, 'Elementary Math Fun', 'Engaging activities for young learners focusing on numbers and basic operations.', 1, 'Mathematics', 'K-2'),
(5, 'Middle School Science Projects', 'A collection of hands-on science projects for grades 6-8.', 1, 'Science', 'Middle School'),
(6, 'American History: Civil War', 'In-depth study of the American Civil War, its causes and effects.', 1, 'History', 'High School'),
(7, 'Creative Writing Workshop', 'Develop your creative writing skills through prompts and exercises.', 1, 'Language Arts', 'All Grades'),
(8, 'Introduction to Digital Art', 'Learn the basics of digital drawing and painting techniques.', 1, 'Art', 'Middle School')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    created_by = EXCLUDED.created_by,
    subject = EXCLUDED.subject,
    grade_level = EXCLUDED.grade_level,
    updated_at = CURRENT_TIMESTAMP;

-- Sample Career Paths
INSERT INTO career_paths (id, name, description, related_skills) VALUES
(1, 'Software Engineer', 'Designs, develops, and maintains software applications.', ARRAY['programming', 'problem-solving', 'algorithms', 'data structures']),
(2, 'Data Analyst', 'Collects, processes, and analyzes data to provide actionable insights.', ARRAY['data analysis', 'statistics', 'SQL', 'visualization', 'spreadsheets']),
(3, 'UX/UI Designer', 'Creates user-centered designs for websites, applications, and other digital products.', ARRAY['design thinking', 'user research', 'prototyping', 'wireframing', 'visual design']),
(4, 'Graphic Designer', 'Creates visual concepts to communicate ideas that inspire, inform, or captivate consumers.', ARRAY['typography', 'color theory', 'layout design', 'branding', 'Adobe Creative Suite']),
(5, 'Research Scientist', 'Conducts scientific research in various fields to advance knowledge.', ARRAY['critical thinking', 'experimentation', 'data analysis', 'scientific writing', 'lab techniques']),
(6, 'Medical Doctor', 'Diagnoses and treats illnesses and injuries, and provides preventative care.', ARRAY['medical knowledge', 'patient care', 'problem-solving', 'communication', 'ethics']),
(7, 'K-12 Teacher', 'Educates students at the elementary, middle, or high school level.', ARRAY['pedagogy', 'classroom management', 'curriculum development', 'communication', 'patience']),
(8, 'Entrepreneur', 'Starts and manages a new business venture, assuming risks for profit.', ARRAY['business strategy', 'leadership', 'financial management', 'marketing', 'innovation']),
(9, 'Digital Marketer', 'Develops and implements online marketing strategies to promote products or services.', ARRAY['SEO', 'SEM', 'social media marketing', 'content creation', 'analytics']),
(10, 'Registered Nurse', 'Provides direct patient care in hospitals, clinics, or other healthcare settings.', ARRAY['patient assessment', 'medical procedures', 'empathy', 'critical thinking', 'teamwork'])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    related_skills = EXCLUDED.related_skills,
    updated_at = CURRENT_TIMESTAMP;

-- Sample Diagnostic Quiz Questions
INSERT INTO questions (id, quiz_id, question_text, question_type) VALUES
(1, 'diagnostic_v1', 'What is your primary interest in technology?', 'multiple-choice'),
(2, 'diagnostic_v1', 'Are you comfortable with basic algebra?', 'true-false'),
(3, 'diagnostic_v1', 'Which of these activities do you enjoy most?', 'multiple-choice')
ON CONFLICT (id) DO UPDATE SET
    quiz_id = EXCLUDED.quiz_id,
    question_text = EXCLUDED.question_text,
    question_type = EXCLUDED.question_type,
    updated_at = CURRENT_TIMESTAMP;

-- Sample Options for Question 1 (ID 1)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(1, 'Building websites and apps', FALSE), (1, 'Analyzing data and finding patterns', FALSE),
(1, 'Designing digital products', FALSE), (1, 'Understanding how computers work at a low level', FALSE)
ON CONFLICT (question_id, option_text) DO NOTHING;

-- Sample Options for Question 2 (ID 2)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(2, 'True', FALSE), (2, 'False', FALSE)
ON CONFLICT (question_id, option_text) DO NOTHING;

-- Sample Options for Question 3 (ID 3)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(3, 'Solving puzzles and logic problems', FALSE), (3, 'Creating art or visual designs', FALSE),
(3, 'Writing stories or explaining complex topics', FALSE), (3, 'Organizing information and making plans', FALSE)
ON CONFLICT (question_id, option_text) DO NOTHING;

-- Sample Marketplace Products (assuming user with ID 1 is a 'teacher')
INSERT INTO marketplace_products
  (seller_id, title, description, price, file_path, file_type, thumbnail_url, tags, subject, grade_level, status)
VALUES
(
  1,
  'Algebra Worksheet Pack - Grade 7',
  'A comprehensive pack of 20 algebra worksheets covering equations, inequalities, and functions for Grade 7 students.',
  4.99, '/uploads/algebra_grade7_pack.pdf', 'pdf', '/thumbnails/algebra_pack_thumb.png',
  ARRAY['algebra', 'math', 'grade 7', 'worksheet', 'equations'], 'Mathematics', 'Middle School', 'approved'
),
(
  1,
  'Introduction to Python - Curriculum Guide',
  'A detailed lesson plan and curriculum guide for teaching an introductory Python course to beginners. Includes links to recommended videos and projects.',
  12.50, '/uploads/python_intro_plan.docx', 'docx', '/thumbnails/python_plan_thumb.png',
  ARRAY['python', 'programming', 'curriculum', 'beginner', 'coding'], 'Computer Science', 'High School', 'approved'
),
(
  1,
  'Creative Writing Prompts - All Ages',
  '100 engaging creative writing prompts suitable for various age groups to spark imagination and storytelling.',
  3.99, 'https://docs.google.com/document/d/examplelink123', 'google_doc_link', NULL,
  ARRAY['writing', 'creative writing', 'prompts', 'storytelling'], 'Language Arts', 'All Grades', 'pending_review'
),
(
  1,
  'Elementary Science Experiments',
  'A collection of 15 simple and safe science experiments for K-2 students with easy-to-follow instructions.',
  5.00, '/uploads/elementary_science_experiments.pdf', 'pdf', '/thumbnails/science_experiments_thumb.png',
  ARRAY['science', 'experiments', 'k-2', 'elementary'], 'Science', 'K-2', 'approved'
),
(
  1,
  'US History Flashcards: Key Events',
  'Set of 100 flashcards covering key events and figures in US History. Ideal for High School exam prep.',
  7.25, '/uploads/us_history_flashcards.zip', 'zip', '/thumbnails/history_flashcards_thumb.png',
  ARRAY['history', 'us history', 'flashcards', 'exam prep'], 'History', 'High School', 'approved'
),
(
  1,
  'Digital Art Techniques for Beginners',
  'A step-by-step guide to basic digital art techniques using free software. Perfect for middle schoolers.',
  6.00, '/uploads/digital_art_guide.pdf', 'pdf', NULL,
  ARRAY['art', 'digital art', 'beginner', 'drawing'], 'Art', 'Middle School', 'pending_review'
)
ON CONFLICT (title) DO UPDATE SET -- Using title as conflict target for simplicity in seed data
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    file_path = EXCLUDED.file_path,
    file_type = EXCLUDED.file_type,
    thumbnail_url = EXCLUDED.thumbnail_url,
    tags = EXCLUDED.tags,
    subject = EXCLUDED.subject,
    grade_level = EXCLUDED.grade_level,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- Notes:
-- - Added more diverse seed data for `career_paths`.
-- - Updated `courses` and `marketplace_products` seed data with more examples and ensured `subject` and `grade_level` are populated.
-- - Used `ON CONFLICT (id) DO UPDATE` for tables where `id` is explicitly set in seed data.
-- - Used `ON CONFLICT (title) DO UPDATE` for `marketplace_products` for simplicity in this seed data context.
--   In a real app, a more robust conflict target might be needed or handled differently.
-- - Ensured `seller_id` in `marketplace_products` refers to an existing user (user ID 1 assumed to be a teacher).
-- - Added more variety to tags, subjects, and grade levels.
