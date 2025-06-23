"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CourseSummary } from '@/types/courseTypes'; // Using alias
import { PlusCircleIcon, PencilIcon, EyeIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'; // Example icons

import apiClient from '@/lib/apiClient'; // Import the API client

const EducatorCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<CourseSummary | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use apiClient for the actual API call
      const data = await apiClient.get<CourseSummary[]>('/courses/my-courses');
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while fetching courses.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const openDeleteModal = (course: CourseSummary) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setCourseToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    setDeleteError(null); // Clear previous delete error
    try {
      // Use apiClient for the actual API call
      await apiClient.delete<void>(`/courses/${courseToDelete.id}`);
      setCourses(prevCourses => prevCourses.filter(c => c.id !== courseToDelete.id));
      closeDeleteModal();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete the course. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">Loading your courses...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600"><p>Error: {error}</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Courses</h1>
        <Link href="/dashboard/educator/courses/new" legacyBehavior>
          <a className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Create New Course
          </a>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No courses yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first course.</p>
          {/* The "Create New Course" button is already above, but can be duplicated here for emphasis if desired */}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    <div className="text-xs text-gray-500">{course.subject || 'N/A'} - {course.grade_level || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.review_status === 'published' ? 'bg-green-100 text-green-800' :
                      course.review_status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                      course.review_status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {course.review_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(course.updated_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Link href={`/dashboard/educator/courses/edit/${course.id}`} legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-800 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" title="Edit Course">
                        <PencilIcon className="h-5 w-5" />
                        <span className="sr-only">Edit</span>
                      </a>
                    </Link>
                    <Link href={`/courses/${course.id}`} legacyBehavior>
                      <a className="text-sky-600 hover:text-sky-800 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500" title="Preview Course">
                        <EyeIcon className="h-5 w-5" />
                        <span className="sr-only">Preview</span>
                      </a>
                    </Link>
                    <button
                      onClick={() => openDeleteModal(course)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                      title="Delete Course"
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Course
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the course "{courseToDelete.title}"? This action cannot be undone.
                      </p>
                      {deleteError && <p className="text-xs text-red-500 mt-2">{deleteError}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" onClick={handleDeleteConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Delete
                </button>
                <button type="button" onClick={closeDeleteModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducatorCoursesPage;
