"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";
import UserService from "@/services/UserService";
import ClassService from "@/services/ClassService";
import { StudentResponse, ClassResponse } from "@/types/TypeResponse";
import { DataResponse } from "@/types/DataResponse";
import { NotificationDialog } from "@/components/ui/notification-dialog";

// Map StudentResponse to local interface for compatibility
interface Student {
  id: number;
  fullName: string;
  email: string;
  code: string;
  phone: string;
  gender: boolean;
  birthday: string;
  role: string;
  status: string;
  class: string;
  major: string;
  specialization: string;
}

// Convert StudentResponse from API to local Student format
const mapStudentResponseToStudent = (student: StudentResponse): Student => {
  return {
    id: student.id,
    fullName: student.fullName,
    email: student.email,
    code: student.code,
    phone: student.phone,
    gender: student.gender,
    birthday: student.birthday,
    role: student.role,
    status: student.status,
    class: student.class,
    major: student.major,
    specialization: student.specialization
  };
};

// Convert local Student format back to API format for create/update
const mapStudentToPayload = (student: Partial<Student>, classId: number) => {
  return {
    fullName: student.fullName || '',
    email: student.email || '',
    code: student.code || '',
    phone: student.phone || '',
    gender: student.gender === undefined ? true : student.gender,
    birthday: student.birthday ? new Date(student.birthday) : new Date(),
    classId: classId
  };
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    class: '',
    major: '',
    status: '',
    gender: '',
    searchName: ''
  });
  const [successStudent, setSuccessStudent] = useState<Student | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'edit' | 'lock' | 'unlock' | 'delete' | null>(null);

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await UserService.getAllStudents();
        if (response.success) {
          const mappedStudents = response.data.map(mapStudentResponseToStudent);
          setStudents(mappedStudents);
        } else {
          setError(response.message || 'Failed to fetch students');
        }
      } catch (err) {
        setError('Lỗi kết nối đến máy chủ: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Fetch classes for the dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setClassesLoading(true);
        const response = await ClassService.getAllClasses("");
        if (response.success) {
          setClasses(response.data);
        } else {
          console.error('Failed to fetch classes:', response.message);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Extract unique values for filter dropdowns
  const classOptions = useMemo(() => 
    Array.from(new Set(students.map(s => s.class))), [students]);
  
  const majorOptions = useMemo(() => 
    Array.from(new Set(students.map(s => s.major))), [students]);
  
  const statusOptions = useMemo(() => [
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'INACTIVE', label: 'Đã khoá' }
  ], []);

  const genderOptions = useMemo(() => [
    { value: 'true', label: 'Nam' },
    { value: 'false', label: 'Nữ' }
  ], []);

  const filterOptions = useMemo(() => [
    {
      id: 'class',
      label: 'Lớp',
      value: filters.class,
      options: classOptions.map(cls => ({ value: cls, label: cls }))
    },
    {
      id: 'major',
      label: 'Ngành',
      value: filters.major,
      options: majorOptions.map(major => ({ value: major, label: major }))
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
  ], [filters, classOptions, majorOptions, statusOptions, genderOptions]);

  // Apply filters
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Filter by class
      if (filters.class && student.class !== filters.class) {
        return false;
      }
      
      // Filter by major
      if (filters.major && student.major !== filters.major) {
        return false;
      }
      
      // Filter by status
      if (filters.status && student.status !== filters.status) {
        return false;
      }
      
      // Filter by gender (convert string to boolean for comparison)
      if (filters.gender && student.gender !== (filters.gender === 'true')) {
        return false;
      }
      
      // Filter by name search
      if (filters.searchName && !student.fullName.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [students, filters]);

  // Use our pagination hook with filtered data
  const {
    currentPage,
    pageSize,
    totalPages,
    currentData: paginatedStudents,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination({
    data: filteredStudents,
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
      class: '',
      major: '',
      status: '',
      gender: '',
      searchName: ''
    });
  };

  const handleAddStudent = async (newStudent: Omit<Student, 'id'>, classId: number) => {
    try {
      const payload = mapStudentToPayload(newStudent, classId);
      const response = await UserService.createStudent(payload);
      
      if (response.success) {
        const createdStudent = mapStudentResponseToStudent(response.data);
        setStudents(prev => [...prev, createdStudent]);
        setSuccessStudent(createdStudent);
        setActionType('add');
        setIsSuccessDialogOpen(true);
        setIsAddModalOpen(false);
      } else {
        setError(response.message || 'Có lỗi khi tạo tài khoản sinh viên');
      }
    } catch (err) {
      setError('Có lỗi khi tạo tài khoản sinh viên ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleEditStudent = async (editedStudent: Student) => {
    try {
      const payload: any = {
        fullName: editedStudent.fullName,
        email: editedStudent.email,
        code: editedStudent.code,
        phone: editedStudent.phone,
        gender: editedStudent.gender,
        birthday: editedStudent.birthday,
      };
      const response = await UserService.updateStudent(editedStudent.id, payload);
      if (response.success) {
        const updatedStudent = mapStudentResponseToStudent(response.data);
        setStudents(prev => prev.map(student => 
          student.id === updatedStudent.id ? updatedStudent : student
        ));
        setSuccessStudent(updatedStudent);
        setActionType('edit');
        setIsSuccessDialogOpen(true);
        setIsEditModalOpen(false);
        setSelectedStudent(null);
      } else {
        setError(response.message || 'Failed to update student');
      }
    } catch (err) {
      setError('Lỗi cập nhật sinh viên: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
      try {
        const response = await UserService.deleteUser(studentId);
        if (response.success) {
          // Update UI after successful deletion
          setStudents(prev => prev.filter(student => student.id !== studentId));
          // Show success message
          const deletedStudent = students.find(s => s.id === studentId);
          if (deletedStudent) {
            setSuccessStudent(deletedStudent);
            setActionType('delete');
            setIsSuccessDialogOpen(true);
          }
        } else {
          setError(response.message || 'Failed to delete student');
        }
      } catch (err) {
        setError('Lỗi xoá sinh viên: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  const handleLockAccount = async (studentId: number) => {
    try {
      const response = await UserService.lockUserAccount(studentId);
      if (response.success) {
        // Update student status in the list
        setStudents(prev => prev.map(student => 
          student.id === studentId 
            ? { ...student, status: 'INACTIVE' }
            : student
        ));
        // Show success message
        const lockedStudent = students.find(s => s.id === studentId);
        if (lockedStudent) {
          setSuccessStudent(lockedStudent);
          setActionType('lock');
          setIsSuccessDialogOpen(true);
        }
      } else {
        setError(response.message || 'Failed to lock student account');
      }
    } catch (err) {
      setError('Error locking student account: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleUnlockAccount = async (studentId: number) => {
    try {
      const response = await UserService.unlockUserAccount(studentId);
      if (response.success) {
        // Update student status in the list
        setStudents(prev => prev.map(student => 
          student.id === studentId 
            ? { ...student, status: 'ACTIVE' }
            : student
        ));
        // Show success message
        const unlockedStudent = students.find(s => s.id === studentId);
        if (unlockedStudent) {
          setSuccessStudent(unlockedStudent);
          setActionType('unlock');
          setIsSuccessDialogOpen(true);
        }
      } else {
        setError(response.message || 'Failed to unlock student account');
      }
    } catch (err) {
      setError('Error unlocking student account: ' + (err instanceof Error ? err.message : String(err)));
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
      {successStudent && (
        <NotificationDialog
          isOpen={isSuccessDialogOpen}
          onClose={() => {
            setIsSuccessDialogOpen(false);
            setSuccessStudent(null);
            setActionType(null);
          }}
          title={
            actionType === 'add' ? "Thêm sinh viên thành công!" :
            actionType === 'edit' ? "Cập nhật sinh viên thành công!" :
            actionType === 'lock' ? "Khóa tài khoản sinh viên thành công!" :
            actionType === 'unlock' ? "Mở khóa tài khoản sinh viên thành công!" :
            "Xóa sinh viên thành công!"
          }
          details={{
            "Mã SV": successStudent.code,
            "Họ tên": successStudent.fullName,
            "Email": successStudent.email,
            "Lớp": successStudent.class,
            "Trạng thái": successStudent.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'
          }}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sinh viên</h1>
        <div className="flex items-center gap-4">
          {/* Filter component */}
          <FilterPanel
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
          
          {/* Add student button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm sinh viên
          </button>
        </div>
      </div>

      {/* Student name search input */}
      {isFilterOpen && (
        <div className="mb-6">
          <div className="max-w-md">
            <label htmlFor="searchStudent" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm theo tên sinh viên
            </label>
            <input
              type="text"
              id="searchStudent"
              value={filters.searchName}
              onChange={(e) => handleFilterChange('searchName', e.target.value)}
              placeholder="Nhập tên sinh viên..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã sinh viên
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
                  Lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chuyên ngành
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
              {paginatedStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.gender ? "Nam" : "Nữ"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(student.birthday).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.major}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.specialization || 'Không có'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khoá'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    {student.status === 'ACTIVE' ? (
                      <button
                        onClick={() => {
                          if (window.confirm("Bạn có chắc chắn muốn khóa tài khoản sinh viên này?")) {
                            handleLockAccount(student.id);
                          }
                        }}
                        className="text-yellow-600 hover:text-yellow-900 mr-4"
                        title="Khóa tài khoản"
                      >
                        <LockClosedIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (window.confirm("Bạn có chắc chắn muốn mở khóa tài khoản sinh viên này?")) {
                            handleUnlockAccount(student.id);
                          }
                        }}
                        className="text-green-600 hover:text-green-900 mr-4"
                        title="Mở khóa tài khoản"
                      >
                        <LockOpenIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Add pagination component */}
        {students.length > 0 && (
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

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm sinh viên mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const classId = Number(formData.get('classId'));
                const className = classes.find(c => c.id === classId)?.name || '';
                
                handleAddStudent({
                  fullName: formData.get('fullName') as string,
                  email: formData.get('email') as string,
                  code: formData.get('code') as string,
                  phone: formData.get('phone') as string,
                  gender: formData.get('gender') === 'true',
                  birthday: formData.get('birthday') as string,
                  role: 'STUDENT',
                  status: 'ACTIVE',
                  class: className,
                  major: '',  // Empty since we're removing this field
                  specialization: ''  // Empty since we're removing this field
                }, classId);
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Mã sinh viên</label>
                  <input
                    type="text"
                    name="code"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập mã sinh viên"
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
                    placeholder="example@student.ptithcm.edu.vn"
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
                  <label className="block text-sm font-medium text-gray-700">Lớp</label>
                  <select
                    name="classId"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 appearance-none bg-white"
                    disabled={classesLoading}
                  >
                    {classesLoading ? (
                      <option value="">Đang tải...</option>
                    ) : (
                      <>
                        <option value="">Chọn lớp</option>
                        {classes.map((classItem) => (
                          <option key={classItem.id} value={classItem.id}>
                            {classItem.name} - {classItem.major}
                            {classItem.type === "SPECIALIZATION" && classItem.specialization ? ` (${classItem.specialization})` : ''}
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

      {/* Edit Student Modal */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa thông tin sinh viên</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedStudent(null);
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
              const classId = Number(formData.get('classId'));
              const className = classes.find(c => c.id === classId)?.name || selectedStudent.class;
              
              handleEditStudent({
                ...selectedStudent,
                fullName: formData.get('fullName') as string,
                email: formData.get('email') as string,
                code: formData.get('code') as string,
                phone: formData.get('phone') as string,
                gender: formData.get('gender') === 'true',
                birthday: formData.get('birthday') as string,
                class: className,
                status: formData.get('status') as string
              });
            }} className="h-[calc(100%-4rem)] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Thông tin cơ bản */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Mã sinh viên</label>
                      <input
                        type="text"
                        name="code"
                        defaultValue={selectedStudent.code}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mã sinh viên"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Họ và tên</label>
                      <input
                        type="text"
                        name="fullName"
                        defaultValue={selectedStudent.fullName}
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
                        defaultValue={selectedStudent.email}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="example@student.ptithcm.edu.vn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={selectedStudent.phone}
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
                        defaultValue={selectedStudent.gender.toString()}
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
                        defaultValue={selectedStudent.birthday}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Thông tin học tập */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin học tập</h4>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Lớp</label>
                    <input
                      type="text"
                      name="class"
                      value={selectedStudent.class}
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
                      defaultValue={selectedStudent.status}
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
                    setSelectedStudent(null);
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
