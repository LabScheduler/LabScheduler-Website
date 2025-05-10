import Link from "next/link";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
// import authService from "@/services/authService";

const Header = () => {
  const user = "User Name";
  const role = "MANAGER";

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Logo and site name */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.jpg" 
              alt="LabScheduler Logo" 
              width={40} 
              height={40} 
              className="rounded-md object-cover"
            />
            <span className="font-semibold text-lg md:text-xl text-gray-800 hidden md:block">LabScheduler</span>
          </div>
        </Link>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* User Profile */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1.5 rounded-full">
            <UserCircleIcon className="w-7 h-7 text-gray-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-800">{user}</p>
            <p className="text-xs text-gray-500 capitalize">{role.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;