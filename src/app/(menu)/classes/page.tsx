"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";
import ClassService from "@/services/ClassService";
import MajorService from "@/services/MajorService";
import { ClassResponse, MajorResponse, StudentResponse } from "@/types/TypeResponse";
import { NotificationDialog } from "@/components/ui/notification-dialog";

interface Class {
  id: number;
  name: string;
  major: string;
  specialization: string | null;
  type: "MAJOR" | "SPECIALIZATION";
  numberOfStudents: number;
}

interface CreateClassRequest {
  name: string;
  majorId: number;
  type: "MAJOR" | "SPECIALIZATION";
  specializationId: number | null;
}

const mapClassResponseToClass = (response: ClassResponse): Class => ({
  id: response.id,
  name: response.name,
  major: response.major,
  specialization: response.specialization,
  type: response.type,
  numberOfStudents: response.numberOfStudents
});

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [majors, setMajors] = useState<MajorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    major: '',
    type: '',
    specialization: ''
  });
  const [successClass, setSuccessClass] = useState<Class | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'delete' | null>(null);
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [selectedSpecializationId, setSelectedSpecializationId] = useState<number | null>(null);
  const [selectedClassType, setSelectedClassType] = useState<"MAJOR" | "SPECIALIZATION">("MAJOR");

  // Extract unique values for filter dropdowns
  const majorOptions = useMemo(() => 
    Array.from(new Set(classes.map(c => c.major))).sort(), [classes]);

  const specializationOptions = useMemo(() => 
    Array.from(new Set(classes
      .filter(c => c.specialization)
      .map(c => c.specialization as string)))
      .sort(), [classes]);

  const filterOptions = useMemo(() => [
    {
      id: 'name',
      label: 'Tên lớp',
      type: 'search' as const,
      value: filters.name || '',
      placeholder: 'Nhập tên lớp...'
    },
    {
      id: 'major',
      label: 'Ngành',
      type: 'select' as const,
      value: filters.major,
      options: majorOptions.map(major => ({ 
        value: major, 
        label: major 
      }))
    },
    {
      id: 'type',
      label: 'Loại lớp',
      type: 'select' as const,
      value: filters.type,
      options: [
        { value: 'MAJOR', label: 'Lớp ngành' },
        { value: 'SPECIALIZATION', label: 'Lớp chuyên ngành' }
      ]
    },
    {
      id: 'specialization',
      label: 'Chuyên ngành',
      type: 'select' as const,
      value: filters.specialization,
      options: specializationOptions.map(spec => ({ 
        value: spec, 
        label: spec 
      }))
    }
  ], [filters, majorOptions, specializationOptions]);

  // Apply filters
  const filteredClasses = useMemo(() => {
    return classes.filter(classItem => {
      // Filter by name
      if (filters.name && !classItem.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      // Filter by major
      if (filters.major && classItem.major !== filters.major) {
        return false;
      }
      
      // Filter by type
      if (filters.type && classItem.type !== filters.type) {
        return false;
      }
      
      // Filter by specialization
      if (filters.specialization && classItem.specialization !== filters.specialization) {
        return false;
      }
      
      return true;
    });
  }, [classes, filters]);

  // Use pagination hook with filtered data
  const {
    currentPage,
    pageSize,
    totalPages,
    currentData: paginatedClasses,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination({
    data: filteredClasses,
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
      name: '',
      major: '',
      type: '',
      specialization: ''
    });
  };

  const handleDeleteClass = async (classId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
      try {
        const response = await ClassService.deleteClass(classId);
        if (response.success) {
          const deletedClass = classes.find(c => c.id === classId);
          setClasses(prev => prev.filter(classItem => classItem.id !== classId));
          if (deletedClass) {
            setSuccessClass(deletedClass);
            setActionType('delete');
            setIsSuccessDialogOpen(true);
          }
        } else {
          setError(response.message || 'Có lỗi khi xóa lớp học');
        }
      } catch (err) {
        setError('Có lỗi khi xóa lớp học: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  const handleAddClass = async (classData: Omit<Class, 'id' | 'numberOfStudents'>) => {
    try {
      const major = majors.find(m => m.name === classData.major);
      if (!major) {
        throw new Error('Không tìm thấy ngành học');
      }

      const specializationId = classData.type === "SPECIALIZATION" && classData.specialization ? 
        major.specializations.find(s => s.name === classData.specialization)?.id : 
        null;

      if (classData.type === "SPECIALIZATION" && !specializationId) {
        throw new Error('Không tìm thấy chuyên ngành');
      }

      const response = await ClassService.createClass(
        classData.name,
        major.id,
        classData.type,
        specializationId
      );

      if (response.success) {
        const newClass = mapClassResponseToClass(response.data);
        setClasses(prev => [...prev, newClass]);
        setSuccessClass(newClass);
        setActionType('add');
        setIsSuccessDialogOpen(true);
        setIsAddModalOpen(false);
        setSelectedMajorId(null);
        setSelectedSpecializationId(null);
        setSelectedClassType("MAJOR");
      } else {
        setError(response.message || 'Có lỗi khi thêm lớp học');
      }
    } catch (err) {
      setError('Có lỗi khi thêm lớp học: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleViewStudents = async (classItem: Class) => {
    try {
      setLoadingStudents(true);
      setSelectedClass(classItem);
      const response = await ClassService.getAllStudentsInClass(classItem.id);
      if (response.success) {
        setStudents(response.data);
        setIsStudentsModalOpen(true);
      } else {
        setError(response.message || 'Không thể tải danh sách sinh viên');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách sinh viên: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch classes data
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await ClassService.getAllClasses("");
        if (response.success) {
          setClasses(response.data.map(mapClassResponseToClass));
        } else {
          setError(response.message || 'Failed to fetch classes');
        }
      } catch (err) {
        setError('Error fetching classes: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch majors data
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await MajorService.getAllMajors();
        if (response.success) {
          setMajors(response.data);
        } else {
          console.error('Failed to fetch majors:', response.message);
        }
      } catch (err) {
        console.error('Error fetching majors:', err);
      }
    };

    fetchMajors();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Success notification dialog for class actions */}
      {successClass && (
        <NotificationDialog
          isOpen={isSuccessDialogOpen}
          onClose={() => {
            setIsSuccessDialogOpen(false);
            setSuccessClass(null);
            setActionType(null);
          }}
          title={
            actionType === 'add' ? "Thêm lớp học thành công!" :
            "Xóa lớp học thành công!"
          }
          details={{
            "Tên lớp": successClass.name,
            "Ngành": successClass.major,
            "Loại lớp": successClass.type === "MAJOR" ? "Lớp ngành" : "Lớp chuyên ngành",
            "Chuyên ngành": successClass.specialization || "Không có",
            "Số sinh viên": `${successClass.numberOfStudents} sinh viên`
          }}
        />
      )}

      {/* Main content */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý lớp học</h1>
        <div className="flex items-center gap-4">
          {/* Filter component */}
          <FilterPanel
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
          
          {/* Add class button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm lớp học
          </button>
        </div>
      </div>

      {/* Class Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chuyên ngành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số sinh viên
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedClasses.map((classItem) => (
                <tr 
                  key={classItem.id}
                  onClick={() => handleViewStudents(classItem)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem.major}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem.type === "MAJOR" ? "Lớp ngành" : "Lớp chuyên ngành"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem.specialization || "Không có"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem.numberOfStudents} sinh viên
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(classItem.id);
                      }}
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
        {classes.length > 0 && (
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

      {/* Students Modal */}
      {isStudentsModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách sinh viên lớp {selectedClass.name}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setIsStudentsModalOpen(false);
                    setSelectedClass(null);
                    setStudents([]);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {loadingStudents ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
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
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          Không có sinh viên nào trong lớp này
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm lớp học mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const type = formData.get('type') as "MAJOR" | "SPECIALIZATION";
                const name = formData.get('name') as string;
                const majorId = parseInt(formData.get('major') as string);
                const major = majors.find(m => m.id === majorId);
                if (!major) {
                  setError('Không tìm thấy ngành học');
                  return;
                }

                const specializationId = type === "SPECIALIZATION" ? 
                  parseInt(formData.get('specialization') as string) : 
                  null;
                const specialization = type === "SPECIALIZATION" && specializationId ? 
                  major.specializations.find(s => s.id === specializationId)?.name || null : 
                  null;

                handleAddClass({
                  name,
                  type,
                  major: major.name,
                  specialization
                });
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tên lớp</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập tên lớp"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Loại lớp</label>
                    <select
                      name="type"
                      required
                      defaultValue="MAJOR"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      onChange={(e) => {
                        const type = e.target.value as "MAJOR" | "SPECIALIZATION";
                        setSelectedClassType(type);
                        if (type === "MAJOR") {
                          setSelectedSpecializationId(null);
                        }
                      }}
                    >
                      <option value="MAJOR">Lớp ngành</option>
                      <option value="SPECIALIZATION">Lớp chuyên ngành</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Ngành</label>
                    <select
                      name="major"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      onChange={(e) => {
                        const majorId = parseInt(e.target.value);
                        setSelectedMajorId(majorId);
                        setSelectedSpecializationId(null);
                      }}
                    >
                      <option value="">Chọn ngành</option>
                      {majors.map(major => (
                        <option key={major.id} value={major.id}>{major.name}</option>
                      ))}
                    </select>
                  </div>
                  {selectedClassType === "SPECIALIZATION" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Chuyên ngành</label>
                    <select
                      name="specialization"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      onChange={(e) => {
                        const specializationId = parseInt(e.target.value);
                        setSelectedSpecializationId(specializationId);
                      }}
                      disabled={!selectedMajorId}
                    >
                      <option value="">Chọn chuyên ngành</option>
                      {selectedMajorId && majors
                        .find(m => m.id === selectedMajorId)
                        ?.specializations.map(spec => (
                          <option key={spec.id} value={spec.id}>{spec.name}</option>
                      ))}
                    </select>
                  </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Thêm lớp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
