"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { PlusIcon, PencilIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";
import UserService from "@/services/UserService";
import DepartmentService from "@/services/DepartmentService";
import { LecturerResponse, Department } from "@/types/TypeResponse";
import { DataResponse } from "@/types/DataResponse";
import { NotificationDialog } from "@/components/ui/notification-dialog";


// Map LecturerResponse to local interface for compatibility
interface Lecturer {
  id: number;
  fullName: string;
  email: string;
  code: string;
  phone: string;
  gender: boolean;
  birthday: string;
  department: string;
  role: string;
  status: string;
}

// Convert LecturerResponse from API to local Lecturer format
const mapLecturerResponseToLecturer = (lecturer: LecturerResponse): Lecturer => {
  return {
    id: lecturer.id,
    fullName: lecturer.fullName,
    email: lecturer.email,
    code: lecturer.code,
    phone: lecturer.phone,
    gender: lecturer.gender,
    birthday: lecturer.birthday,
    department: lecturer.department,
    role: lecturer.role,
    status: lecturer.status
  };
};

// Convert local Lecturer format back to API format for create/update
const mapLecturerToPayload = (lecturer: Partial<Lecturer>, departmentId: number) => {
  return {
    fullName: lecturer.fullName || '',
    code: lecturer.code || '',
    email: lecturer.email || '',
    phone: lecturer.phone || '',
    gender: lecturer.gender === undefined ? 1 : lecturer.gender ? 1 : 0,
    birthday: lecturer.birthday || '',
    departmentId: departmentId
  };
};

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    gender: '',
    searchName: ''
  });
  const [successLecturer, setSuccessLecturer] = useState<Lecturer | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'edit' | 'lock' | 'unlock' | null>(null);

  

  // Fetch lecturers data
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        setLoading(true);
        const response = await UserService.getAllLecturers();
        if (response.success) {
          const mappedLecturers = response.data.map(mapLecturerResponseToLecturer);
          setLecturers(mappedLecturers);
        } else {
          setError(response.message || 'Failed to fetch lecturers');
        }
      } catch (err) {
        setError('Lỗi kết nối đến máy chủ: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchLecturers();
  }, []);

  // Fetch departments for the dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const response = await DepartmentService.getAllDepartments();
        if (response.success) {
          setDepartments(response.data);
        } else {
          console.error('Failed to fetch departments:', response.message);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Extract unique values for filter dropdowns
  const departmentOptions = useMemo(() => 
    Array.from(new Set(lecturers.map(l => l.department))), [lecturers]);
  
  const statusOptions = useMemo(() => [
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'INACTIVE', label: 'Không hoạt động' }
  ], []);

  const genderOptions = useMemo(() => [
    { value: 'true', label: 'Nam' },
    { value: 'false', label: 'Nữ' }
  ], []);

  const filterOptions = useMemo(() => [
    {
      id: 'department',
      label: 'Khoa',
      value: filters.department,
      options: departmentOptions.map(dept => ({ value: dept, label: dept }))
    },
    {
      id: 'status',
      label: 'Trạng thái',
      value: filters.status,
      options: statusOptions
    },
    {
      id: 'gender',
      label: 'Giới tính',
      value: filters.gender,
      options: genderOptions
    }
  ], [filters, departmentOptions, statusOptions, genderOptions]);

  // Apply filters
  const filteredLecturers = useMemo(() => {
    return lecturers.filter(lecturer => {
      // Filter by department
      if (filters.department && lecturer.department !== filters.department) {
        return false;
      }
      
      // Filter by status
      if (filters.status && lecturer.status !== filters.status) {
        return false;
      }
      
      // Filter by gender (convert string to boolean for comparison)
      if (filters.gender && lecturer.gender !== (filters.gender === 'true')) {
        return false;
      }
      
      // Filter by name search
      if (filters.searchName && !lecturer.fullName.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [lecturers, filters]);

  // Use our pagination hook with filtered data
  const {
    currentPage,
    pageSize,
    totalPages,
    currentData: paginatedLecturers,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination({
    data: filteredLecturers,
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
      department: '',
      status: '',
      gender: '',
      searchName: ''
    });
  };

  const handleAddLecturer = async (newLecturer: Omit<Lecturer, 'id'>, departmentId: number) => {
    try {
      const payload = mapLecturerToPayload(newLecturer, departmentId);
      const response = await UserService.createLecturer(payload);
      
      if (response.success) {
        const createdLecturer = mapLecturerResponseToLecturer(response.data);
        setLecturers(prev => [...prev, createdLecturer]);
        setSuccessLecturer(createdLecturer);
        setActionType('add');
        setIsSuccessDialogOpen(true);
    setIsAddModalOpen(false);
      } else {
        setError(response.message || 'Failed to create lecturer');
      }
    } catch (err) {
      setError('Có lỗi khi cố gắng tạo giảng viên: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleEditLecturer = async (editedLecturer: Lecturer) => {
    try {
      const payload: any = {
        fullName: editedLecturer.fullName,
        email: editedLecturer.email,
        code: editedLecturer.code,
        phone: editedLecturer.phone,
        gender: editedLecturer.gender,
        birthday: editedLecturer.birthday,
      };
      const response = await UserService.updateLecturer(editedLecturer.id, payload);
      if (response.success) {
        const updatedLecturer = mapLecturerResponseToLecturer(response.data);
        setLecturers(prev => prev.map(lecturer => 
          lecturer.id === updatedLecturer.id ? updatedLecturer : lecturer
    ));
        setSuccessLecturer(updatedLecturer);
        setActionType('edit');
        setIsSuccessDialogOpen(true);
    setIsEditModalOpen(false);
    setSelectedLecturer(null);
      } else {
        setError(response.message || 'Failed to update lecturer');
      }
    } catch (err) {
      setError('Error updating lecturer: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleLockAccount = async (lecturerId: number) => {
    try {
      const response = await UserService.lockUserAccount(lecturerId);
      if (response.success) {
        // Update lecturer status in the list
        setLecturers(prev => prev.map(lecturer => 
          lecturer.id === lecturerId 
            ? { ...lecturer, status: 'INACTIVE' }
            : lecturer
        ));
        // Show success message
        const lockedLecturer = lecturers.find(l => l.id === lecturerId);
        if (lockedLecturer) {
          setSuccessLecturer(lockedLecturer);
          setActionType('lock');
          setIsSuccessDialogOpen(true);
    }
      } else {
        setError(response.message || 'Failed to lock lecturer account');
      }
    } catch (err) {
      setError('Error locking lecturer account: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleUnlockAccount = async (lecturerId: number) => {
    try {
      const response = await UserService.unlockUserAccount(lecturerId);
      if (response.success) {
        // Update lecturer status in the list
        setLecturers(prev => prev.map(lecturer => 
          lecturer.id === lecturerId 
            ? { ...lecturer, status: 'ACTIVE' }
            : lecturer
        ));
        // Show success message
        const unlockedLecturer = lecturers.find(l => l.id === lecturerId);
        if (unlockedLecturer) {
          setSuccessLecturer(unlockedLecturer);
          setActionType('unlock');
          setIsSuccessDialogOpen(true);
        }
      } else {
        setError(response.message || 'Failed to unlock lecturer account');
      }
    } catch (err) {
      setError('Error unlocking lecturer account: ' + (err instanceof Error ? err.message : String(err)));
    }
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
      if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-xl shadow p-8 max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-4">{error || "Không thể tải dữ liệu"}</p>
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
  }

  return (
    <div className="p-6">
      {/* Replace success notification with NotificationDialog */}
      {successLecturer && (
        <NotificationDialog
          isOpen={isSuccessDialogOpen}
          onClose={() => {
            setIsSuccessDialogOpen(false);
            setSuccessLecturer(null);
            setActionType(null);
          }}
          title={
            actionType === 'add' ? "Thêm giảng viên thành công!" :
            actionType === 'edit' ? "Cập nhật giảng viên thành công!" :
            actionType === 'lock' ? "Khóa tài khoản giảng viên thành công!" :
            "Mở khóa tài khoản giảng viên thành công!"
          }
          details={{
            "Mã GV": successLecturer.code,
            "Họ tên": successLecturer.fullName,
            "Email": successLecturer.email,
            "Khoa": successLecturer.department,
            "Trạng thái": successLecturer.status === 'ACTIVE' ? 'Đang giảng dạy' : 'Đã khóa'
          }}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý giảng viên</h1>
        <div className="flex items-center gap-4">
          {/* Filter component */}
          <FilterPanel
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
          
          {/* Add lecturer button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm giảng viên
          </button>
        </div>
      </div>

      {/* Lecturer name search input */}
      {isFilterOpen && (
        <div className="mb-6">
          <div className="max-w-md">
            <label htmlFor="searchLecturer" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm theo tên giảng viên
            </label>
            <input
              type="text"
              id="searchLecturer"
              value={filters.searchName}
              onChange={(e) => handleFilterChange('searchName', e.target.value)}
              placeholder="Nhập tên giảng viên..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Lecturer Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã giảng viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Họ và tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giới tính
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày sinh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khoa
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
              {paginatedLecturers.map((lecturer) => (
                <tr key={lecturer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lecturer.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lecturer.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lecturer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lecturer.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lecturer.gender ? "Nam" : "Nữ"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(lecturer.birthday).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lecturer.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lecturer.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {lecturer.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khoá'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedLecturer(lecturer);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    {lecturer.status === 'ACTIVE' ? (
                      <button
                        onClick={() => {
                          if (window.confirm("Bạn có chắc chắn muốn khóa tài khoản giảng viên này?")) {
                            handleLockAccount(lecturer.id);
                          }
                        }}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Khóa tài khoản"
                      >
                        <LockClosedIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (window.confirm("Bạn có chắc chắn muốn mở khóa tài khoản giảng viên này?")) {
                            handleUnlockAccount(lecturer.id);
                          }
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Mở khóa tài khoản"
                      >
                        <LockOpenIcon className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Add pagination component */}
        {lecturers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Suspense fallback={<div>Loading pagination...</div>}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                totalItems={totalItems}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Add Lecturer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm giảng viên mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const departmentId = Number(formData.get('departmentId'));
                const departmentName = departments.find(d => d.id === departmentId)?.name || '';
                
                handleAddLecturer({
                  fullName: formData.get('fullName') as string,
                  email: formData.get('email') as string,
                  code: formData.get('code') as string,
                  phone: formData.get('phone') as string,
                  gender: formData.get('gender') === 'true',
                  birthday: formData.get('birthday') as string,
                  department: departmentName,
                  role: 'LECTURER',
                  status: 'ACTIVE'
                }, departmentId);
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Mã giảng viên</label>
                  <input
                    type="text"
                    name="code"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập mã giảng viên"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="example@gmail.com"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    pattern="[0-9]{10,11}"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="0xxxxxxxxx"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                  <select
                    name="gender"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 appearance-none bg-white"
                  >
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                  <input
                    type="date"
                    name="birthday"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Khoa</label>
                  <select
                    name="departmentId"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 appearance-none bg-white"
                    disabled={departmentsLoading}
                  >
                    {departmentsLoading ? (
                      <option value="">Đang tải...</option>
                    ) : (
                      <>
                        <option value="">Chọn khoa</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
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
                    Thêm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lecturer Modal */}
      {isEditModalOpen && selectedLecturer && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa thông tin giảng viên</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedLecturer(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const departmentId = Number(formData.get('departmentId'));
              const departmentName = departments.find(d => d.id === departmentId)?.name || selectedLecturer.department;
              
              handleEditLecturer({
                ...selectedLecturer,
                fullName: formData.get('fullName') as string,
                email: formData.get('email') as string,
                code: formData.get('code') as string,
                phone: formData.get('phone') as string,
                gender: formData.get('gender') === 'true',
                birthday: formData.get('birthday') as string,
                department: departmentName,
                status: formData.get('status') as string
              });
            }} className="h-[calc(100%-4rem)] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Thông tin cơ bản */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Mã giảng viên</label>
                      <input
                        type="text"
                        name="code"
                        defaultValue={selectedLecturer.code}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mã giảng viên"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Họ và tên</label>
                      <input
                        type="text"
                        name="fullName"
                        defaultValue={selectedLecturer.fullName}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>
                </div>

                {/* Thông tin liên hệ */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin liên hệ</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={selectedLecturer.email}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="example@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={selectedLecturer.phone}
                        pattern="[0-9]{10,11}"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0xxxxxxxxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Thông tin cá nhân */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin cá nhân</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Giới tính</label>
                      <select
                        name="gender"
                        defaultValue={selectedLecturer.gender.toString()}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="true">Nam</option>
                        <option value="false">Nữ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        name="birthday"
                        defaultValue={selectedLecturer.birthday}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Thông tin chuyên môn */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin chuyên môn</h4>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Khoa</label>
                    <input
                      type="text"
                      name="department"
                      value={selectedLecturer.department}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Trạng thái</h4>
                  <div>
                    <select
                      name="status"
                      defaultValue={selectedLecturer.status}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="INACTIVE">Đã khoá</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedLecturer(null);
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
