"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useState, useEffect, use } from "react";

import {
  PaperAirplaneIcon,
  AcademicCapIcon,
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChatBubbleLeftIcon,
  MegaphoneIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AuthService from "@/services/AuthService";


const menuItems = [
  {
    title: "Danh mục",
    items: [
      {
        icon: <HomeIcon className="w-5 h-5" />,
        label: "Home",
        name: "Tổng quan",
        href: "/",
        visible: ["MANAGER"],
      },
      {
        icon: <UserGroupIcon className="w-5 h-5" />,
        label: "Students",
        name: "Sinh viên",
        href: "/students",
        visible: ["MANAGER"],
      },
      {
        icon: <UsersIcon className="w-5 h-5" />,
        label: "Lecturers",
        name: "Giảng viên",
        href: "/lecturers",
        visible: ["MANAGER"],
      },
      {
        icon: <BuildingOfficeIcon className="w-5 h-5" />,
        label: "Rooms",
        name: "Phòng máy",
        href: "/rooms",
        visible: ["MANAGER"],
      },
      {
        icon: <CalendarIcon className="w-5 h-5" />,
        label: "Schedule",
        name: "Lịch thực hành",
        href: "/schedules",
        visible: ["MANAGER", "LECTURER", "STUDENT"],
      },
      {
        icon: <CalendarIcon className="w-5 h-5" />,
        label: "Schedule Management",
        name: "Quản Lý Lịch thực hành",
        href: "/schedules/manage",
        visible: ["MANAGER"],
      },
      {
        icon: <DocumentTextIcon className="w-5 h-5" />,
        label: "Requests",
        name: "Yêu cầu giảng viên",
        href: "/requests",
        visible: ["MANAGER"],
      },
      {
        icon: <DocumentTextIcon className="w-5 h-5" />,
        label: "Subjects",
        name: "Môn học",
        href: "/subjects",
        visible: ["MANAGER"],
      },
      {
        icon: <UserGroupIcon className="w-5 h-5" />,
        label: "Classes",
        name: "Lớp học",
        href: "/classes",
        visible: ["MANAGER"],
      },
      {
        icon: <UserGroupIcon className="w-5 h-5" />,
        label: "Courses",
        name: "Học phần",
        href: "/courses",
        visible: ["MANAGER"],
      },
      {
        icon: <AcademicCapIcon className="w-5 h-5" />,
        label: "Teaching Schedule",
        name: "Lịch dạy",
        href: "/lecturer/schedules",
        visible: ["LECTURER"],
      },
      {
        icon: <PaperAirplaneIcon className="w-5 h-5" />,
        label: "Request Schedule",
        name: "Yêu cầu",
        href: "/lecturer/requests",
        visible: ["LECTURER"],
      },
    ],
  },
  {
    title: "Khác",
    items: [
      {
        icon: <UserCircleIcon className="w-5 h-5" />,
        label: "Profile",
        name: "Thông tin cá nhân",
        href: "/profile",
        visible: ["MANAGER", "LECTURER", "STUDENT"],
      },
      {
        icon: <ArrowRightStartOnRectangleIcon className="w-5 h-5" />,
        label: "Logout",
        name: "Đăng xuất",
        href: "/logout",
        visible: ["MANAGER", "LECTURER", "STUDENT"],
      },
    ],
  },
];

const Menu = () => {
  const pathname = usePathname();

  const [role, setRole] = useState("");


  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const userRole = AuthService.getRole(storedToken);
        setRole(userRole);
      } else {
        setRole("UNDEFINED");
      }
    }

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();

    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Sidebar/Menu */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col gap-6 p-4 transition-all duration-300 overflow-y-auto
            ${isMenuOpen ? 'w-64 fixed inset-y-16 left-0 z-40' : 'w-0 md:w-[14%] md:block'} 
            md:relative md:inset-auto md:min-w-[220px] lg:w-[16%] xl:w-[14%] h-[calc(100vh-64px)]`}
      >
        {(isMenuOpen || !isMobile) && menuItems.map((menu) => (
          <div key={menu.title} className="min-w-[180px]">
            <h2 className="text-xs font-semibold text-gray-500 mb-3 tracking-wider uppercase">{menu.title}</h2>
            <div className="space-y-1">
              {menu.items.map(
                (item) =>
                  item.visible.includes(role) && (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        if (item.label === "Logout") {
                          e.preventDefault();
                          AuthService.logout();
                        } else {
                          setIsMenuOpen(false);
                        }
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors ${pathname === item.href
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-700"
                        }`}
                    >
                      <span className={`${pathname === item.href ? "text-blue-600" : "text-gray-500"}`}>
                        {item.icon}
                      </span>
                      <span className="text-sm">{item.name}</span>
                    </Link>

                  )
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Menu;