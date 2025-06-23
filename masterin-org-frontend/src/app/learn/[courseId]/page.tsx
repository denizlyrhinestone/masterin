"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import CoursePlayer from '@/components/coursePlayer/CoursePlayer';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const LearnCoursePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  if (!courseId) {
    // This case might occur if params are not yet available during initial render,
    // or if routing is somehow incorrect.
    // A loading state or specific handling might be needed if params are slow to populate.
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-gray-700">Loading course player...</p>
        {/* Or a more specific error if params are definitely missing after hydration */}
        {/* <p className="text-red-500">Error: Course ID not found in URL.</p>
        <button onClick={() => router.push('/courses')} className="mt-4 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">
          Browse Courses
        </button> */}
      </div>
    );
  }

  // It's good practice to validate if courseId is a number or expected format if needed,
  // but the CoursePlayer component will handle fetching and actual existence errors.
  // const numericCourseId = parseInt(courseId, 10);
  // if (isNaN(numericCourseId)) {
  //   return <div className="container mx-auto px-4 py-8 text-center text-red-500">Invalid Course ID format.</div>;
  // }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* The CoursePlayer component will likely have its own internal max-width container for content if needed */}
      {/* We can add a global back button or breadcrumbs here if desired */}
      <div className="container mx-auto px-2 sm:px-4 py-4">
        <Link href="/courses" legacyBehavior>
          <a className="inline-flex items-center text-sky-600 hover:text-sky-800 group text-sm mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
            Back to All Courses
          </a>
        </Link>
      </div>
      <CoursePlayer courseId={courseId} />
    </div>
  );
};

export default LearnCoursePage;
