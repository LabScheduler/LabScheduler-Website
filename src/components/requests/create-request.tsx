"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LecturerRequestService from '@/services/LecturerRequestService';
import RoomService from '@/services/RoomService';
import SemesterService from '@/services/SemesterService';
import CourseService from '@/services/CourseService';
import { RoomResponse, SemesterWeekResponse, CourseResponse, CourseSectionResponse, LecturerRequestResponse } from '@/types/TypeResponse';

interface CreateRequestProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated: (request: LecturerRequestResponse) => void;
}

export const CreateRequest: React.FC<CreateRequestProps> = ({
  isOpen,
  onClose,
  onRequestCreated,
}) => {
  // Form state
  const [selectedCourse, setSelectedCourse] = useState<CourseResponse | null>(null);
  const [sections, setSections] = useState<CourseSectionResponse[]>([]);
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [newRoom, setNewRoom] = useState<string>("");
  const [newWeek, setNewWeek] = useState<string>("");
  const [newDayOfWeek, setNewDayOfWeek] = useState<number>(2);
  const [newStartPeriod, setNewStartPeriod] = useState<number>(1);
  const [newTotalPeriod, setNewTotalPeriod] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  // Data state
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [weeks, setWeeks] = useState<SemesterWeekResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load lecturer's courses
        const coursesResponse = await CourseService.getLecturerCourses();
        if (coursesResponse.success) {
          setCourses(coursesResponse.data);
        }

        // Load available rooms
        const roomsResponse = await RoomService.getAllRooms();
        if (roomsResponse.success) {
          setRooms(roomsResponse.data.filter(room => room.status === "AVAILABLE"));
        }

        // Load semester weeks
        const currentSemester = await SemesterService.getCurrentSemester();
        if (currentSemester.success) {
          const weeksResponse = await SemesterService.getSemesterWeekBySemesterId(
            currentSemester.data.id.toString()
          );
          if (weeksResponse.success) {
            setWeeks(weeksResponse.data);
          }
        }
      } catch (err) {
        toast.error('Lỗi khi tải dữ liệu: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Load sections when course changes
  useEffect(() => {
    const loadSections = async () => {
      if (selectedCourse) {
        try {
          const sectionsResponse = await CourseService.getSectionByCourseId(selectedCourse.id);
          if (sectionsResponse.success) {
            setSections(sectionsResponse.data);
            // Reset selected section when loading new sections
            setSelectedSection(0);
          }
        } catch (err) {
          toast.error('Lỗi khi tải danh sách tổ: ' + (err instanceof Error ? err.message : String(err)));
        }
      } else {
        setSections([]);
        setSelectedSection(0);
      }
    };

    loadSections();
  }, [selectedCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      toast.error('Vui lòng chọn học phần');
      return;
    }

    if (!selectedSection) {
      toast.error('Vui lòng chọn tổ');
      return;
    }

    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do yêu cầu');
      return;
    }

    try {
      setLoading(true);

      // Find room ID and week ID from selections
      const selectedRoom = rooms.find(r => r.name === newRoom);
      const selectedWeek = weeks.find(w => w.name === newWeek);

      if (!selectedRoom || !selectedWeek) {
        toast.error('Vui lòng chọn phòng và tuần học hợp lệ');
        return;
      }

      const response = await LecturerRequestService.createRequest({
        courseId: selectedCourse.id,
        courseSectionId: selectedSection,
        newRoomId: selectedRoom.id,
        newSemesterWeekId: selectedWeek.id,
        newDayOfWeek,
        newStartPeriod,
        newTotalPeriod,
        body: reason
      });

      if (response.success) {
        toast.success('Đã gửi yêu cầu thành công');
        onRequestCreated(response.data);
        onClose();
      } else {
        toast.error('Không thể gửi yêu cầu');
      }
    } catch (err) {
      toast.error('Lỗi khi gửi yêu cầu: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Tạo yêu cầu mới</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Học phần</label>
                <select
                  value={selectedCourse?.id || ""}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === parseInt(e.target.value));
                    setSelectedCourse(course || null);
                  }}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                >
                  <option value="">Chọn học phần</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.subject} - Nhóm {course.groupNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tổ</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(parseInt(e.target.value))}
                  required
                  disabled={!selectedCourse || sections.length === 0}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                >
                  <option value={0}>Chọn tổ</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      Tổ {section.sectionNumber} ({section.totalStudentsInSection} sinh viên)
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Phòng mới</label>
                <select
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                >
                  <option value="">Chọn phòng</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name} (Sức chứa: {room.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tuần học</label>
                <select
                  value={newWeek}
                  onChange={(e) => setNewWeek(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                >
                  <option value="">Chọn tuần</option>
                  {weeks.map((week) => (
                    <option key={week.id} value={week.name}>
                      {week.name} ({new Date(week.startDate).toLocaleDateString('vi-VN')} - {new Date(week.endDate).toLocaleDateString('vi-VN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Ngày trong tuần</label>
                <select
                  value={newDayOfWeek}
                  onChange={(e) => setNewDayOfWeek(parseInt(e.target.value))}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                >
                  <option value={2}>Thứ 2</option>
                  <option value={3}>Thứ 3</option>
                  <option value={4}>Thứ 4</option>
                  <option value={5}>Thứ 5</option>
                  <option value={6}>Thứ 6</option>
                  <option value={7}>Thứ 7</option>
                  <option value={8}>Chủ nhật</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tiết bắt đầu</label>
                <input
                  type="number"
                  value={newStartPeriod}
                  onChange={(e) => setNewStartPeriod(parseInt(e.target.value))}
                  required
                  min={1}
                  max={10}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Số tiết</label>
                <input
                  type="number"
                  value={newTotalPeriod}
                  onChange={(e) => setNewTotalPeriod(parseInt(e.target.value))}
                  required
                  min={1}
                  max={10}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                />
              </div>

              <div className="mb-4 col-span-2">
                <label className="block text-sm font-medium text-gray-700">Lý do</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  placeholder="Nhập lý do yêu cầu"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 