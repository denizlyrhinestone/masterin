"use client";

import React from 'react';
import CourseEditorForm from '@/components/courseEditor/CourseEditorForm';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const NewCoursePage = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <Link href="/dashboard/educator/courses" legacyBehavior>
        <a className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 group">
          <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to My Courses
        </a>
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Create New Course</h1>
      {/* Pass isNewCourse={true} and no initialCourseData */}
      <CourseEditorForm isNewCourse={true} />
    </div>
  );
};

export default NewCoursePage;
