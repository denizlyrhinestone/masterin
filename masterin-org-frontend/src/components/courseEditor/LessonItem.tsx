"use client";

import React from 'react';
import { CourseLesson } from '@/types/courseTypes'; // Assuming CourseLesson is defined here
import { PencilIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export interface EditableLesson extends Partial<CourseLesson> {
  _tempId?: string; // For new, unsaved lessons
  // If CourseLesson from types doesn't include course_id and module_id, add them if needed for API calls from here
  course_id?: number; // Needed for navigation to content editor
  module_id?: number; // Needed for navigation to content editor
}

interface LessonItemProps {
  lesson: EditableLesson;
  moduleIndex: number; // Only if needed for some specific callback not involving IDs
  lessonIndex: number;
  courseId: number | string; // For navigation to content editor
  moduleId: number | string; // For navigation to content editor
  onUpdate: (lessonIdOrTempId: number | string, updatedData: Partial<EditableLesson>) => void;
  onDelete: (lessonIdOrTempId: number | string) => void;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, courseId, moduleId, onUpdate, onDelete }) => {
  const lessonId = lesson.id || lesson._tempId!;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(lessonId, { title: e.target.value });
  };

  // For navigation to lesson content editor (example path)
  // Ensure courseId and moduleId are actual IDs, not tempIds, if used for DB lookups by the target page.
  // If lesson.id is undefined (it's a new, unsaved lesson), "Manage Content" might be disabled or hidden.
  const manageContentPath = lesson.id
    ? `/dashboard/educator/courses/edit/${courseId}/module/${moduleId}/lesson/${lesson.id}/content`
    : '#'; // Or disable the link/button

  return (
    <div className="p-3 border border-gray-200 rounded-md bg-white hover:shadow-md transition-shadow duration-150 mb-3">
      <div className="flex items-center justify-between">
        <DocumentTextIcon className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
        <input
          type="text"
          value={lesson.title || ''}
          onChange={handleTitleChange}
          className="flex-grow text-sm font-medium text-gray-800 border-b border-transparent focus:border-indigo-500 outline-none py-1"
          placeholder="Lesson Title"
        />
        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
          {lesson.id && (
            <Link href={manageContentPath} legacyBehavior>
              <a className="p-1.5 rounded-md text-sky-600 hover:text-sky-700 hover:bg-sky-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-sky-500" title="Manage Lesson Content" aria-label="Manage Lesson Content">
                <PencilIcon className="h-4 w-4" />
              </a>
            </Link>
          )}
          <button
            type="button"
            onClick={() => onDelete(lessonId)}
            className="p-1.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500"
            title="Delete Lesson"
            aria-label="Delete Lesson"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonItem;
