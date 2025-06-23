"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourseEditorForm from '@/components/courseEditor/CourseEditorForm';
import { FullCourse } from '@/types/courseTypes';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'; // Added ExclamationTriangleIcon
import Link from 'next/link';
import apiClient from '@/lib/apiClient'; // Import the API client

const EditCoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [courseData, setCourseData] = useState<FullCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      setIsLoading(true);
      setError(null);
      // Use apiClient for the actual API call
      apiClient.get<FullCourse>(`/courses/${courseId}/edit`)
        .then(data => {
          // The API might return nothing for a 404, or an error structure.
          // Assuming if data is directly null or has an error property, it's not found or an issue.
          if (data && (data as any).error) { // Check for an error property in the response
             setError((data as any).message || 'Course not found or error fetching data.');
             setCourseData(null);
          } else if (data) {
            setCourseData(data);
          }
           else { // Handles cases where data might be null/undefined for a 404 without explicit error structure
            setError('Course not found. It might have been deleted or the ID is incorrect.');
            setCourseData(null);
          }
        })
        .catch(err => {
          console.error("Error fetching course for edit:", err);
          setError(err.message || 'Failed to load course data. Please try refreshing the page.');
          setCourseData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (params && !courseId) { // Check if params is available but courseId is not
        setError("Course ID is missing from the URL.");
        setIsLoading(false);
    }
    // If params is initially null/undefined, useEffect will re-run when it becomes available.
  }, [courseId, params, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600 mx-auto"></div>
          <p className="text-lg text-gray-700 mt-4">Loading course editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-xl text-red-600">Error: {error}</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Go Back
        </button>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-700">Course data could not be loaded or does not exist.</p>
         <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
       <Link href="/dashboard/educator/courses" legacyBehavior>
        <a className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 group">
          <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to My Courses
        </a>
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Edit Course: <span className="text-indigo-600">{courseData.title}</span>
      </h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: {new Date(courseData.updated_at).toLocaleString()}</p>
      <CourseEditorForm initialCourseData={courseData} isNewCourse={false} />
    </div>
  );
};

export default EditCoursePage;
