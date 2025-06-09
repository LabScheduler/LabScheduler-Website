import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReportResponse } from '@/types/TypeResponse';
import { Textarea } from '@/components/ui/textarea';

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportResponse | null;
  onStatusChange: (reportId: number, newStatus?: string) => Promise<void>;
  mode?: 'manager' | 'lecturer';
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  isOpen,
  onClose,
  report,
  onStatusChange,
  mode = 'manager'
}) => {
  if (!isOpen || !report) return null;

  const handleStatusChange = async (newStatus?: string) => {
    try {
      await onStatusChange(report.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Error changing report status:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return dateObject.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = mode === 'lecturer' && report.status === 'PENDING';
  const canCancel = mode === 'lecturer' && report.status === 'PENDING';

  return (
    <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Chi tiết báo cáo</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Report Title */}
          <div>
            <h4 className="text-sm font-medium text-gray-500">Tiêu đề</h4>
            <p className="mt-1 text-sm text-gray-900">{report.title}</p>
          </div>

          {/* Reporter Info */}
          <div>
            <h4 className="text-sm font-medium text-gray-500">Người gửi</h4>
            <p className="mt-1 text-sm text-gray-900">{report.author}</p>
          </div>

          {/* Report Content */}
          <div>
            <h4 className="text-sm font-medium text-gray-500">Nội dung</h4>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.authorContent}</p>
            </div>
          </div>

          {/* Manager Response */}
          {report.managerContent && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Phản hồi của quản lý</h4>
              <div className="mt-1 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.managerContent}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Ngày gửi</h4>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(report.createdAt)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Cập nhật lần cuối</h4>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(report.updatedAt)}
              </p>
            </div>
          </div>

          {/* Status Management */}
          {mode === 'manager' && report.status === 'PENDING' && (
            <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
              <div>
                <label htmlFor="managerResponse" className="block text-sm font-medium text-gray-700 mb-1">
                  Phản hồi
                </label>
                <textarea
                  id="managerResponse"
                  rows={4}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Nhập phản hồi của bạn..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-150"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => handleStatusChange('APPROVED')}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-150"
                >
                  Duyệt
                </button>
              </div>
            </div>
          )}

          {/* Lecturer Actions */}
          {mode === 'lecturer' && (canEdit || canCancel) && (
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              {canCancel && (
                <button
                  onClick={() => handleStatusChange('CANCELLED')}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-150"
                >
                  Hủy báo cáo
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 