"use client";

import { useEffect, useState } from 'react';
import { PencilIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import LecturerRequestService from '@/services/LecturerRequestService';
import { LecturerRequestResponse, ScheduleResponse } from '@/types/TypeResponse';
import AuthService from '@/services/AuthService';
import { toast } from 'react-hot-toast';
import { CreateRequest } from '@/components/requests/create-request';
import { NotificationDialog } from '@/components/ui/notification-dialog';

export default function LecturerRequestsPage() {
  const [requests, setRequests] = useState<LecturerRequestResponse[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LecturerRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Success notification states
  const [successRequest, setSuccessRequest] = useState<LecturerRequestResponse | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'create' | 'cancel' | 'conflict' | null>(null);
  const [conflictSchedule, setConflictSchedule] = useState<ScheduleResponse | null>(null);

  // Use our pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    currentData: paginatedRequests,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination({
    data: requests,
    defaultPageSize: 10,
    initialPage: 1
  });

  // Load lecturer's requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Không tìm thấy token xác thực');
          return;
        }

        const lecturerId = AuthService.getUserId(token);
        if (!lecturerId) {
          setError('Không thể xác định giảng viên');
          return;
        }

        const response = await LecturerRequestService.getRequestsByLecturer();

        if (response.success) {
          setRequests(response.data);
        } else {
          setError('Không thể tải danh sách yêu cầu');
        }
      } catch (err) {
        setError('Lỗi khi tải yêu cầu: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) {
      return;
    }

    try {
      const response = await LecturerRequestService.cancelRequest(requestId);

      if (response.success) {
        const canceledRequest = requests.find(r => r.id === requestId);
        setRequests(requests.filter(request => request.id !== requestId));
        
        if (canceledRequest) {
          setSuccessRequest(canceledRequest);
          setActionType('cancel');
          setIsSuccessDialogOpen(true);
        }
        
        setIsDetailModalOpen(false);
        setSelectedRequest(null);
      } else {
        toast.error('Không thể hủy yêu cầu');
      }
    } catch (err) {
      toast.error('Lỗi khi hủy yêu cầu: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const formatDateTime = (dateTimeStr: string | Date) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string | undefined | null) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string | undefined | null) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'ĐÃ PHÊ DUYỆT';
      case 'REJECTED':
        return 'ĐÃ TỪ CHỐI';
      case 'PENDING':
      default:
        return 'ĐANG CHỜ';
    }
  };

  const getWeekdayName = (day: number) => {
    const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
    return days[(day - 2 + 7) % 7] || "Không xác định";
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-xl shadow p-8 max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Success notification dialog */}
      {(successRequest || conflictSchedule) && (
        <div className="fixed inset-0 z-[100]">
          <NotificationDialog
            isOpen={isSuccessDialogOpen}
            onClose={() => {
              setIsSuccessDialogOpen(false);
              setSuccessRequest(null);
              setConflictSchedule(null);
              if (actionType === 'conflict') {
                setIsCreateModalOpen(true);
              }
              setActionType(null);
            }}
            title={
              actionType === 'create' ? "Tạo yêu cầu thành công!" :
              actionType === 'cancel' ? "Hủy yêu cầu thành công!" :
              actionType === 'conflict' ? "Phát hiện lịch học bị trùng!" :
              "Xóa yêu cầu thành công!"
            }
            type={actionType === 'conflict' ? 'warning' : 'success'}
            details={
              actionType === 'conflict' && conflictSchedule ? {
                "Cảnh báo": "Không thể tạo yêu cầu mới vì trùng với lịch học sau:",
                "Môn học": conflictSchedule.subjectName || '',
                "Lớp": conflictSchedule.class || '',
                "Nhóm": `Nhóm ${conflictSchedule.courseGroup || ''} - Buổi ${conflictSchedule.courseSection || ''}`,
                "Phòng": conflictSchedule.room || '',
                "Giảng viên": conflictSchedule.lecturer || '',
                "Thời gian": `${getWeekdayName(conflictSchedule.dayOfWeek)}, Tiết ${conflictSchedule.startPeriod}-${conflictSchedule.startPeriod + conflictSchedule.totalPeriod - 1}`,
                "Tuần học": conflictSchedule.semesterWeek || ''
              } : successRequest ? {
                "Môn học": successRequest.subject,
                "Nhóm": `Nhóm ${successRequest.groupNumber} - Buổi ${successRequest.sectionNumber}`,
                "Phòng mới": successRequest.newRoom,
                "Tuần học": successRequest.newSemesterWeek,
                "Thời gian": `${getWeekdayName(successRequest.newDayOfWeek)}, Tiết ${successRequest.newStartPeriod}-${successRequest.newStartPeriod + successRequest.newTotalPeriod - 1}`,
                "Trạng thái": getStatusLabel(successRequest.status)
              } : {}
            }
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu của tôi</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Tạo yêu cầu mới
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Bạn chưa có yêu cầu nào
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tạo yêu cầu mới để thay đổi lịch giảng dạy của bạn.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Tạo yêu cầu mới
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Môn học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhóm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phòng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tuần học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Nhóm {request.groupNumber} - Buổi {request.sectionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.newRoom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.newSemesterWeek}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getWeekdayName(request.newDayOfWeek)}, Tiết {request.newStartPeriod}-{request.newStartPeriod + request.newTotalPeriod - 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsDetailModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          {request.status?.toUpperCase() === 'PENDING' && (
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add pagination component */}
            {requests.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  pageSize={pageSize}
                  onPageSizeChange={handlePageSizeChange}
                  totalItems={totalItems}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Request Modal */}
      {isCreateModalOpen && !isSuccessDialogOpen && (
        <CreateRequest
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onRequestCreated={(newRequest) => {
            // Refresh the requests list after creating
            const token = localStorage.getItem('token');
            if (token) {
              const lecturerId = AuthService.getUserId(token);
              if (lecturerId) {
                LecturerRequestService.getRequestsByLecturer()
                  .then(response => {
                    if (response.success) {
                      setRequests(response.data);
                      // Show success notification
                      if (newRequest) {
                        setSuccessRequest(newRequest);
                        setActionType('create');
                        setIsSuccessDialogOpen(true);
                      }
                    }
                  });
              }
            }
            setIsCreateModalOpen(false);
          }}
          onConflict={(schedule) => {
            setConflictSchedule(schedule);
            setActionType('conflict');
            setIsSuccessDialogOpen(true);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết yêu cầu</h3>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-6">
              {/* Request Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin yêu cầu</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Môn học:</span>
                    <p className="text-sm font-medium">{selectedRequest.subject}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nhóm:</span>
                    <p className="text-sm font-medium">Nhóm {selectedRequest.groupNumber} - Buổi {selectedRequest.sectionNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Ngày tạo:</span>
                    <p className="text-sm font-medium">{formatDateTime(selectedRequest.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Trạng thái:</span>
                    <p className="text-sm">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedRequest.status)}`}>
                        {getStatusLabel(selectedRequest.status)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Request Changes */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin thay đổi</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Phòng:</span>
                    <p className="text-sm font-medium">{selectedRequest.newRoom}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tuần học:</span>
                    <p className="text-sm font-medium">{selectedRequest.newSemesterWeek}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Ngày trong tuần:</span>
                    <p className="text-sm font-medium">{getWeekdayName(selectedRequest.newDayOfWeek)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Thời gian:</span>
                    <p className="text-sm font-medium">Tiết {selectedRequest.newStartPeriod} - {selectedRequest.newStartPeriod + selectedRequest.newTotalPeriod - 1}</p>
                  </div>
                </div>
              </div>

              {/* Lecturer Message */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Lý do yêu cầu</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {selectedRequest.lecturerBody}
                </div>
              </div>

              {/* Manager Response (if any) */}
              {selectedRequest.managerBody && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Phản hồi của quản lý</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {selectedRequest.managerBody}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Đóng
                </button>
                {selectedRequest.status?.toUpperCase() === 'PENDING' && (
                  <button
                    onClick={() => {
                      handleCancelRequest(selectedRequest.id);
                      setIsDetailModalOpen(false);
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Hủy yêu cầu
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
