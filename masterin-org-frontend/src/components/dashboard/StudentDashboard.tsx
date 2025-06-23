"use client"; // Required for useEffect, useState

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { UserBadge } from '@/types/gamificationTypes';
import BadgeDisplayItem from '@/components/badges/BadgeDisplayItem';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';


interface LearningPathItemProps {
  name: string;
}
const LearningPathItem: React.FC<LearningPathItemProps> = ({ name }) => (
  <li className="p-3 mb-2 bg-indigo-50 rounded-md shadow-sm hover:bg-indigo-100 transition-colors">
    {name}
  </li>
);

interface CourseProgressProps {
  name: string;
  progress: number;
}
const CourseProgress: React.FC<CourseProgressProps> = ({ name, progress }) => (
  <div className="p-3 mb-3 bg-sky-50 rounded-md shadow-sm">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-sky-700">{name}</span>
      <span className="text-xs font-semibold text-sky-600">{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-sky-500 h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);


const StudentDashboard: React.FC = () => {
  const learningPaths = [
    { name: 'Web Development Basics' },
    { name: 'Introduction to Algebra' },
  ];

  const courses = [
    { name: 'HTML Fundamentals', progress: 75 },
    { name: 'Solving Equations - Part 1', progress: 30 },
    { name: 'JavaScript for Beginners', progress: 50 },
  ];

  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [isLoadingBadges, setIsLoadingBadges] = useState(true);
  const [errorBadges, setErrorBadges] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    setIsLoadingBadges(true);
    setErrorBadges(null);
    try {
      // Ensure getAuthToken() is available or handle auth state appropriately
      // For now, assume apiClient handles auth or this page is only shown to authenticated users
      const data = await apiClient.get<UserBadge[]>('/users/my-badges');
      setEarnedBadges(data || []);
    } catch (err: any) {
      setErrorBadges(err.message || "Failed to load badges.");
    } finally {
      setIsLoadingBadges(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-indigo-700 mb-8">
        Welcome, Student!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Learning Paths Section (Column 1) */}
        <section className="lg:col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">My Learning Paths</h3>
          {learningPaths.length > 0 ? (
            <ul>
              {learningPaths.map((path) => (
                <LearningPathItem key={path.name} name={path.name} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No active learning paths yet. Explore and enroll!</p>
          )}
        </section>

        {/* Courses Section (Column 2) */}
        <section className="lg:col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">My Courses</h3>
          {courses.length > 0 ? (
            <div>
              {courses.map((course) => (
                <CourseProgress key={course.name} name={course.name} progress={course.progress} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">You are not currently enrolled in any courses.</p>
          )}
        </section>

        {/* Earned Badges Section (Column 3) */}
        <section className="lg:col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Earned Badges</h3>
          {isLoadingBadges && <p className="text-sm text-slate-500">Loading badges...</p>}
          {errorBadges && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" /> {errorBadges}
            </div>
          )}
          {!isLoadingBadges && !errorBadges && earnedBadges.length === 0 && (
            <div className="text-center py-6 px-3 bg-slate-50 rounded-lg">
                <ShieldCheckIcon className="h-10 w-10 text-slate-400 mx-auto mb-2"/>
                <p className="text-sm text-slate-500">No badges earned yet. Keep learning!</p>
            </div>
          )}
          {!isLoadingBadges && !errorBadges && earnedBadges.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2"> {/* Added scroll for many badges */}
              {earnedBadges.map(badge => (
                <BadgeDisplayItem key={badge.id} badge={badge} />
              ))}
            </div>
          )}
        </section>


        {/* Recent Activity & AI Recommendations (Row 2, spanning columns if needed) */}
        <section className="md:col-span-2 lg:col-span-3 pt-8 mt-8 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h3>
                    <div className="p-4 bg-gray-50 rounded-md shadow-sm">
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Completed "HTML Basics Quiz" - Score: 90%</li>
                        <li>Unlocked "CSS Flexbox" badge (Placeholder - will be dynamic)</li>
                        <li>Joined "Calculus Study Group"</li>
                        </ul>
                    </div>
                </div>
                <div className="md:col-span-1">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">AI Recommendations</h3>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm">
                        <p className="text-sm text-yellow-700">
                        Based on your progress in Algebra, you might like "Advanced Trigonometry" or "Statistics Fundamentals".
                        </p>
                    </div>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
