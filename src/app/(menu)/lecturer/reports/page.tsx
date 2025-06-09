'use client';

import React, { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ReportTable } from '@/components/reports/report.table';
import { CreateEditReportModal } from '@/components/reports/create-edit-report.modal';
import { ReportDetailsModal } from '@/components/reports/report-details.modal';
import { FilterPanel } from '@/components/ui/filter-panel';
import { NotificationDialog } from '@/components/ui/notification-dialog';
import ReportService from '@/services/ReportService';
import { ReportResponse } from '@/types/TypeResponse';
import AuthService from '@/services/AuthService';

export default function LecturerReportsPage() {
  // State
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Load reports
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const userId = AuthService.getUserId(localStorage.getItem('token') || undefined);
      const response = await ReportService.getReportByUserId(userId || undefined);
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

  // Handle report creation
  const handleCreateReport = async (data: { title: string; content: string }) => {
    try {
      const response = await ReportService.createReport(data);
      if (response.success) {
        showNotification({
          title: 'Tạo báo cáo thành công',
          type: 'success',
          details: { 'Tiêu đề': data.title }
        });
        loadReports();
      } else {
        showNotification({
          title: 'Lỗi khi tạo báo cáo',
          type: 'warning',
          details: { message: response.message }
        });
      }
    } catch (error) {
      showNotification({
        title: 'Lỗi khi tạo báo cáo',
        type: 'warning',
        details: { message: error instanceof Error ? error.message : String(error) }
      });
    }
  };

  // Handle report update
  const handleUpdateReport = async (data: { title: string; content: string }) => {
    if (!selectedReport) return;

    try {
      const response = await ReportService.updateReport(selectedReport.id, data);
      if (response.success) {
        showNotification({
          title: 'Cập nhật báo cáo thành công',
          type: 'success',
          details: { 'Tiêu đề': data.title }
        });
        loadReports();
      } else {
        showNotification({
          title: 'Lỗi khi cập nhật báo cáo',
          type: 'warning',
          details: { message: response.message }
        });
      }
    } catch (error) {
      showNotification({
        title: 'Lỗi khi cập nhật báo cáo',
        type: 'warning',
        details: { message: error instanceof Error ? error.message : String(error) }
      });
    }
  };

  // Handle report cancellation
  const handleCancelReport = async (reportId: number) => {
    try {
      const response = await ReportService.cancelReport(reportId);
      if (response.success) {
        showNotification({
          title: 'Hủy báo cáo thành công',
          type: 'success'
        });
        loadReports();
        setIsDetailsModalOpen(false);
      } else {
        showNotification({
          title: 'Lỗi khi hủy báo cáo',
          type: 'warning',
          details: { message: response.message }
        });
      }
    } catch (error) {
      showNotification({
        title: 'Lỗi khi hủy báo cáo',
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
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo của tôi</h1>
          <div className="flex items-center gap-4">
            <FilterPanel
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
              title="Lọc báo cáo"
            />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              Tạo báo cáo
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Đang tải danh sách báo cáo...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <ReportTable
            reports={filteredReports}
            onViewDetails={(report) => {
              setSelectedReport(report);
              setIsDetailsModalOpen(true);
            }}
          />
        </div>
      )}

      <CreateEditReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReport}
        mode="create"
      />

      <CreateEditReportModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReport(null);
      }}
        onSubmit={handleUpdateReport}
        initialData={selectedReport ?? undefined}
        mode="edit"
      />

      <ReportDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onStatusChange={selectedReport?.status === 'PENDING' ? 
          async (reportId: number, newStatus?: string) => {
            await handleCancelReport(reportId);
          } 
          : async () => {/* No action for non-PENDING reports */}}
        mode="lecturer"
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
