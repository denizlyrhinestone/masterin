// User type for admin panel user listing
export interface AdminUser {
  id: number;
  email: string;
  full_name: string | null;
  role: 'student' | 'teacher' | 'admin';
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// Type for items listed in content moderation queue
export interface ModerationItem {
  id: number; // course_id or product_id
  title: string;
  content_type: 'course' | 'product';
  created_by_user_id: number;
  creator_email?: string | null; // Joined from users table
  creator_name?: string | null;  // Joined from users table
  created_at: string; // ISO date string
  status: 'pending_review'; // This page specifically lists pending items
}

// For API response from /admin/users
export interface AdminUsersApiResponse {
  success: boolean;
  users: AdminUser[];
  totalUsers: number;
  page: number;
  limit: number;
  totalPages: number;
}

// For API response from /admin/content/pending-review
export interface AdminPendingContentApiResponse {
  success: boolean;
  items: ModerationItem[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}
