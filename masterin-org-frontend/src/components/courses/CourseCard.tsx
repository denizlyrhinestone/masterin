"use client";

import React from 'react';
import Link from 'next/link';
import { CourseSummary } from '@/types/courseTypes';
import { StarIcon, HeartIcon, UserCircleIcon, ClockIcon } from '@heroicons/react/24/solid'; // Using solid for filled stars/hearts potentially
import { StarIcon as StarOutlineIcon, HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline'; // For empty states or partial fills

interface CourseCardProps {
  course: CourseSummary;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const renderStars = (rating?: number) => {
    const totalStars = 5;
    const filledStars = Math.round(rating || 0);
    const stars = [];
    for (let i = 1; i <= totalStars; i++) {
      stars.push(
        i <= filledStars ? (
          <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarOutlineIcon key={i} className="h-5 w-5 text-yellow-400" />
        )
      );
    }
    return stars;
  };

  return (
    <Link href={`/courses/${course.id}`} legacyBehavior>
      <a className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
        <div className="relative">
          {course.thumbnail_image_url ? (
            <img
              src={course.thumbnail_image_url}
              alt={`Thumbnail for ${course.title}`}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
              <UserCircleIcon className="h-24 w-24 text-slate-400" /> {/* Placeholder icon */}
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-sky-700 group-hover:text-sky-800 transition-colors mb-2 truncate" title={course.title}>
            {course.title}
          </h3>
          {course.instructor_email && ( // Or instructor_name if available
            <p className="text-xs text-slate-500 mb-1 flex items-center">
              <UserCircleIcon className="h-4 w-4 mr-1.5 text-slate-400" />
              {course.instructor_email.split('@')[0]} {/* Display part of email as name placeholder */}
            </p>
          )}
          <p className="text-sm text-slate-600 mb-3 h-10 overflow-hidden"> {/* Fixed height for description snippet */}
            {course.description ?
              (course.description.length > 80 ? course.description.substring(0, 80) + "..." : course.description) :
              "No description available."
            }
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            {course.estimated_duration_hours && (
              <div className="flex items-center" title="Estimated Duration">
                <ClockIcon className="h-4 w-4 mr-1 text-slate-400" />
                <span>{course.estimated_duration_hours} hrs</span>
              </div>
            )}
            {course.grade_level && (
                 <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full">{course.grade_level}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center" title={`Rating: ${course.average_rating?.toFixed(1) || 'N/A'} from ${course.total_ratings || 0} ratings`}>
              {renderStars(course.average_rating)}
              <span className="ml-1.5 text-xs text-yellow-500">
                ({course.total_ratings || 0})
              </span>
            </div>
            <div className="flex items-center text-rose-500" title={`${course.total_likes || 0} likes`}>
              <HeartIcon className="h-5 w-5" />
              <span className="ml-1 text-xs">{course.total_likes || 0}</span>
            </div>
          </div>
          {/* Price can be added here if applicable */}
        </div>
      </a>
    </Link>
  );
};

export default CourseCard;
