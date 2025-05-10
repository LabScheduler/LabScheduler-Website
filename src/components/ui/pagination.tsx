import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  totalItems?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSizeOptions = [10, 20, 50, 100],
  pageSize,
  onPageSizeChange,
  totalItems,
  className
}: PaginationProps) {
  const getPageNumbers = () => {
    // Always show first and last page
    // Show 2 pages before and after current page
    // Use ellipsis (...) for pages that are not shown
    const pageNumbers = [];
    const ellipsis = -1;

    if (totalPages <= 7) {
      // If there are 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always add first page
      pageNumbers.push(1);

      // Calculate the range of pages to show around current page
      let rangeStart = Math.max(2, currentPage - 1);
      let rangeEnd = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range to always show 3 pages when possible
      if (currentPage <= 3) {
        rangeEnd = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 2) {
        rangeStart = Math.max(2, totalPages - 3);
      }

      // Add ellipsis before range if needed
      if (rangeStart > 2) {
        pageNumbers.push(ellipsis);
      }

      // Add pages in range
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis after range if needed
      if (rangeEnd < totalPages - 1) {
        pageNumbers.push(ellipsis);
      }

      // Always add last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 mt-4", className)}>
      <div className="flex items-center text-sm text-gray-600">
        {totalItems !== undefined && (
          <span className="mr-4">
            Hiển thị {Math.min(pageSize, totalItems - (currentPage - 1) * pageSize)} / {totalItems} mục
          </span>
        )}
        <span className="mr-2">Hiển thị:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Trang đầu"
        >
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Trang trước"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNumber, index) => (
            pageNumber === -1 ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-sm text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm",
                  pageNumber === currentPage
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {pageNumber}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Trang tiếp"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Trang cuối"
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 