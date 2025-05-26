"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";
import CourseService from "@/services/CourseService";
import SemesterService from "@/services/SemesterService";
import UserService from "@/services/UserService";
import SubjectService from "@/services/SubjectService";
import ClassService from "@/services/ClassService";
import { CourseResponse, SemesterResponse, LecturerResponse, SemesterWeekResponse, SubjectResponse, ClassResponse, CourseSectionResponse } from "@/types/TypeResponse";
import { NotificationDialog } from "@/components/ui/notification-dialog";

interface Course {
  id: number;
  subject: string;
  semester: string;
  lecturers: string[];
  groupNumber: number;
  totalStudents: number;
  class: string;
}

const mapCourseResponseToCourse = (courseResponse: CourseResponse): Course => {
  console.log('Mapping course response:', courseResponse);
  return {
    id: courseResponse.id,
    subject: courseResponse.subject,
    semester: courseResponse.semester,
    lecturers: courseResponse.lecturers || [],
    groupNumber: courseResponse.groupNumber,
    totalStudents: courseResponse.totalStudents,
    class: courseResponse.class,
  };
};

export default function CoursesPage() {
  // State for courses data
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for semesters
  const [semesters, setSemesters] = useState<SemesterResponse[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<SemesterResponse | null>(null);
  const [semesterWeeks, setSemesterWeeks] = useState<SemesterWeekResponse[]>([]);

  // State for subjects, classes, lecturers
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [lecturers, setLecturers] = useState<LecturerResponse[]>([]);

  // Additional state for form management
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [defaultStudentCount, setDefaultStudentCount] = useState<number | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Success notification states
  const [successCourse, setSuccessCourse] = useState<Course | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'edit' | 'delete' | null>(null);

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    semester: '',
    lecturer: '',
    class: ''
  });

  // Add state for selected lecturers
  const [selectedLecturers, setSelectedLecturers] = useState<LecturerResponse[]>([]);
  const [lecturerSearchText, setLecturerSearchText] = useState('');

  // Add states for search and selection
  const [subjectSearchText, setSubjectSearchText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectResponse | null>(null);
  const [classSearchText, setClassSearchText] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassResponse | null>(null);

  // Add focus states
  const [isSubjectFocused, setIsSubjectFocused] = useState(false);
  const [isClassFocused, setIsClassFocused] = useState(false);
  const [isLecturerFocused, setIsLecturerFocused] = useState(false);

  // Add new semester modal states
  const [isAddSemesterModalOpen, setIsAddSemesterModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccessNotificationOpen, setIsSuccessNotificationOpen] = useState(false);

  // Add course detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseResponse | null>(null);
  const [courseSections, setCourseSections] = useState<CourseSectionResponse[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  // Load semesters on component mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await SemesterService.getAllSemesters();
        if (response.success) {
          setSemesters(response.data);
          // Set current semester as default
          const currentSemResponse = await SemesterService.getCurrentSemester();
          if (currentSemResponse.success) {
            setSelectedSemester(currentSemResponse.data);
          }
        } else {
          setError(response.message || 'Không thể tải danh sách kỳ học');
        }
      } catch (err) {
        setError('Lỗi khi tải kỳ học: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    fetchSemesters();
  }, []);

  // Load subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await SubjectService.getAllSubjects();
        if (response.success) {
          setSubjects(response.data);
        } else {
          setError(response.message || 'Không thể tải danh sách học phần');
        }
      } catch (err) {
        setError('Lỗi khi tải học phần: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    fetchSubjects();
  }, []);

  // Load classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await ClassService.getAllClasses("");
        if (response.success) {
          setClasses(response.data);
        } else {
          setError(response.message || 'Không thể tải danh sách lớp học');
        }
      } catch (err) {
        setError('Lỗi khi tải lớp học: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    fetchClasses();
  }, []);

  // Load courses when selected semester changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedSemester) return;
      
      try {
        setLoading(true);
        const response = await CourseService.getAllCoursesBySemesterId(selectedSemester.id);
        if (response.success) {
          setCourses(response.data.map(mapCourseResponseToCourse));
        } else {
          setError(response.message || 'Không thể tải danh sách học phần');
        }
      } catch (err) {
        setError('Lỗi khi tải học phần: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [selectedSemester]);

  // Load lecturers on component mount
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const response = await UserService.getAllLecturers();
        if (response.success) {
          setLecturers(response.data);
        } else {
          setError(response.message || 'Không thể tải danh sách giảng viên');
        }
      } catch (err) {
        setError('Lỗi khi tải giảng viên: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    fetchLecturers();
  }, []);

  // Load semester weeks when selected semester changes
  useEffect(() => {
    const fetchSemesterWeeks = async () => {
      if (!selectedSemester) return;
      
      try {
        const response = await SemesterService.getSemesterWeekBySemesterId(selectedSemester.id.toString());
        if (response.success) {
          setSemesterWeeks(response.data);
        } else {
          setError(response.message || 'Không thể tải danh sách tuần học');
        }
      } catch (err) {
        setError('Lỗi khi tải tuần học: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    fetchSemesterWeeks();
  }, [selectedSemester]);

  // Handler for class selection in form
  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
    const selectedClass = classes.find(c => c.id === classId);
    if (selectedClass) {
      setDefaultStudentCount(selectedClass.numberOfStudents);
    }
  };

  // Reset form state when closing modals
  const resetFormState = () => {
    setSelectedClassId(null);
    setDefaultStudentCount(null);
  };

  // Extract unique values for filter dropdowns
  const subjectOptions = useMemo(() => 
    Array.from(new Set(courses.map(c => c.subject))).sort(), [courses]);

  const classOptions = useMemo(() => 
    Array.from(new Set(courses.map(c => c.class))).sort(), [courses]);

  const lecturerOptions = useMemo(() => 
    Array.from(new Set(courses.flatMap(c => c.lecturers))).sort(), [courses]);

  const filterOptions = useMemo(() => [
    {
      id: 'subject',
      label: 'Học phần',
      type: 'search' as const,
      value: filters.subject || '',
      placeholder: 'Nhập tên học phần...'
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
      id: 'class',
      label: 'Lớp',
      type: 'select' as const,
      value: filters.class,
      options: classOptions.map(cls => ({ 
        value: cls, 
        label: cls 
      }))
    }
  ], [filters, lecturerOptions, classOptions]);

  // Apply filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (filters.subject && !course.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
        return false;
      }
      
      if (filters.lecturer && !course.lecturers.some(l => l === filters.lecturer)) {
        return false;
      }
      
      if (filters.class && course.class !== filters.class) {
        return false;
      }
      
      return true;
    });
  }, [courses, filters]);

  // Use pagination hook with filtered data
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

  const handleAddCourse = async (
    subjectId: number,
    classId: number,
    lecturerIds: number[],
    totalStudents: number,
    totalSection: number,
    startWeekId: number
  ) => {
    if (!selectedSemester) {
      setError('Vui lòng chọn kỳ học');
      return;
    }

    try {
      const payload = {
        subjectId,
        classId,
        lecturersIds: lecturerIds,
        semesterId: selectedSemester.id,
        totalStudents,
        totalSection,
        startWeekId
      };
      console.log('Sending payload:', payload);

      const response = await CourseService.createCourse(payload);
      console.log('API Response:', response);

      if (response.success) {
        if (response.data && response.data.course) {
          const newCourse = mapCourseResponseToCourse(response.data.course);
          console.log('Mapped new course:', newCourse);
          setCourses(prev => [...prev, newCourse]);
          setSuccessCourse(newCourse);
          setActionType('add');
          setIsSuccessDialogOpen(true);
    setIsAddModalOpen(false);
          resetFormState();
          resetAllSelections();
        } else {
          console.error('Invalid response structure:', response);
          setError('Định dạng phản hồi không hợp lệ');
        }
      } else {
        setError(response.message || 'Có lỗi khi tạo học phần');
      }
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Lỗi khi tạo học phần: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleEditCourse = (editedCourse: Course) => {
    setCourses(courses.map(course => 
      course.id === editedCourse.id ? editedCourse : course
    ));
    setIsEditModalOpen(false);
    setSelectedCourse(null);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học phần này?")) {
      try {
        const courseToDelete = courses.find(c => c.id === courseId);
        const response = await CourseService.deleteCourse(courseId);
        console.log( "JSUSCRY"+ response)
        if (response.success) {
          setCourses(prev => prev.filter(course => course.id !== courseId));
          if (courseToDelete) {
            setSuccessCourse(courseToDelete);
            setActionType('delete');
            setIsSuccessDialogOpen(true);
          }
        } else {
          setError(response.message || 'Có lỗi khi xóa học phần');
        }
      } catch (err) {
        setError('Lỗi khi xóa học phần: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  const handleUpdateCourse = async (
    courseId: number,
    subjectId: number,
    classId: number,
    lecturerIds: number[],
    totalStudents: number
  ) => {
    try {
      const response = await CourseService.updateCourse(courseId, {
        subjectId,
        classId,
        lecturersIds: lecturerIds,
        totalStudents
      });

      if (response.success) {
        const updatedCourse = mapCourseResponseToCourse(response.data);
        setCourses(prev => prev.map(course => 
          course.id === updatedCourse.id ? updatedCourse : course
        ));
        setSuccessCourse(updatedCourse);
        setActionType('edit');
        setIsSuccessDialogOpen(true);
        setIsEditModalOpen(false);
        setSelectedCourse(null);
      } else {
        setError(response.message || 'Có lỗi khi cập nhật học phần');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật học phần: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Function to handle lecturer selection
  const handleLecturerSelect = (lecturer: LecturerResponse) => {
    if (!selectedLecturers.find(l => l.id === lecturer.id)) {
      setSelectedLecturers([...selectedLecturers, lecturer]);
    }
    setLecturerSearchText('');
  };

  // Function to remove lecturer
  const handleRemoveLecturer = (lecturerId: number) => {
    setSelectedLecturers(selectedLecturers.filter(l => l.id !== lecturerId));
  };

  // Filter lecturers based on search text
  const filteredLecturers = useMemo(() => {
    return lecturers.filter(
      l => (!lecturerSearchText || 
           l.fullName.toLowerCase().includes(lecturerSearchText.toLowerCase()) ||
           l.code.toLowerCase().includes(lecturerSearchText.toLowerCase())) &&
           !selectedLecturers.find(sl => sl.id === l.id)
    );
  }, [lecturers, lecturerSearchText, selectedLecturers]);

  // Reset lecturer selection when closing modal
  const resetLecturerSelection = () => {
    setSelectedLecturers([]);
    setLecturerSearchText('');
  };

  // Filter subjects based on search text
  const filteredSubjects = useMemo(() => {
    if (!selectedSubject) {
      return subjects.filter(
        s => !subjectSearchText || 
        s.name.toLowerCase().includes(subjectSearchText.toLowerCase()) ||
        s.code.toLowerCase().includes(subjectSearchText.toLowerCase())
      );
    }
    return [];
  }, [subjects, subjectSearchText, selectedSubject]);

  // Filter classes based on search text
  const filteredClasses = useMemo(() => {
    if (!selectedClass) {
      return classes.filter(
        c => !classSearchText || 
        c.name.toLowerCase().includes(classSearchText.toLowerCase())
      );
    }
    return [];
  }, [classes, classSearchText, selectedClass]);

  // Reset all selections when closing modal
  const resetAllSelections = () => {
    setSelectedSubject(null);
    setSubjectSearchText('');
    setSelectedClass(null);
    setClassSearchText('');
    setSelectedLecturers([]);
    setLecturerSearchText('');
    setIsSubjectFocused(false);
    setIsClassFocused(false);
    setIsLecturerFocused(false);
    resetFormState();
  };

  // Handle subject selection
  const handleSubjectSelect = (subject: SubjectResponse) => {
    setSelectedSubject(subject);
    setSubjectSearchText('');
  };

  // Handle class selection
  const handleClassSelect = (classItem: ClassResponse) => {
    setSelectedClass(classItem);
    setClassSearchText('');
    setDefaultStudentCount(classItem.numberOfStudents);
  };

  // Function to handle viewing course details
  const handleViewCourseDetail = async (course: Course) => {
    setSelectedCourseDetail(course);
    setIsDetailModalOpen(true);
    setIsLoadingSections(true);
    try {
      const response = await CourseService.getSectionByCourseId(course.id);
      if (response.success) {
        setCourseSections(response.data);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải thông tin nhóm');
    } finally {
      setIsLoadingSections(false);
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
      {successCourse && (
        <NotificationDialog
          isOpen={isSuccessDialogOpen}
          onClose={() => {
            setIsSuccessDialogOpen(false);
            setSuccessCourse(null);
            setActionType(null);
          }}
          title={
            actionType === 'add' ? "Thêm học phần thành công!" :
            actionType === 'edit' ? "Cập nhật học phần thành công!" :
            "Xóa học phần thành công!"
          }
          details={{
            "Học phần": successCourse.subject,
            "Kỳ học": successCourse.semester,
            "Nhóm": successCourse.groupNumber.toString(),
            "Lớp": successCourse.class,
            "Giảng viên": successCourse.lecturers.join(", "),
            "Số sinh viên": `${successCourse.totalStudents} sinh viên`
          }}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý học phần</h1>
        <div className="flex items-center gap-4">
          {/* Semester selector */}
          <div className="relative">
            <select
              className="appearance-none block w-127 pl-4 pr-10 py-2.5 text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer"
              value={selectedSemester?.id || ""}
              onChange={(e) => {
                if (e.target.value === "add_new") {
                  setIsAddSemesterModalOpen(true);
                  return;
                }
                const semester = semesters.find(s => s.id === parseInt(e.target.value));
                setSelectedSemester(semester || null);
              }}
            >
              <option value="">Chọn học kỳ</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name} ({new Date(semester.startDate).toLocaleDateString('vi-VN')} - {new Date(semester.endDate).toLocaleDateString('vi-VN')})
                </option>
              ))}
              <option value="" disabled>──────────</option>
              <option value="add_new">+ Thêm học kỳ mới</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

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
            disabled={!selectedSemester}
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
                  Học phần
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhóm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảng viên
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
                <tr 
                  key={course.id}
                  onClick={() => handleViewCourseDetail(course)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.groupNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.lecturers.join(", ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.totalStudents} sinh viên
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCourse(course);
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
                        handleDeleteCourse(course.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedCourses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {selectedSemester 
                      ? "Không có học phần nào trong kỳ học này" 
                      : "Vui lòng chọn kỳ học để xem danh sách học phần"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {paginatedCourses.length > 0 && (
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
      {isAddModalOpen && selectedSemester && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-6 border w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Thêm học phần mới</h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetAllSelections();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                
                if (!selectedSemester) {
                  alert('Vui lòng chọn kỳ học trước khi tạo học phần');
                  return;
                }
                
                if (!selectedSubject) {
                  alert('Vui lòng chọn môn học');
                  return;
                }

                if (!selectedClass) {
                  alert('Vui lòng chọn lớp');
                  return;
                }

                if (selectedLecturers.length === 0) {
                  alert('Vui lòng chọn ít nhất một giảng viên');
                  return;
                }

                const totalStudents = parseInt(formData.get('totalStudents') as string);
                const totalSection = parseInt(formData.get('totalSection') as string);
                const startWeekId = parseInt(formData.get('startWeekId') as string);

                if (isNaN(totalStudents) || totalStudents <= 0) {
                  alert('Số sinh viên không hợp lệ');
                  return;
                }

                if (isNaN(totalSection) || totalSection <= 0) {
                  alert('Số nhóm không hợp lệ');
                  return;
                }

                if (isNaN(startWeekId) || startWeekId <= 0) {
                  alert('Vui lòng chọn tuần bắt đầu');
                  return;
                }

                // Log values for debugging
                console.log('Form values:', {
                  subjectId: selectedSubject.id,
                  classId: selectedClass.id,
                  lecturerIds: selectedLecturers.map(l => l.id),
                  semesterId: selectedSemester.id,
                  totalStudents,
                  totalSection,
                  startWeekId
                });

                handleAddCourse(
                  selectedSubject.id,
                  selectedClass.id,
                  selectedLecturers.map(l => l.id),
                  totalStudents,
                  totalSection,
                  startWeekId
                );
              }}>
                <div className="grid grid-cols-2 gap-6">
                  {/* Subject Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                    <div className="relative">
                    <input
                      type="text"
                        value={subjectSearchText || (selectedSubject ? `${selectedSubject.code} - ${selectedSubject.name}` : '')}
                        onChange={(e) => {
                          setSubjectSearchText(e.target.value);
                          setSelectedSubject(null);
                        }}
                        onFocus={() => setIsSubjectFocused(true)}
                        onBlur={() => {
                          setTimeout(() => setIsSubjectFocused(false), 200);
                        }}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                        placeholder="Tìm kiếm môn học theo mã hoặc tên..."
                      />
                      {isSubjectFocused && filteredSubjects.length > 0 && !selectedSubject && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                          <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <p className="text-sm text-gray-500">Tìm thấy {filteredSubjects.length} môn học</p>
                  </div>
                          {filteredSubjects.map(subject => (
                            <div
                              key={subject.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                              onClick={() => handleSubjectSelect(subject)}
                            >
                              <div className="font-medium">{subject.code} - {subject.name}</div>
                              <div className="text-sm text-gray-500">Số tín chỉ: {subject.totalCredits}</div>
                            </div>
                          ))}
                  </div>
                      )}
                    </div>
                  </div>

                  {/* Class Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lớp</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={classSearchText || (selectedClass ? `${selectedClass.name} (${selectedClass.numberOfStudents} sinh viên)` : '')}
                        onChange={(e) => {
                          setClassSearchText(e.target.value);
                          setSelectedClass(null);
                        }}
                        onFocus={() => setIsClassFocused(true)}
                        onBlur={() => {
                          setTimeout(() => setIsClassFocused(false), 200);
                        }}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                        placeholder="Tìm kiếm lớp..."
                      />
                      {isClassFocused && filteredClasses.length > 0 && !selectedClass && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                          <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <p className="text-sm text-gray-500">Tìm thấy {filteredClasses.length} lớp</p>
                          </div>
                          {filteredClasses.map(classItem => (
                            <div
                              key={classItem.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                              onClick={() => handleClassSelect(classItem)}
                            >
                              <div className="font-medium">{classItem.name}</div>
                              <div className="text-sm text-gray-500">
                                {classItem.type === "MAJOR" ? "Lớp ngành" : "Lớp chuyên ngành"} - {classItem.numberOfStudents} sinh viên
                              </div>
                            </div>
                          ))}
                  </div>
                      )}
                    </div>
                  </div>

                  {/* Lecturer Selection with Tag Input */}
                  <div className="mb-4 col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giảng viên
                      <span className="ml-1 text-sm text-gray-500">(Có thể chọn nhiều)</span>
                    </label>
                    <div className="relative">
                      <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                        {selectedLecturers.map(lecturer => (
                          <div
                            key={lecturer.id}
                            className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm"
                          >
                            <span>{lecturer.code} - {lecturer.fullName}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveLecturer(lecturer.id);
                              }}
                              className="ml-2 text-blue-500 hover:text-blue-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <input
                          type="text"
                          value={lecturerSearchText}
                          onChange={(e) => setLecturerSearchText(e.target.value)}
                          onFocus={() => setIsLecturerFocused(true)}
                          onBlur={() => {
                            setTimeout(() => setIsLecturerFocused(false), 200);
                          }}
                          className="flex-1 outline-none min-w-[200px] placeholder:text-gray-400"
                          placeholder={selectedLecturers.length === 0 ? "Tìm kiếm giảng viên theo mã hoặc tên..." : "Thêm giảng viên..."}
                        />
                  </div>
                      {isLecturerFocused && filteredLecturers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                          <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <p className="text-sm text-gray-500">Tìm thấy {filteredLecturers.length} giảng viên</p>
                          </div>
                          {filteredLecturers.map(lecturer => (
                            <div
                              key={lecturer.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLecturerSelect(lecturer);
                              }}
                            >
                              <div className="font-medium">{lecturer.code} - {lecturer.fullName}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedLecturers.length === 0 && (
                      <p className="mt-2 text-sm text-gray-500">Chưa có giảng viên nào được chọn</p>
                    )}
                  </div>

                  {/* Other fields remain unchanged */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số sinh viên</label>
                    <input
                      type="number"
                      name="totalStudents"
                      required
                      min="1"
                      value={defaultStudentCount || ""}
                      onChange={(e) => setDefaultStudentCount(parseInt(e.target.value))}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                      placeholder="Nhập số sinh viên"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số nhóm</label>
                    <input
                      type="number"
                      name="totalSection"
                      required
                      min="1"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                      placeholder="Nhập số nhóm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tuần bắt đầu</label>
                    <select
                      name="startWeekId"
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                    >
                      <option value="">Chọn tuần bắt đầu</option>
                      {semesterWeeks.map(week => (
                        <option key={week.id} value={week.id}>
                          {week.name}
                        </option>
                      ))}
                    </select>
                </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddModalOpen(false);
                      resetAllSelections();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                  >
                    Thêm học phần
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
          <div className="relative top-20 mx-auto p-6 border w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa thông tin học phần</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCourse(null);
                  resetAllSelections();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!selectedCourse) return;

              handleUpdateCourse(
                selectedCourse.id,
                selectedSubject?.id || subjects.find(s => s.name === selectedCourse.subject)?.id || 0,
                selectedClass?.id || classes.find(c => c.name === selectedCourse.class)?.id || 0,
                selectedLecturers.map(l => l.id),
                defaultStudentCount || selectedCourse.totalStudents
              );
            }}>
              <div className="grid grid-cols-2 gap-6">
                {/* Subject Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={subjectSearchText || (selectedSubject ? `${selectedSubject.code} - ${selectedSubject.name}` : selectedCourse.subject)}
                      onChange={(e) => {
                        setSubjectSearchText(e.target.value);
                        setSelectedSubject(null);
                      }}
                      onFocus={() => setIsSubjectFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsSubjectFocused(false), 200);
                      }}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                      placeholder="Tìm kiếm môn học theo mã hoặc tên..."
                    />
                    {isSubjectFocused && filteredSubjects.length > 0 && !selectedSubject && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <p className="text-sm text-gray-500">Tìm thấy {filteredSubjects.length} môn học</p>
                        </div>
                        {filteredSubjects.map(subject => (
                          <div
                            key={subject.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                            onClick={() => handleSubjectSelect(subject)}
                          >
                            <div className="font-medium">{subject.code} - {subject.name}</div>
                            <div className="text-sm text-gray-500">Số tín chỉ: {subject.totalCredits}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Class Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lớp</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={classSearchText || (selectedClass ? `${selectedClass.name} (${selectedClass.numberOfStudents} sinh viên)` : selectedCourse.class)}
                      onChange={(e) => {
                        setClassSearchText(e.target.value);
                        setSelectedClass(null);
                      }}
                      onFocus={() => setIsClassFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsClassFocused(false), 200);
                      }}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                      placeholder="Tìm kiếm lớp..."
                    />
                    {isClassFocused && filteredClasses.length > 0 && !selectedClass && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <p className="text-sm text-gray-500">Tìm thấy {filteredClasses.length} lớp</p>
                        </div>
                        {filteredClasses.map(classItem => (
                          <div
                            key={classItem.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                            onClick={() => handleClassSelect(classItem)}
                          >
                            <div className="font-medium">{classItem.name}</div>
                            <div className="text-sm text-gray-500">
                              {classItem.type === "MAJOR" ? "Lớp ngành" : "Lớp chuyên ngành"} - {classItem.numberOfStudents} sinh viên
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lecturer Selection */}
                <div className="mb-4 col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giảng viên
                    <span className="ml-1 text-sm text-gray-500">(Có thể chọn nhiều)</span>
                  </label>
                  <div className="relative">
                    <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      {selectedLecturers.map(lecturer => (
                        <div
                          key={lecturer.id}
                          className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm"
                        >
                          <span>{lecturer.code} - {lecturer.fullName}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLecturer(lecturer.id)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={lecturerSearchText}
                        onChange={(e) => setLecturerSearchText(e.target.value)}
                        onFocus={() => setIsLecturerFocused(true)}
                        onBlur={() => {
                          setTimeout(() => setIsLecturerFocused(false), 200);
                        }}
                        className="flex-1 outline-none min-w-[200px] placeholder:text-gray-400"
                        placeholder={selectedLecturers.length === 0 ? "Tìm kiếm giảng viên theo mã hoặc tên..." : "Thêm giảng viên..."}
                      />
                    </div>
                    {isLecturerFocused && filteredLecturers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <p className="text-sm text-gray-500">Tìm thấy {filteredLecturers.length} giảng viên</p>
                        </div>
                        {filteredLecturers.map(lecturer => (
                          <div
                            key={lecturer.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                            onClick={() => handleLecturerSelect(lecturer)}
                          >
                            <div className="font-medium">{lecturer.code} - {lecturer.fullName}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedLecturers.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500">Chưa có giảng viên nào được chọn</p>
                  )}
                </div>

                {/* Total Students */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số sinh viên</label>
                  <input
                    type="number"
                    name="totalStudents"
                    required
                    min="1"
                    value={defaultStudentCount || selectedCourse.totalStudents}
                    onChange={(e) => setDefaultStudentCount(parseInt(e.target.value))}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                    placeholder="Nhập số sinh viên"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(false);
                    setSelectedCourse(null);
                    resetAllSelections();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Semester Modal */}
      {isAddSemesterModalOpen && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thêm học kỳ mới</h3>
              <button
                onClick={() => setIsAddSemesterModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);

              const code = formData.get('code') as string;
              const name = formData.get('name') as string;
              const startDate = new Date(formData.get('startDate') as string);
              const endDate = new Date(formData.get('endDate') as string);
              const startWeek = parseInt(formData.get('startWeek') as string);

              try {
                const response = await SemesterService.createSemester({
                  code,
                  name,
                  startDate,
                  endDate,
                  startWeek,
                });

                if (response.success) {
                  setSemesters([...semesters, response.data]);
                  setSelectedSemester(response.data);
                  setIsAddSemesterModalOpen(false);
                  // Show success notification
                  setSuccessMessage("Thêm học kỳ mới thành công!");
                  setIsSuccessNotificationOpen(true);
                }
              } catch (error) {
                setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo học kỳ mới');
              }
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Mã học kỳ</label>
                  <input
                    type="text"
                    name="code"
                        required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="VD: 20231"
                      />
                    </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tên học kỳ</label>
                      <input
                    type="text"
                    name="name"
                        required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="VD: Học kỳ 1 năm 2023-2024"
                      />
                    </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  />
                  </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tuần bắt đầu</label>
                  <input
                    type="number"
                    name="startWeek"
                    required
                    min="1"
                    max="15"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    placeholder="VD: 1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nhập số thứ tự tuần (1-15)</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddSemesterModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                >
                  Thêm học kỳ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {isDetailModalOpen && selectedCourseDetail && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết học phần</h3>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedCourseDetail(null);
                  setCourseSections([]);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-700">Thông tin chung</h4>
                <div className="mt-2 space-y-2">
                  <p><span className="text-gray-600">Học phần:</span> {selectedCourseDetail.subject}</p>
                  <p><span className="text-gray-600">Kỳ học:</span> {selectedCourseDetail.semester}</p>
                  <p><span className="text-gray-600">Nhóm:</span> {selectedCourseDetail.groupNumber}</p>
                  <p><span className="text-gray-600">Lớp:</span> {selectedCourseDetail.class}</p>
                  <p><span className="text-gray-600">Tổng số sinh viên:</span> {selectedCourseDetail.totalStudents}</p>
                  <p><span className="text-gray-600">Giảng viên:</span> {selectedCourseDetail.lecturers.join(", ")}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Danh sách nhóm thực hành</h4>
                {isLoadingSections ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : courseSections.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nhóm</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số sinh viên</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {courseSections.map((section) => (
                            <tr key={section.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                Nhóm {section.sectionNumber}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {section.totalStudentsInSection} sinh viên
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">Chưa có nhóm thực hành nào</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedCourseDetail(null);
                  setCourseSections([]);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {isSuccessNotificationOpen && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            onClick={() => setIsSuccessNotificationOpen(false)}
            className="ml-4 text-green-700 hover:text-green-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
