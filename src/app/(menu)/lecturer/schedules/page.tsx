"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ScheduleTable, ScheduleItem } from '@/components/schedules/schedule.table';
import { ScheduleGrid } from '@/components/schedules/schedule.grid';
import { 
  TableCellsIcon, 
  Squares2X2Icon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PaperAirplaneIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { FilterPanel } from '@/components/ui/filter-panel';
import AuthService from '@/services/AuthService';
import ScheduleService from '@/services/ScheduleService';
import SemesterService from '@/services/SemesterService';
import { ScheduleResponse, SemesterResponse, SemesterWeekResponse } from '@/types/TypeResponse';

type ViewMode = 'table' | 'grid';

// Filter interface
interface Filters {
  subject: string;
  room: string;
  status: string;
  class: string;
}

// Helper function to map ScheduleResponse to ScheduleItem
const mapScheduleResponseToScheduleItem = (schedule: ScheduleResponse): ScheduleItem => ({
  id: schedule.id,
  subject_code: schedule.subjectCode || '',
  subject_name: schedule.subjectName || '',
  course_group: schedule.courseGroup || 1,
  course_section: schedule.courseSection || 1,
  room: schedule.room || '',
  semester_week: schedule.semesterWeek || '',
  day_of_week: schedule.dayOfWeek,
  start_period: schedule.startPeriod,
  total_period: schedule.totalPeriod,
  class: schedule.class || '',
  lecturer: schedule.lecturer || '',
  status: schedule.status || 'PENDING'
});

export default function LecturerSchedulesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false);

  // State for data
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState<SemesterResponse | null>(null);
  const [semesterWeeks, setSemesterWeeks] = useState<SemesterWeekResponse[]>([]);
  const [semesters, setSemesters] = useState<SemesterResponse[]>([]);

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    subject: '',
    room: '',
    status: '',
    class: ''
  });

  // Filter options
  const filterOptions = useMemo(() => [
    {
      id: 'subject',
      label: 'Môn học',
      type: 'search' as const,
      value: filters.subject,
      placeholder: 'Tìm kiếm môn học...'
    },
    {
      id: 'room',
      label: 'Phòng học',
      type: 'search' as const,
      value: filters.room,
      placeholder: 'Tìm kiếm phòng học...'
    },
    {
      id: 'class',
      label: 'Lớp',
      type: 'search' as const,
      value: filters.class,
      placeholder: 'Tìm kiếm lớp...'
    },
    {
      id: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      value: filters.status,
      options: [
        { value: '', label: 'Tất cả' },
        { value: 'COMPLETED', label: 'Hoàn thành' },
        { value: 'IN_PROGRESS', label: 'Đang diễn ra' },
        { value: 'CANCELLED', label: 'Đã hủy' },
        { value: 'PENDING', label: 'Chờ thực hiện' }
      ]
    }
  ], [filters]);

  // Filter handlers
  const handleFilterChange = (filterId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      subject: '',
      room: '',
      status: '',
      class: ''
    });
  };

  // Filter schedules based on current filters
  const filteredSchedules = useMemo(() => {
    return selectedWeek === 'all' 
      ? schedules.filter(schedule => {
          const matchesSubject = !filters.subject || 
            schedule.subject_name.toLowerCase().includes(filters.subject.toLowerCase()) ||
            schedule.subject_code.toLowerCase().includes(filters.subject.toLowerCase());
          const matchesRoom = !filters.room || 
            schedule.room.toLowerCase().includes(filters.room.toLowerCase());
          const matchesClass = !filters.class || 
            schedule.class.toLowerCase().includes(filters.class.toLowerCase());
          const matchesStatus = !filters.status || schedule.status === filters.status;
          
          return matchesSubject && matchesRoom && matchesClass && matchesStatus;
        })
      : schedules.filter(schedule => {
          const matchesWeek = schedule.semester_week === selectedWeek;
          const matchesSubject = !filters.subject || 
            schedule.subject_name.toLowerCase().includes(filters.subject.toLowerCase()) ||
            schedule.subject_code.toLowerCase().includes(filters.subject.toLowerCase());
          const matchesRoom = !filters.room || 
            schedule.room.toLowerCase().includes(filters.room.toLowerCase());
          const matchesClass = !filters.class || 
            schedule.class.toLowerCase().includes(filters.class.toLowerCase());
          const matchesStatus = !filters.status || schedule.status === filters.status;
          
          return matchesWeek && matchesSubject && matchesRoom && matchesClass && matchesStatus;
        });
  }, [schedules, selectedWeek, filters]);

  // Load semesters and current semester data
  useEffect(() => {
    const fetchSemesterData = async () => {
      try {
        // First fetch all semesters
        const semestersResponse = await SemesterService.getAllSemesters();
        if (semestersResponse.success) {
          setSemesters(semestersResponse.data);
        }

        // Then get current semester
        const semesterResponse = await SemesterService.getCurrentSemester();
        if (semesterResponse.success) {
          setCurrentSemester(semesterResponse.data);
          
          // Fetch semester weeks
          const weeksResponse = await SemesterService.getSemesterWeekBySemesterId(
            semesterResponse.data.id.toString()
          );
          
          if (weeksResponse.success) {
            setSemesterWeeks(weeksResponse.data);
            setSelectedWeek('all'); // Set default to 'all'
          }
        }
      } catch (err) {
        setError('Lỗi khi tải thông tin kỳ học: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    
    fetchSemesterData();
  }, []);

  // Load lecturer's schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!currentSemester) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const lecturerId = AuthService.getUserId(localStorage.getItem('token') || '');
        if (!lecturerId) {
          setError('Không thể xác định giảng viên');
          return;
        }

        const response = await ScheduleService.getscheduleByLecturerId(currentSemester.id, lecturerId);
        
        if (response && response.success) {
          const mappedSchedules = response.data.map(mapScheduleResponseToScheduleItem);
          setSchedules(mappedSchedules);
        } else {
          setError('Không thể tải danh sách lịch dạy');
        }
      } catch (err) {
        setError('Lỗi khi tải lịch dạy: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedules();
  }, [currentSemester]);

  const handleViewScheduleDetails = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
    setIsDetailModalOpen(true);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (selectedWeek === 'all') {
      if (semesterWeeks.length > 0) {
        setSelectedWeek(semesterWeeks[0].name);
      }
      return;
    }
    
    const currentIndex = semesterWeeks.findIndex(week => week.name === selectedWeek);
    if (currentIndex === -1) return;
    
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedWeek(semesterWeeks[currentIndex - 1].name);
    } else if (direction === 'next' && currentIndex < semesterWeeks.length - 1) {
      setSelectedWeek(semesterWeeks[currentIndex + 1].name);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch dạy của tôi</h1>
        <div className="flex items-center gap-4">
          {/* Semester and Week navigation */}
          <div className="flex items-center gap-2">
            {/* Semester selector */}
            <select
              value={currentSemester?.id || ''}
              onChange={async (e) => {
                const semesterId = Number(e.target.value);
                const selectedSem = semesters.find(s => s.id === semesterId);
                if (selectedSem) {
                  setCurrentSemester(selectedSem);
                  // Fetch new weeks for the selected semester
                  try {
                    const weeksResponse = await SemesterService.getSemesterWeekBySemesterId(
                      selectedSem.id.toString()
                    );
                    if (weeksResponse.success) {
                      setSemesterWeeks(weeksResponse.data);
                      if (weeksResponse.data.length > 0) {
                        setSelectedWeek(weeksResponse.data[0].name);
                      }
                    }
                  } catch (err) {
                    setError('Lỗi khi tải thông tin tuần: ' + (err instanceof Error ? err.message : String(err)));
                  }
                }
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {semesters.map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </select>

            {/* Week navigation */}
            <div className="flex items-center">
              <button
                onClick={() => navigateWeek('prev')}
                disabled={selectedWeek === 'all' || semesterWeeks.findIndex(w => w.name === selectedWeek) === 0}
                className="p-1 rounded-md text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Tuần trước"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="mx-2 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                {semesterWeeks.map(week => (
                  <option key={week.id} value={week.name}>
                    {week.name} ({new Date(week.startDate).toLocaleDateString('vi-VN')} - {new Date(week.endDate).toLocaleDateString('vi-VN')})
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => navigateWeek('next')}
                disabled={selectedWeek === 'all' || semesterWeeks.findIndex(w => w.name === selectedWeek) === semesterWeeks.length - 1}
                className="p-1 rounded-md text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Tuần sau"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* View mode toggle and filters */}
          <div className="flex items-center gap-4">
            {/* Filter panel */}
            <FilterPanel
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
              title="Lọc lịch dạy"
            />
          
          {/* View mode toggle */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              className={`flex items-center justify-center p-2 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setViewMode('table')}
              aria-label="View as table"
            >
              <TableCellsIcon className="w-5 h-5" />
            </button>
            <button
              className={`flex items-center justify-center p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setViewMode('grid')}
              aria-label="View as grid"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule view */}
      <div className="mt-6">
        {viewMode === 'table' ? (
          <ScheduleTable 
            schedules={filteredSchedules}
            onViewDetails={handleViewScheduleDetails}
          />
        ) : (
          <ScheduleGrid 
            schedules={filteredSchedules}
            onViewDetails={handleViewScheduleDetails}
            weekNumber={selectedWeek !== 'all' ? selectedWeek : undefined}
            onChangeWeek={navigateWeek}
          />
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết lịch dạy</h3>
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
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Môn học</h4>
                  <p className="text-sm font-medium">{selectedSchedule.subject_name}</p>
                  <p className="text-xs text-gray-500">{selectedSchedule.subject_code}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Lớp / Nhóm</h4>
                  <p className="text-sm font-medium">{selectedSchedule.class} - Nhóm {selectedSchedule.course_group} - Buổi {selectedSchedule.course_section}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phòng</h4>
                  <p className="text-sm font-medium">{selectedSchedule.room}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tuần học</h4>
                  <p className="text-sm font-medium">{selectedSchedule.semester_week}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Trạng thái</h4>
                  <p className="text-sm font-medium">
                    {selectedSchedule.status.toUpperCase() === 'COMPLETED' && 'Hoàn thành'}
                    {selectedSchedule.status.toUpperCase() === 'IN_PROGRESS' && 'Đang diễn ra'}
                    {selectedSchedule.status.toUpperCase() === 'CANCELLED' && 'Đã hủy'}
                    {!['COMPLETED', 'IN_PROGRESS', 'CANCELLED'].includes(selectedSchedule.status.toUpperCase()) && selectedSchedule.status}
                  </p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Thời gian</h4>
                  <p className="text-sm font-medium">
                    {(() => {
                      const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7","Chủ nhật"];
                      const day = days[(selectedSchedule.day_of_week -2 + 7) % 7];
                      const startPeriod = selectedSchedule.start_period;
                      const endPeriod = startPeriod + selectedSchedule.total_period - 1;
                      return `${day}, Tiết ${startPeriod}-${endPeriod}`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedSchedule(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
