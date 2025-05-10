"use client";

import { useState, useMemo } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";

interface Course {
  id: number;
  subject: string;
  semester: string;
  lecturers: string[];
  class: string;
  group_number: number;
  total_students: number;
}

// Sample data - replace with actual API calls later
const initialCourses: Course[] = [
  {
    id: 1,
    subject: "Lập trình Web",
    semester: "Học kỳ 2 - Năm học 2024 - 2025",
    lecturers: [
      "Giang Vien 1"
    ],
    class: "D22CQCN01-N",
    group_number: 1,
    total_students: 80
  },
  {
    id: 2,
    subject: "An toàn và bảo mật hệ thống thông tin",
    semester: "Học kỳ 2 - Năm học 2024 - 2025",
    lecturers: [
      "Giang Vien 2"
    ],
    class: "D22CQCN01-N",
    group_number: 1,
    total_students: 80
  },
  {
    id: 3,
    subject: "Nhập môn công nghệ phần mềm",
    semester: "Học kỳ 2 - Năm học 2024 - 2025",
    lecturers: [
      "Giang Vien 3"
    ],
    class: "D22CQCN01-N",
    group_number: 1,
    total_students: 80
  },
  {
    id: 4,
    subject: "Nhập môn trí tuệ nhân tạo",
    semester: "Học kỳ 2 - Năm học 2024 - 2025",
    lecturers: [
      "Giang Vien 4"
    ],
    class: "D22CQCN01-N",
    group_number: 1,
    total_students: 80
  },
  {
    id: 5,
    subject: "Cơ sở dữ liệu phân tán",
    semester: "Học kỳ 2 - Năm học 2024 - 2025",
    lecturers: [
      "Giang Vien 5"
    ],
    class: "D22CQCN01-N",
    group_number: 1,
    total_students: 80
  },
  {
    id: 6,
    subject: "Thực tập cơ sở",
    semester: "Học kỳ 2 - Năm học 2024 - 2025",
    lecturers: [
      "Giang Vien 1"
    ],
    class: "D22CQCN01-N",
    group_number: 1,
    total_students: 80
  },
  {
    id: 7,
    subject: "Kỹ năng tạo lập Văn bản",
    semester: "Học kỳ 2 - Năm học 2024 - 2025",
    lecturers: [
      "Giang Vien 2"
    ],
    class: "D22CQCN01-N",
    group_number: 1,
    total_students: 80
  }
];

// Sample data for lecturers (for dropdown)
const availableLecturers = [
  "Giang Vien 1",
  "Giang Vien 2",
  "Giang Vien 3",
  "Giang Vien 4",
  "Giang Vien 5"
];

// Sample data for classes (for dropdown)
const availableClasses = [
  "D22CQCN01-N",
  "D22CQCN02-N",
  "D22CQPT01-N",
  "D22CQDT01-N"
];

// Sample data for semesters (for dropdown)
const availableSemesters = [
  "Học kỳ 1 - Năm học 2024 - 2025",
  "Học kỳ 2 - Năm học 2024 - 2025",
  "Học kỳ 3 - Năm học 2024 - 2025"
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    semester: '',
    lecturer: '',
    class: ''
  });

  // Extract unique values for filter dropdowns
  const subjectOptions = useMemo(() => 
    Array.from(new Set(courses.map(c => c.subject))), [courses]);

  const filterOptions = useMemo(() => [
    {
      id: 'subject',
      label: 'Môn học',
      type: 'select' as const,
      value: filters.subject,
      options: subjectOptions.map(subject => ({ value: subject, label: subject }))
    },
    {
      id: 'semester',
      label: 'Học kỳ',
      type: 'select' as const,
      value: filters.semester,
      options: availableSemesters.map(semester => ({ value: semester, label: semester }))
    },
    {
      id: 'lecturer',
      label: 'Giảng viên',
      type: 'select' as const,
      value: filters.lecturer,
      options: availableLecturers.map(lecturer => ({ value: lecturer, label: lecturer }))
    },
    {
      id: 'class',
      label: 'Lớp',
      type: 'select' as const,
      value: filters.class,
      options: availableClasses.map(cls => ({ value: cls, label: cls }))
    }
  ], [filters, subjectOptions]);

  // Apply filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Filter by subject
      if (filters.subject && course.subject !== filters.subject) {
        return false;
      }
      
      // Filter by semester
      if (filters.semester && course.semester !== filters.semester) {
        return false;
      }
      
      // Filter by lecturer
      if (filters.lecturer && !course.lecturers.includes(filters.lecturer)) {
        return false;
      }
      
      // Filter by class
      if (filters.class && course.class !== filters.class) {
        return false;
      }
      
      return true;
    });
  }, [courses, filters]);

  // Use our pagination hook with filtered data
  const {
    currentPage,
    pageSize,
    totalPages,
    currentData: paginatedCourses,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination({
    data: filteredCourses,
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
      subject: '',
      semester: '',
      lecturer: '',
      class: ''
    });
  };

  const handleAddCourse = (newCourse: Omit<Course, 'id'>) => {
    setCourses([...courses, { ...newCourse, id: courses.length + 1 }]);
    setIsAddModalOpen(false);
  };

  const handleEditCourse = (editedCourse: Course) => {
    setCourses(courses.map(course => 
      course.id === editedCourse.id ? editedCourse : course
    ));
    setIsEditModalOpen(false);
    setSelectedCourse(null);
  };

  const handleDeleteCourse = (courseId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học phần này?")) {
      setCourses(courses.filter(course => course.id !== courseId));
    }
  };

  const getLecturerNames = (lecturers: string[]) => {
    return lecturers.join(", ");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý học phần</h1>
        <div className="flex items-center gap-4">
          {/* Filter component */}
          <FilterPanel
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
          
          {/* Add course button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm học phần
          </button>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học kỳ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảng viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhóm
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
              {paginatedCourses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.semester}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getLecturerNames(course.lecturers)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.group_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.total_students}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
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
        {courses.length > 0 && (
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

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm học phần mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                
                // Handle multiple lecturers (if using multi-select)
                const lecturers = [];
                const selectedLecturer = formData.get('lecturer') as string;
                if (selectedLecturer) {
                  lecturers.push(selectedLecturer);
                }
                
                handleAddCourse({
                  subject: formData.get('subject') as string,
                  semester: formData.get('semester') as string,
                  lecturers: lecturers,
                  class: formData.get('class') as string,
                  group_number: parseInt(formData.get('group_number') as string, 10),
                  total_students: parseInt(formData.get('total_students') as string, 10)
                });
              }}>
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700">Học kỳ</label>
                    <select
                      name="semester"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 appearance-none bg-white"
                    >
                      <option value="">Chọn học kỳ</option>
                      {availableSemesters.map((semester, index) => (
                        <option key={index} value={semester}>{semester}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Giảng viên</label>
                    <select
                      name="lecturer"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 appearance-none bg-white"
                    >
                      <option value="">Chọn giảng viên</option>
                      {availableLecturers.map((lecturer, index) => (
                        <option key={index} value={lecturer}>{lecturer}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Lớp</label>
                    <select
                      name="class"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 appearance-none bg-white"
                    >
                      <option value="">Chọn lớp</option>
                      {availableClasses.map((cls, index) => (
                        <option key={index} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nhóm</label>
                    <input
                      type="number"
                      name="group_number"
                      min="1"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số nhóm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Số sinh viên</label>
                    <input
                      type="number"
                      name="total_students"
                      min="0"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số lượng sinh viên"
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

      {/* Edit Course Modal */}
      {isEditModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa thông tin học phần</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCourse(null);
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
              
              // Handle multiple lecturers (if using multi-select)
              const lecturers = [];
              const selectedLecturer = formData.get('lecturer') as string;
              if (selectedLecturer) {
                lecturers.push(selectedLecturer);
              }
              
              handleEditCourse({
                ...selectedCourse,
                subject: formData.get('subject') as string,
                semester: formData.get('semester') as string,
                lecturers: lecturers,
                class: formData.get('class') as string,
                group_number: parseInt(formData.get('group_number') as string, 10),
                total_students: parseInt(formData.get('total_students') as string, 10)
              });
            }} className="h-[calc(100%-4rem)] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Thông tin cơ bản */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Môn học</label>
                      <input
                        type="text"
                        name="subject"
                        defaultValue={selectedCourse.subject}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên môn học"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Học kỳ</label>
                      <select
                        name="semester"
                        defaultValue={selectedCourse.semester}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        {availableSemesters.map((semester, index) => (
                          <option key={index} value={semester}>{semester}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Thông tin giảng dạy */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin giảng dạy</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Giảng viên</label>
                      <select
                        name="lecturer"
                        defaultValue={selectedCourse.lecturers[0]}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        {availableLecturers.map((lecturer, index) => (
                          <option key={index} value={lecturer}>{lecturer}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Lớp</label>
                      <select
                        name="class"
                        defaultValue={selectedCourse.class}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        {availableClasses.map((cls, index) => (
                          <option key={index} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Nhóm</label>
                      <input
                        type="number"
                        name="group_number"
                        defaultValue={selectedCourse.group_number}
                        min="1"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số nhóm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Số sinh viên</label>
                      <input
                        type="number"
                        name="total_students"
                        defaultValue={selectedCourse.total_students}
                        min="0"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số lượng sinh viên"
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
                    setSelectedCourse(null);
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
