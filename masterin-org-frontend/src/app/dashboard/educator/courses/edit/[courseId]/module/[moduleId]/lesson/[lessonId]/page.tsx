"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LessonContentEditor from '@/components/lessonEditor/LessonContentEditor';
import { CourseLesson, ContentBlock } from '@/types/courseTypes'; // Assuming these types are defined
import Link from 'next/link';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// Define a more complete Lesson type for the editor, including blocks
export interface EditableLessonWithBlocks extends CourseLesson {
  content_blocks: ContentBlock[]; // Ensure this matches your type
  course_id?: number; // For context
  module_id?: number; // For context
}

// Mock API client function
const fetchLessonWithContentBlocks = async (courseId: string, moduleId: string, lessonId: string): Promise<EditableLessonWithBlocks | null> => {
  console.log(`Fetching lesson ${lessonId} (course: ${courseId}, module: ${moduleId}) with content blocks... (mocked)`);
  // In a real app, you'd fetch this from an endpoint like:
  // GET /api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId} (ensure this returns blocks)
  // Or use the GET /api/courses/:courseId/edit and filter down.

  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate finding a lesson, e.g., lessonId "1001" from previous course mock
      if (lessonId === "1001") {
        resolve({
          id: 1001,
          module_id: 101, // from previous mock
          course_id: 1, // from previous mock
          title: 'Lesson 1.1: Introduction to Python',
          order_index: 0,
          content_blocks: [
            { id: 1, lesson_id: 1001, content_type: 'text', content_data: { text: "Welcome to Python! It's a versatile language." }, order_index: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 2, lesson_id: 1001, content_type: 'video_embed', content_data: { url: "https://www.youtube.com/embed/xyz", caption: "Intro Video" }, order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else if (lessonId === "1002") {
         resolve({
          id: 1002,
          module_id: 101, // from previous mock
          course_id: 1, // from previous mock
          title: 'Lesson 1.2: Variables and Data Types',
          order_index: 1,
          content_blocks: [
            { id: 3, lesson_id: 1002, content_type: 'text', content_data: { text: "Let's talk about variables: x = 5" }, order_index: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      else {
        resolve(null); // Simulate not found
      }
    }, 500);
  });
};


const LessonEditPage = () => {
  const params = useParams();
  const router = useRouter();

  const courseId = params?.courseId as string;
  const moduleId = params?.moduleId as string;
  const lessonId = params?.lessonId as string;

  const [lessonData, setLessonData] = useState<EditableLessonWithBlocks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && moduleId && lessonId) {
      setIsLoading(true);
      setError(null);
      fetchLessonWithContentBlocks(courseId, moduleId, lessonId)
        .then(data => {
          if (data) {
            setLessonData(data);
          } else {
            setError('Lesson not found.');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load lesson data. Please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError("Missing course, module, or lesson ID from URL.");
      setIsLoading(false);
    }
  }, [courseId, moduleId, lessonId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600 mx-auto"></div>
          <p className="text-lg text-gray-700 mt-4">Loading lesson editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-xl text-red-600">Error: {error}</p>
        <Link href={`/dashboard/educator/courses/edit/${courseId || 'prev'}`} legacyBehavior>
            <a className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 inline-flex items-center">
                <ArrowLeftIcon className="h-5 w-5 mr-2"/>
                Back to Course Editor
            </a>
        </Link>
      </div>
    );
  }

  if (!lessonData) {
    return <div className="container mx-auto px-4 py-8 text-center">Lesson data could not be loaded.</div>;
  }

  const backToCourseEditorUrl = `/dashboard/educator/courses/edit/${courseId}`;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <Link href={backToCourseEditorUrl} legacyBehavior>
        <a className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 group">
          <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Course Editor ({lessonData.course_id ? `Course ID ${lessonData.course_id}` : '...'})
        </a>
      </Link>
      <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-200">
        <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Editing Lesson: <span className="text-indigo-600">{lessonData.title}</span>
            </h1>
            <p className="text-sm text-gray-500">Module ID: {lessonData.module_id} | Lesson ID: {lessonData.id}</p>
        </div>
        <LessonContentEditor
            initialLessonData={lessonData}
            courseId={courseId}
            moduleId={moduleId}
            lessonId={lessonId}
        />
      </div>
    </div>
  );
};

export default LessonEditPage;
