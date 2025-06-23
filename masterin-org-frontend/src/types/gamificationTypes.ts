export interface UserBadge {
  id: number; // This is the user_badge unique ID
  badge_id: number; // The ID of the badge definition from the 'badges' table
  user_id: number; // The ID of the user who earned the badge
  achieved_at: string; // ISO date string when the badge was earned
  name: string; // Name of the badge (from joined 'badges' table)
  description: string; // Description of the badge (from joined 'badges' table)
  icon_url: string | null; // URL to an image for the badge (from joined 'badges' table)
}
