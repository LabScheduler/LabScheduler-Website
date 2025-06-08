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
import { useState, useEffect } from "react";
import StatisticsService from "@/services/StatisticsService";
import { StatisticsResponse } from "@/types/TypeResponse";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Home() {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch statistics data
        const statsResponse = await StatisticsService.getStatistics();
        setStatistics(statsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Mất kết nối đến máy chủ :(", err);
        setError("Có lỗi xảy ra khi tải dữ liệu");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Room status pie chart data
  const roomPieData = {
    labels: ["Đang hoạt động", "Đang sửa", "Không hoạt động"],
    datasets: [
      {
        data: statistics ? [
          statistics.totalAvailableRooms,
          statistics.totalRepairingRooms,
          statistics.totalUnavailableRooms
        ] : [0, 0, 0],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  // Schedule bar chart data
  const scheduleBarData = {
    labels: ["Lịch thực hành", "Học phần", "Báo cáo đang chờ"],
    datasets: [
      {
        label: "Số lượng",
        data: statistics ? [
          statistics.totalPracticeSchedulesInSemester, 
          statistics.totalCoursesInSemester,
          statistics.totalPendingReports
        ] : [0, 0, 0],
        backgroundColor: ["#10b981", "#6366f1", "#f59e0b"],
        borderRadius: 6,
      },
    ],
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-xl shadow p-8 max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-4">{error || "Không thể tải dữ liệu"}</p>
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
    <div className="w-full h-full flex flex-col gap-8">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard 
          icon={<BuildingOfficeIcon className="w-7 h-7 text-blue-600" />} 
          label="Tổng số phòng" 
          value={statistics.totalRooms} 
        />
        <OverviewCard 
          icon={<UserGroupIcon className="w-7 h-7 text-green-600" />} 
          label="Tổng số sinh viên" 
          value={statistics.totalStudents} 
        />
        <OverviewCard 
          icon={<UsersIcon className="w-7 h-7 text-purple-600" />} 
          label="Tổng số giảng viên" 
          value={statistics.totalLecturers} 
        />
        <OverviewCard 
          icon={<DocumentTextIcon className="w-7 h-7 text-pink-600" />} 
          label="Số học phần" 
          value={statistics.totalCoursesInSemester} 
        />
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
          <h3 className="font-semibold text-lg mb-4">Thống kê</h3>
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