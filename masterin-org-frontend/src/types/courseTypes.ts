export interface CourseSummary {
  id: number; // or string if using UUIDs, backend uses SERIAL so number is fine
  title: string;
  description?: string; // Making optional as it might be long for a summary list
  subject?: string;
  grade_level?: string;
  review_status: string; // e.g., 'draft', 'pending_review', 'published'
  is_publicly_browsable?: boolean;
  language?: string;
  estimated_duration_hours?: number;
  thumbnail_image_url?: string;
  created_at?: string; // Backend might not always send this in summary
  updated_at?: string; // Backend might not always send this in summary
  created_by?: number; // user_id of the creator
  instructor_email?: string; // From joined users table
  average_rating?: number;
  total_ratings?: number;
  total_likes?: number;
  // review_status and is_publicly_browsable are mainly for admin/editing,
  // but might be useful if we ever show "new" badges or similar.
  // For now, assuming the GET /api/courses endpoint only returns published & public ones.
}

// Interface for the full course structure, used on edit pages
// For now, CourseSummary is the focus for the listing page.
export interface CourseModule {
  id: number;
  title: string;
  description?: string;
  order_index: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: number;
  title: string;
  order_index: number;
  content_blocks: ContentBlock[];
}

export interface ContentBlock {
  id: number;
  content_type: string; // 'text', 'video_embed', 'quiz_ref', etc.
  content_data: any; // JSONB
  order_index: number;
}

export interface FullCourse extends CourseSummary {
  modules: CourseModule[];
}

// Types for Quizzes (both AI Generated and Stored)
export interface QuizQuestionOption {
  id?: number; // Will have ID when fetched from DB
  label?: string; // "A", "B", "C", "D" - AI might provide this, DB might not store it if ID is primary key
  text: string;
  // is_correct?: boolean; // Backend might send this for results, or only correct_answer_id/label on question
}

export interface QuizQuestion {
  id: number | string; // Will have ID when fetched from DB or assigned temp ID
  question_text: string;
  options: QuizQuestionOption[];
  correct_answer_label?: string; // Provided by AI for generation
  correct_option_id?: number;    // Might be provided by backend for stored quizzes
  question_type?: string; // e.g., 'multiple-choice'
}

export interface GeneratedQuiz { // From AI
  title: string;
  questions: QuizQuestion[]; // Questions here might lack IDs until saved
  course_quiz_id?: number; // Assigned after metadata is saved
}

export interface CourseQuizData { // Fetched from our DB for taking a quiz
    id: number; // This is course_quiz_id
    title: string;
    description?: string;
    questions: QuizQuestion[]; // Questions here will have IDs and their options will have IDs
}

// Type for Quiz Results
export interface QuestionResult {
    question_id: number | string;
    selected_option_id?: number | null; // ID of the option selected by user
    is_correct: boolean;
    correct_option_id?: number | null; // ID of the correct option
    // correct_answer_label?: string; // Could also send label
}
export interface QuizResultsType {
    attempt_id: number;
    score: number; // Percentage
    total_questions: number;
    correct_answers_count: number;
    results: QuestionResult[];
}


// Type for Course Detail Page (can be same as FullCourse if it includes everything needed for view)
export type CourseDetailType = FullCourse; // Assuming FullCourse has all view-related details including modules/lessons summaries

// Type for Course Reviews
export interface ReviewUser { // Simplified user info for a review
  id: number;
  // name?: string; // Backend provides email, frontend can derive a display name
  email: string; // Or a display name if backend provides it
  // avatar_url?: string;
}

export interface ReviewType {
  id: number;
  user: ReviewUser; // Or just user_id and fetch user details separately if needed, but embedding is fine for display
  user_id: number; // Keep user_id for reference
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

// Type for Student Progress on a Course
// Conforms to the backend response from GET /api/users/student-progress/:courseId
// and the requirements for live progress tracking in the Course Player.
export interface StudentProgress {
  id: number; // ID of the student_progress record itself
  learning_pathway_id?: number | null; // Optional, if the course is part of a pathway
  course_id: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'skipped'; // 'skipped' is a valid status from backend
  progress_percentage: number;
  completed_lessons_count: number;
  total_lessons_count: number;
  completed_lesson_ids: number[]; // Made non-optional as per subtask requirement for reliable UI updates
  last_accessed_at?: string; // Optional, but useful if provided by backend
}
