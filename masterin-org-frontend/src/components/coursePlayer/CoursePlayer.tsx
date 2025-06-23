"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { FullCourse, CourseModule, CourseLesson, ContentBlock, StudentProgress } from '@/types/courseTypes'; // Updated type
import CourseSidebarNav from './CourseSidebarNav';
import ContentBlockViewer from './ContentBlockViewer';
import { ArrowLeftCircleIcon, ArrowRightCircleIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface CoursePlayerProps {
  courseId: string;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ courseId }) => {
  const router = useRouter();
  const pathname = usePathname(); // For updating URL with query params
  const searchParams = useSearchParams(); // For reading initial query params
  const { isAuthenticated, user } = useAuth(); // Get auth state

  const [courseData, setCourseData] = useState<FullCourse | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null); // Updated type
  // const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set()); // Will derive from studentProgress

  const [currentModuleId, setCurrentModuleId] = useState<string | number | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | number | null>(null);
  const [currentBlockId, setCurrentBlockId] = useState<string | number | null>(null);
  const [currentBlockContent, setCurrentBlockContent] = useState<ContentBlock | null>(null);

  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isLoadingBlock, setIsLoadingBlock] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false); // New state
  const [progressError, setProgressError] = useState<string | null>(null); // New state
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false); // New state for mark complete button
  const [error, setError] = useState<string | null>(null); // General error for course/block loading

  // Function to update URL query parameters for deep linking
  const updateUrlQuery = useCallback((moduleId?: string|number|null, lessonId?: string|number|null, blockId?: string|number|null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (moduleId) params.set('moduleId', String(moduleId)); else params.delete('moduleId');
    if (lessonId) params.set('lessonId', String(lessonId)); else params.delete('lessonId');
    if (blockId) params.set('blockId', String(blockId)); else params.delete('blockId');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);


  // Fetch full course structure
  useEffect(() => {
    if (courseId) {
      setIsLoadingCourse(true); setError(null);
      apiClient.get<FullCourse>(`/courses/${courseId}/view`)
        .then(response => {
          const data = response.data; // Assuming apiClient returns { data: FullCourse }
          setCourseData(data);
          // Initialize current item from query params or first available
          const initialModuleId = searchParams.get('moduleId') || data.modules?.[0]?.id;
          const initialModule = data.modules?.find(m => m.id === Number(initialModuleId));
          const initialLessonId = searchParams.get('lessonId') || initialModule?.lessons?.[0]?.id;
          const initialLesson = initialModule?.lessons?.find(l => l.id === Number(initialLessonId));
          const initialBlockId = searchParams.get('blockId') || initialLesson?.content_blocks?.[0]?.id;

          if (initialModuleId) setCurrentModuleId(Number(initialModuleId));
          if (initialLessonId) setCurrentLessonId(Number(initialLessonId));
          if (initialBlockId) setCurrentBlockId(Number(initialBlockId));
          else if (initialLesson?.content_blocks?.length) {
            setCurrentBlockId(initialLesson.content_blocks[0].id);
          }
        })
        .catch(err => {
          console.error("Failed to load course:", err);
          setError(err.response?.data?.message || err.message || "Failed to load course.");
        })
        .finally(() => setIsLoadingCourse(false));
    }
  }, [courseId, searchParams]);

  // Effect to fetch student progress when courseData is loaded and user is authenticated
  useEffect(() => {
    if (courseId && courseData && isAuthenticated) {
      setIsLoadingProgress(true); setProgressError(null);
      apiClient.get<{ progress: StudentProgress }>(`/users/student-progress/${courseId}`)
        .then(response => {
          setStudentProgress(response.data.progress);
        })
        .catch(err => {
          console.error("Failed to load student progress:", err);
          setProgressError(err.response?.data?.message || err.message || "Failed to load progress.");
          setStudentProgress(null); // Ensure progress is cleared on error
        })
        .finally(() => setIsLoadingProgress(false));
    } else if (!isAuthenticated) {
      setStudentProgress(null); // Clear progress if user logs out or was never logged in
      setIsLoadingProgress(false);
    }
  }, [courseId, courseData, isAuthenticated]); // Depends on courseData to ensure course context exists

  // Fetch specific block content when currentBlockId changes
  useEffect(() => {
    if (courseId && currentModuleId && currentLessonId && currentBlockId) {
      setIsLoadingBlock(true); setError(null); // Clear general error, focus on block loading
      apiClient.get<{content_type: string, details: any}>(`/courses/${courseId}/lessons/${currentLessonId}/content-block/${currentBlockId}/details`)
        .then(response => {
          const data = response.data;
          setCurrentBlockContent({
            id: Number(currentBlockId),
            content_type: data.content_type,
            content_data: data.details,
            order_index: courseData?.modules.find(m=>m.id===currentModuleId)?.lessons.find(l=>l.id===currentLessonId)?.content_blocks.find(b=>b.id===currentBlockId)?.order_index ?? 0,
          });
          updateUrlQuery(currentModuleId, currentLessonId, currentBlockId);
        })
        .catch(err => {
          console.error("Failed to load content block:", err);
          setError(err.response?.data?.message || err.message || "Failed to load content block."); // Set general error for block issues
          setCurrentBlockContent(null);
        })
        .finally(() => setIsLoadingBlock(false));
    } else {
        setCurrentBlockContent(null);
        if (courseId) updateUrlQuery(currentModuleId, currentLessonId, null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, currentModuleId, currentLessonId, currentBlockId, updateUrlQuery, courseData]); // Added courseData to deps for order_index


  const handleSelectLesson = useCallback((moduleId: string | number, lessonId: string | number, firstBlockId?: string | number) => {
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
    setCurrentBlockId(firstBlockId || null); // Select first block or null if lesson has no blocks
    if (!firstBlockId) setCurrentBlockContent(null); // Clear content if no block to load
  }, []);

  const findCurrentIndices = () => {
    if (!courseData || !currentModuleId || !currentLessonId) return null;
    const moduleIndex = courseData.modules.findIndex(m => m.id === currentModuleId);
    if (moduleIndex === -1) return null;
    const lessonIndex = courseData.modules[moduleIndex].lessons.findIndex(l => l.id === currentLessonId);
    if (lessonIndex === -1) return null;
    const blockIndex = currentBlockId ? courseData.modules[moduleIndex].lessons[lessonIndex].content_blocks.findIndex(b => b.id === currentBlockId) : -1;
    return { moduleIndex, lessonIndex, blockIndex };
  };

  const navigateToBlock = (direction: 'prev' | 'next') => {
    const indices = findCurrentIndices();
    if (!indices || !courseData) return;
    let { moduleIndex, lessonIndex, blockIndex } = indices;

    const currentLesson = courseData.modules[moduleIndex].lessons[lessonIndex];
    const currentModule = courseData.modules[moduleIndex];
    const isLessonCompleted = studentProgress?.completed_lesson_ids?.includes(Number(currentLessonId));

    if (direction === 'next') {
      if (blockIndex < currentLesson.content_blocks.length - 1) { // Next block in same lesson
        setCurrentBlockId(currentLesson.content_blocks[blockIndex + 1].id);
      } else { // End of lesson, try next lesson or module
        // Mark current lesson as complete before moving to next, if not already completed
        if (isAuthenticated && currentLessonId && !isLessonCompleted) {
            handleMarkLessonComplete(Number(currentLessonId), true); // true to indicate it's part of navigation
        }
        if (lessonIndex < currentModule.lessons.length - 1) { // Next lesson in same module
          const nextLesson = currentModule.lessons[lessonIndex + 1];
          handleSelectLesson(currentModule.id, nextLesson.id, nextLesson.content_blocks?.[0]?.id);
        } else if (moduleIndex < courseData.modules.length - 1) { // Next module
          const nextModule = courseData.modules[moduleIndex + 1];
          const firstLessonOfNextModule = nextModule.lessons?.[0];
          if (firstLessonOfNextModule) {
            handleSelectLesson(nextModule.id, firstLessonOfNextModule.id, firstLessonOfNextModule.content_blocks?.[0]?.id);
          }
        } else {
          // End of course
          alert("Congratulations! You've completed the course!"); // Placeholder
        }
      }
    } else { // direction === 'prev'
      if (blockIndex > 0) { // Previous block in same lesson
        setCurrentBlockId(currentLesson.content_blocks[blockIndex - 1].id);
      } else { // Start of lesson, try previous lesson or module
        if (lessonIndex > 0) { // Previous lesson in same module
          const prevLesson = currentModule.lessons[lessonIndex - 1];
          handleSelectLesson(currentModule.id, prevLesson.id, prevLesson.content_blocks?.[prevLesson.content_blocks.length-1]?.id || prevLesson.content_blocks?.[0]?.id); // last or first block
        } else if (moduleIndex > 0) { // Previous module
          const prevModule = courseData.modules[moduleIndex - 1];
          const lastLessonOfPrevModule = prevModule.lessons?.[prevModule.lessons.length - 1];
          if (lastLessonOfPrevModule) {
            handleSelectLesson(prevModule.id, lastLessonOfPrevModule.id, lastLessonOfPrevModule.content_blocks?.[lastLessonOfPrevModule.content_blocks.length-1]?.id || lastLessonOfPrevModule.content_blocks?.[0]?.id);
          }
        } else {
          // Start of course
        }
      }
    }
  };

  const handleMarkLessonComplete = async (lessonIdToMark: number, isNavigatingNext: boolean = false) => {
    if (!isAuthenticated || !courseId || studentProgress?.completed_lesson_ids?.includes(lessonIdToMark)) {
      return;
    }

    setIsSubmittingComplete(true);
    // Optimistically update UI if not navigating, or rely on backend response if navigating
    // For now, always rely on backend response.

    try {
      const response = await apiClient.post<{ progress: StudentProgress }>(
        `/courses/${courseId}/lessons/${lessonIdToMark}/complete`,
        {}
      );
      setStudentProgress(response.data.progress); // Update progress with the new state from backend
      // TODO: Show success toast: "Lesson marked complete!"
      console.log(`Lesson ${lessonIdToMark} marked complete.`);

      // If not automatically navigating to next, the user stays on the page.
      // If navigating, the navigation will handle moving to the next item.
    } catch (err: any) {
      console.error("Failed to mark lesson complete:", err);
      // TODO: Show error toast
      setProgressError(err.response?.data?.message || err.message || "Failed to mark lesson complete.");
      // Optionally, revert optimistic update here if one was made.
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  const isFirstContent = () => {
    const indices = findCurrentIndices();
    if (!indices) return true;
    return indices.moduleIndex === 0 && indices.lessonIndex === 0 && indices.blockIndex <= 0;
  };

  const isLastContent = () => {
     const indices = findCurrentIndices();
     if (!indices || !courseData) return true;
     const lastModuleIndex = courseData.modules.length - 1;
     if (indices.moduleIndex < lastModuleIndex) return false;
     const lastLessonIndex = courseData.modules[lastModuleIndex].lessons.length - 1;
     if (indices.lessonIndex < lastLessonIndex) return false;
     return indices.blockIndex >= courseData.modules[lastModuleIndex].lessons[lastLessonIndex].content_blocks.length - 1;
  };


  if (isLoadingCourse) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-sky-600"></div></div>;
  }
  if (error && !courseData) { // Show full page error if course data failed to load entirely
    return <div className="container mx-auto px-4 py-10 text-center"><ExclamationTriangleIcon className="h-10 w-10 text-red-500 mx-auto mb-2"/><p className="text-red-600">Error: {error}</p></div>;
  }
  if (!courseData) {
    return <div className="container mx-auto px-4 py-10 text-center text-slate-600">Course not found or not accessible.</div>;
  }

  const currentLessonIsCompleted = studentProgress?.completed_lesson_ids?.includes(Number(currentLessonId));

  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-6 min-h-[calc(100vh-120px)]"> {/* Adjust min-h based on nav/footer height */}
      <aside className="w-full md:w-1/4 lg:w-1/5 p-0 md:p-0"> {/* Sidebar takes full width on mobile, then fixed width */}
        <CourseSidebarNav
          course={courseData}
          currentModuleId={currentModuleId}
          currentLessonId={currentLessonId}
          onSelectLesson={handleSelectLesson}
          completedLessonIds={studentProgress?.completed_lesson_ids || []} // Pass live progress
          isLoadingProgress={isLoadingProgress} // Pass loading state for progress
        />
      </aside>
      <main className="flex-grow p-4 md:p-6 min-w-0"> {/* min-w-0 for flex child truncation */}
        {/* Display general errors (course/block loading) and progress errors */}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center"><ExclamationTriangleIcon className="h-5 w-5 mr-2"/>Error: {error}</div>}
        {progressError && <div className="mb-4 p-3 bg-orange-50 text-orange-700 rounded-md flex items-center"><ExclamationTriangleIcon className="h-5 w-5 mr-2"/>Progress Error: {progressError}</div>}

        <ContentBlockViewer block={currentBlockContent} isLoading={isLoadingBlock} />

        <div className="mt-6 pt-6 border-t flex justify-between items-center">
          <button
            onClick={() => navigateToBlock('prev')}
            disabled={isFirstContent() || isLoadingBlock}
            className="py-2 px-4 rounded-md text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center transition-colors"
          >
            <ArrowLeftCircleIcon className="h-5 w-5 mr-2"/> Previous
          </button>
          {/* Display current lesson title or block title if available */}
          <button
            onClick={() => navigateToBlock('next')}
            disabled={isLastContent() || isLoadingBlock || isSubmittingComplete}
            className="py-2 px-4 rounded-md text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center transition-colors"
          >
            {isLastContent() ? 'Finish Course' : 'Next'} <ArrowRightCircleIcon className="h-5 w-5 ml-2"/>
          </button>
        </div>

        {/* "Mark Lesson Complete" button - only show if authenticated, lesson exists, and not yet completed */}
        {isAuthenticated && currentLessonId && !currentLessonIsCompleted && (
             <div className="mt-6 text-center">
                <button
                    onClick={() => handleMarkLessonComplete(Number(currentLessonId))}
                    disabled={isSubmittingComplete || isLoadingProgress} // Disable if submitting or initial progress is loading
                    className="py-2 px-4 rounded-md text-sm font-medium border border-green-600 text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center transition-colors"
                >
                    <CheckBadgeIcon className="h-5 w-5 mr-2"/>
                    {isSubmittingComplete ? 'Marking...' : 'Mark Lesson as Complete'}
                </button>
             </div>
         )}
         {/* Show if lesson is already completed */}
         {isAuthenticated && currentLessonId && currentLessonIsCompleted && (
            <div className="mt-6 text-center">
                <p className="text-green-600 font-semibold inline-flex items-center">
                    <CheckBadgeIcon className="h-6 w-6 mr-2 text-green-500"/> Lesson Completed!
                </p>
            </div>
         )}
      </main>
    </div>
  );
};

export default CoursePlayer;
