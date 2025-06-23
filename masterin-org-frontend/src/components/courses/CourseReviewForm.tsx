"use client";

import React, { useState, useEffect } from 'react';
import { ReviewType } from '@/types/courseTypes';
import apiClient from '@/lib/apiClient';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface CourseReviewFormProps {
  courseId: string | number;
  existingReview: ReviewType | null;
  onSubmitSuccess: (newOrUpdatedReview: ReviewType) => void;
  onCancel?: () => void; // Optional: if the form can be explicitly cancelled
}

const CourseReviewForm: React.FC<CourseReviewFormProps> = ({ courseId, existingReview, onSubmitSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0); // For interactive star selection

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError("Please select a rating (1-5 stars).");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = { rating, comment };
      // Backend handles create/update via ON CONFLICT
      const response = await apiClient.post<ReviewType>(`/courses/${courseId}/reviews`, payload);
      onSubmitSuccess(response); // Pass the full review object from backend
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">
        {existingReview ? 'Update Your Review' : 'Write a Review'}
      </h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Your Rating <span className="text-red-500">*</span></label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none p-0.5 rounded-full focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
              aria-label={`Rate ${star} out of 5 stars`}
            >
              {(hoverRating || rating) >= star ? (
                <StarSolidIcon className="h-6 w-6 text-yellow-400" />
              ) : (
                <StarOutlineIcon className="h-6 w-6 text-yellow-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-1">Your Comment</label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2.5 text-sm border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
          placeholder="Share your thoughts about this course..."
        />
      </div>

      {submitError && (
        <p className="text-sm text-red-600 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-1.5 flex-shrink-0"/> {submitError}
        </p>
      )}

      <div className="flex items-center justify-end space-x-3">
        {onCancel && (
            <button type="button" onClick={onCancel}
             className="py-2 px-4 rounded-md text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 transition-colors">
                Cancel
            </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="py-2 px-5 rounded-md text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center transition-colors"
        >
          {isSubmitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
        </button>
      </div>
    </form>
  );
};

export default CourseReviewForm;
