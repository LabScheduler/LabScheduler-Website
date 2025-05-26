import React from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

interface ScheduleTableProps {
  schedules: ScheduleItem[];
  onViewDetails?: (schedule: ScheduleItem) => void;
}

export interface ScheduleItem {
  id: number;
  subject_code: string;
  subject_name: string;
  course_group: number;
  course_section: number;
  room: string;
  day_of_week: number;
  start_period: number;
  total_period: number;
  class: string;
  lecturer: string;
  semester_week: string;
  status: string; // 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedules,
  onViewDetails
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="mr-1 h-3 w-3" />
            Hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="mr-1 h-3 w-3" />
            Đã hủy
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="mr-1 h-3 w-3" />
            Đang diễn ra
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getWeekdayName = (day: number) => {
    const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
    return days[(day-2+7) % 7];
  };

  const getPeriodTime = (period: number) => {
    const startTimes = [
      "07:00", "07:50", "08:40", "09:30", "10:20",
      "13:00", "13:50", "14:40", "15:30", "16:20"
    ];

    if (period >= 1 && period <= startTimes.length) {
      return startTimes[period - 1];
    }
    return "";
  };

  const formatPeriodRange = (start: number, total: number) => {
    const end = start + total - 1;
    const startTime = getPeriodTime(start);
    const endTime = getPeriodTime(end + 1); // End time is the start of next period
    
    return `Tiết ${start}-${end} (${startTime} - ${endTime})`;
  };

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Môn học
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giảng viên
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lớp / Nhóm
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phòng
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thời gian
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tuần học
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <tr 
                key={schedule.id} 
                className={`hover:bg-gray-50 ${onViewDetails ? 'cursor-pointer' : ''}`}
                onClick={() => onViewDetails && onViewDetails(schedule)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <BookOpenIcon className="flex-shrink-0 h-5 w-5 text-blue-500" />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{schedule.subject_name}</div>
                      <div className="text-xs text-gray-500">{schedule.subject_code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                    <div className="ml-3">
                      <div className="text-sm text-gray-900">{schedule.lecturer}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DocumentTextIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                    <div className="ml-3">
                      <div className="text-sm text-gray-900">{schedule.class}</div>
                      <div className="text-xs text-gray-500">Nhóm {schedule.course_group} - Tổ {schedule.course_section}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                    <div className="ml-3 text-sm text-gray-900">{schedule.room}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CalendarIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                    <div className="ml-3">
                      <div className="text-sm text-gray-900">{getWeekdayName(schedule.day_of_week)}</div>
                      <div className="text-xs text-gray-500">
                        {formatPeriodRange(schedule.start_period, schedule.total_period)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {schedule.semester_week}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(schedule.status)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                Không có lịch thực hành nào được tìm thấy
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
