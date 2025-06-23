// Represents the metadata for a file that has been uploaded.
// This type would be used by various features that involve file uploads.
export interface UploadedFileMetadata {
  id: number;
  file_name: string;
  file_path: string; // Usually a relative path from a base upload directory
  mime_type: string;
  size_bytes: number;
  created_at?: string;
  updated_at?: string;
  // uploader_user_id?: number; // Optional: if needed to know who uploaded it
  // storage_details?: any; // Optional: for any specific storage info like S3 bucket/key
}

// Represents the detailed structure of a marketplace product,
// including seller information and associated files.
export interface MarketplaceProductDetail {
  id: number;
  title: string;
  description: string;
  price: number; // Or string if using a library like decimal.js for precision
  subject?: string | null;
  grade_level?: string | null;
  tags?: string[] | null;
  status: 'pending_review' | 'approved' | 'rejected' | 'archived'; // Reflects DB enum/check constraint
  average_rating?: number | null; // Assuming products can be rated
  total_ratings?: number | null;
  total_likes?: number | null; // If products can be liked

  seller_id: number;
  seller_name: string | null;
  seller_profile_picture_url?: string | null;

  // Raw file path and type from the main product record (legacy or for simple, single-file products)
  file_path?: string | null; // This might be deprecated in favor of content_file_ids
  file_type?: string | null; // This might be deprecated in favor of content_file_ids

  thumbnail_url?: string | null; // For the product's main listing image

  content_file_ids?: number[] | null; // IDs of actual product files (e.g., the PDF, ZIP)
  preview_file_ids?: number[] | null; // IDs of preview files (e.g., sample images, short PDF preview)

  // Expanded file metadata, populated by frontend after fetching based on IDs
  content_files?: UploadedFileMetadata[];
  preview_files?: UploadedFileMetadata[];

  created_at?: string;
  updated_at?: string;
}

// Type for a product as listed in a summary view (e.g., marketplace listing page)
// Could be a subset of MarketplaceProductDetail
export interface MarketplaceProductSummary {
  id: number;
  title: string;
  description?: string; // Often shorter in summaries
  price: number;
  thumbnail_url?: string | null;
  subject?: string | null;
  grade_level?: string | null;
  seller_name?: string | null; // May or may not be needed in summary
  average_rating?: number | null;
  total_ratings?: number | null;
  tags?: string[] | null;
}

// Type for a user's purchase record
export interface UserPurchase {
    id: number; // purchase_id
    product_id: number;
    purchased_at: string;
    price_paid: number;
    transaction_id?: string | null;
    product_title: string;
    product_description?: string | null;
    product_thumbnail_url?: string | null;
    product_seller_id: number;
    product_seller_name?: string | null;
}
