'use client';

import React, { useEffect, useState } from 'react';
import { ReportTable } from '@/components/reports/report.table';
import { ReportDetailsModal } from '@/components/reports/report-details.modal';
import { FilterPanel } from '@/components/ui/filter-panel';
import { NotificationDialog } from '@/components/ui/notification-dialog';
import ReportService from '@/services/ReportService';
import { ReportResponse } from '@/types/TypeResponse';
import UserService from '@/services/UserService';

export default function ReportsPage() {
  // State
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportCategory, setReportCategory] = useState('pending');
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [lecturers, setLecturers] = useState<Array<{ id: number; fullName: string }>>([]);

  // Notification state
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    type: 'success' | 'warning';
    details?: Record<string, string>;
  }>({
    isOpen: false,
    title: '',
    type: 'success',
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  // Report category options
  const reportCategories = [
    { value: 'pending', label: 'Báo cáo đang chờ' },
    { value: 'all', label: 'Tất cả báo cáo' },
  ];

  // Get lecturer list
  const loadLecturers = async () => {
    try {
      const response = await UserService.getAllLecturers();
      if (response.success) {
        setLecturers(response.data.map(lecturer => ({
          id: lecturer.id,
          fullName: lecturer.fullName
        })));
      }
    } catch (error) {
      console.error('Error loading lecturers:', error);
    }
  };

  // Load lecturers on component mount
  useEffect(() => {
    loadLecturers();
  }, []);

  // Lecturer options
  const lecturerOptions = [
    { value: '', label: 'Tất cả giảng viên' },
    ...lecturers.map(lecturer => ({
      value: lecturer.fullName,
      label: lecturer.fullName
    }))
  ];

  // Filter options
  const filterOptions = [
    {
      id: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      options: [
        { value: '', label: 'Tất cả' },
        { value: 'PENDING', label: 'Đang chờ' },
        { value: 'APPROVED', label: 'Đã duyệt' },
        { value: 'REJECTED', label: 'Từ chối' },
        { value: 'CANCELLED', label: 'Đã hủy' },
      ],
      value: filters.status,
    },
    {
      id: 'search',
      label: 'Tìm kiếm',
      type: 'search' as const,
      value: filters.search,
      placeholder: 'Tìm theo tiêu đề hoặc nội dung...',
    },
  ];

  // Load reports based on category
  const loadReports = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (reportCategory) {
        case 'pending':
          response = await ReportService.getAllPendingReports();
          break;
        default:
          response = await ReportService.getAllReports();
          break;
      }

      if (response.success) {
        setReports(response.data);
      } else {
        showNotification({
          title: 'Lỗi khi tải danh sách báo cáo',
          type: 'warning',
          details: { message: response.message }
        });
      }
    } catch (error) {
      showNotification({
        title: 'Lỗi khi tải danh sách báo cáo',
        type: 'warning',
        details: { message: error instanceof Error ? error.message : String(error) }
      });
    } finally {
      setLoading(false);
    }
  };

  // Load reports when category changes
  useEffect(() => {
    loadReports();
  }, [reportCategory]);

  // Handle report status change
  const handleStatusChange = async (reportId: number, newStatus?: string) => {
    try {
      const currentReport = reports.find(r => r.id === reportId);
      if (!currentReport) return;

      if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
        const response = await ReportService.processReport(reportId, newStatus);
        if (response.success) {
          showNotification({
            title: 'Cập nhật trạng thái thành công',
            type: 'success',
            details: {
              'Báo cáo': currentReport.title,
              'Trạng thái mới': newStatus === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'
            }
          });
          loadReports();
        } else {
          showNotification({
            title: 'Lỗi khi cập nhật trạng thái',
            type: 'warning',
            details: { message: response.message }
          });
        }
      } else if (newStatus === 'CANCELLED') {
        const response = await ReportService.cancelReport(reportId);
        if (response.success) {
          showNotification({
            title: 'Hủy báo cáo thành công',
            type: 'success',
            details: {
              'Báo cáo': currentReport.title
            }
          });
          loadReports();
        } else {
          showNotification({
            title: 'Lỗi khi hủy báo cáo',
            type: 'warning',
            details: { message: response.message }
          });
        }
      }
    } catch (error) {
      showNotification({
        title: 'Lỗi khi cập nhật trạng thái',
        type: 'warning',
        details: { message: error instanceof Error ? error.message : String(error) }
      });
    }
  };

  // Notification helper
  const showNotification = (config: {
    title: string;
    type: 'success' | 'warning';
    details?: Record<string, string>;
  }) => {
    setNotification({
      isOpen: true,
      ...config
    });
  };

  // Filter handlers
  const handleFilterChange = (filterId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      search: '',
    });
  };

  // Filter reports based on current filters
  const filteredReports = reports.filter(report => {
    const matchesStatus = !filters.status || report.status === filters.status;
    const matchesSearch = !filters.search || 
      report.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.authorContent.toLowerCase().includes(filters.search.toLowerCase());
    const matchesLecturer = !selectedLecturer || report.author === selectedLecturer;
    
    return matchesStatus && matchesSearch && matchesLecturer;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý báo cáo</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="block w-50 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {reportCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                className="block w-48 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {lecturerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <FilterPanel
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
              title="Lọc báo cáo"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <ReportTable
          reports={filteredReports}
          onViewDetails={(report) => {
            setSelectedReport(report);
            setIsModalOpen(true);
          }}
        />
      )}

      <ReportDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onStatusChange={handleStatusChange}
      />

      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        type={notification.type}
        details={notification.details}
      />
    </div>
  );
}
