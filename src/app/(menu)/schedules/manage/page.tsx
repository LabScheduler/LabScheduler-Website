"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XCircleIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";
import { NotificationDialog } from "@/components/ui/notification-dialog";
import SemesterService from "@/services/SemesterService";
import UserService from "@/services/UserService";
import ClassService from "@/services/ClassService";
import RoomService from "@/services/RoomService";
import ScheduleService from "@/services/ScheduleService";
import { 
  ScheduleResponse, 
  SemesterResponse, 
  LecturerResponse,
  ClassResponse,
  RoomResponse,
  SemesterWeekResponse,
  CourseResponse,
  CourseSectionResponse
} from "@/types/TypeResponse";
import CourseService from "@/services/CourseService";

// Schedule type for internal use
interface Schedule {
  id: number;
  courseId: number;
  courseSectionId: number;
  roomId: number;
  lecturerId: number;
  semesterWeekId: number;
  dayOfWeek: number;
  startPeriod: number;
  totalPeriod: number;
  // Display properties
  subject: string;
  room: string;
  lecturer: string;
  class: string;
  courseGroup: number;
  courseSection: number;
  semesterWeek: string;
  status: string;
}

// Helper to map response to our internal format
const mapScheduleResponseToSchedule = (response: ScheduleResponse): Schedule => {
  return {
    id: response.id,
    courseId: response.id, // We don't have this in the response
    courseSectionId: response.id, // We don't have this in the response
    roomId: response.id, // We don't have this in the response
    lecturerId: response.id, // We don't have this in the response
    semesterWeekId: response.id, // We don't have this in the response
    dayOfWeek: response.dayOfWeek,
    startPeriod: response.startPeriod,
    totalPeriod: response.totalPeriod,
    subject: response.subjectName || '',
    room: response.room || '',
    lecturer: response.lecturer || '',
    class: response.class || '',
    courseGroup: response.courseGroup || 0,
    courseSection: response.courseSection || 0,
    semesterWeek: response.semesterWeek || '',
    status: response.status || 'PENDING'
  };
};

export default function ScheduleManagementPage() {
  // State for schedules data
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for semesters
  const [semesters, setSemesters] = useState<SemesterResponse[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<SemesterResponse | null>(null);
  const [semesterWeeks, setSemesterWeeks] = useState<SemesterWeekResponse[]>([]);
  const [selectedSemesterWeek, setSelectedSemesterWeek] = useState<SemesterWeekResponse | null>(null);

  // State for other resources
  const [lecturers, setLecturers] = useState<LecturerResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [courseSections, setCourseSections] = useState<CourseSectionResponse[]>([]);

  // Selected values for form
  const [selectedCourse, setSelectedCourse] = useState<CourseResponse | null>(null);
  const [selectedCourseSection, setSelectedCourseSection] = useState<CourseSectionResponse | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerResponse | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassResponse | null>(null);

  // Form values
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startPeriod, setStartPeriod] = useState<number>(1);
  const [totalPeriod, setTotalPeriod] = useState<number>(1);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Success notification states
  const [successSchedule, setSuccessSchedule] = useState<Schedule | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'edit' | 'delete' | 'cancel' | 'conflict' | null>(null);

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    lecturer: '',
    class: '',
    room: '',
    status: ''
  });

  // Add new state for course lecturers
  const [courseLecturers, setCourseLecturers] = useState<LecturerResponse[]>([]);

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

  // Load semester weeks when selected semester changes
  useEffect(() => {
    const fetchSemesterWeeks = async () => {
      if (!selectedSemester) {
        setSemesterWeeks([]);
        setSelectedSemesterWeek(null);
        return;
      }
      
      try {
        const response = await SemesterService.getSemesterWeekBySemesterId(selectedSemester.id.toString());
        if (response.success) {
          setSemesterWeeks(response.data);
          // Only set first week as default if we have weeks and no week is currently selected
          // or if the currently selected week doesn't belong to the new semester
          if (response.data.length > 0 && 
              (!selectedSemesterWeek || 
               !response.data.find(w => w.id === selectedSemesterWeek.id))) {
            setSelectedSemesterWeek(response.data[0]);
          }
        } else {
          setError(response.message || 'Không thể tải danh sách tuần học');
        }
      } catch (err) {
        setError('Lỗi khi tải tuần học: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    fetchSemesterWeeks();
  }, [selectedSemester]);

  // Load schedules when selected semester and week changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedSemester) {
        setSchedules([]);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch schedules for the selected class and semester
        if (classes.length > 0) {
          const response = await ScheduleService.getscheduleByClassId(
            selectedSemester.id,
            classes[0].id
          );
          
          if (response.success) {
            // If a specific week is selected, filter schedules for that week
            // Otherwise show all schedules in the semester
            const mappedSchedules = response.data
              .map(mapScheduleResponseToSchedule)
              .filter(schedule => 
                !selectedSemesterWeek || schedule.semesterWeek === selectedSemesterWeek.name
            );
            
            setSchedules(mappedSchedules);
          } else {
            setError(response.message || 'Không thể tải danh sách lịch học');
          }
        }
      } catch (err) {
        setError('Lỗi khi tải lịch học: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedules();
  }, [selectedSemester, selectedSemesterWeek, classes]);

  // Load classes
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

  // Load rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await RoomService.getAllRooms();
        if (response.success) {
          setRooms(response.data);
        } else {
          setError(response.message || 'Không thể tải danh sách phòng học');
        }
      } catch (err) {
        setError('Lỗi khi tải phòng học: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    fetchRooms();
  }, []);

  // Load lecturers
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

  // Load courses when selected semester changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedSemester) return;
      
      try {
        const response = await CourseService.getAllCoursesBySemesterId(selectedSemester.id);
        if (response.success) {
          setCourses(response.data);
        } else {
          setError(response.message || 'Không thể tải danh sách học phần');
        }
      } catch (err) {
        setError('Lỗi khi tải học phần: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    fetchCourses();
  }, [selectedSemester]);

  // Load course sections and lecturers when selected course changes
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!selectedCourse) {
        setCourseSections([]);
        setCourseLecturers([]);
        setSelectedLecturer(null);
        return;
      }
      
      try {
        // Fetch course sections
        const sectionsResponse = await CourseService.getSectionByCourseId(selectedCourse.id);
        if (sectionsResponse.success) {
          setCourseSections(sectionsResponse.data);
          if (sectionsResponse.data.length > 0) {
            setSelectedCourseSection(sectionsResponse.data[0]);
          }
        } else {
          setError(sectionsResponse.message || 'Không thể tải danh sách nhóm học phần');
        }

        // Fetch course lecturers
        const lecturersResponse = await CourseService.getCourseLecturers(selectedCourse.id);
        console.log('Course lecturers response:', lecturersResponse); // Debug log

        if (lecturersResponse.success && Array.isArray(lecturersResponse.data)) {
          setCourseLecturers(lecturersResponse.data);
          // If there's only one lecturer, select them automatically
          if (lecturersResponse.data.length === 1) {
            setSelectedLecturer(lecturersResponse.data[0]);
          } else {
            setSelectedLecturer(null);
          }
        } else {
          console.warn('Invalid response from getCourseLecturers, using all lecturers');
          setCourseLecturers(lecturers);
          setSelectedLecturer(null);
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Lỗi khi tải thông tin học phần: ' + (err instanceof Error ? err.message : String(err)));
        setCourseLecturers(lecturers);
        setSelectedLecturer(null);
      }
    };
    
    fetchCourseDetails();
  }, [selectedCourse, lecturers]);

  // Extract unique values for filter dropdowns
  const subjectOptions = useMemo(() => 
    Array.from(new Set(schedules.map(s => s.subject))).sort(), [schedules]);

  const lecturerOptions = useMemo(() => 
    Array.from(new Set(schedules.map(s => s.lecturer))).sort(), [schedules]);

  const classOptions = useMemo(() => 
    Array.from(new Set(schedules.map(s => s.class))).sort(), [schedules]);

  const roomOptions = useMemo(() => 
    Array.from(new Set(schedules.map(s => s.room))).sort(), [schedules]);

  const statusOptions = useMemo(() => 
    ["PENDING", "COMPLETED", "IN_PROGRESS", "CANCELLED"], []);

  const filterOptions = useMemo(() => [
    {
      id: 'subject',
      label: 'Môn học',
      type: 'select' as const,
      value: filters.subject,
      options: subjectOptions.map(subject => ({ value: subject, label: subject }))
    },
    {
      id: 'lecturer',
      label: 'Giảng viên',
      type: 'select' as const,
      value: filters.lecturer,
      options: lecturerOptions.map(lecturer => ({ value: lecturer, label: lecturer }))
    },
    {
      id: 'class',
      label: 'Lớp',
      type: 'select' as const,
      value: filters.class,
      options: classOptions.map(cls => ({ value: cls, label: cls }))
    },
    {
      id: 'room',
      label: 'Phòng',
      type: 'select' as const,
      value: filters.room,
      options: roomOptions.map(room => ({ value: room, label: room }))
    },
    {
      id: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      value: filters.status,
      options: statusOptions.map(status => ({ 
        value: status, 
        label: status === 'COMPLETED' ? 'Hoàn thành' : 
              status === 'IN_PROGRESS' ? 'Đang diễn ra' : 
              status === 'CANCELLED' ? 'Đã hủy' : 
              status === 'PENDING' ? 'Chờ xử lý' : status
      }))
    }
  ], [filters, subjectOptions, lecturerOptions, classOptions, roomOptions, statusOptions]);

  // Apply filters
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      if (filters.subject && schedule.subject !== filters.subject) {
        return false;
      }
      
      if (filters.lecturer && schedule.lecturer !== filters.lecturer) {
        return false;
      }
      
      if (filters.class && schedule.class !== filters.class) {
        return false;
      }
      
      if (filters.room && schedule.room !== filters.room) {
        return false;
      }
      
      if (filters.status && schedule.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  }, [schedules, filters]);

  // Use pagination hook with filtered data
  const {
    currentPage,
    pageSize,
    totalPages,
    currentData: paginatedSchedules,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination({
    data: filteredSchedules,
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
      lecturer: '',
      class: '',
      room: '',
      status: ''
    });
  };

  const getWeekdayName = (day: number) => {
    const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
    return days[(day - 2 + 7) % 7];
  };

  const getPeriodRange = (start: number, total: number) => {
    return `Tiết ${start}-${start + total - 1}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Hoàn thành
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Đang diễn ra
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Đã hủy
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Chờ xử lý
          </span>
        );
    }
  };

  // Create a new schedule
  const handleCreateSchedule = async (
    courseId: number,
    courseSectionId: number,
    roomId: number,
    lecturerId: number,
    semesterWeekId: number,
    dayOfWeek: number,
    startPeriod: number,
    totalPeriod: number
  ) => {
    try {
      const payload = {
        courseId,
        courseSectionId,
        roomId,
        lecturerId,
        semesterWeekId,
        dayOfWeek,
        startPeriod,
        totalPeriod
      };

      // Check for schedule conflicts first
      const conflictResponse = await ScheduleService.checkScheduleConflict(payload);
      
      if (conflictResponse.success) {
        if (conflictResponse.data) {
          // There is a conflict - show conflict details
          const conflictSchedule = mapScheduleResponseToSchedule(conflictResponse.data);
          setSuccessSchedule(conflictSchedule);
          setActionType('conflict');
          setIsSuccessDialogOpen(true);
          return;
        }
        
        // No conflict - proceed with creating schedule
        const response = await ScheduleService.createSchedule(payload);
        
        if (response.success) {
          const newSchedule = mapScheduleResponseToSchedule(response.data);
          setSchedules(prev => [...prev, newSchedule]);
          setSuccessSchedule(newSchedule);
          setActionType('add');
          setIsSuccessDialogOpen(true);
          setIsAddModalOpen(false);
          resetFormData();
        } else {
          setError(response.message || 'Có lỗi khi tạo lịch học');
        }
      } else {
        setError(conflictResponse.message || 'Có lỗi khi kiểm tra lịch trùng');
      }
    } catch (err) {
      setError('Lỗi khi tạo lịch học: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Update an existing schedule
  const handleUpdateSchedule = async (
    scheduleId: number,
    roomId: number,
    lecturerId: number,
    semesterWeekId: number,
    dayOfWeek: number,
    startPeriod: number,
    totalPeriod: number
  ) => {
    try {
      const payload = {
        courseId: selectedSchedule!.courseId,
        courseSectionId: selectedSchedule!.courseSectionId,
        roomId,
        lecturerId,
        semesterWeekId,
        dayOfWeek,
        startPeriod,
        totalPeriod
      };
      
      const response = await ScheduleService.updateSchedule(scheduleId, payload);
      
      if (response.success) {
        const updatedSchedule = mapScheduleResponseToSchedule(response.data);
        setSchedules(prev => prev.map(schedule => 
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        ));
        setSuccessSchedule(updatedSchedule);
        setActionType('edit');
        setIsSuccessDialogOpen(true);
        setIsEditModalOpen(false);
        setSelectedSchedule(null);
      } else {
        setError(response.message || 'Có lỗi khi cập nhật lịch học');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật lịch học: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Cancel a schedule
  const handleCancelSchedule = async (scheduleId: number) => {
    try {
      const response = await ScheduleService.cancelSchedule(scheduleId);
      
      if (response.success) {
        const cancelledSchedule = mapScheduleResponseToSchedule(response.data);
        setSchedules(prev => prev.map(schedule => 
          schedule.id === cancelledSchedule.id ? cancelledSchedule : schedule
        ));
        setSuccessSchedule(cancelledSchedule);
        setActionType('cancel');
        setIsSuccessDialogOpen(true);
      } else {
        setError(response.message || 'Có lỗi khi hủy lịch học');
      }
    } catch (err) {
      setError('Lỗi khi hủy lịch học: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Delete a schedule
  const handleDeleteSchedule = async (scheduleId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch học này?")) {
      try {
        const scheduleToDelete = schedules.find(s => s.id === scheduleId);
        const response = await ScheduleService.deleteSchedule(scheduleId);
        
        if (response.success) {
          setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
          if (scheduleToDelete) {
            setSuccessSchedule(scheduleToDelete);
            setActionType('delete');
            setIsSuccessDialogOpen(true);
          }
        } else {
          setError(response.message || 'Có lỗi khi xóa lịch học');
        }
      } catch (err) {
        setError('Lỗi khi xóa lịch học: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  // Reset form data
  const resetFormData = () => {
    setSelectedCourse(null);
    setSelectedCourseSection(null);
    setSelectedRoom(null);
    setSelectedLecturer(null);
    setSelectedClass(null);
    setDayOfWeek(1);
    setStartPeriod(1);
    setTotalPeriod(1);
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
      {successSchedule && (
        <div className="fixed inset-0 z-[100]">
          <NotificationDialog
            isOpen={isSuccessDialogOpen}
            onClose={() => {
              setIsSuccessDialogOpen(false);
              setSuccessSchedule(null);
              if (actionType === 'conflict') {
                // Do nothing, modal will show again due to isAddModalOpen being true
              } else {
                setActionType(null);
                setIsAddModalOpen(false);
              }
            }}
            title={
              actionType === 'add' ? "Thêm lịch học thành công!" :
              actionType === 'edit' ? "Cập nhật lịch học thành công!" :
              actionType === 'cancel' ? "Hủy lịch học thành công!" :
              actionType === 'conflict' ? "Phát hiện lịch học bị trùng!" :
              "Xóa lịch học thành công!"
            }
            type={actionType === 'conflict' ? 'warning' : 'success'}
            details={
              actionType === 'conflict' ? {
                "Cảnh báo": "Không thể tạo lịch học mới vì trùng với lịch học sau:",
                "Môn học": successSchedule.subject,
                "Lớp": successSchedule.class,
                "Nhóm": `Nhóm ${successSchedule.courseGroup} - Buổi ${successSchedule.courseSection}`,
                "Phòng": successSchedule.room,
                "Giảng viên": successSchedule.lecturer,
                "Thời gian": `${getWeekdayName(successSchedule.dayOfWeek)}, ${getPeriodRange(successSchedule.startPeriod, successSchedule.totalPeriod)}`,
                "Tuần học": successSchedule.semesterWeek
              } : {
                "Môn học": successSchedule.subject,
                "Lớp": successSchedule.class,
                "Nhóm": `Nhóm ${successSchedule.courseGroup} - Buổi ${successSchedule.courseSection}`,
                "Phòng": successSchedule.room,
                "Giảng viên": successSchedule.lecturer,
                "Thời gian": `${getWeekdayName(successSchedule.dayOfWeek)}, ${getPeriodRange(successSchedule.startPeriod, successSchedule.totalPeriod)}`,
                "Tuần học": successSchedule.semesterWeek
              }
            }
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch thực hành</h1>
        <div className="flex items-center gap-4">
          {/* Semester selector */}
          <div className="relative">
            <select
              className="appearance-none block w-127 pl-4 pr-10 py-2.5 text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer"
              value={selectedSemester?.id || ""}
              onChange={(e) => {
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
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          {/* Week selector */}
          <div className="relative">
            <select
              className="appearance-none block w-78 pl-4 pr-10 py-2.5 text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer"
              value={selectedSemesterWeek?.id || ""}
              onChange={(e) => {
                const weekId = e.target.value;
                if (weekId === "") {
                  setSelectedSemesterWeek(null);
                } else {
                  const week = semesterWeeks.find(w => w.id === parseInt(weekId));
                  setSelectedSemesterWeek(week || null);
                }
              }}
              disabled={!selectedSemester || semesterWeeks.length === 0}
            >
              <option value="">Tất cả các tuần</option>
              {semesterWeeks.map((week) => (
                <option key={week.id} value={week.id}>
                  {week.name} ({new Date(week.startDate).toLocaleDateString('vi-VN')} - {new Date(week.endDate).toLocaleDateString('vi-VN')})
                </option>
              ))}
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
          
          {/* Add schedule button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            disabled={!selectedSemester}
          >
            <PlusIcon className="w-5 h-5" />
            Thêm lịch học
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lớp / Nhóm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảng viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tuần học
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
              {paginatedSchedules.length > 0 ? (
                paginatedSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.class} - Nhóm {schedule.courseGroup} - Buổi {schedule.courseSection}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.lecturer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.room}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getWeekdayName(schedule.dayOfWeek)}, {getPeriodRange(schedule.startPeriod, schedule.totalPeriod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.semesterWeek}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(schedule.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setIsDetailModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleCancelSchedule(schedule.id)}
                          className={`text-yellow-600 hover:text-yellow-900 ${schedule.status === 'CANCELLED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Hủy lịch"
                          disabled={schedule.status === 'CANCELLED'}
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    {selectedSemester 
                      ? "Không có lịch học nào trong kỳ học này" 
                      : "Vui lòng chọn kỳ học để xem danh sách lịch học"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {paginatedSchedules.length > 0 && (
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

      {/* Add Schedule Modal */}
      {isAddModalOpen && !isSuccessDialogOpen && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thêm lịch thực hành mới</h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetFormData();
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
              
              if (!selectedSemester || !selectedSemesterWeek || !selectedCourse || 
                  !selectedCourseSection || !selectedRoom || !selectedLecturer) {
                alert('Vui lòng điền đầy đủ thông tin');
                return;
              }
              
              handleCreateSchedule(
                selectedCourse.id,
                selectedCourseSection.id,
                selectedRoom.id,
                selectedLecturer.id,
                selectedSemesterWeek.id,
                dayOfWeek,
                startPeriod,
                totalPeriod
              );
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Học phần</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={selectedCourse?.id || ""}
                    onChange={(e) => {
                      const course = courses.find(c => c.id === parseInt(e.target.value));
                      setSelectedCourse(course || null);
                    }}
                    required
                  >
                    <option value="">Chọn học phần</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.subject}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nhóm thực hành</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={selectedCourseSection?.id || ""}
                    onChange={(e) => {
                      const section = courseSections.find(s => s.id === parseInt(e.target.value));
                      setSelectedCourseSection(section || null);
                    }}
                    disabled={!selectedCourse}
                    required
                  >
                    <option value="">Chọn nhóm thực hành</option>
                    {courseSections.map(section => (
                      <option key={section.id} value={section.id}>
                        Nhóm {section.sectionNumber} ({section.totalStudentsInSection} sinh viên)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Phòng học</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={selectedRoom?.id || ""}
                    onChange={(e) => {
                      const room = rooms.find(r => r.id === parseInt(e.target.value));
                      setSelectedRoom(room || null);
                    }}
                    required
                  >
                    <option value="">Chọn phòng học</option>
                    {rooms.map(room => (
                      <option 
                        key={room.id} 
                        value={room.id}
                        disabled={room.status !== "AVAILABLE"}
                      >
                        {room.name} ({room.capacity} chỗ ngồi) - {room.status === "AVAILABLE" ? "Có sẵn" : "Không khả dụng"}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Giảng viên</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={selectedLecturer?.id || ""}
                    onChange={(e) => {
                      const lecturer = courseLecturers.find(l => l.id === parseInt(e.target.value));
                      setSelectedLecturer(lecturer || null);
                    }}
                    required
                    disabled={!selectedCourse}
                  >
                    <option value="">Chọn giảng viên</option>
                    {courseLecturers.map(lecturer => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.code} - {lecturer.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Ngày trong tuần</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    required
                  >
                    <option value="2">Thứ 2</option>
                    <option value="3">Thứ 3</option>
                    <option value="4">Thứ 4</option>
                    <option value="5">Thứ 5</option>
                    <option value="6">Thứ 6</option>
                    <option value="7">Thứ 7</option>
                    <option value="8">Chủ nhật</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tiết bắt đầu</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={startPeriod}
                    onChange={(e) => setStartPeriod(parseInt(e.target.value))}
                    required
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(period => (
                      <option key={period} value={period}>
                        Tiết {period}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Số tiết</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={totalPeriod}
                    onChange={(e) => setTotalPeriod(parseInt(e.target.value))}
                    required
                  >
                    {Array.from({ length: 5 }, (_, i) => i + 1).map(count => (
                      <option key={count} value={count} disabled={(startPeriod + count - 1) > 10}>
                        {count} tiết
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tuần học</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={selectedSemesterWeek?.id || ""}
                    onChange={(e) => {
                      const week = semesterWeeks.find(w => w.id === parseInt(e.target.value));
                      setSelectedSemesterWeek(week || null);
                    }}
                    required
                  >
                    <option value="">Chọn tuần học</option>
                    {semesterWeeks.map(week => (
                      <option key={week.id} value={week.id}>
                        {week.name} ({new Date(week.startDate).toLocaleDateString('vi-VN')} - {new Date(week.endDate).toLocaleDateString('vi-VN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetFormData();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                >
                  Thêm lịch học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Details Modal */}
      {isDetailModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết lịch thực hành</h3>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedSchedule(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Môn học</h4>
                <p className="text-sm font-medium">{selectedSchedule.subject}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Lớp / Nhóm</h4>
                <p className="text-sm font-medium">
                  {selectedSchedule.class} - Nhóm {selectedSchedule.courseGroup} - Buổi {selectedSchedule.courseSection}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Giảng viên</h4>
                <p className="text-sm font-medium">{selectedSchedule.lecturer}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phòng</h4>
                <p className="text-sm font-medium">{selectedSchedule.room}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Thời gian</h4>
                <p className="text-sm font-medium">
                  {getWeekdayName(selectedSchedule.dayOfWeek)}, {getPeriodRange(selectedSchedule.startPeriod, selectedSchedule.totalPeriod)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Tuần học</h4>
                <p className="text-sm font-medium">{selectedSchedule.semesterWeek}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Trạng thái</h4>
                <div className="text-sm font-medium">
                  {getStatusBadge(selectedSchedule.status)}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedSchedule(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}
      {isEditModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa lịch thực hành</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedSchedule(null);
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
              
              if (!selectedRoom || !selectedLecturer || !selectedSemesterWeek) {
                alert('Vui lòng điền đầy đủ thông tin');
                return;
              }
              
              handleUpdateSchedule(
                selectedSchedule.id,
                selectedRoom.id,
                selectedLecturer.id,
                selectedSemesterWeek.id,
                dayOfWeek,
                startPeriod,
                totalPeriod
              );
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Học phần</label>
                  <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                    <p className="text-sm font-medium">{selectedSchedule.subject}</p>
                    <p className="text-xs text-gray-500">
                      {selectedSchedule.class} - Nhóm {selectedSchedule.courseGroup} - Buổi {selectedSchedule.courseSection}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Phòng học</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={selectedRoom?.id || ""}
                    onChange={(e) => {
                      const room = rooms.find(r => r.id === parseInt(e.target.value));
                      setSelectedRoom(room || null);
                    }}
                    required
                  >
                    <option value="">Chọn phòng học</option>
                    {rooms.map(room => (
                      <option 
                        key={room.id} 
                        value={room.id}
                        disabled={room.status !== "AVAILABLE" && room.id !== selectedSchedule.roomId}
                      >
                        {room.name} ({room.capacity} chỗ ngồi) - {room.status === "AVAILABLE" ? "Có sẵn" : "Không khả dụng"}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Giảng viên</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={selectedLecturer?.id || ""}
                    onChange={(e) => {
                      const lecturer = courseLecturers.find(l => l.id === parseInt(e.target.value));
                      setSelectedLecturer(lecturer || null);
                    }}
                    required
                  >
                    <option value="">Chọn giảng viên</option>
                    {courseLecturers.map(lecturer => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.code} - {lecturer.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Ngày trong tuần</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={dayOfWeek || selectedSchedule.dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    required
                  >
                    <option value="2">Thứ 2</option>
                    <option value="3">Thứ 3</option>
                    <option value="4">Thứ 4</option>
                    <option value="5">Thứ 5</option>
                    <option value="6">Thứ 6</option>
                    <option value="7">Thứ 7</option>
                    <option value="8">Chủ nhật</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tiết bắt đầu</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={startPeriod || selectedSchedule.startPeriod}
                    onChange={(e) => setStartPeriod(parseInt(e.target.value))}
                    required
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(period => (
                      <option key={period} value={period}>
                        Tiết {period}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Số tiết</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={totalPeriod || selectedSchedule.totalPeriod}
                    onChange={(e) => setTotalPeriod(parseInt(e.target.value))}
                    required
                  >
                    {Array.from({ length: 5 }, (_, i) => i + 1).map(count => (
                      <option key={count} value={count} disabled={(startPeriod + count - 1) > 10}>
                        {count} tiết
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tuần học</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    value={selectedSemesterWeek?.id || ""}
                    onChange={(e) => {
                      const week = semesterWeeks.find(w => w.id === parseInt(e.target.value));
                      setSelectedSemesterWeek(week || null);
                    }}
                    required
                  >
                    <option value="">Chọn tuần học</option>
                    {semesterWeeks.map(week => (
                      <option key={week.id} value={week.id}>
                        {week.name} ({new Date(week.startDate).toLocaleDateString('vi-VN')} - {new Date(week.endDate).toLocaleDateString('vi-VN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedSchedule(null);
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
    </div>
  );
} 