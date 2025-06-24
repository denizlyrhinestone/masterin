"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number; // Optional, for displaying info
  totalItems?: number;   // Optional, for displaying info
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or less
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Determine which page numbers to display
  // Logic for more complex pagination (e.g., with ellipses) can be added here
  const pageNumbers = [];
  const maxPagesToShow = 5; // Max number of page buttons to show (excluding prev/next)

  if (totalPages <= maxPagesToShow + 2) { // Show all pages if not too many
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Logic for showing first, last, current, and adjacent pages with ellipses
    // Simplified: Show current page and some adjacent ones, plus first and last with ellipses
    pageNumbers.push(1); // Always show first page

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxPagesToShow -1); // show 1, 2, 3, 4 ... last
    } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 2) ); // show 1 ... secondLast-2, secondLast-1, secondLast, last
    }

    if (startPage > 2) {
      pageNumbers.push(-1); // Ellipsis placeholder
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push(-1); // Ellipsis placeholder
    }

    pageNumbers.push(totalPages); // Always show last page
  }


  return (
    <div className="flex items-center justify-between mt-6 py-3 px-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-b-lg shadow-sm">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {itemsPerPage && totalItems !== undefined ? (
          <span>
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
            {' - '}
            {Math.min(currentPage * itemsPerPage, totalItems)}
            {' of '} {totalItems} results
          </span>
        ) : (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline ml-1.5">Previous</span>
        </Button>

        {/* Page number buttons - simplified version for brevity in this step */}
        {/* A more complex version would render numbered buttons */}
        {/* For now, just showing current page info is handled above, and prev/next buttons work */}
        {/* Example of numbered buttons (can be expanded from pageNumbers array logic) */}
        {totalPages > 1 && pageNumbers.map((page, index) => (
            page === -1 ? (
                <span key={`ellipsis-${index}`} className="px-2.5 py-1.5 text-sm text-slate-500">...</span>
            ) : (
                <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={`min-w-[36px] ${currentPage === page ? 'font-bold' : ''}`}
                    aria-label={`Go to page ${page}`}
                >
                    {page}
                </Button>
            )
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline mr-1.5">Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
