"use client";

import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";

interface LecturerRequest {
  id: number;
  lecturer: string;
  subject: string;
  group_number: number;
  section_number: number;
  new_room: string;
  new_semester_week: string;
  new_day_of_week: number;
  new_start_period: number;
  new_total_period: number;
  lecturer_body: string;
  manager_body: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

// Sample data - replace with actual API calls later
const initialRequests: LecturerRequest[] = [
  {
    id: 1,
    lecturer: "Giang Vien 1",
    subject: "Lập trình Web",
    group_number: 1,
    section_number: 1,
    new_room: "2B11",
    new_semester_week: "Tuần 36",
    new_day_of_week: 3,
    new_start_period: 5,
    new_total_period: 4,
    lecturer_body: "Xin chuyển lịch thực hành sang phòng và thời gian mới vì phòng cũ đang gặp sự cố kỹ thuật.",
    manager_body: null,
    status: "PENDING",
    created_at: "2025-05-09T22:29:05.000+07:00"
  },
  {
    id: 2,
    lecturer: "Giang Vien 2",
    subject: "An toàn và bảo mật hệ thống thông tin",
    group_number: 1,
    section_number: 2,
    new_room: "2B12",
    new_semester_week: "Tuần 37",
    new_day_of_week: 4,
    new_start_period: 6,
    new_total_period: 3,
    lecturer_body: "Xin đổi phòng vì số lượng sinh viên tăng, cần phòng lớn hơn.",
    manager_body: "Đã phê duyệt yêu cầu này.",
    status: "APPROVED",
    created_at: "2025-05-08T10:15:00.000+07:00"
  },
  {
    id: 3,
    lecturer: "Giang Vien 3",
    subject: "Nhập môn công nghệ phần mềm",
    group_number: 2,
    section_number: 1,
    new_room: "2B21",
    new_semester_week: "Tuần 38",
    new_day_of_week: 5,
    new_start_period: 1,
    new_total_period: 4,
    lecturer_body: "Cần đổi lịch vì trùng với lịch họp khoa.",
    manager_body: "Từ chối vì không có phòng trống thời điểm này.",
    status: "REJECTED",
    created_at: "2025-05-07T08:30:00.000+07:00"
  }
];

export default function RequestsPage() {
  const [requests, setRequests] = useState<LecturerRequest[]>(initialRequests);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LecturerRequest | null>(null);
  const [responseText, setResponseText] = useState("");

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

  const handleAddRequest = (newRequest: Omit<LecturerRequest, 'id' | 'created_at' | 'status' | 'manager_body'>) => {
    const now = new Date().toISOString();
    setRequests([...requests, { 
      ...newRequest, 
      id: requests.length + 1,
      created_at: now,
      status: 'PENDING',
      manager_body: null
    }]);
    setIsAddModalOpen(false);
  };

  const handleApproveRequest = (requestId: number) => {
    if (!responseText.trim()) {
      alert("Vui lòng nhập phản hồi trước khi phê duyệt.");
      return;
    }
    
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'APPROVED', manager_body: responseText } 
        : request
    ));
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
    setResponseText("");
  };

  const handleRejectRequest = (requestId: number) => {
    if (!responseText.trim()) {
      alert("Vui lòng nhập phản hồi trước khi từ chối.");
      return;
    }
    
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'REJECTED', manager_body: responseText } 
        : request
    ));
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
    setResponseText("");
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: LecturerRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: LecturerRequest['status']) => {
    switch (status) {
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
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return days[day % 7];
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý yêu cầu giảng viên</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Tạo yêu cầu mới
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảng viên
                </th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.lecturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Nhóm {request.group_number} - Buổi {request.section_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.new_room}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.new_semester_week}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getWeekdayName(request.new_day_of_week)}, Tiết {request.new_start_period}-{request.new_start_period + request.new_total_period - 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(request.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsDetailModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
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
      </div>

      {/* Add Request Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo yêu cầu mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                handleAddRequest({
                  lecturer: formData.get('lecturer') as string,
                  subject: formData.get('subject') as string,
                  group_number: parseInt(formData.get('group_number') as string, 10),
                  section_number: parseInt(formData.get('section_number') as string, 10),
                  new_room: formData.get('new_room') as string,
                  new_semester_week: formData.get('new_semester_week') as string,
                  new_day_of_week: parseInt(formData.get('new_day_of_week') as string, 10),
                  new_start_period: parseInt(formData.get('new_start_period') as string, 10),
                  new_total_period: parseInt(formData.get('new_total_period') as string, 10),
                  lecturer_body: formData.get('lecturer_body') as string
                });
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Giảng viên</label>
                    <input
                      type="text"
                      name="lecturer"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập tên giảng viên"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Môn học</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập tên môn học"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nhóm</label>
                    <input
                      type="number"
                      name="group_number"
                      required
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số nhóm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Buổi</label>
                    <input
                      type="number"
                      name="section_number"
                      required
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số buổi"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Phòng mới</label>
                    <input
                      type="text"
                      name="new_room"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Ví dụ: 2B11"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tuần học</label>
                    <input
                      type="text"
                      name="new_semester_week"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Ví dụ: Tuần 36"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Ngày trong tuần</label>
                    <select
                      name="new_day_of_week"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 appearance-none bg-white"
                    >
                      <option value="1">Thứ 2</option>
                      <option value="2">Thứ 3</option>
                      <option value="3">Thứ 4</option>
                      <option value="4">Thứ 5</option>
                      <option value="5">Thứ 6</option>
                      <option value="6">Thứ 7</option>
                      <option value="0">Chủ nhật</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tiết bắt đầu</label>
                    <input
                      type="number"
                      name="new_start_period"
                      required
                      min="1"
                      max="10"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập tiết bắt đầu"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Số tiết</label>
                    <input
                      type="number"
                      name="new_total_period"
                      required
                      min="1"
                      max="10"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số tiết"
                    />
                  </div>
                  <div className="mb-4 col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Lý do</label>
                    <textarea
                      name="lecturer_body"
                      rows={3}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập lý do xin thay đổi"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Gửi yêu cầu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
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
                  <div>
                    <span className="text-sm text-gray-500">Giảng viên:</span>
                    <p className="text-sm font-medium">{selectedRequest.lecturer}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Môn học:</span>
                    <p className="text-sm font-medium">{selectedRequest.subject}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nhóm:</span>
                    <p className="text-sm font-medium">Nhóm {selectedRequest.group_number} - Buổi {selectedRequest.section_number}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Ngày tạo:</span>
                    <p className="text-sm font-medium">{formatDateTime(selectedRequest.created_at)}</p>
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
                    <span className="text-sm text-gray-500">Phòng mới:</span>
                    <p className="text-sm font-medium">{selectedRequest.new_room}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tuần học:</span>
                    <p className="text-sm font-medium">{selectedRequest.new_semester_week}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Ngày trong tuần:</span>
                    <p className="text-sm font-medium">{getWeekdayName(selectedRequest.new_day_of_week)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Thời gian:</span>
                    <p className="text-sm font-medium">Tiết {selectedRequest.new_start_period} - {selectedRequest.new_start_period + selectedRequest.new_total_period - 1}</p>
                  </div>
                </div>
              </div>

              {/* Lecturer Message */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Lý do yêu cầu</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {selectedRequest.lecturer_body}
                </div>
              </div>

              {/* Manager Response (if any) */}
              {selectedRequest.manager_body && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Phản hồi của quản lý</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {selectedRequest.manager_body}
                  </div>
                </div>
              )}

              {/* Response Form (if PENDING) */}
              {selectedRequest.status === 'PENDING' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Phản hồi</h4>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập phản hồi của bạn"
                  ></textarea>

                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      onClick={() => handleRejectRequest(selectedRequest.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Phê duyệt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
