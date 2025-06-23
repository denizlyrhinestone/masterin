"use client";

import React, { useState } from 'react';
import { FullCourse, CourseModule, CourseLesson } from '@/types/courseTypes'; // Assuming these types are defined
import { ChevronDownIcon, ChevronRightIcon, CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface CourseSidebarNavProps {
  course: FullCourse | null;
  currentModuleId: string | number | null;
  currentLessonId: string | number | null;
  onSelectLesson: (moduleId: string | number, lessonId: string | number, firstBlockId?: string | number) => void;
  completedLessonIds: number[]; // Updated prop
  isLoadingProgress: boolean; // New prop
}

const CourseSidebarNav: React.FC<CourseSidebarNavProps> = ({
  course,
  currentModuleId,
  currentLessonId,
  onSelectLesson,
  completedLessonIds, // Updated prop
  isLoadingProgress, // New prop
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string | number>>(new Set());

  // Effect to expand current module - keep this

  useEffect(() => {
    // Automatically expand the current module
    if (currentModuleId) {
      setExpandedModules(prev => new Set(prev).add(currentModuleId));
    }
  }, [currentModuleId]);

  const toggleModule = (moduleId: string | number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  if (!course) {
    return <div className="p-4 text-sm text-slate-500">Loading course structure...</div>;
  }

  return (
    <nav className="w-full md:w-80 lg:w-96 bg-slate-50 p-3 sm:p-4 rounded-lg shadow-md border border-slate-200 max-h-[calc(100vh-150px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-3 sm:mb-4 px-2">
        <h2 className="text-lg font-semibold text-sky-700 truncate">{course.title} - Content</h2>
        {isLoadingProgress && (
            <div className="flex items-center text-xs text-sky-600">
                <div className="w-3 h-3 border-2 border-dashed rounded-full animate-spin border-sky-500 mr-1.5"></div>
                Syncing...
            </div>
        )}
      </div>

      {course.modules && course.modules.length > 0 ? (
        <ul className="space-y-1">
          {course.modules.map((module) => {
            const isModuleExpanded = expandedModules.has(module.id);
            return (
              <li key={module.id} className="bg-slate-100 rounded-md">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
                >
                  <span className="truncate">{module.title}</span>
                  {isModuleExpanded ? (
                    <ChevronDownIcon className="h-5 w-5 text-slate-500 transform transition-transform" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-slate-500 transform transition-transform" />
                  )}
                </button>
                {isModuleExpanded && module.lessons && module.lessons.length > 0 && (
                  <ul className="mt-1 mb-1 ml-3 pl-3 border-l-2 border-slate-300 space-y-0.5">
                    {module.lessons.map((lesson) => {
                      const isLessonActive = lesson.id === currentLessonId && module.id === currentModuleId;
                      const isCompleted = completedLessonIds.includes(lesson.id); // Use updated prop and method
                      const firstBlockId = lesson.content_blocks?.[0]?.id;
                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => onSelectLesson(module.id, lesson.id, firstBlockId)}
                            className={`w-full text-left px-2.5 py-2 text-xs rounded-md transition-colors flex items-center group
                              ${isLessonActive ? 'bg-sky-500 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'}
                              ${isCompleted && !isLessonActive ? 'text-slate-500' : ''}
                            `}
                            title={lesson.title}
                          >
                            {isCompleted ? (
                              <CheckCircleIcon className={`h-4 w-4 mr-1.5 flex-shrink-0 ${isLessonActive ? 'text-white' : 'text-green-500'}`} />
                            ) : (
                              <DocumentTextIcon className={`h-4 w-4 mr-1.5 flex-shrink-0 ${isLessonActive ? 'text-white' : 'text-sky-500 group-hover:text-sky-600'}`} />
                            )}
                            <span className={`truncate ${isCompleted && !isLessonActive ? 'line-through' : ''}`}>{lesson.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                 {isModuleExpanded && (!module.lessons || module.lessons.length === 0) && (
                    <p className="px-3 py-2 text-xs text-slate-400 italic">No lessons in this module.</p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-slate-500 px-2">No modules in this course yet.</p>
      )}
      {/* Optional: Display overall progress if studentProgress object is passed */}
      {/* Example:
      {studentProgress && (
        <div className="mt-4 pt-2 border-t border-slate-300">
          <p className="text-xs text-slate-600 mb-1">Overall Progress:</p>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className="bg-sky-500 h-2.5 rounded-full"
              style={{ width: `${studentProgress.progress_percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-right text-slate-500 mt-0.5">{studentProgress.progress_percentage}%</p>
        </div>
      )}
      */}
    </nav>
  );
};
      ) : (
        <p className="text-sm text-slate-500 px-2">No modules in this course yet.</p>
      )}
    </nav>
  );
};

export default CourseSidebarNav;
