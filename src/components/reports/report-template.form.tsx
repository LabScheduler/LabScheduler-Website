import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ReportTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => void;
}

interface ScheduleFormData {
  type: 'add' | 'update' | 'cancel';
  courseInfo: string;
  weekInfo: string;
  timeInfo: string;
  reason?: string;
}

interface RoomFormData {
  type: 'broken' | 'missing';
  roomNumber: string;
  description: string;
  impact: string;
}

export const ReportTemplateForm: React.FC<ReportTemplateFormProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'schedule' | 'room'>('schedule');
  const [scheduleData, setScheduleData] = useState<ScheduleFormData>({
    type: 'add',
    courseInfo: '',
    weekInfo: '',
    timeInfo: '',
    reason: ''
  });
  const [roomData, setRoomData] = useState<RoomFormData>({
    type: 'broken',
    roomNumber: '',
    description: '',
    impact: ''
  });

  const formatScheduleContent = (data: ScheduleFormData): { title: string; content: string } => {
    const titles = {
      add: 'Thêm lịch thực hành',
      update: 'Cập nhật lịch thực hành',
      cancel: 'Huỷ lịch thực hành'
    };

    let content = `Thông tin học phần: ${data.courseInfo}\n`;
    content += `Tuần học: ${data.weekInfo}\n`;
    content += `Thời gian: ${data.timeInfo}\n`;
    
    if (data.type === 'cancel' && data.reason) {
      content += `\nLý do huỷ: ${data.reason}`;
    } else if (data.type === 'update' && data.reason) {
      content += `\nLý do thay đổi: ${data.reason}`;
    }

    return {
      title: titles[data.type],
      content
    };
  };

  const formatRoomContent = (data: RoomFormData): { title: string; content: string } => {
    const titles = {
      broken: 'Báo cáo phòng thực hành hỏng',
      missing: 'Báo cáo thiếu thiết bị phòng thực hành'
    };

    let content = `Phòng: ${data.roomNumber}\n`;
    content += `Mô tả: ${data.description}\n`;
    content += `Ảnh hưởng đến việc thực hành: ${data.impact}`;

    return {
      title: titles[data.type],
      content
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedData = selectedTemplate === 'schedule' 
      ? formatScheduleContent(scheduleData)
      : formatRoomContent(roomData);
    onSubmit(formattedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Tạo báo cáo mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setSelectedTemplate('schedule')}
              className={`flex-1 py-2 px-4 rounded-md ${
                selectedTemplate === 'schedule'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              } border`}
            >
              Báo cáo lịch thực hành
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('room')}
              className={`flex-1 py-2 px-4 rounded-md ${
                selectedTemplate === 'room'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              } border`}
            >
              Báo cáo phòng thực hành
            </button>
          </div>

          {selectedTemplate === 'schedule' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại báo cáo
                </label>
                <select
                  value={scheduleData.type}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, type: e.target.value as 'add' | 'update' | 'cancel' }))}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="add">Thêm lịch thực hành</option>
                  <option value="update">Cập nhật lịch thực hành</option>
                  <option value="cancel">Huỷ lịch thực hành</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thông tin học phần
                </label>
                <input
                  type="text"
                  value={scheduleData.courseInfo}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, courseInfo: e.target.value }))}
                  placeholder="VD: Lập trình Web - Nhóm 1 - Tổ 2"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tuần học
                </label>
                <input
                  type="text"
                  value={scheduleData.weekInfo}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, weekInfo: e.target.value }))}
                  placeholder="VD: Tuần 7 (02/10/2023 - 08/10/2023)"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian
                </label>
                <input
                  type="text"
                  value={scheduleData.timeInfo}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, timeInfo: e.target.value }))}
                  placeholder="VD: Thứ 2, tiết 1-3 (7:00 - 9:30)"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {(scheduleData.type === 'cancel' || scheduleData.type === 'update') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do {scheduleData.type === 'cancel' ? 'huỷ' : 'thay đổi'}
                  </label>
                  <textarea
                    value={scheduleData.reason}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={3}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại báo cáo
                </label>
                <select
                  value={roomData.type}
                  onChange={(e) => setRoomData(prev => ({ ...prev, type: e.target.value as 'broken' | 'missing' }))}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="broken">Báo hỏng</option>
                  <option value="missing">Thiếu thiết bị</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng
                </label>
                <input
                  type="text"
                  value={roomData.roomNumber}
                  onChange={(e) => setRoomData(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="VD: PM2.01"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả {roomData.type === 'broken' ? 'tình trạng hỏng' : 'thiết bị thiếu'}
                </label>
                <textarea
                  value={roomData.description}
                  onChange={(e) => setRoomData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder={roomData.type === 'broken' 
                    ? "Mô tả chi tiết tình trạng hỏng hóc..."
                    : "Liệt kê các thiết bị còn thiếu..."}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ảnh hưởng đến việc thực hành
                </label>
                <textarea
                  value={roomData.impact}
                  onChange={(e) => setRoomData(prev => ({ ...prev, impact: e.target.value }))}
                  rows={3}
                  placeholder="Mô tả ảnh hưởng đến việc thực hành của sinh viên..."
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-150"
            >
              Tạo báo cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 