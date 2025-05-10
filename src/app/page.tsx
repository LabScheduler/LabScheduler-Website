"use client";

import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import {
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const data = {
  total_rooms: 5,
  total_available_rooms: 4,
  total_unavailable_rooms: 1,
  total_repairing_rooms: 1,
  total_courses_in_semester: 7,
  total_practice_schedules_in_semester: 3,
  total_students: 1,
  total_lecturers: 5,
};

const roomPieData = {
  labels: ["Đang hoạt động", "Đang sửa", "Không hoạt động"],
  datasets: [
    {
      data: [
        data.total_available_rooms,
        data.total_repairing_rooms,
        data.total_unavailable_rooms
      ],
      backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
      borderWidth: 1,
    },
  ],
};

const scheduleBarData = {
  labels: ["Lịch thực hành", "Môn học"],
  datasets: [
    {
      label: "Số lượng",
      data: [data.total_practice_schedules_in_semester, data.total_courses_in_semester],
      backgroundColor: ["#10b981", "#6366f1"],
      borderRadius: 6,
    },
  ],
};

const lecturerRequests = [
  {
    id: 8,
    lecturer: "Giang Vien 2",
    subject: "Lập trình Web",
    group_number: 1,
    section_number: 1,
    new_room: "2B11",
    new_semester_week: "Tuần 36",
    new_day_of_week: 3,
    new_start_period: 5,
    new_total_period: 4,
    lecturer_body: "bombardino crocodilo",
    manager_body: null,
    status: "PENDING",
    created_at: "2025-05-09T22:29:05.000+07:00"
  }
];

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col gap-8">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard icon={<BuildingOfficeIcon className="w-7 h-7 text-blue-600" />} label="Tổng số phòng" value={data.total_rooms} />
        <OverviewCard icon={<UserGroupIcon className="w-7 h-7 text-green-600" />} label="Tổng số sinh viên" value={data.total_students} />
        <OverviewCard icon={<UsersIcon className="w-7 h-7 text-purple-600" />} label="Tổng số giảng viên" value={data.total_lecturers} />
        <OverviewCard icon={<DocumentTextIcon className="w-7 h-7 text-pink-600" />} label="Số môn học" value={data.total_courses_in_semester} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-4">Trạng thái phòng học</h3>
          <div className="w-100 h-100 flex items-center justify-center">
            <Pie data={roomPieData} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-4">Lịch thực hành & Môn học trong học kỳ</h3>
          <Bar data={scheduleBarData} options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false },
            },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } },
            },
          }} />
        </div>
      </div>

      {/* Table for PENDING lecturer requests */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h3 className="font-semibold text-lg mb-4">Yêu cầu giảng viên đang chờ xử lý</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 font-semibold">Giảng viên</th>
                <th className="px-4 py-2 font-semibold">Môn học</th>
                <th className="px-4 py-2 font-semibold">Nhóm</th>
                <th className="px-4 py-2 font-semibold">Phòng</th>
                <th className="px-4 py-2 font-semibold">Tuần</th>
                <th className="px-4 py-2 font-semibold">Thời gian</th>
                <th className="px-4 py-2 font-semibold">Lý do</th>
                <th className="px-4 py-2 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {lecturerRequests.filter(r => r.status === "PENDING").map((req) => (
                <tr key={req.id} className="border-b last:border-0">
                  <td className="px-4 py-2">{req.lecturer}</td>
                  <td className="px-4 py-2">{req.subject}</td>
                  <td className="px-4 py-2">Nhóm {req.group_number}</td>
                  <td className="px-4 py-2">{req.new_room}</td>
                  <td className="px-4 py-2">{req.new_semester_week}</td>
                  <td className="px-4 py-2">
                    Thứ {req.new_day_of_week}, Tiết {req.new_start_period}-{req.new_start_period + req.new_total_period - 1}
                  </td>
                  <td className="px-4 py-2">{req.lecturer_body}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                      {req.status === "PENDING" ? "ĐANG CHỜ" : req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow p-6">
      <div className="bg-gray-100 rounded-full p-3 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-gray-500 text-sm mt-1">{label}</div>
      </div>
    </div>
  );
}