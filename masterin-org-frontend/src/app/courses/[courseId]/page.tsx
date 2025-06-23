"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { CourseDetailType, ReviewType } from '@/types/courseTypes';
import { StarIcon as StarSolidIcon, ClockIcon, UserCircleIcon, LanguageIcon, AcademicCapIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid'; // Removed HeartSolid
import { StarIcon as StarOutlineIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
// import { getAuthToken } from '@/lib/auth'; // Replaced by useAuth
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import ReactMarkdown from 'react-markdown';
import CourseReviewForm from '@/components/courses/CourseReviewForm';
import LikeButton from '@/components/common/LikeButton';
import Link from 'next/link';


const CourseDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const { isAuthenticated, user } = useAuth(); // Get auth state

  const [course, setCourse] = useState<CourseDetailType | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [userReview, setUserReview] = useState<ReviewType | null>(null);
  const [userLikeStatus, setUserLikeStatus] = useState<boolean>(false);

  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isLoadingUserFeedback, setIsLoadingUserFeedback] = useState(true);

  const [errorCourse, setErrorCourse] = useState<string | null>(null);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);
  const [errorUserFeedback, setErrorUserFeedback] = useState<string | null>(null);

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  // const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Replaced by user?.id from useAuth

  const fetchCourseAndReviews = useCallback(async () => {
    if (courseId) {
      setIsLoadingCourse(true); setErrorCourse(null);
      apiClient.get<CourseDetailType>(`/courses/${courseId}/view`)
        .then(data => setCourse(data))
        .catch(err => { console.error(err); setErrorCourse(err.message || 'Failed to load course.'); })
        .finally(() => setIsLoadingCourse(false));

      setIsLoadingReviews(true); setErrorReviews(null);
      apiClient.get<ReviewType[]>(`/courses/${courseId}/reviews?limit=50`)
        .then(data => setReviews(data || []))
        .catch(err => { console.error(err); setErrorReviews(err.message || 'Failed to load reviews.'); })
        .finally(() => setIsLoadingReviews(false));
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseAndReviews();
  }, [fetchCourseAndReviews]);

  useEffect(() => {
    if (courseId && isAuthenticated && user?.id) {
      setIsLoadingUserFeedback(true); setErrorUserFeedback(null);

      const foundReview = reviews.find(r => r.user_id === user.id);
      setUserReview(foundReview || null);

      apiClient.get<{ liked: boolean }>(`/courses/${courseId}/like-status`)
        .then(data => setUserLikeStatus(data.liked))
        .catch(err => { console.error(err); setErrorUserFeedback(err.message || 'Failed to load like status.'); })
        .finally(() => setIsLoadingUserFeedback(false));
    } else if (!isAuthenticated) {
        setIsLoadingUserFeedback(false);
        setUserReview(null);
        setUserLikeStatus(false);
    }
  }, [courseId, user, reviews, isAuthenticated]);


  const handleEnroll = () => {
    setIsEnrolling(true);
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${courseId}`);
      setIsEnrolling(false);
      return;
    }
    console.log(`Simulating enrollment for course ${courseId}...`);
    setTimeout(() => {
      let firstLessonPath = `/learn/course/${courseId}`;
      if (course && course.modules && course.modules[0] && course.modules[0].lessons && course.modules[0].lessons[0]) {
        firstLessonPath = `/learn/course/${courseId}/module/${course.modules[0].id}/lesson/${course.modules[0].lessons[0].id}`;
      }
      router.push(firstLessonPath);
      setIsEnrolling(false);
    }, 1000);
  };

  const renderStars = (rating?: number) => {
    const totalStars = 5; const filledStars = Math.round(rating || 0);
    return Array(totalStars).fill(0).map((_, i) =>
      i < filledStars ? <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" /> : <StarOutlineIcon key={i} className="h-5 w-5 text-yellow-400" />
    );
  };

  const handleReviewSubmitSuccess = (newOrUpdatedReview: ReviewType) => {
    setUserReview(newOrUpdatedReview);
    setReviews(prev => {
      const existingIndex = prev.findIndex(r => r.id === newOrUpdatedReview.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = newOrUpdatedReview;
        return updated;
      }
      return [newOrUpdatedReview, ...prev.filter(r => r.user_id !== newOrUpdatedReview.user_id)]; // Ensure only one review per user in the list
    });
    setShowReviewForm(false);
    if (course) {
        const oldTotalRatings = course.total_ratings || 0;
        const oldAvgRating = course.average_rating || 0;
        let newTotalRatings = oldTotalRatings;
        let newTotalScore = oldAvgRating * oldTotalRatings;

        const existingReviewInList = reviews.find(r => r.id === newOrUpdatedReview.id && r.id !== userReview?.id); // check if it was an update of a review already in list but not the current user's initial one

        if (userReview && userReview.id === newOrUpdatedReview.id) {
            newTotalScore = newTotalScore - userReview.rating + newOrUpdatedReview.rating;
            // totalRatings does not change
        } else if (!existingReviewInList) { // It's a brand new review for this user not previously in list
            newTotalScore = newTotalScore + newOrUpdatedReview.rating;
            newTotalRatings = oldTotalRatings + 1;
        } else { // It was an update to a review that was ALREADY in the list but not the initial userReview
             const originalReviewFromList = reviews.find(r => r.id === newOrUpdatedReview.id);
             if(originalReviewFromList) {
                newTotalScore = newTotalScore - originalReviewFromList.rating + newOrUpdatedReview.rating;
             } else { // Should not happen if logic is correct
                newTotalScore = newTotalScore + newOrUpdatedReview.rating;
                newTotalRatings = oldTotalRatings + 1;
             }
        }
        const newAvgRating = newTotalRatings > 0 ? newTotalScore / newTotalRatings : 0;
        setCourse(prev => prev ? ({...prev, average_rating: parseFloat(newAvgRating.toFixed(2)), total_ratings: newTotalRatings }) : null);
    }
  };

  const handleLikeToggleSuccess = (newLikedStatus: boolean, newTotalLikes: number) => {
    setUserLikeStatus(newLikedStatus);
    setCourse(prev => prev ? ({ ...prev, total_likes: newTotalLikes }) : null);
  };

  if (isLoadingCourse) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-600"></div>
      </div>
    );
  }
  if (errorCourse) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-xl text-red-600">Error: {errorCourse}</p>
        <Link href="/courses" legacyBehavior><a className="mt-4 text-sky-600 hover:underline">Back to Courses</a></Link>
      </div>
    );
  }
  if (!course) {
    return <div className="container mx-auto px-4 py-10 text-center text-slate-600">Course not found.</div>;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="lg:flex lg:space-x-8">
        <div className="lg:w-2/3 space-y-8">
          <section> {/* Course Header */}
            <h1 className="text-3xl sm:text-4xl font-bold text-sky-800 dark:text-sky-200 mb-2">{course.title}</h1>
            {course.description && <ReactMarkdown className="prose prose-slate dark:prose-invert max-w-none mb-4">{course.description}</ReactMarkdown>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center" title={`Rating: ${course.average_rating?.toFixed(1) || 'N/A'} (${course.total_ratings || 0} ratings)`}>
                {renderStars(course.average_rating)}
                <span className="ml-1.5">({course.total_ratings || 0} ratings)</span>
              </div>
              <div className="flex items-center">
                {!isLoadingUserFeedback &&
                    <LikeButton
                        courseId={course.id}
                        initialIsLiked={userLikeStatus || false}
                        initialTotalLikes={course.total_likes || 0}
                        onLikeToggleSuccess={handleLikeToggleSuccess}
                    />
                }
              </div>
            </div>
          </section>

          <section> {/* Course Content/Curriculum */}
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b dark:border-slate-700 pb-2">Course Content</h2>
            <div className="space-y-4">
              {course.modules && course.modules.length > 0 ? (
                course.modules.map(module => (
                  <div key={module.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-md shadow-sm">
                    <h3 className="text-lg font-medium text-sky-700 dark:text-sky-400 mb-2">{module.title}</h3>
                    {module.lessons && module.lessons.length > 0 ? (
                      <ul className="list-disc list-inside pl-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        {module.lessons.map(lesson => <li key={lesson.id}>{lesson.title}</li>)}
                      </ul>
                    ) : <p className="text-xs text-slate-400 dark:text-slate-500 italic">No lessons in this module.</p>}
                  </div>
                ))
              ) : <p className="text-slate-500 dark:text-slate-400">Course curriculum details coming soon.</p>}
            </div>
          </section>

          <section> {/* Instructor Info */}
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b dark:border-slate-700 pb-2">Instructor</h2>
            <div className="flex items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
              <UserCircleIcon className="h-16 w-16 text-slate-400 dark:text-slate-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">{course.instructor_email ? course.instructor_email.split('@')[0] : 'Instructor Name'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Placeholder for instructor bio and credentials.</p>
              </div>
            </div>
          </section>

          <section> {/* Reviews Section */}
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b dark:border-slate-700 pb-2">Student Reviews</h2>
            {isAuthenticated && !isLoadingUserFeedback && (
              <div className="mb-6">
                {!showReviewForm && !userReview && (
                  <button onClick={() => setShowReviewForm(true)} className="py-2 px-4 rounded-md text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 bg-sky-100 dark:bg-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-700 focus:ring-sky-500">
                    Write a Review
                  </button>
                )}
                {(showReviewForm || userReview) && (
                  <CourseReviewForm
                    courseId={courseId}
                    existingReview={userReview}
                    onSubmitSuccess={handleReviewSubmitSuccess}
                    onCancel={() => setShowReviewForm(false)}
                  />
                )}
              </div>
            )}
            {isLoadingReviews && <p className="text-slate-500 dark:text-slate-400">Loading reviews...</p>}
            {errorReviews && <p className="text-red-500 dark:text-red-400">Error: {errorReviews}</p>}
            {!isLoadingReviews && reviews.length === 0 && !userReview && <p className="text-slate-500 dark:text-slate-400 italic">No reviews yet for this course. Be the first!</p>}
            <div className="space-y-4">
              {reviews.filter(r => r.user_id !== user?.id || (!showReviewForm && !userReview))
                .map(review => (
                <div key={review.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                  <div className="flex items-center mb-2">
                    {renderStars(review.rating)}
                    <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{new Date(review.updated_at).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <ReactMarkdown className="prose prose-sm max-w-none text-slate-600 dark:prose-invert dark:text-slate-300">{review.comment}</ReactMarkdown>}
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-2">- {review.user?.email?.split('@')[0] || 'Anonymous'}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:w-1/3 space-y-6 mt-8 lg:mt-0"> {/* Right Sidebar */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 sticky top-24">
            {course.thumbnail_image_url ? ( <img src={course.thumbnail_image_url} alt={course.title} className="w-full h-auto rounded-md mb-4 object-cover" /> ) : ( <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 flex items-center justify-center rounded-md mb-4"> <AcademicCapIcon className="h-24 w-24 text-slate-400 dark:text-slate-500" /> </div> )}
            <button onClick={handleEnroll} disabled={isEnrolling} className="w-full py-3 px-4 rounded-md text-lg font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              {isEnrolling ? 'Processing...' : 'Enroll Now & Start Learning'}
            </button>
            <ul className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center"><ClockIcon className="h-5 w-5 mr-2 text-sky-500"/> Estimated Duration: {course.estimated_duration_hours || 'N/A'} hours</li>
              <li className="flex items-center"><UserCircleIcon className="h-5 w-5 mr-2 text-sky-500"/> Grade Level: {course.grade_level || 'All Levels'}</li>
              <li className="flex items-center"><LanguageIcon className="h-5 w-5 mr-2 text-sky-500"/> Language: {course.language || 'English'}</li>
              <li className="flex items-center"><ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-2 text-sky-500"/> Subject: {course.subject || 'General'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
