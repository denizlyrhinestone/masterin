"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '@/lib/apiClient';
import { CourseSummary } from '@/types/courseTypes';
import CourseCard from '@/components/courses/CourseCard';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');

  const [subjects, setSubjects] = useState<string[]>([]);
  const [gradeLevels, setGradeLevels] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Assume backend will send this
  const [totalCourses, setTotalCourses] = useState(0);
  const coursesPerPage = 12; // Or get from API config

  const fetchTaxonomyData = useCallback(async () => {
    try {
      const [subjectsRes, gradeLevelsRes] = await Promise.all([
        apiClient.get<string[]>('/taxonomy/subjects'),
        apiClient.get<string[]>('/taxonomy/grade-levels'),
      ]);
      setSubjects(subjectsRes || []);
      setGradeLevels(gradeLevelsRes || []);
    } catch (err) {
      console.error("Failed to fetch taxonomy data:", err);
      // Not setting main page error for this, filters might just be empty
    }
  }, []);

  const fetchCourses = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedGradeLevel) params.append('grade_level', selectedGradeLevel);
      params.append('page', page.toString());
      params.append('limit', coursesPerPage.toString());

      // Assuming API response might include totalItems/totalPages
      // For now, the API returns just the course array. We'll mock pagination details.
      const data = await apiClient.get<CourseSummary[]>(`/courses?${params.toString()}`);
      setCourses(data || []);

      // Mocking pagination details as backend doesn't provide them yet
      // In a real scenario, the API would return { items: [], totalItems: X, totalPages: Y, currentPage: Z }
      if (data && data.length > 0) {
         // This is a rough mock. If we fetch 12 and get 12, there might be more.
         // A proper API would tell us the total.
        setTotalCourses(data.length < coursesPerPage && page === 1 ? data.length : (page * coursesPerPage + (data.length === coursesPerPage ? 1 : 0) ) );
        setTotalPages(Math.ceil( (page * coursesPerPage + (data.length === coursesPerPage ? 1 : 0) ) / coursesPerPage));
      } else if (page === 1) {
        setTotalCourses(0);
        setTotalPages(1);
      }
      setCurrentPage(page);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses.');
      setCourses([]); // Clear courses on error
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, selectedSubject, selectedGradeLevel, coursesPerPage]);

  useEffect(() => {
    fetchTaxonomyData();
  }, [fetchTaxonomyData]);

  useEffect(() => {
    fetchCourses(1); // Fetch page 1 when filters or search term change
  }, [debouncedSearchTerm, selectedSubject, selectedGradeLevel, fetchCourses]); // fetchCourses is memoized by useCallback

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchCourses(newPage);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedGradeLevel('');
    // fetchCourses(1) will be triggered by useEffect due to state changes
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-sky-700">Explore Courses</h1>
        <p className="mt-2 text-lg text-slate-600">Find your next learning adventure from our curated collection.</p>
      </header>

      {/* Filters and Search Section */}
      <div className="mb-8 p-4 sm:p-6 bg-white shadow-lg rounded-lg border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-slate-700">Search Courses</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="search"
                name="search"
                id="search"
                className="focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2.5"
                placeholder="Keywords, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700">Subject</label>
            <select id="subject" name="subject" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 block w-full p-2.5 border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="gradeLevel" className="block text-sm font-medium text-slate-700">Grade Level</label>
            <select id="gradeLevel" name="gradeLevel" value={selectedGradeLevel} onChange={(e) => setSelectedGradeLevel(e.target.value)}
              className="mt-1 block w-full p-2.5 border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
              <option value="">All Grades</option>
              {gradeLevels.map(gl => <option key={gl} value={gl}>{gl}</option>)}
            </select>
          </div>
        </div>
        {(searchTerm || selectedSubject || selectedGradeLevel) && (
            <div className="mt-4 text-right">
                <button
                    onClick={clearFilters}
                    className="text-xs text-sky-600 hover:text-sky-800 hover:underline inline-flex items-center"
                >
                    <XMarkIcon className="h-4 w-4 mr-1"/> Clear Filters
                </button>
            </div>
        )}
      </div>

      {isLoading && (
         <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-sky-600"></div>
         </div>
      )}
      {error && <p className="text-center text-red-500 py-10">Error loading courses: {error}</p>}

      {!isLoading && !error && courses.length === 0 && (
        <p className="text-center text-slate-500 py-10">No courses found matching your criteria. Try adjusting your filters.</p>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="mt-10 flex justify-center items-center space-x-2">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
              className="py-2 px-4 rounded-md text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <button key={pageNumber} onClick={() => handlePageChange(pageNumber)}
                className={`py-2 px-4 rounded-md text-sm font-medium border ${
                  currentPage === pageNumber
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}>
                {pageNumber}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}
              className="py-2 px-4 rounded-md text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
           <p className="text-center text-sm text-slate-500 mt-4">Page {currentPage} of {totalPages} (Total Courses: {totalCourses})</p>
        </>
      )}
    </div>
  );
};

export default CoursesPage;
