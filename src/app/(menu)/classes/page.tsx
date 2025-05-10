"use client";

import { useState, useMemo } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";

interface Class {
  id: number;
  name: string;
  major: string;
  specialization: string;
  type: 'MAJOR';
  number_of_students: number;
  semester: string;
}

// Sample data - replace with actual API calls later
const initialClasses: Class[] = [
  {
    id: 1,
    name: "D22CQCN01-N",
    major: "Công nghệ thông tin",
    specialization: "Kỹ thuật phần mềm",
    type: "MAJOR",
    number_of_students: 1,
    semester: "2023-2024.2"
  },
  {
    id: 2,
    name: "D22CQCN02-N",
    major: "Công nghệ thông tin",
    specialization: "Hệ thống thông tin",
    type: "MAJOR",
    number_of_students: 0,
    semester: "2023-2024.2"
  },
  {
    id: 3,
    name: "D22CQPT01-N",
    major: "Kế toán",
    specialization: "Kế toán doanh nghiệp",
    type: "MAJOR",
    number_of_students: 0,
    semester: "2023-2024.2"
  },
  {
    id: 4,
    name: "D22CQDT01-N",
    major: "Kỹ thuật Điện tử",
    specialization: "Điện tử viễn thông",
    type: "MAJOR",
    number_of_students: 0,
    semester: "2023-2024.2"
  }
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    major: '',
    specialization: '',
    searchName: ''
  });

  // Extract unique values for filter dropdowns
  const majorOptions = useMemo(() => 
    Array.from(new Set(classes.map(c => c.major))), [classes]);

  const specializationOptions = useMemo(() => 
    Array.from(new Set(classes.map(c => c.specialization))), [classes]);

  const filterOptions = useMemo(() => [
    {
      id: 'major',
      label: 'Ngành',
      type: 'select' as const,
      value: filters.major,
      options: majorOptions.map(major => ({ value: major, label: major }))
    },
    {
      id: 'specialization',
      label: 'Chuyên ngành',
      type: 'select' as const,
      value: filters.specialization,
      options: specializationOptions.map(spec => ({ value: spec, label: spec }))
    }
  ], [filters, majorOptions, specializationOptions]);

  // Apply filters
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      // Filter by major
      if (filters.major && cls.major !== filters.major) {
        return false;
      }
      
      // Filter by specialization
      if (filters.specialization && cls.specialization !== filters.specialization) {
        return false;
      }
      
      // Filter by name search
      if (filters.searchName && !cls.name.toLowerCase().includes(filters.searchName.toLowerCase())) {
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
      major: '',
      specialization: '',
      searchName: ''
    });
  };

  const handleAddClass = (newClass: Omit<Class, 'id' | 'number_of_students'>) => {
    setClasses([...classes, { 
      ...newClass, 
      id: classes.length + 1,
      number_of_students: 0,
      semester: newClass.semester || "2023-2024.2" // Default to current semester if not provided
    }]);
    setIsAddModalOpen(false);
  };

  const handleEditClass = (editedClass: Class) => {
    setClasses(classes.map(cls => 
      cls.id === editedClass.id ? editedClass : cls
    ));
    setIsEditModalOpen(false);
    setSelectedClass(null);
  };

  const handleDeleteClass = (classId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp này?")) {
      setClasses(classes.filter(cls => cls.id !== classId));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý lớp</h1>
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
            Thêm lớp
          </button>
        </div>
      </div>

      {/* Class name search input */}
      {isFilterOpen && (
        <div className="mb-6">
          <div className="max-w-md">
            <label htmlFor="searchClass" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm theo mã lớp
            </label>
            <input
              type="text"
              id="searchClass"
              value={filters.searchName}
              onChange={(e) => handleFilterChange('searchName', e.target.value)}
              placeholder="Nhập mã lớp..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Class Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chuyên ngành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng sinh viên
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedClasses.map((cls) => (
                <tr key={cls.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cls.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cls.major}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cls.specialization ? cls.specialization : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cls.type === "MAJOR" ? "Lớp chính" : cls.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cls.number_of_students}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedClass(cls);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
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

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm lớp mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                handleAddClass({
                  name: formData.get('name') as string,
                  major: formData.get('major') as string,
                  specialization: formData.get('specialization') as string,
                  type: "MAJOR" as const,
                  semester: formData.get('semester') as string
                });
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Mã lớp</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập mã lớp"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Ngành</label>
                    <input
                      type="text"
                      name="major"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập tên ngành"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Chuyên ngành</label>
                    <input
                      type="text"
                      name="specialization"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập tên chuyên ngành"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Học phần</label>
                    <input
                      type="text"
                      name="semester"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Ví dụ: 2023-2024.2"
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

      {/* Edit Class Modal */}
      {isEditModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa thông tin lớp</h3>
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
                specialization: formData.get('specialization') as string,
                type: "MAJOR" as const,
                semester: formData.get('semester') as string
              });
            }} className="h-[calc(100%-4rem)] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Thông tin cơ bản */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Mã lớp</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={selectedClass.name}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mã lớp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Ngành</label>
                      <input
                        type="text"
                        name="major"
                        defaultValue={selectedClass.major}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên ngành"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Chuyên ngành</label>
                      <input
                        type="text"
                        name="specialization"
                        defaultValue={selectedClass.specialization}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên chuyên ngành"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Học phần</label>
                      <input
                        type="text"
                        name="semester"
                        defaultValue={selectedClass.semester}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: 2023-2024.2"
                      />
                    </div>
                  </div>
                </div>

                {/* Thông tin thêm */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin thêm</h4>
                  <div>
                    <p className="text-sm text-gray-600">
                      Số lượng sinh viên: {selectedClass.number_of_students}
                    </p>
                  </div>
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
    </div>
  );
}
