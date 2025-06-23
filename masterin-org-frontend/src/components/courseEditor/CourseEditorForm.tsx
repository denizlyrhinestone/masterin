"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FullCourse, CourseModule as CourseModuleType, CourseLesson as CourseLessonType, CourseSummary } from '@/types/courseTypes';
import { PlusCircleIcon, SaveIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ModuleItem, { EditableModule } from './ModuleItem';
import { EditableLesson } from './LessonItem';
import apiClient from '@/lib/apiClient'; // Import the API client
import Link from 'next/link'; // Import Link

interface CourseEditorFormProps {
  initialCourseData?: FullCourse | null;
  isNewCourse: boolean;
}

const CourseEditorForm: React.FC<CourseEditorFormProps> = ({ initialCourseData, isNewCourse }) => {
  const router = useRouter();
  const [courseDetails, setCourseDetails] = useState<Partial<CourseSummary>>({
    title: '', description: '', subject: '', grade_level: '', language: 'en',
    estimated_duration_hours: 0, thumbnail_image_url: '',
    is_publicly_browsable: true, is_template: false, review_status: 'draft',
  });
  const [modules, setModules] = useState<EditableModule[]>([]);
  const [isLoading, setIsLoading] = useState(false); // General loading for save course
  const [actionError, setActionError] = useState<string | null>(null); // For errors from specific actions like add/delete module/lesson
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Store the original course ID for updates, even if details.id is cleared for new course
  const [existingCourseId, setExistingCourseId] = useState<number | undefined>(undefined);


  useEffect(() => {
    if (initialCourseData) {
      const { modules: initialModules, ...details } = initialCourseData;
      setCourseDetails(details);
      setModules(initialModules?.map(m => ({
        ...m,
        id: m.id, // Ensure existing IDs are numbers
        _tempId: undefined, // Clear tempId if it's an existing module
        lessons: m.lessons?.map(l => ({
            ...l,
            id: l.id, // Ensure existing IDs are numbers
            _tempId: undefined, // Clear tempId
            content_blocks: l.content_blocks || []
        })) || []
      })) || []);
      if (!isNewCourse) {
        setExistingCourseId(initialCourseData.id);
      }
    } else {
      // Reset for a new course form
      setCourseDetails({
        title: '', description: '', subject: '', grade_level: '', language: 'en',
        estimated_duration_hours: 0, thumbnail_image_url: '',
        is_publicly_browsable: true, is_template: false, review_status: 'draft',
      });
      setModules([]);
      setExistingCourseId(undefined);
    }
  }, [initialCourseData, isNewCourse]);

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCourseDetails(prev => ({ ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSaveCourse = async () => {
    setIsLoading(true); setActionError(null); setSaveSuccessMessage(null);

    const coursePayload = { ...courseDetails };
    // Remove temporary IDs before saving, backend will assign new IDs
    const cleanModules = modules.map(mod => {
        const { _tempId, ...restMod } = mod;
        return {
            ...restMod,
            lessons: mod.lessons.map(les => {
                const { _tempId: lessonTempId, ...restLes } = les;
                return restLes;
            })
        };
    });

    try {
      if (isNewCourse || !existingCourseId) {
        // Create new course
        const newCourseBase = await apiClient.post<CourseSummary>('/courses', coursePayload);
        setExistingCourseId(newCourseBase.id); // Store new ID for subsequent operations
        setCourseDetails(prev => ({...prev, id: newCourseBase.id, created_at: newCourseBase.created_at, updated_at: newCourseBase.updated_at }));

        // Now save modules and lessons under the newCourseBase.id
        const savedModules: EditableModule[] = [];
        for (const module of cleanModules) {
          const { lessons, ...moduleData } = module;
          const newModule = await apiClient.post<CourseModuleType>(`/courses/${newCourseBase.id}/modules`, moduleData);
          const savedLessons: EditableLesson[] = [];
          for (const lesson of lessons) {
            const newLesson = await apiClient.post<CourseLessonType>(`/courses/${newCourseBase.id}/modules/${newModule.id}/lessons`, lesson);
            savedLessons.push(newLesson as EditableLesson);
          }
          savedModules.push({ ...newModule, lessons: savedLessons });
        }
        setModules(savedModules);
        setSaveSuccessMessage(`Course '${newCourseBase.title}' created successfully! You can continue editing.`);
        router.replace(`/dashboard/educator/courses/edit/${newCourseBase.id}`, { scroll: false }); // Update URL without reload

      } else {
        // Update existing course details (modules/lessons updated separately via their handlers)
        const updatedCourseDetails = await apiClient.put<CourseSummary>(`/courses/${existingCourseId}`, coursePayload);
        setCourseDetails(updatedCourseDetails);
        // Note: Modules and lessons are assumed to be saved via their own handlers for existing courses.
        // If a full nested save is desired for PUT /courses/:id, the backend needs to support it,
        // and this frontend logic would send the full 'cleanModules' payload.
        // For now, this main save button only saves course-level details for existing courses.
        setSaveSuccessMessage(`Course '${updatedCourseDetails.title}' details updated successfully!`);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to save course.');
      console.error("Save course error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModule = async () => {
    setActionError(null);
    if (!existingCourseId && !isNewCourse) { // Should be !existingCourseId if it's a new course not yet saved
        setActionError("Please save the basic course details first before adding modules.");
        // Or, allow adding to local state, and the main save will handle it.
        // For simplicity now, let's adopt the latter: add to local state.
    }
    const tempId = `module_${Date.now()}_${Math.random()}`;
    const newModuleData: EditableModule = {
      _tempId: tempId, title: 'New Module', description: '', order_index: modules.length, lessons: []
    };

    if (existingCourseId) { // If course exists, save module immediately
        try {
            const { _tempId, ...payload } = newModuleData; // Don't send _tempId to backend
            const savedModule = await apiClient.post<CourseModuleType>(`/courses/${existingCourseId}/modules`, payload);
            setModules(prev => [...prev.filter(m => m._tempId !== tempId), { ...savedModule, lessons: [] }]);
        } catch (err: any) { setActionError(err.message || "Failed to add module."); }
    } else { // For a new course, just add to local state
        setModules(prev => [...prev, newModuleData]);
    }
  };

  const handleUpdateModule = useCallback(async (moduleIdOrTempId: number | string, updatedData: Partial<EditableModule>) => {
    setActionError(null);
    const moduleToUpdate = modules.find(m => m.id === moduleIdOrTempId || m._tempId === moduleIdOrTempId);
    if (!moduleToUpdate) return;

    if (moduleToUpdate.id && existingCourseId) { // Existing module
        try {
            const { lessons, course_id, ...payload } = { ...moduleToUpdate, ...updatedData }; // Exclude lessons and course_id from PUT payload for module details
            const savedModule = await apiClient.put<CourseModuleType>(`/courses/${existingCourseId}/modules/${moduleToUpdate.id}`, payload);
            setModules(prev => prev.map(m => (m.id === savedModule.id) ? { ...m, ...savedModule, lessons: m.lessons } : m)); // Preserve lessons
        } catch (err: any) { setActionError(err.message || "Failed to update module."); }
    } else { // Temp module or course not saved yet, just update local state
        setModules(prev => prev.map(m => (m.id === moduleIdOrTempId || m._tempId === moduleIdOrTempId) ? { ...m, ...updatedData } : m));
    }
  }, [modules, existingCourseId]);

  const handleDeleteModule = useCallback(async (moduleIdOrTempId: number | string) => {
    setActionError(null);
    const moduleToDelete = modules.find(m => m.id === moduleIdOrTempId || m._tempId === moduleIdOrTempId);
    if (!moduleToDelete) return;

    if (moduleToDelete.id && existingCourseId) { // Existing module
        if (!confirm(`Are you sure you want to delete module: "${moduleToDelete.title}"? This will also delete its lessons.`)) return;
        try {
            await apiClient.delete<void>(`/courses/${existingCourseId}/modules/${moduleToDelete.id}`);
            setModules(prev => prev.filter(m => m.id !== moduleIdOrTempId));
        } catch (err: any) { setActionError(err.message || "Failed to delete module."); }
    } else { // Temp module, just remove from local state
        setModules(prev => prev.filter(m => m._tempId !== moduleIdOrTempId));
    }
  }, [modules, existingCourseId]);

  const handleAddLesson = useCallback(async (moduleIdOrTempId: number | string) => {
    setActionError(null);
    const targetModule = modules.find(m => m.id === moduleIdOrTempId || m._tempId === moduleIdOrTempId);
    if (!targetModule) return;

    const tempLessonId = `lesson_${Date.now()}_${Math.random()}`;
    const newLessonData: EditableLesson = { _tempId: tempLessonId, title: 'New Lesson', order_index: targetModule.lessons.length, content_blocks: [] };

    if (targetModule.id && existingCourseId) { // Module is saved, course is saved
        try {
            const { _tempId, ...payload } = newLessonData;
            const savedLesson = await apiClient.post<CourseLessonType>(`/courses/${existingCourseId}/modules/${targetModule.id}/lessons`, payload);
            setModules(prev => prev.map(m =>
                (m.id === moduleIdOrTempId) ? { ...m, lessons: [...m.lessons, { ...savedLesson, content_blocks: [] }] } : m
            ));
        } catch (err: any) { setActionError(err.message || "Failed to add lesson."); }
    } else { // Module is temporary or course not saved, add to local state
        setModules(prev => prev.map(m =>
            (m.id === moduleIdOrTempId || m._tempId === moduleIdOrTempId) ? { ...m, lessons: [...m.lessons, newLessonData] } : m
        ));
    }
  }, [modules, existingCourseId]);

  const handleUpdateLesson = useCallback(async (moduleIdOrTempId: number | string, lessonIdOrTempId: number | string, updatedData: Partial<EditableLesson>) => {
    setActionError(null);
    const targetModule = modules.find(m => m.id === moduleIdOrTempId || m._tempId === moduleIdOrTempId);
    if (!targetModule) return;
    const lessonToUpdate = targetModule.lessons.find(l => l.id === lessonIdOrTempId || l._tempId === lessonIdOrTempId);
    if (!lessonToUpdate) return;

    if (lessonToUpdate.id && targetModule.id && existingCourseId) { // Existing lesson in existing module
        try {
            const { content_blocks, module_id, course_id, ...payload } = { ...lessonToUpdate, ...updatedData };
            const savedLesson = await apiClient.put<CourseLessonType>(`/courses/${existingCourseId}/modules/${targetModule.id}/lessons/${lessonToUpdate.id}`, payload);
            setModules(prev => prev.map(m =>
                (m.id === moduleIdOrTempId) ? { ...m, lessons: m.lessons.map(l => l.id === savedLesson.id ? { ...l, ...savedLesson, content_blocks: l.content_blocks } : l) } : m
            ));
        } catch (err: any) { setActionError(err.message || "Failed to update lesson."); }
    } else { // Temp lesson or module, just update local state
         setModules(prev => prev.map(m =>
            (m.id === moduleIdOrTempId || m._tempId === moduleIdOrTempId) ? { ...m, lessons: m.lessons.map(l => (l.id === lessonIdOrTempId || l._tempId === lessonIdOrTempId) ? { ...l, ...updatedData } : l) } : m
        ));
    }
  }, [modules, existingCourseId]);

  const handleDeleteLesson = useCallback(async (moduleIdOrTempId: number | string, lessonIdOrTempId: number | string) => {
    setActionError(null);
    const targetModule = modules.find(m => m.id === moduleIdOrTempId || m._tempId === moduleIdOrTempId);
    if (!targetModule) return;
    const lessonToDelete = targetModule.lessons.find(l => l.id === lessonIdOrTempId || l._tempId === lessonIdOrTempId);
    if (!lessonToDelete) return;

    if (lessonToDelete.id && targetModule.id && existingCourseId) { // Existing lesson
        if (!confirm(`Are you sure you want to delete lesson: "${lessonToDelete.title}"?`)) return;
        try {
            await apiClient.delete<void>(`/courses/${existingCourseId}/modules/${targetModule.id}/lessons/${lessonToDelete.id}`);
            setModules(prev => prev.map(m =>
                (m.id === moduleIdOrTempId || m._tempId === moduleIdOrTempId) ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonIdOrTempId) } : m
            ));
        } catch (err: any) { setActionError(err.message || "Failed to delete lesson."); }
    } else { // Temp lesson, just remove from local state
        setModules(prev => prev.map(m =>
            (m.id === moduleIdOrTempId || m._tempId === moduleIdOrTempId) ? { ...m, lessons: m.lessons.filter(l => l._tempId !== lessonIdOrTempId) } : m
        ));
    }
  }, [modules, existingCourseId]);


  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSaveCourse(); }} className="space-y-8">
      <section className="p-6 bg-white shadow-xl rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Course Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={courseDetails.title} onChange={handleDetailChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
            <input type="text" name="subject" id="subject" value={courseDetails.subject || ''} onChange={handleDetailChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" placeholder="e.g., Mathematics, History"/>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" rows={4} value={courseDetails.description || ''} onChange={handleDetailChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
          </div>
           <div>
            <label htmlFor="grade_level" className="block text-sm font-medium text-gray-700">Grade Level</label>
            <input type="text" name="grade_level" id="grade_level" value={courseDetails.grade_level || ''} onChange={handleDetailChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" placeholder="e.g., High School, K-2"/>
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
            <select name="language" id="language" value={courseDetails.language || 'en'} onChange={handleDetailChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 bg-white">
                <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option>
            </select>
          </div>
          <div>
            <label htmlFor="estimated_duration_hours" className="block text-sm font-medium text-gray-700">Estimated Duration (Hours)</label>
            <input type="number" name="estimated_duration_hours" id="estimated_duration_hours" value={courseDetails.estimated_duration_hours || ''} onChange={handleDetailChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" />
          </div>
           <div>
            <label htmlFor="thumbnail_image_url" className="block text-sm font-medium text-gray-700">Thumbnail Image URL</label>
            <input type="url" name="thumbnail_image_url" id="thumbnail_image_url" value={courseDetails.thumbnail_image_url || ''} onChange={handleDetailChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" placeholder="https://example.com/image.png"/>
          </div>
          <div className="md:col-span-2 space-y-2 pt-2">
            <div className="flex items-center">
                <input type="checkbox" name="is_publicly_browsable" id="is_publicly_browsable" checked={courseDetails.is_publicly_browsable || false} onChange={handleDetailChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                <label htmlFor="is_publicly_browsable" className="ml-2 block text-sm text-gray-900">Publicly Browsable</label>
            </div>
            <div className="flex items-center">
                <input type="checkbox" name="is_template" id="is_template" checked={courseDetails.is_template || false} onChange={handleDetailChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                <label htmlFor="is_template" className="ml-2 block text-sm text-gray-900">Is a Course Template</label>
            </div>
          </div>
           {!isNewCourse && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Review Status</label>
              <p className="mt-1 text-sm text-gray-600 p-2 bg-gray-100 rounded-md capitalize">{courseDetails.review_status?.replace('_', ' ')}</p>
            </div>
           )}
        </div>
      </section>

      <section className="p-6 bg-white shadow-xl rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Course Content: Modules & Lessons</h2>
          <button
            type="button"
            onClick={handleAddModule}
            className="bg-sky-100 text-sky-700 hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 font-semibold py-2 px-4 rounded-md inline-flex items-center text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Module
          </button>
        </div>
        <div className="space-y-6">
          {modules.map((module, moduleIndex) => (
            <ModuleItem
              key={module.id || module._tempId}
              module={module}
              moduleIndex={moduleIndex}
              courseId={existingCourseId || "new"}
              onUpdate={handleUpdateModule}
              onDelete={handleDeleteModule}
              onAddLesson={handleAddLesson}
              onUpdateLesson={handleUpdateLesson}
              onDeleteLesson={handleDeleteLesson}
            />
          ))}
          {modules.length === 0 && <p className="text-gray-500 text-center py-6 text-sm">No modules yet. Click "Add Module" to build your course structure.</p>}
        </div>
      </section>

      <div className="mt-10 flex justify-end space-x-4 items-center border-t pt-6">
        {actionError && <p className="text-sm text-red-600 flex items-center"><ExclamationTriangleIcon className="h-5 w-5 inline mr-1 flex-shrink-0"/> {actionError}</p>}
        {saveSuccessMessage && <p className="text-sm text-green-600">{saveSuccessMessage}</p>}
        <Link href="/dashboard/educator/courses" legacyBehavior>
          <a className="py-2 px-4 rounded-md text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 transition-colors">
            Cancel
          </a>
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="py-2 px-6 rounded-md text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center transition-colors"
        >
          <SaveIcon className="h-5 w-5 mr-2" />
          {isLoading ? 'Saving...' : (isNewCourse && !existingCourseId ? 'Create & Edit Content' : 'Save Changes')}
        </button>
      </div>
    </form>
  );
};

export default CourseEditorForm;
