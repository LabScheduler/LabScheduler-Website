"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";
import ClassService from "@/services/ClassService";
import MajorService from "@/services/MajorService";
import UserService from "@/services/UserService";
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

const mapClassResponseToClass = (classResponse: ClassResponse): Class => ({
  id: classResponse.id,
  name: classResponse.name,
  major: classResponse.major,
  specialization: classResponse.specialization,
  type: classResponse.type,
  numberOfStudents: classResponse.numberOfStudents,
});

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [majors, setMajors] = useState<MajorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [availableStudents, setAvailableStudents] = useState<StudentResponse[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    major: '',
    type: '',
    specialization: ''
  });
  const [successClass, setSuccessClass] = useState<Class | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [selectedSpecializationId, setSelectedSpecializationId] = useState<number | null>(null);
  const [selectedClassType, setSelectedClassType] = useState<"MAJOR" | "SPECIALIZATION">("MAJOR");
  const [selectedStudents, setSelectedStudents] = useState<StudentResponse[]>([]);
  const [successStudent, setSuccessStudent] = useState<StudentResponse | null>(null);
  const [isStudentActionDialogOpen, setIsStudentActionDialogOpen] = useState(false);
  const [studentActionType, setStudentActionType] = useState<'add' | 'remove' | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await ClassService.getAllClasses("");
        if (response.success) {
          setClasses(response.data.map(mapClassResponseToClass));
        } else {
          setError(response.message || 'Không thể tải danh sách lớp học');
        }
      } catch (err) {
        setError('Lỗi khi tải lớp học: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await MajorService.getAllMajors();
        if (response.success) {
          setMajors(response.data);
        } else {
          setError(response.message || 'Không thể tải danh sách ngành học');
        }
      } catch (err) {
        setError('Lỗi khi tải ngành học: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    fetchMajors();
  }, []);

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

  // Use our pagination hook with filtered data
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

  const handleAddClass = async (newClass: Omit<Class, 'id' | 'numberOfStudents'>) => {
    try {
      if (!selectedMajorId) {
        setError('Vui lòng chọn ngành học');
        return;
      }

      if (newClass.type === "SPECIALIZATION" && !selectedSpecializationId) {
        setError('Vui lòng chọn chuyên ngành');
        return;
      }

      const response = await ClassService.createClass(
        newClass.name,
        selectedMajorId,
        newClass.type,
        newClass.type === "SPECIALIZATION" ? selectedSpecializationId : null
      );
      
      if (response.success) {
        const createdClass = mapClassResponseToClass(response.data);
        setClasses(prev => [...prev, createdClass]);
        setSuccessClass(createdClass);
        setActionType('add');
        setIsSuccessDialogOpen(true);
        setIsAddModalOpen(false);
        setSelectedMajorId(null);
        setSelectedSpecializationId(null);
      } else {
        setError(response.message || 'Có lỗi khi tạo lớp học');
      }
    } catch (err) {
      setError('Có lỗi khi tạo lớp học: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleEditClass = async (editedClass: Class) => {
    try {
      let response;
      if (editedClass.type === "MAJOR") {
        response = await ClassService.updateMajorClass(
          editedClass.id,
          editedClass.name,
          1 // majorId - This should be selected from a dropdown
        );
      } else {
        response = await ClassService.updateSpecializationClass(
          editedClass.id,
          editedClass.name,
          1, // majorId - This should be selected from a dropdown
          1 // specializationId - This should be selected from a dropdown
        );
      }
      
      if (response.success) {
        const updatedClass = mapClassResponseToClass(response.data);
        setClasses(prev => prev.map(classItem => 
          classItem.id === updatedClass.id ? updatedClass : classItem
        ));
        setSuccessClass(updatedClass);
        setActionType('edit');
        setIsSuccessDialogOpen(true);
        setIsEditModalOpen(false);
        setSelectedClass(null);
      } else {
        setError(response.message || 'Có lỗi khi cập nhật lớp học');
      }
    } catch (err) {
      setError('Có lỗi khi cập nhật lớp học: ' + (err instanceof Error ? err.message : String(err)));
    }
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

  const handleSearchStudents = async (query: string) => {
    setSearchQuery(query);
    try {
      setLoadingStudents(true);
      const response = await UserService.getAllStudents();
      if (response.success) {
        // Filter out students that are already in the class
        const studentsNotInClass = response.data.filter(
          student => !students.some(s => s.id === student.id)
        );
        
        // If there's a search query, filter the results
        const filteredStudents = query
          ? studentsNotInClass.filter(student => 
              student.code.toLowerCase().includes(query.toLowerCase()) ||
              student.fullName.toLowerCase().includes(query.toLowerCase())
            )
          : studentsNotInClass;
        
        setAvailableStudents(filteredStudents);
      } else {
        setError(response.message || 'Không thể tải danh sách sinh viên');
      }
    } catch (err) {
      setError('Lỗi khi tìm kiếm sinh viên: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingStudents(false);
    }
  };

  // Add useEffect to load available students when modal opens
  useEffect(() => {
    if (isAddStudentModalOpen) {
      handleSearchStudents('');
    }
  }, [isAddStudentModalOpen]);

  const handleAddStudent = async (studentId: number) => {
    if (!selectedClass) return;
    
    try {
      const studentToAdd = availableStudents.find(s => s.id === studentId);
      if (studentToAdd) {
        setSelectedStudents(prev => [...prev, studentToAdd]);
        setAvailableStudents(prev => prev.filter(s => s.id !== studentId));
      }
    } catch (err) {
      setError('Lỗi khi thêm sinh viên vào danh sách: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleRemoveSelectedStudent = (studentId: number) => {
    const studentToRemove = selectedStudents.find(s => s.id === studentId);
    if (studentToRemove) {
      setSelectedStudents(prev => prev.filter(s => s.id !== studentId));
      setAvailableStudents(prev => [...prev, studentToRemove]);
    }
  };

  const handleConfirmAddStudents = async () => {
    if (!selectedClass || selectedStudents.length === 0) return;
    
    try {
      const studentIds = selectedStudents.map(s => s.id);
      const response = await ClassService.addStudentToClass(
        selectedClass.id,
        [...studentIds]
      );
      
      if (response.success) {
        // Update students list
        setStudents(prev => [...prev, ...selectedStudents]);
        
        // Update class's student count in the main list
        setClasses(prev => prev.map(c => 
          c.id === selectedClass.id 
            ? { ...c, numberOfStudents: c.numberOfStudents + selectedStudents.length }
            : c
        ));
        
        // Update selectedClass's student count
        setSelectedClass(prev => prev ? {
          ...prev,
          numberOfStudents: prev.numberOfStudents + selectedStudents.length
        } : null);
        
        setSelectedStudents([]);
        setIsAddStudentModalOpen(false);
      } else {
        setError(response.message || 'Không thể thêm sinh viên vào lớp');
      }
    } catch (err) {
      setError('Lỗi khi thêm sinh viên vào lớp: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!selectedClass) return;
    
    // Ask for user confirmation
    if (!window.confirm("Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp?")) {
      return;
    }
    
    try {
      const studentToRemove = students.find(s => s.id === studentId);
      const response = await ClassService.deleteStudentFromClass(
        selectedClass.id,
        studentId
      );
      
      if (response.success) {
        // Remove student from the list
        setStudents(prev => prev.filter(s => s.id !== studentId));
        // Add student back to available students
        if (studentToRemove) {
          setAvailableStudents(prev => [...prev, studentToRemove]);
        }
        // Update class's student count
        setClasses(prev => prev.map(c => 
          c.id === selectedClass.id 
            ? { ...c, numberOfStudents: c.numberOfStudents - 1 }
            : c
        ));
        // Update selectedClass's student count
        setSelectedClass(prev => prev ? { ...prev, numberOfStudents: prev.numberOfStudents - 1 } : null);
        
        // Show success notification after confirmation
        if (studentToRemove) {
          setSuccessStudent(studentToRemove);
          setStudentActionType('remove');
          setIsStudentActionDialogOpen(true);
        }
      } else {
        setError(response.message || 'Không thể xóa sinh viên khỏi lớp');
      }
    } catch (err) {
      setError('Lỗi khi xóa sinh viên khỏi lớp: ' + (err instanceof Error ? err.message : String(err)));
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
            actionType === 'edit' ? "Cập nhật lớp học thành công!" :
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

      {/* Success notification dialog for student actions */}
      {successStudent && (
        <NotificationDialog
          isOpen={isStudentActionDialogOpen}
          onClose={() => {
            setIsStudentActionDialogOpen(false);
            setSuccessStudent(null);
            setStudentActionType(null);
          }}
          title={
            studentActionType === 'remove' 
              ? `Xóa sinh viên khỏi lớp ${selectedClass?.name} thành công!`
              : `Thêm sinh viên vào lớp ${selectedClass?.name} thành công!`
          }
          details={{
            "Mã sinh viên": successStudent.code,
            "Họ và tên": successStudent.fullName,
            "Email": successStudent.email,
            "Số điện thoại": successStudent.phone,
            "Giới tính": successStudent.gender ? "Nam" : "Nữ",
            "Ngày sinh": new Date(successStudent.birthday).toLocaleDateString('vi-VN')
          }}
        />
      )}

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
                        setSelectedClass(classItem);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
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
                handleAddClass({
                  name: formData.get('name') as string,
                  major: formData.get('major') as string,
                  type: formData.get('type') as "MAJOR" | "SPECIALIZATION",
                  specialization: formData.get('specialization') as string || null
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

      {/* Edit Class Modal */}
      {isEditModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa thông tin lớp học</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedClass(null);
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
              handleEditClass({
                ...selectedClass,
                name: formData.get('name') as string,
                major: formData.get('major') as string,
                type: formData.get('type') as "MAJOR" | "SPECIALIZATION",
                specialization: formData.get('specialization') as string || null
              });
            }} className="h-[calc(100%-4rem)] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tên lớp</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedClass.name}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập tên lớp"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Ngành</label>
                  <select
                    name="major"
                    defaultValue={selectedClass.major}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  >
                    <option value="">Chọn ngành</option>
                    {majorOptions.map(major => (
                      <option key={major} value={major}>{major}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Loại lớp</label>
                  <select
                    name="type"
                    defaultValue={selectedClass.type}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  >
                    <option value="">Chọn loại lớp</option>
                    <option value="MAJOR">Lớp ngành</option>
                    <option value="SPECIALIZATION">Lớp chuyên ngành</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Chuyên ngành</label>
                  <select
                    name="specialization"
                    defaultValue={selectedClass.specialization || ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  >
                    <option value="">Chọn chuyên ngành</option>
                    {specializationOptions.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedClass(null);
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

      {/* Students Modal */}
      {isStudentsModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách sinh viên lớp {selectedClass.name}
              </h3>
              <div className="flex items-center gap-4">
                {selectedClass.type === "SPECIALIZATION" && (
                <button
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Thêm sinh viên
                </button>
                )}
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveStudent(student.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa khỏi lớp"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
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

      {/* Add Student Modal */}
      {isAddStudentModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Thêm sinh viên vào lớp {selectedClass.name}
              </h3>
              <button
                onClick={() => {
                  setIsAddStudentModalOpen(false);
                  setSelectedStudents([]);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Tìm kiếm sinh viên</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  className="flex-1 block w-full rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  placeholder="Nhập mã sinh viên hoặc tên..."
                  onChange={(e) => handleSearchStudents(e.target.value)}
                />
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Available Students */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Danh sách sinh viên có thể thêm</h4>
                <div className="max-h-96 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mã sinh viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Họ và tên
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {availableStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.fullName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleAddStudent(student.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Thêm vào danh sách"
                            >
                              <PlusIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {availableStudents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                            Không tìm thấy sinh viên nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected Students */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Danh sách sinh viên đã chọn</h4>
                <div className="max-h-96 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mã sinh viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Họ và tên
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.fullName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRemoveSelectedStudent(student.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa khỏi danh sách"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {selectedStudents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                            Chưa có sinh viên nào được chọn
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsAddStudentModalOpen(false);
                  setSelectedStudents([]);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAddStudents}
                disabled={selectedStudents.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Xác nhận thêm ({selectedStudents.length} sinh viên)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
