"use client";

import React from 'react';
import { UserBadge } from '@/types/gamificationTypes';
import Image from 'next/image'; // Using next/image for potential optimizations
import { ShieldCheckIcon } from '@heroicons/react/24/solid'; // Placeholder icon

interface BadgeDisplayItemProps {
  badge: UserBadge;
}

const BadgeDisplayItem: React.FC<BadgeDisplayItemProps> = ({ badge }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out w-full max-w-xs mx-auto text-center">
      <div className="w-24 h-24 relative mb-3">
        {badge.icon_url ? (
          <Image
            src={badge.icon_url}
            alt={`${badge.name} badge`}
            layout="fill"
            objectFit="contain"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/badges/default_badge.png'; }} // Fallback to a default image
          />
        ) : (
          // Fallback if no icon_url, or use a generic one from Heroicons
          <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-16 w-16 text-sky-500" />
          </div>
        )}
      </div>
      <h3 className="text-md font-semibold text-sky-700 mb-1">{badge.name}</h3>
      <p className="text-xs text-slate-500 mb-2 px-2 flex-grow" title={badge.description}>
        {badge.description.length > 60 ? badge.description.substring(0, 57) + "..." : badge.description}
      </p>
      <p className="text-xs text-slate-400">
        Achieved: {formatDate(badge.achieved_at)}
      </p>
    </div>
  );
};

export default BadgeDisplayItem;
