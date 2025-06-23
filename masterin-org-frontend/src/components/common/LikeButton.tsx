"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { getAuthToken } from '@/lib/auth'; // To check if user is logged in

interface LikeButtonProps {
  courseId: string | number;
  initialIsLiked: boolean;
  initialTotalLikes: number;
  onLikeToggleSuccess: (newLikedStatus: boolean, newTotalLikes: number) => void; // Callback for parent to update its state
  className?: string; // Allow passing custom classes
}

const LikeButton: React.FC<LikeButtonProps> = ({
  courseId,
  initialIsLiked,
  initialTotalLikes,
  onLikeToggleSuccess,
  className = '',
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [totalLikes, setTotalLikes] = useState(initialTotalLikes);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with prop changes if parent state changes for some reason
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setTotalLikes(initialTotalLikes);
  }, [initialIsLiked, initialTotalLikes]);

  const handleLikeToggle = async () => {
    const token = getAuthToken();
    if (!token) {
      // Handle not authenticated: redirect to login or show message
      // For now, just console log and disable button (or parent handles this)
      console.log("User not authenticated. Like action unavailable.");
      setError("Please log in to like courses.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<{ liked: boolean; total_likes: number }>(
        `/courses/${courseId}/like`,
        {} // Empty body for toggle
      );
      setIsLiked(response.liked);
      setTotalLikes(response.total_likes);
      onLikeToggleSuccess(response.liked, response.total_likes);
    } catch (err: any) {
      setError(err.message || "Failed to update like status.");
      // Revert optimistic update if implemented, or show error
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = isLiked ? HeartSolidIcon : HeartOutlineIcon;
  const buttonText = isLiked ? 'Liked' : 'Like';

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading || !getAuthToken()} // Disable if loading or not authenticated
      className={`inline-flex items-center space-x-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors
        ${isLiked
            ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200'
            : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200'}
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500
        disabled:opacity-70 disabled:cursor-not-allowed
        ${className}
      `}
      title={isLiked ? "Unlike this course" : "Like this course"}
      aria-pressed={isLiked}
    >
      <IconComponent className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} />
      <span>{totalLikes}</span>
      {/* <span className="sr-only sm:not-sr-only">{buttonText}</span> */}
      {error && <span className="text-xs text-red-500 ml-2 truncate" title={error}>Error!</span>}
    </button>
  );
};

export default LikeButton;
