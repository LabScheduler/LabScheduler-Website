"use client";
import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface UsePaginationProps<T> {
  data: T[];
  defaultPageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  currentData: T[];
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  totalItems: number;
}

export function usePagination<T>({
  data,
  defaultPageSize = 10,
  initialPage = 1,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const router = useRouter();
  const pathname = usePathname();
  let searchParams;
  
  try {
    searchParams = useSearchParams();
  } catch (error) {
    // If useSearchParams fails (during SSR or before Suspense is ready),
    // we'll use null and fall back to defaults
    searchParams = null;
  }
  
  // Initialize with values from URL or defaults
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (!searchParams) return initialPage;
    const urlPage = searchParams.get('page');
    return urlPage ? parseInt(urlPage, 10) : initialPage;
  });
  
  const [pageSize, setPageSize] = useState<number>(() => {
    if (!searchParams) return defaultPageSize;
    const urlPageSize = searchParams.get('pageSize');
    return urlPageSize ? parseInt(urlPageSize, 10) : defaultPageSize;
  });
  
  // Total number of items and pages
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Update currentPage if it's out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      handlePageChange(totalPages);
    }
  }, [totalPages, data.length]);

  // Create new URL when pagination changes
  useEffect(() => {
    if (!searchParams) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', currentPage.toString());
    params.set('pageSize', pageSize.toString());
    
    // Replace state to avoid creating a new history entry for each pagination change
    router.replace(`${pathname}?${params.toString()}`);
  }, [currentPage, pageSize, pathname, router, searchParams]);
  
  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handlePageSizeChange = (size: number) => {
    // When changing page size, try to keep the same items visible
    // Calculate the first item index in the current view
    const firstItemIndex = (currentPage - 1) * pageSize;
    // Determine what page this item would be on with the new page size
    const newPage = Math.floor(firstItemIndex / size) + 1;
    
    setPageSize(size);
    setCurrentPage(newPage);
  };
  
  // Calculate the current page data with memoization for performance
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);
  
  return {
    currentPage,
    pageSize,
    totalPages,
    currentData,
    handlePageChange,
    handlePageSizeChange,
    totalItems,
  };
} 