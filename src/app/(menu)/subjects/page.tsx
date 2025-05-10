"use client";

import { useState, useMemo } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";

interface Subject {
  id: number;
  code: string;
  name: string;
  total_credits: number;
  total_theory_periods: number;
  total_practice_periods: number;
  total_exercise_periods: number;
  total_self_study_periods: number;
}

// Sample data - replace with actual API calls later
const initialSubjects: Subject[] = [
  {
    id: 1,
    code: "BAS1150",
    name: "Triết học Mác - Lênin",
    total_credits: 3,
    total_theory_periods: 45,
    total_practice_periods: 0,
    total_exercise_periods: 0,
    total_self_study_periods: 0
  },
  {
    id: 2,
    code: "BAS1203",
    name: "Giải tích 1",
    total_credits: 3,
    total_theory_periods: 36,
    total_practice_periods: 0,
    total_exercise_periods: 0,
    total_self_study_periods: 0
  },
  {
    id: 3,
    code: "INT1154",
    name: "Tin học cơ sở 1",
    total_credits: 2,
    total_theory_periods: 20,
    total_practice_periods: 4,
    total_exercise_periods: 0,
    total_self_study_periods: 0
  },
  {
    id: 4,
    code: "BAS1201",
    name: "Đại số",
    total_credits: 3,
    total_theory_periods: 36,
    total_practice_periods: 0,
    total_exercise_periods: 0,
    total_self_study_periods: 0
  },
  {
    id: 5,
    code: "BAS1106",
    name: "Giáo dục thể chất 1",
    total_credits: 2,
    total_theory_periods: 2,
    total_practice_periods: 0,
    total_exercise_periods: 0,
    total_self_study_periods: 0
  },
  {
    id: 6,
    code: "BAS1105-7",
    name: "Giáo dục quốc phòng và an ninh",
    total_credits: 7,
    total_theory_periods: 0,
    total_practice_periods: 165,
    total_exercise_periods: 0,
    total_self_study_periods: 0
  },
  {
    id: 7,
    code: "BAS1151",
    name: "Kinh tế chính trị Mác - Lênin",
    total_credits: 2,
    total_theory_periods: 30,
    total_practice_periods: 0,
    total_exercise_periods: 0,
    total_self_study_periods: 0
  },
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    code: '',
    name: '',
    credits: ''
  });

  // Extract unique values for filter dropdowns
  const uniqueCodes = useMemo(() => 
    Array.from(new Set(initialSubjects.map(s => s.code.substring(0, 3)))), []);
  
  const creditOptions = useMemo(() => 
    Array.from(new Set(initialSubjects.map(s => s.total_credits))).sort(), []);

  const filterOptions = useMemo(() => [
    {
      id: 'code',
      label: 'Mã môn học',
      type: 'select' as const,
      value: filters.code,
      options: uniqueCodes.map(code => ({ value: code, label: code }))
    },
    {
      id: 'name',
      label: 'Tên môn học',
      type: 'search' as const,
      value: filters.name,
      placeholder: 'Nhập tên môn học...'
    },
    {
      id: 'credits',
      label: 'Số tín chỉ',
      type: 'select' as const,
      value: filters.credits,
      options: creditOptions.map(credits => ({ value: credits.toString(), label: credits.toString() }))
    }
  ], [filters, uniqueCodes, creditOptions]);

  // Apply filters
  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      // Filter by code prefix (e.g., BAS, INT)
      if (filters.code && !subject.code.startsWith(filters.code)) {
        return false;
      }
      
      // Filter by name
      if (filters.name && !subject.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      // Filter by credits
      if (filters.credits && subject.total_credits !== parseInt(filters.credits)) {
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

  const handleAddSubject = (newSubject: Omit<Subject, 'id'>) => {
    setSubjects([...subjects, { ...newSubject, id: subjects.length + 1 }]);
    setIsAddModalOpen(false);
  };

  const handleEditSubject = (editedSubject: Subject) => {
    setSubjects(subjects.map(subject => 
      subject.id === editedSubject.id ? editedSubject : subject
    ));
    setIsEditModalOpen(false);
    setSelectedSubject(null);
  };

  const handleDeleteSubject = (subjectId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
      setSubjects(subjects.filter(subject => subject.id !== subjectId));
    }
  };

  return (
    <div className="p-6">
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
                  Lý thuyết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thực hành
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
                    {subject.total_credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.total_theory_periods} tiết
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.total_practice_periods} tiết
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedSubject(subject);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-red-600 hover:text-red-900"
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
                  total_credits: parseInt(formData.get('total_credits') as string, 10),
                  total_theory_periods: parseInt(formData.get('total_theory_periods') as string, 10),
                  total_practice_periods: parseInt(formData.get('total_practice_periods') as string, 10),
                  total_exercise_periods: parseInt(formData.get('total_exercise_periods') as string, 10),
                  total_self_study_periods: parseInt(formData.get('total_self_study_periods') as string, 10)
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
                      placeholder="Ví dụ: BAS1150"
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
                      name="total_credits"
                      min="1"
                      max="10"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số tín chỉ"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Số tiết lý thuyết</label>
                    <input
                      type="number"
                      name="total_theory_periods"
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
                      name="total_practice_periods"
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
                      name="total_exercise_periods"
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
                      name="total_self_study_periods"
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
                total_credits: parseInt(formData.get('total_credits') as string, 10),
                total_theory_periods: parseInt(formData.get('total_theory_periods') as string, 10),
                total_practice_periods: parseInt(formData.get('total_practice_periods') as string, 10),
                total_exercise_periods: parseInt(formData.get('total_exercise_periods') as string, 10),
                total_self_study_periods: parseInt(formData.get('total_self_study_periods') as string, 10)
              });
            }} className="h-[calc(100%-4rem)] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Thông tin cơ bản */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Mã môn học</label>
                      <input
                        type="text"
                        name="code"
                        defaultValue={selectedSubject.code}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: BAS1150"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Tên môn học</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={selectedSubject.name}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên môn học"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Số tín chỉ</label>
                      <input
                        type="number"
                        name="total_credits"
                        defaultValue={selectedSubject.total_credits}
                        min="1"
                        max="10"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số tín chỉ"
                      />
                    </div>
                  </div>
                </div>

                {/* Thông tin số tiết */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin số tiết</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Số tiết lý thuyết</label>
                      <input
                        type="number"
                        name="total_theory_periods"
                        defaultValue={selectedSubject.total_theory_periods}
                        min="0"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số tiết lý thuyết"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Số tiết thực hành</label>
                      <input
                        type="number"
                        name="total_practice_periods"
                        defaultValue={selectedSubject.total_practice_periods}
                        min="0"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số tiết thực hành"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Số tiết bài tập</label>
                      <input
                        type="number"
                        name="total_exercise_periods"
                        defaultValue={selectedSubject.total_exercise_periods}
                        min="0"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số tiết bài tập"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Số tiết tự học</label>
                      <input
                        type="number"
                        name="total_self_study_periods"
                        defaultValue={selectedSubject.total_self_study_periods}
                        min="0"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số tiết tự học"
                      />
                    </div>
                  </div>
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
