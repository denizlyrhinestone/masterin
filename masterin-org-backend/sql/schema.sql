-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('student', 'teacher', 'admin')) NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add columns to users table for profile information
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS full_name TEXT NULL, -- Changed VARCHAR(255) to TEXT for consistency with bio
    ADD COLUMN IF NOT EXISTS bio TEXT NULL,
    ADD COLUMN IF NOT EXISTS profile_picture_file_id INT NULL REFERENCES uploaded_files(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS social_links JSONB NULL;
-- Example of how social_links might be structured: {'linkedin': 'url', 'twitter': 'url', 'website': 'url'}

-- Ensure the updated_at trigger applies to the users table.
-- The generic loop at the end of this script should handle this:
-- CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
-- This is just a comment to confirm it's expected to be covered.


-- Courses Table (Modified for reviews/likes)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(100),
    grade_level VARCHAR(50),
    is_template BOOLEAN DEFAULT FALSE,
    is_publicly_browsable BOOLEAN DEFAULT TRUE,
    review_status VARCHAR(50) DEFAULT 'draft' CHECK (review_status IN ('draft', 'pending_review', 'peer_reviewed', 'admin_reviewed', 'published', 'rejected')),
    language VARCHAR(10) DEFAULT 'en',
    estimated_duration_hours INT,
    thumbnail_image_url TEXT,
    average_rating DECIMAL(3, 2) DEFAULT 0.00, -- New
    total_ratings INT DEFAULT 0,             -- New
    total_likes INT DEFAULT 0,               -- New
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Course Modules Table
CREATE TABLE IF NOT EXISTS course_modules (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);

-- Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    module_id INT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);

-- Lesson Content Blocks Table
CREATE TABLE IF NOT EXISTS lesson_content_blocks (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('text', 'video_embed', 'video_upload', 'slide_deck_embed', 'slide_deck_upload', 'quiz_ref', 'lab_ref', 'downloadable_ref', 'ai_generated_text')),
    content_data JSONB,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lesson_content_blocks_lesson_id ON lesson_content_blocks(lesson_id);

-- Uploaded Files Table
CREATE TABLE IF NOT EXISTS uploaded_files (
    id SERIAL PRIMARY KEY,
    uploader_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Will store S3 object key
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT,
    upload_status VARCHAR(50) DEFAULT 'pending' CHECK (upload_status IN ('pending', 'pending_s3_upload', 'processing', 'completed', 'error')), -- Added 'pending_s3_upload'
    storage_details JSONB NULL, -- Ensure it exists and allows NULL
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_uploader_user_id ON uploaded_files(uploader_user_id);

-- Note for existing databases: If the 'uploaded_files_status_check' constraint needs updating
-- you might need to drop the old constraint and add a new one, e.g.:
-- ALTER TABLE uploaded_files DROP CONSTRAINT uploaded_files_status_check; -- (Replace with actual constraint name if different)
-- ALTER TABLE uploaded_files ADD CONSTRAINT uploaded_files_status_check
-- CHECK (upload_status IN ('pending', 'pending_s3_upload', 'processing', 'completed', 'error'));

-- Course Quizzes Table
CREATE TABLE IF NOT EXISTS course_quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    course_id INT REFERENCES courses(id) ON DELETE SET NULL,
    module_id INT REFERENCES course_modules(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    general_quiz_id VARCHAR(255),
    course_quiz_id INT REFERENCES course_quizzes(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple-choice',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_quiz_type_exclusive CHECK (
        (general_quiz_id IS NOT NULL AND course_quiz_id IS NULL) OR
        (general_quiz_id IS NULL AND course_quiz_id IS NOT NULL) OR
        (general_quiz_id IS NULL AND course_quiz_id IS NULL)
    )
);
CREATE INDEX IF NOT EXISTS idx_questions_general_quiz_id ON questions(general_quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_course_quiz_id ON questions(course_quiz_id);

-- Labs & Simulations Table
CREATE TABLE IF NOT EXISTS labs_simulations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lab_type VARCHAR(100) DEFAULT 'interactive_simulation' CHECK (lab_type IN ('interactive_simulation', 'virtual_lab', 'external_link')),
    embed_url TEXT,
    config_json JSONB,
    created_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace Products Table
CREATE TABLE IF NOT EXISTS marketplace_products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_path VARCHAR(1024),
    file_type VARCHAR(50),
    thumbnail_url VARCHAR(1024) NULL,
    tags TEXT[] NULL,
    subject VARCHAR(100) NULL,
    grade_level VARCHAR(50) NULL,
    status VARCHAR(50) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'archived')),
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    content_file_ids INT[] DEFAULT ARRAY[]::INT[], -- New column for actual product files
    preview_file_ids INT[] DEFAULT ARRAY[]::INT[], -- New column for preview files (images, short docs, etc.)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Product Purchases Table (New Table)
CREATE TABLE IF NOT EXISTS user_product_purchases (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    purchased_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    price_paid DECIMAL(10, 2) NOT NULL,
    transaction_id TEXT NULL, -- For payment gateway reference
    UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_user_product_purchases_user_id ON user_product_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_product_purchases_product_id ON user_product_purchases(product_id);

-- Question Options Table
CREATE TABLE IF NOT EXISTS question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Student Quiz Attempts Table
CREATE TABLE IF NOT EXISTS student_quiz_attempts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_identifier VARCHAR(255) NOT NULL,
    quiz_type VARCHAR(50) DEFAULT 'general' CHECK (quiz_type IN ('general', 'course')),
    score INTEGER,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Student Quiz Answers Table
CREATE TABLE IF NOT EXISTS student_quiz_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES student_quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id INTEGER REFERENCES question_options(id) ON DELETE SET NULL,
    answer_text TEXT,
    is_correct BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Career Paths Table
CREATE TABLE IF NOT EXISTS career_paths (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    related_skills TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Learning Pathways Table
CREATE TABLE IF NOT EXISTS learning_pathways (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_path_id INTEGER REFERENCES career_paths(id) ON DELETE SET NULL,
    path_data JSONB,
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, career_path_id)
);

-- Student Progress Table (Simplified and Corrected)
CREATE TABLE IF NOT EXISTS student_progress (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Added student_id
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'skipped')), -- 'skipped' kept as it was already there
    progress_percentage INT DEFAULT 0,
    completed_lessons_count INT DEFAULT 0,
    total_lessons_count INT DEFAULT 0,
    completed_lesson_ids INT[] DEFAULT ARRAY[]::INT[],
    last_accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, course_id) -- Updated Unique constraint
);
-- Removed learning_pathway_id from this table. Progress on a course is independent of pathway context here.
-- Pathway progress itself can be a higher-level aggregation if needed.

-- Course Reviews Table (New)
CREATE TABLE IF NOT EXISTS course_reviews (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);

-- Course Likes Table (New)
CREATE TABLE IF NOT EXISTS course_likes (
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_course_likes_course_id ON course_likes(course_id);
CREATE INDEX IF NOT EXISTS idx_course_likes_user_id ON course_likes(user_id);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id ON marketplace_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_subject ON marketplace_products(subject);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_grade_level ON marketplace_products(grade_level);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON marketplace_products(status);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_student_quiz_attempts_student_id ON student_quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_quiz_answers_attempt_id ON student_quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_career_paths_name ON career_paths(name);
CREATE INDEX IF NOT EXISTS idx_learning_pathways_student_id ON learning_pathways(student_id);
-- CREATE INDEX IF NOT EXISTS idx_student_progress_learning_pathway_id ON student_progress(learning_pathway_id); -- This index is no longer needed
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id); -- Index for student_id
CREATE INDEX IF NOT EXISTS idx_student_progress_course_id ON student_progress(course_id); -- Index for course_id (often useful)


-- Function to update 'updated_at' timestamp
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
  col_name TEXT := 'updated_at';
BEGIN
  FOR t_name IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = col_name
  LOOP
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'set_' || replace(t_name, '_', '') || '_updated_at' AND tgrelid = t_name::regclass
    ) THEN
        EXECUTE format('CREATE TRIGGER set_%s_updated_at
                        BEFORE UPDATE ON %I
                        FOR EACH ROW
                        EXECUTE FUNCTION trigger_set_timestamp();',
                        replace(t_name, '_', ''), t_name);
    END IF;
  END LOOP;
END;
$$;

-- SEED DATA (Includes previous seed data + new course structure seeds)
INSERT INTO courses (id, title, description, created_by, subject, grade_level, is_template, is_publicly_browsable, review_status, language, estimated_duration_hours, thumbnail_image_url, average_rating, total_ratings, total_likes) VALUES
(1, 'Introduction to Python', 'Learn the basics of Python programming, syntax, and control structures.', 1, 'Computer Science', 'High School', FALSE, TRUE, 'published', 'en', 40, '/thumbnails/python_course.png', 4.5, 120, 250),
(2, 'Web Development Fundamentals', 'Understand HTML, CSS, and basic JavaScript for building web pages.', 1, 'Web Development', 'High School', FALSE, TRUE, 'published', 'en', 60, '/thumbnails/webdev_course.png', 4.2, 95, 180),
(3, 'Data Science 101', 'An introduction to data science concepts, data analysis, and visualization.', 1, 'Data Science', 'University', FALSE, TRUE, 'published', 'en', 80, '/thumbnails/datasci_course.png', 4.7, 75, 150),
(4, 'Elementary Math Fun', 'Engaging activities for young learners focusing on numbers and basic operations.', 1, 'Mathematics', 'K-2', FALSE, TRUE, 'published', 'en', 20, NULL, 0, 0, 5),
(5, 'Middle School Science Projects', 'A collection of hands-on science projects for grades 6-8.', 1, 'Science', 'Middle School', FALSE, TRUE, 'published', 'en', 30, NULL, 0,0,12),
(6, 'American History: Civil War', 'In-depth study of the American Civil War, its causes and effects.', 1, 'History', 'High School', FALSE, TRUE, 'published', 'en', 45, NULL,0,0,8),
(7, 'Creative Writing Workshop', 'Develop your creative writing skills through prompts and exercises.', 1, 'Language Arts', 'All Grades', FALSE, TRUE, 'published', 'en', 25, NULL,0,0,22),
(8, 'Introduction to Digital Art', 'Learn the basics of digital drawing and painting techniques.', 1, 'Art', 'Middle School', FALSE, TRUE, 'published', 'en', 35, NULL,0,0,15),
(9, 'Advanced Python Programming', 'Deep dive into advanced Python topics including OOP, decorators, and generators.', 1, 'Computer Science', 'University', FALSE, TRUE, 'published', 'en', 50, '/thumbnails/adv_python.png',0,0,0)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title, description = EXCLUDED.description, created_by = EXCLUDED.created_by, subject = EXCLUDED.subject, grade_level = EXCLUDED.grade_level,
    is_template = EXCLUDED.is_template, is_publicly_browsable = EXCLUDED.is_publicly_browsable, review_status = EXCLUDED.review_status, language = EXCLUDED.language,
    estimated_duration_hours = EXCLUDED.estimated_duration_hours, thumbnail_image_url = EXCLUDED.thumbnail_image_url,
    average_rating = EXCLUDED.average_rating, total_ratings = EXCLUDED.total_ratings, total_likes = EXCLUDED.total_likes, updated_at = CURRENT_TIMESTAMP;

INSERT INTO course_modules (id, course_id, title, description, order_index) VALUES
(1, 1, 'Module 1: Python Basics', 'Variables, data types, and basic syntax.', 0),
(2, 1, 'Module 2: Control Flow', 'Conditional statements and loops.', 1)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, title = EXCLUDED.title, description = EXCLUDED.description, order_index = EXCLUDED.order_index, updated_at = CURRENT_TIMESTAMP;

INSERT INTO lessons (id, module_id, title, order_index) VALUES
(1, 1, 'Lesson 1.1: Introduction to Python', 0),
(2, 1, 'Lesson 1.2: Variables and Data Types', 1)
ON CONFLICT (id) DO UPDATE SET module_id=EXCLUDED.module_id, title = EXCLUDED.title, order_index = EXCLUDED.order_index, updated_at = CURRENT_TIMESTAMP;

INSERT INTO course_quizzes (id, title, description, created_by_user_id, course_id, module_id) VALUES
(1, 'Python Basics Quiz', 'Test your knowledge of Python variables and data types.', 1, 1, 1)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = CURRENT_TIMESTAMP;

INSERT INTO lesson_content_blocks (id, lesson_id, content_type, content_data, order_index) VALUES
(1, 1, 'text', '{"text": "Welcome to Python! Python is a versatile and widely used programming language."}', 0),
(2, 1, 'video_embed', '{"url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "caption": "Introductory Video"}', 1),
(3, 1, 'quiz_ref', '{"quiz_id": 1, "quiz_title": "Python Basics Quiz"}', 2)
ON CONFLICT (id) DO UPDATE SET lesson_id=EXCLUDED.lesson_id, content_type = EXCLUDED.content_type, content_data = EXCLUDED.content_data, order_index = EXCLUDED.order_index, updated_at = CURRENT_TIMESTAMP;

INSERT INTO uploaded_files (id, uploader_user_id, file_name, file_path, mime_type, size_bytes, upload_status, storage_details) VALUES
(1, 1, 'python_cheatsheet.pdf', '/course_assets/python/python_cheatsheet.pdf', 'application/pdf', 102400, 'completed', '{"service": "local", "container": "course_assets"}')
ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, updated_at = CURRENT_TIMESTAMP;

INSERT INTO labs_simulations (id, title, description, lab_type, embed_url, created_by_user_id) VALUES
(1, 'Interactive Python Sandbox', 'A simple interactive Python environment to test snippets.', 'interactive_simulation', '/labs/python_sandbox_v1', 1)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = CURRENT_TIMESTAMP;

INSERT INTO questions (id, general_quiz_id, course_quiz_id, question_text, question_type) VALUES
(1, 'diagnostic_v1', NULL, 'What is your primary interest in technology?', 'multiple-choice'),
(2, 'diagnostic_v1', NULL, 'Are you comfortable with basic algebra?', 'true-false'),
(3, 'diagnostic_v1', NULL, 'Which of these activities do you enjoy most?', 'multiple-choice'),
(4, NULL, 1, 'What is the keyword to define a function in Python?', 'multiple-choice')
ON CONFLICT (id) DO UPDATE SET general_quiz_id=EXCLUDED.general_quiz_id, course_quiz_id=EXCLUDED.course_quiz_id, question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, updated_at = CURRENT_TIMESTAMP;

DO $$
DECLARE q_id INTEGER;
BEGIN
  SELECT id INTO q_id FROM questions WHERE question_text = 'What is the keyword to define a function in Python?' AND course_quiz_id = 1 LIMIT 1;
  IF q_id IS NOT NULL THEN
    INSERT INTO question_options (question_id, option_text, is_correct) VALUES
    (q_id, 'def', TRUE), (q_id, 'function', FALSE), (q_id, 'fun', FALSE), (q_id, 'define', FALSE)
    ON CONFLICT (question_id, option_text) DO NOTHING;
  END IF;
END $$;

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
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, related_skills = EXCLUDED.related_skills, updated_at = CURRENT_TIMESTAMP;

INSERT INTO marketplace_products
  (seller_id, title, description, price, file_path, file_type, thumbnail_url, tags, subject, grade_level, status, content_file_ids, preview_file_ids)
VALUES
(1, 'Algebra Worksheet Pack - Grade 7', 'A comprehensive pack of 20 algebra worksheets covering equations, inequalities, and functions for Grade 7 students.', 4.99, '/uploads/algebra_grade7_pack.pdf', 'pdf', '/thumbnails/algebra_pack_thumb.png', ARRAY['algebra', 'math', 'grade 7', 'worksheet', 'equations'], 'Mathematics', 'Middle School', 'approved', ARRAY[1], ARRAY[]), -- Assuming uploaded_file id 1 is relevant for content
(1, 'Introduction to Python - Curriculum Guide', 'A detailed lesson plan and curriculum guide for teaching an introductory Python course to beginners.', 12.50, '/uploads/python_intro_plan.docx', 'docx', '/thumbnails/python_plan_thumb.png', ARRAY['python', 'programming', 'curriculum', 'beginner', 'coding'], 'Computer Science', 'High School', 'approved', ARRAY[]::INT[], ARRAY[]::INT[]),
(1, 'Creative Writing Prompts - All Ages', '100 engaging creative writing prompts suitable for various age groups to spark imagination.', 3.99, 'https://docs.google.com/document/d/examplelink123', 'google_doc_link', NULL, ARRAY['writing', 'creative writing', 'prompts', 'storytelling'], 'Language Arts', 'All Grades', 'pending_review', ARRAY[]::INT[], ARRAY[]::INT[]),
(1, 'Elementary Science Experiments', 'A collection of 15 simple and safe science experiments for K-2 students with easy-to-follow instructions.', 5.00, '/uploads/elementary_science_experiments.pdf', 'pdf', '/thumbnails/science_experiments_thumb.png', ARRAY['science', 'experiments', 'k-2', 'elementary'], 'Science', 'K-2', 'approved', ARRAY[]::INT[], ARRAY[]::INT[]),
(1, 'US History Flashcards: Key Events', 'Set of 100 flashcards covering key events and figures in US History. Ideal for High School exam prep.', 7.25, '/uploads/us_history_flashcards.zip', 'zip', '/thumbnails/history_flashcards_thumb.png', ARRAY['history', 'us history', 'flashcards', 'exam prep'], 'History', 'High School', 'approved', ARRAY[]::INT[], ARRAY[]::INT[]),
(1, 'Digital Art Techniques for Beginners', 'A step-by-step guide to basic digital art techniques using free software. Perfect for middle schoolers.', 6.00, '/uploads/digital_art_guide.pdf', 'pdf', NULL, ARRAY['art', 'digital art', 'beginner', 'drawing'], 'Art', 'Middle School', 'pending_review', ARRAY[]::INT[], ARRAY[]::INT[])
ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    content_file_ids = EXCLUDED.content_file_ids,
    preview_file_ids = EXCLUDED.preview_file_ids,
    updated_at = CURRENT_TIMESTAMP;

-- Seed data for course_reviews and course_likes (example for course_id = 1)
-- Assuming user_id 2 and 3 exist as students
INSERT INTO course_reviews (course_id, user_id, rating, comment) VALUES
(1, 2, 5, 'Excellent introduction to Python! Clear and concise.'),
(1, 3, 4, 'Good course, but would have liked more advanced examples in the later sections.')
ON CONFLICT (course_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = NOW();

INSERT INTO course_likes (course_id, user_id) VALUES (1, 2), (1, 3), (2, 2)
ON CONFLICT (course_id, user_id) DO NOTHING;

-- (The trigger should automatically update average_rating, total_ratings, total_likes in courses table,
--  or this needs to be handled by application logic after review/like. The provided code includes an
--  application-logic helper function `updateCourseAggregates` for this.)
--  The seed data for courses table has been updated to include initial values for these.The `sql/schema.sql` file has been updated to include the new tables `course_reviews` and `course_likes`, and the `courses` table has been augmented with `average_rating`, `total_ratings`, and `total_likes`. Seed data for these new structures has also been added.

Now I will use `overwrite_file_with_block` to update `masterin-org-backend/routes/courseRoutes.js` with the new review and like/unlike functionalities, ensuring the existing student-facing course consumption endpoints are preserved.
