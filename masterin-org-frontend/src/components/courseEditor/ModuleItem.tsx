"use client";

import React, { useState } from 'react';
import { CourseModule } from '@/types/courseTypes'; // Assuming CourseModule includes lessons array
import LessonItem, { EditableLesson } from './LessonItem';
import { PlusCircleIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, BookmarkIcon } from '@heroicons/react/24/outline';

export interface EditableModule extends Partial<CourseModule> {
  _tempId?: string; // For new, unsaved modules
  lessons: EditableLesson[]; // Ensure lessons are of EditableLesson type
  course_id?: number; // For context, if needed by LessonItem for deep linking or API calls
}

interface ModuleItemProps {
  module: EditableModule;
  moduleIndex: number;
  courseId: number | string; // Pass courseId down for lesson content navigation
  onUpdate: (moduleIdOrTempId: number | string, updatedData: Partial<EditableModule>) => void;
  onDelete: (moduleIdOrTempId: number | string) => void;
  onAddLesson: (moduleIdOrTempId: number | string) => void;
  // Lesson-specific handlers are now passed down to LessonItem if needed,
  // or can be derived from onUpdate (e.g., by finding the module then the lesson)
  onUpdateLesson: (moduleIdOrTempId: number | string, lessonIdOrTempId: number | string, updatedData: Partial<EditableLesson>) => void;
  onDeleteLesson: (moduleIdOrTempId: number | string, lessonIdOrTempId: number | string) => void;
}

const ModuleItem: React.FC<ModuleItemProps> = ({
  module,
  courseId,
  onUpdate,
  onDelete,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const moduleId = module.id || module._tempId!;

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate(moduleId, { [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-slate-50 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center flex-grow">
          <BookmarkIcon className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" />
          <input
            type="text"
            name="title"
            value={module.title || ''}
            onChange={handleDetailChange}
            className="flex-grow text-lg font-semibold text-gray-800 border-b-2 border-transparent focus:border-blue-500 outline-none py-1"
            placeholder="Module Title"
          />
        </div>
        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onDelete(moduleId)}
            className="text-red-500 hover:text-red-700 p-1"
            title="Delete Module"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 p-1"
            title={isExpanded ? "Collapse Module" : "Expand Module"}
          >
            {isExpanded ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-4 mt-2 space-y-4">
          <div>
            <label htmlFor={`module-desc-${moduleId}`} className="sr-only">Module Description</label>
            <textarea
              id={`module-desc-${moduleId}`}
              name="description"
              value={module.description || ''}
              onChange={handleDetailChange}
              className="w-full p-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Module description (optional)"
              rows={2}
            />
          </div>

          <div className="ml-4 pl-4 border-l-2 border-slate-300 space-y-3 py-2">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Lessons:</h4>
            {module.lessons && module.lessons.map((lesson, lessonIndex) => (
              <LessonItem
                key={lesson.id || lesson._tempId}
                lesson={{...lesson, course_id: module.course_id, module_id: module.id || Number(module._tempId?.replace('module_',''))}} // Pass IDs for context
                moduleIndex={0} // Not strictly needed if IDs are used
                lessonIndex={lessonIndex}
                courseId={courseId} // Pass actual courseId
                moduleId={moduleId}   // Pass actual moduleId or tempId
                onUpdate={(lessonIdOrTemp, updatedData) => onUpdateLesson(moduleId, lessonIdOrTemp, updatedData)}
                onDelete={(lessonIdOrTemp) => onDeleteLesson(moduleId, lessonIdOrTemp)}
              />
            ))}
            {(!module.lessons || module.lessons.length === 0) && (
                <p className="text-xs text-gray-500 italic">No lessons in this module yet.</p>
            )}
            <button
              type="button"
              onClick={() => onAddLesson(moduleId)}
              className="mt-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 font-medium py-1.5 px-3 rounded-md inline-flex items-center transition-colors"
            >
              <PlusCircleIcon className="h-4 w-4 mr-1.5" /> Add Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleItem;
