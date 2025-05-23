"use client";

import { useEffect, useState, useMemo } from "react";
import { PencilIcon, CheckIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import LecturerRequestService from "@/services/LecturerRequestService";
import { LecturerRequestResponse } from "@/types/TypeResponse";
import AuthService from "@/services/AuthService";
import { toast } from "react-hot-toast";
import { NotificationDialog } from "@/components/ui/notification-dialog";
import { FilterPanel } from "@/components/ui/filter-panel";

export default function RequestsPage() {
  const [requests, setRequests] = useState<LecturerRequestResponse[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LecturerRequestResponse | null>(null);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [requestType, setRequestType] = useState<'pending' | 'all'>('pending');
  const [filters, setFilters] = useState({
    lecturer: '',
    subject: '',
    status: '',
    searchName: ''
  });

  // Success notification states
  const [successRequest, setSuccessRequest] = useState<LecturerRequestResponse | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Extract unique values for filter dropdowns
  const lecturerOptions = useMemo(() => 
    Array.from(new Set(requests.map(r => r.lecturer))).sort(), [requests]);
  
  const subjectOptions = useMemo(() => 
    Array.from(new Set(requests.map(r => r.subject))).sort(), [requests]);
  
  const statusOptions = useMemo(() => [
    { value: 'PENDING', label: 'Đang chờ' },
    { value: 'APPROVED', label: 'Đã phê duyệt' },
    { value: 'REJECTED', label: 'Đã từ chối' }
  ], []);

  const filterOptions = useMemo(() => [
    {
      id: 'searchName',
      label: 'Tìm kiếm',
      type: 'search' as const,
      value: filters.searchName || '',
      placeholder: 'Tìm theo tên giảng viên hoặc môn học...'
    },
    {
      id: 'lecturer',
      label: 'Giảng viên',
      type: 'select' as const,
      value: filters.lecturer,
      options: lecturerOptions.map(lecturer => ({ 
        value: lecturer, 
        label: lecturer 
      }))
    },
    {
      id: 'subject',
      label: 'Môn học',
      type: 'select' as const,
      value: filters.subject,
      options: subjectOptions.map(subject => ({ 
        value: subject, 
        label: subject 
      }))
    },
    {
      id: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      value: filters.status,
      options: statusOptions
    }
  ], [filters, lecturerOptions, subjectOptions, statusOptions]);

  // Apply filters
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Filter by lecturer
      if (filters.lecturer && request.lecturer !== filters.lecturer) {
        return false;
      }
      
      // Filter by subject
      if (filters.subject && request.subject !== filters.subject) {
        return false;
      }
      
      // Filter by status
      if (filters.status && request.status !== filters.status) {
        return false;
      }
      
      // Filter by search term
      if (filters.searchName) {
        const searchTerm = filters.searchName.toLowerCase();
        const matchesLecturer = request.lecturer.toLowerCase().includes(searchTerm);
        const matchesSubject = request.subject.toLowerCase().includes(searchTerm);
        if (!matchesLecturer && !matchesSubject) {
          return false;
        }
      }
      
      return true;
    });
  }, [requests, filters]);

  // Use our pagination hook with filtered data
  const {
    currentPage,
    pageSize,
    totalPages,
    currentData: paginatedRequests,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination({
    data: filteredRequests,
    defaultPageSize: 10,
    initialPage: 1
  });

  const handleFilterChange = (filterId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      lecturer: '',
      subject: '',
      status: '',
      searchName: ''
    });
  };

  // Load requests based on user role and request type
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

        const role = AuthService.getRole(token);
        setUserRole(role);

        let response;
        if (role === 'MANAGER') {
          response = requestType === 'pending' 
            ? await LecturerRequestService.getAllPendingRequests()
            : await LecturerRequestService.getAllRequests();
        } else if (role === 'LECTURER') {
          response = await LecturerRequestService.getRequestsByLecturer();
        } else {
          setError('Không có quyền truy cập');
          return;
        }

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
  }, [requestType]); // Add requestType as dependency

  const refreshRequests = async () => {
    try {
      const response = requestType === 'pending' 
        ? await LecturerRequestService.getAllPendingRequests()
        : await LecturerRequestService.getAllRequests();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải lại danh sách yêu cầu: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    if (!confirm('Bạn có chắc chắn muốn phê duyệt yêu cầu này?')) {
      return;
    }
    
    try {
      const response = await LecturerRequestService.processRequest({
        requestId,
        status: "APPROVED",
        body: responseText || ""
      });

      if (response.success) {
        // Show success notification with API response data
        setSuccessRequest(response.data);
        setActionType('approve');
        setIsSuccessDialogOpen(true);
        
        // Close modal and reset state
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
    setResponseText("");

        // Refresh requests list
        await refreshRequests();
      } else {
        toast.error("Không thể phê duyệt yêu cầu");
      }
    } catch (err) {
      toast.error('Lỗi khi phê duyệt yêu cầu: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      return;
    }
    
    try {
      const response = await LecturerRequestService.processRequest({
        requestId,
        status: "REJECTED",
        body: responseText || ""
      });

      if (response.success) {
        // Show success notification with API response data
        setSuccessRequest(response.data);
        setActionType('reject');
        setIsSuccessDialogOpen(true);

        // Close modal and reset state
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
    setResponseText("");

        // Refresh requests list
        await refreshRequests();
      } else {
        toast.error("Không thể từ chối yêu cầu");
      }
    } catch (err) {
      toast.error('Lỗi khi từ chối yêu cầu: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) {
      return;
    }

    try {
      const response = await LecturerRequestService.cancelRequest(requestId);

      if (response.success) {
        setRequests(requests.filter(request => request.id !== requestId));
        toast.success('Đã hủy yêu cầu thành công');
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

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
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
      {successRequest && (
        <NotificationDialog
          isOpen={isSuccessDialogOpen}
          onClose={() => {
            setIsSuccessDialogOpen(false);
            setSuccessRequest(null);
            setActionType(null);
          }}
          title={
            actionType === 'approve' ? "Phê duyệt yêu cầu thành công!" :
            "Từ chối yêu cầu thành công!"
          }
          details={{
            "Giảng viên": successRequest.lecturer,
            "Môn học": successRequest.subject,
            "Nhóm": `Nhóm ${successRequest.groupNumber} - Buổi ${successRequest.sectionNumber}`,
            "Phòng mới": successRequest.newRoom,
            "Tuần học": successRequest.newSemesterWeek,
            "Thời gian": `${getWeekdayName(successRequest.newDayOfWeek)}, Tiết ${successRequest.newStartPeriod}-${successRequest.newStartPeriod + successRequest.newTotalPeriod - 1}`,
            "Trạng thái": getStatusLabel(successRequest.status),
            "Phản hồi": successRequest.managerBody
          }}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {userRole === 'MANAGER' ? 'Quản lý yêu cầu giảng viên' : 'Yêu cầu của tôi'}
        </h1>
        <div className="flex items-center gap-4">
          {userRole === 'MANAGER' && (
            <div className="relative">
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as 'pending' | 'all')}
                className="appearance-none block w-64 pl-4 pr-10 py-2 text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer"
              >
                <option value="pending">Yêu cầu đang chờ xử lý</option>
                <option value="all">Tất cả yêu cầu</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          )}
          {/* Filter component */}
          <FilterPanel
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
        </div>
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
                {userRole === 'MANAGER' 
                  ? (requestType === 'pending' 
                    ? 'Không có yêu cầu nào đang chờ xử lý'
                    : 'Không có yêu cầu nào')
                  : 'Bạn chưa có yêu cầu nào'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {userRole === 'MANAGER'
                  ? (requestType === 'pending'
                    ? 'Tất cả các yêu cầu đã được xử lý.'
                    : 'Chưa có giảng viên nào gửi yêu cầu.')
                  : 'Vui lòng quay lại sau khi có yêu cầu mới.'}
              </p>
            </div>
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                    {userRole === 'MANAGER' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảng viên
                </th>
                    )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhóm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng mới
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
                      {userRole === 'MANAGER' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.lecturer}
                  </td>
                      )}
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
                          {userRole === 'LECTURER' && request.status.toUpperCase() === 'PENDING' && (
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
                  setResponseText("");
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
                  {userRole === 'MANAGER' && (
                  <div>
                    <span className="text-sm text-gray-500">Giảng viên:</span>
                    <p className="text-sm font-medium">{selectedRequest.lecturer}</p>
                  </div>
                  )}
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
                <h4 className="font-medium text-gray-900 mb-2">Thông tin chi tiết</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Phòng mới:</span>
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

              {/* Response Form (if PENDING and user is MANAGER) */}
              {userRole === 'MANAGER' && selectedRequest.status.toUpperCase() === 'PENDING' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Phản hồi</h4>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 resize-none"
                    placeholder="Nhập phản hồi của bạn"
                  ></textarea>

                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      type="button"
                      onClick={() => handleRejectRequest(selectedRequest.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Phê duyệt
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedRequest(null);
                    setResponseText("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Đóng
                </button>
                {userRole === 'LECTURER' && selectedRequest.status.toUpperCase() === 'PENDING' && (
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
