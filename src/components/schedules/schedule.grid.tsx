import React, { useMemo } from 'react';
import { ScheduleItem } from './schedule.table';
import { ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ScheduleGridProps {
  schedules: ScheduleItem[];
  onViewDetails?: (schedule: ScheduleItem) => void;
  weekNumber?: string;
  onChangeWeek?: (direction: 'prev' | 'next') => void;
}

// Extended ScheduleItem interface for internal use
interface ExtendedScheduleItem extends ScheduleItem {
  _isContinuation?: boolean;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  schedules,
  onViewDetails,
  weekNumber,
  onChangeWeek
}) => {
  // Define grid constants
  const DAYS_OF_WEEK = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const PERIODS = Array.from({ length: 10 }, (_, i) => i + 1);
  const PERIOD_TIMES = [
    "07:00 - 07:50", "07:50 - 08:40", "08:40 - 09:30", "09:30 - 10:20", "10:20 - 11:10",
    "13:00 - 13:50", "13:50 - 14:40", "14:40 - 15:30", "15:30 - 16:20", "16:20 - 17:10"
  ];

  // Filter schedules by the specified week if provided
  const filteredSchedules = useMemo(() => {
    if (!weekNumber) return schedules;
    return schedules.filter(schedule => schedule.semester_week === weekNumber);
  }, [schedules, weekNumber]);

  // Create a 2D grid of schedules by day and period
  const scheduleGrid = useMemo(() => {
    // Initialize empty grid
    const grid: (ExtendedScheduleItem | null)[][] = Array(7)
      .fill(null)
      .map(() => Array(PERIODS.length).fill(null));

    // Place schedules in the grid
    filteredSchedules.forEach(schedule => {
      const dayIndex = schedule.day_of_week % 7;
      const startPeriod = schedule.start_period - 1; // 0-based index
      
      // Place the schedule in the starting period cell
      grid[dayIndex][startPeriod] = schedule;
      
      // Mark consecutive periods as occupied by setting them to a special value
      // (we'll skip rendering these when we detect they're part of a multi-period schedule)
      for (let i = 1; i < schedule.total_period; i++) {
        if (startPeriod + i < PERIODS.length) {
          grid[dayIndex][startPeriod + i] = { ...schedule, _isContinuation: true };
        }
      }
    });

    return grid;
  }, [filteredSchedules, PERIODS.length]);

  // Determine if a cell is the first in a span
  const isScheduleStart = (schedule: ExtendedScheduleItem | null): boolean => {
    return Boolean(schedule && !schedule._isContinuation);
  };

  // Get appropriate color for schedule based on status
  const getScheduleColor = (schedule: ScheduleItem): string => {
    switch (schedule.status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Week indicator */}
      {weekNumber && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{weekNumber}</h3>
            {onChangeWeek && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onChangeWeek('prev')}
                  className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Tuần trước"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onChangeWeek('next')}
                  className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Tuần sau"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          {/* Header with days */}
          <thead>
            <tr>
              <th className="w-20 px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">
                Tiết
              </th>
              {DAYS_OF_WEEK.map((day, index) => (
                <th 
                  key={day} 
                  className="px-3 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 last:border-r-0"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          {/* Grid body with periods and schedules */}
          <tbody>
            {PERIODS.map((period, periodIndex) => (
              <tr key={period} className={periodIndex === 4 ? 'border-b-2 border-gray-300' : ''}>
                {/* Period cell */}
                <td className="px-2 py-2 text-xs text-gray-500 border-r border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <span className="font-medium">Tiết {period}</span>
                    <span className="text-xs">{PERIOD_TIMES[periodIndex]}</span>
                  </div>
                </td>

                {/* Day cells */}
                {DAYS_OF_WEEK.map((_, dayIndex) => {
                  const schedule = scheduleGrid[dayIndex][periodIndex];
                  const isStart = isScheduleStart(schedule);
                  
                  // Skip rendering for continuation cells
                  if (schedule && schedule._isContinuation) {
                    return <td key={`${dayIndex}-${periodIndex}`} className="border-r border-b border-gray-200 last:border-r-0"></td>;
                  }

                  // Render schedule cell or empty cell
                  return (
                    <td 
                      key={`${dayIndex}-${periodIndex}`} 
                      className="border-r border-b border-gray-200 last:border-r-0"
                      rowSpan={isStart && schedule ? schedule.total_period : 1}
                    >
                      {isStart && schedule ? (
                        <div 
                          className={`h-full p-2 text-xs border rounded m-1 ${getScheduleColor(schedule)} ${onViewDetails ? 'cursor-pointer hover:opacity-80' : ''}`}
                          onClick={() => onViewDetails && onViewDetails(schedule)}
                        >
                          <div className="font-medium truncate">{schedule.subject_name}</div>
                          <div className="text-xs text-gray-600 truncate">{schedule.subject_code}</div>
                          <div className="mt-1 flex flex-col space-y-1">
                            <div className="truncate">GV: {schedule.lecturer}</div>
                            <div className="truncate">Phòng: {schedule.room}</div>
                            <div className="truncate">Lớp: {schedule.class}</div>
                            <div className="truncate">Nhóm {schedule.course_group} - Buổi {schedule.course_section}</div>
                            {schedule.status.toUpperCase() === 'IN_PROGRESS' && (
                              <div className="flex items-center text-yellow-600 mt-1">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                <span>Đang diễn ra</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredSchedules.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Không có lịch thực hành nào trong khoảng thời gian này</p>
        </div>
      )}
    </div>
  );
};
