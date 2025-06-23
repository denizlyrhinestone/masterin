export interface UserProfile {
  id: number;
  email: string;
  role: string;
  full_name: string | null;
  bio: string | null;
  profile_picture_file_id: number | null; // Store the ID of the uploaded file
  profile_picture_url: string | null;    // Store the actual URL for display, derived from uploaded_files table
  social_links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  } | null;
  created_at?: string; // Optional, but often included
  updated_at?: string; // Optional
}

// You might also want a type for the editable form data,
// which could be a subset or include fields like individual social links
export interface UserProfileFormData {
  full_name?: string;
  bio?: string;
  profile_picture_file_id?: number | null;
  // For form handling, individual links are easier
  linkedinLink?: string;
  twitterLink?: string;
  githubLink?: string;
  websiteLink?: string;
  // If you were using a textarea for raw JSON social_links:
  // social_links_json_string?: string;
}
