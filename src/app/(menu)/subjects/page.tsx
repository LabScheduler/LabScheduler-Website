"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";
import SubjectService from "@/services/SubjectService";
import { SubjectResponse } from "@/types/TypeResponse";
import { NotificationDialog } from "@/components/ui/notification-dialog";

interface Subject {
  id: number;
  code: string;
  name: string;
  totalCredits: number;
  totalTheoryPeriods: number;
  totalPracticePeriods: number;
  totalExercisePeriods: number;
  totalSelfStudyPeriods: number;
}

const mapSubjectResponseToSubject = (subject: SubjectResponse): Subject => ({
  id: subject.id,
  code: subject.code,
  name: subject.name,
  totalCredits: subject.totalCredits,
  totalTheoryPeriods: subject.totalTheoryPeriods,
  totalPracticePeriods: subject.totalPracticePeriods,
  totalExercisePeriods: subject.totalExercisePeriods,
  totalSelfStudyPeriods: subject.totalSelfStudyPeriods,
});

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    code: '',
    name: '',
    credits: ''
  });
  const [successSubject, setSuccessSubject] = useState<Subject | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'edit' | 'delete' | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await SubjectService.getAllSubjects();
        if (response.success) {
          setSubjects(response.data.map(mapSubjectResponseToSubject));
        } else {
          setError(response.message || 'Không thể tải danh sách môn học');
        }
      } catch (err) {
        setError('Lỗi khi tải môn học: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // Extract unique values for filter dropdowns
  const creditsOptions = useMemo(() => 
    Array.from(new Set(subjects.map(s => s.totalCredits))).sort(), [subjects]);

  const filterOptions = useMemo(() => [
    {
      id: 'code',
      label: 'Mã môn học',
      type: 'search' as const,
      value: filters.code || '',
      placeholder: 'Nhập mã môn học...'
    },
    {
      id: 'name',
      label: 'Tên môn học',
      type: 'search' as const,
      value: filters.name || '',
      placeholder: 'Nhập tên môn học...'
    },
    {
      id: 'credits',
      label: 'Số tín chỉ',
      type: 'select' as const,
      value: filters.credits,
      options: creditsOptions.map(credits => ({ 
        value: credits.toString(), 
        label: `${credits} tín chỉ` 
      }))
    }
  ], [filters, creditsOptions]);

  // Apply filters
  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      // Filter by code
      if (filters.code && !subject.code.toLowerCase().includes(filters.code.toLowerCase())) {
        return false;
      }
      
      // Filter by name
      if (filters.name && !subject.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      // Filter by credits
      if (filters.credits && subject.totalCredits !== parseInt(filters.credits)) {
        return false;
      }
      
      return true;
    });
  }, [subjects, filters]);

  // Use our pagination hook with filtered data
  const {
    currentPage,
    pageSize,
    totalPages,
    currentData: paginatedSubjects,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination({
    data: filteredSubjects,
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
      code: '',
      name: '',
      credits: ''
    });
  };

  const handleAddSubject = async (newSubject: Omit<Subject, 'id'>) => {
    try {
      const response = await SubjectService.createSubject(
        newSubject.code,
        newSubject.name,
        newSubject.totalCredits,
        newSubject.totalTheoryPeriods,
        newSubject.totalPracticePeriods,
        newSubject.totalExercisePeriods,
        newSubject.totalSelfStudyPeriods
      );
      
      if (response.success) {
        const createdSubject = mapSubjectResponseToSubject(response.data);
        setSubjects(prev => [...prev, createdSubject]);
        setSuccessSubject(createdSubject);
        setActionType('add');
        setIsSuccessDialogOpen(true);
        setIsAddModalOpen(false);
      } else {
        setError(response.message || 'Có lỗi khi tạo môn học');
      }
    } catch (err) {
      setError('Có lỗi khi tạo môn học: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleEditSubject = async (editedSubject: Subject) => {
    try {
      const response = await SubjectService.updateSubject(
        editedSubject.id,
        editedSubject.code,
        editedSubject.name,
        editedSubject.totalCredits,
        editedSubject.totalTheoryPeriods,
        editedSubject.totalPracticePeriods,
        editedSubject.totalExercisePeriods,
        editedSubject.totalSelfStudyPeriods
      );
      
      if (response.success) {
        const updatedSubject = mapSubjectResponseToSubject(response.data);
        setSubjects(prev => prev.map(subject => 
          subject.id === updatedSubject.id ? updatedSubject : subject
        ));
        setSuccessSubject(updatedSubject);
        setActionType('edit');
        setIsSuccessDialogOpen(true);
        setIsEditModalOpen(false);
        setSelectedSubject(null);
      } else {
        setError(response.message || 'Có lỗi khi cập nhật môn học');
      }
    } catch (err) {
      setError('Có lỗi khi cập nhật môn học: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
      try {
        const response = await SubjectService.deleteSubject(subjectId);
        if (response.success) {
          const deletedSubject = subjects.find(s => s.id === subjectId);
          setSubjects(prev => prev.filter(subject => subject.id !== subjectId));
          if (deletedSubject) {
            setSuccessSubject(deletedSubject);
            setActionType('delete');
            setIsSuccessDialogOpen(true);
          }
        } else {
          setError(response.message || 'Có lỗi khi xóa môn học');
        }
      } catch (err) {
        setError('Có lỗi khi xóa môn học: ' + (err instanceof Error ? err.message : String(err)));
      }
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
      {/* Success notification dialog */}
      {successSubject && (
        <NotificationDialog
          isOpen={isSuccessDialogOpen}
          onClose={() => {
            setIsSuccessDialogOpen(false);
            setSuccessSubject(null);
            setActionType(null);
          }}
          title={
            actionType === 'add' ? "Thêm môn học thành công!" :
            actionType === 'edit' ? "Cập nhật môn học thành công!" :
            "Xóa môn học thành công!"
          }
          details={{
            "Mã môn học": successSubject.code,
            "Tên môn học": successSubject.name,
            "Số tín chỉ": `${successSubject.totalCredits} tín chỉ`,
            "Số tiết lý thuyết": `${successSubject.totalTheoryPeriods} tiết`,
            "Số tiết thực hành": `${successSubject.totalPracticePeriods} tiết`,
            "Số tiết bài tập": `${successSubject.totalExercisePeriods} tiết`,
            "Số tiết tự học": `${successSubject.totalSelfStudyPeriods} tiết`
          }}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý môn học</h1>
        <div className="flex items-center gap-4">
          {/* Filter component */}
          <FilterPanel
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
          
          {/* Add subject button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm môn học
          </button>
        </div>
      </div>

      {/* Subject Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tín chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiết lý thuyết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiết thực hành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiết bài tập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiết tự học
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSubjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.totalCredits} tín chỉ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.totalTheoryPeriods} tiết
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.totalPracticePeriods} tiết
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.totalExercisePeriods} tiết
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.totalSelfStudyPeriods} tiết
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedSubject(subject);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
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
        {subjects.length > 0 && (
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

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm môn học mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                handleAddSubject({
                  code: formData.get('code') as string,
                  name: formData.get('name') as string,
                  totalCredits: parseInt(formData.get('totalCredits') as string, 10),
                  totalTheoryPeriods: parseInt(formData.get('totalTheoryPeriods') as string, 10),
                  totalPracticePeriods: parseInt(formData.get('totalPracticePeriods') as string, 10),
                  totalExercisePeriods: parseInt(formData.get('totalExercisePeriods') as string, 10),
                  totalSelfStudyPeriods: parseInt(formData.get('totalSelfStudyPeriods') as string, 10)
                });
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Mã môn học</label>
                    <input
                      type="text"
                      name="code"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập mã môn học"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tên môn học</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập tên môn học"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Số tín chỉ</label>
                    <input
                      type="number"
                      name="totalCredits"
                      min="1"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số tín chỉ"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Số tiết lý thuyết</label>
                    <input
                      type="number"
                      name="totalTheoryPeriods"
                      min="0"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số tiết lý thuyết"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Số tiết thực hành</label>
                    <input
                      type="number"
                      name="totalPracticePeriods"
                      min="0"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số tiết thực hành"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Số tiết bài tập</label>
                    <input
                      type="number"
                      name="totalExercisePeriods"
                      min="0"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số tiết bài tập"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Số tiết tự học</label>
                    <input
                      type="number"
                      name="totalSelfStudyPeriods"
                      min="0"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số tiết tự học"
                    />
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
                    Thêm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditModalOpen && selectedSubject && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa thông tin môn học</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedSubject(null);
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
              handleEditSubject({
                ...selectedSubject,
                code: formData.get('code') as string,
                name: formData.get('name') as string,
                totalCredits: parseInt(formData.get('totalCredits') as string, 10),
                totalTheoryPeriods: parseInt(formData.get('totalTheoryPeriods') as string, 10),
                totalPracticePeriods: parseInt(formData.get('totalPracticePeriods') as string, 10),
                totalExercisePeriods: parseInt(formData.get('totalExercisePeriods') as string, 10),
                totalSelfStudyPeriods: parseInt(formData.get('totalSelfStudyPeriods') as string, 10)
              });
            }} className="h-[calc(100%-4rem)] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Mã môn học</label>
                  <input
                    type="text"
                    name="code"
                    defaultValue={selectedSubject.code}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập mã môn học"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tên môn học</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedSubject.name}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập tên môn học"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Số tín chỉ</label>
                  <input
                    type="number"
                    name="totalCredits"
                    defaultValue={selectedSubject.totalCredits}
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập số tín chỉ"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Số tiết lý thuyết</label>
                  <input
                    type="number"
                    name="totalTheoryPeriods"
                    defaultValue={selectedSubject.totalTheoryPeriods}
                    min="0"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập số tiết lý thuyết"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Số tiết thực hành</label>
                  <input
                    type="number"
                    name="totalPracticePeriods"
                    defaultValue={selectedSubject.totalPracticePeriods}
                    min="0"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập số tiết thực hành"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Số tiết bài tập</label>
                  <input
                    type="number"
                    name="totalExercisePeriods"
                    defaultValue={selectedSubject.totalExercisePeriods}
                    min="0"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập số tiết bài tập"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Số tiết tự học</label>
                  <input
                    type="number"
                    name="totalSelfStudyPeriods"
                    defaultValue={selectedSubject.totalSelfStudyPeriods}
                    min="0"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="Nhập số tiết tự học"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedSubject(null);
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
