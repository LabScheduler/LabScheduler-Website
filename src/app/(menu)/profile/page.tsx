"use client";

import { useState, useEffect } from "react";
import { UserCircleIcon, PencilIcon } from "@heroicons/react/24/outline";
import UserService from "@/services/UserService";
import AuthService from "@/services/AuthService";
import { LecturerResponse, ManagerResponse, StudentResponse } from "@/types/TypeResponse";

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<ManagerResponse | LecturerResponse | StudentResponse | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    email: "",
    phone: ""
  });
  const [userId, setUserId] = useState<number | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = AuthService.getToken();
        if (!token) {
          throw new Error("Có lỗi trong quá trình thực thi!");
        }

        // Get the user role
        const role = AuthService.getRole(token);
        setUserRole(role);

        // Get the user ID
        const id = AuthService.getUserId(token);
        setUserId(id);
        console.log("User ID:", id);
        // Get the user profile based on role
        const response = await UserService.getUserProfile();
        setUserProfile(response.data.data);
        setUpdateFormData({
          email: response.data.data.email || "",
          phone: response.data.data.phone || ""
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Có lỗi xảy ra khi tải thông tin người dùng");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateFormData({
      ...updateFormData,
      [name]: value
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setUpdateError("Không tìm thấy ID người dùng");
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      await UserService.updateUserProfile({
        email: updateFormData.email,
        phone: updateFormData.phone
      });

      // Update the profile state with the new data
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          email: updateFormData.email,
          phone: updateFormData.phone
        });
      }

      setUpdateSuccess(true);
      setUpdateLoading(false);

      // Close the modal after a short delay
      setTimeout(() => {
        setIsEditModalOpen(false);
        setUpdateSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateError("Có lỗi xảy ra khi cập nhật thông tin");
      setUpdateLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validate passwords
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await UserService.changePassword({
        oldPassword: passwordFormData.oldPassword,
        newPassword: passwordFormData.newPassword
      });

      if (response.success) {
        setPasswordSuccess(true);
        setPasswordFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Close modal after success
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
          setPasswordSuccess(false);
        }, 1500);
      }
    } catch (err) {
      setPasswordError('Mật khẩu hiện tại không đúng');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderStudentSpecificInfo = (student: StudentResponse) => (
    <div className="mt-6 bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Thông tin Sinh viên</h3>
      </div>
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã sinh viên</label>
          <div className="p-2 bg-gray-50 rounded-md text-sm">{student.code || "N/A"}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
          <div className="p-2 bg-gray-50 rounded-md text-sm">{student.class || "N/A"}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngành học</label>
          <div className="p-2 bg-gray-50 rounded-md text-sm">{student.major || "N/A"}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên ngành</label>
          <div className="p-2 bg-gray-50 rounded-md text-sm">{student.specialization || "N/A"}</div>
        </div>
      </div>
    </div>
  );

  const renderLecturerSpecificInfo = (lecturer: LecturerResponse) => (
    <div className="mt-6 bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Thông tin Giảng viên</h3>
      </div>
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảng viên</label>
          <div className="p-2 bg-gray-50 rounded-md text-sm">{lecturer.code || "N/A"}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Khoa/Bộ môn</label>
          <div className="p-2 bg-gray-50 rounded-md text-sm">{lecturer.department || "N/A"}</div>
        </div>
      </div>
    </div>
  );

  const renderManagerSpecificInfo = (manager: ManagerResponse) => (
    <div className="mt-6 bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Thông tin Quản lý</h3>
      </div>
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã quản lý</label>
          <div className="p-2 bg-gray-50 rounded-md text-sm">{manager.code || "N/A"}</div>
        </div>
      </div>
    </div>
  );

  const renderProfileContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-3"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      );
    }

    if (error || !userProfile) {
      return (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error || "Không thể tải thông tin người dùng"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Basic information */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h3>
              {(
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Chỉnh sửa
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <div className="p-2 bg-gray-50 rounded-md text-sm">{userProfile.fullName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="p-2 bg-gray-50 rounded-md text-sm">{userProfile.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <div className="p-2 bg-gray-50 rounded-md text-sm">{userProfile.phone || "Chưa cập nhật"}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <div className="p-2 bg-gray-50 rounded-md text-sm">{userProfile.gender ? 'Nam' : 'Nữ'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                <div className="p-2 bg-gray-50 rounded-md text-sm">{formatDate(userProfile.birthday)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <div className={`p-2 rounded-md text-sm inline-flex items-center ${userProfile.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {userProfile.status === "ACTIVE" ? "Đang hoạt động" : "Không hoạt động"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <div className="p-2 bg-gray-50 rounded-md text-sm">{userRole}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific information */}
        {userRole === "STUDENT" && renderStudentSpecificInfo(userProfile as StudentResponse)}
        {userRole === "LECTURER" && renderLecturerSpecificInfo(userProfile as LecturerResponse)}
        {userRole === "MANAGER" && renderManagerSpecificInfo(userProfile as ManagerResponse)}
      </>
    );
  };

  // Add this to render the change password button
  const renderChangePasswordButton = () => (
    <div className="mt-6 bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Bảo mật</h3>
        <button
          onClick={() => setIsChangePasswordModalOpen(true)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          Đổi mật khẩu
        </button>
      </div>
      <div className="px-6 py-4">
        <p className="text-sm text-gray-600">
          Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.
        </p>
      </div>
    </div>
  );

  // Edit Profile Modal
  const renderEditProfileModal = () => {
    if (!isEditModalOpen || !userProfile) return null;

    return (
      <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cập nhật thông tin cá nhân</h3>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {updateSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
              Cập nhật thông tin thành công!
            </div>
          )}

          {updateError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {updateError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  defaultValue={userProfile.fullName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Họ tên không thể thay đổi</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={updateFormData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={updateFormData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <select
                  defaultValue={userProfile.gender ? "true" : "false"}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 appearance-none"
                >
                  <option value="true">Nam</option>
                  <option value="false">Nữ</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Giới tính không thể thay đổi</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                <input
                  type="date"
                  defaultValue={userProfile.birthday?.split('T')[0]}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Ngày sinh không thể thay đổi</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={updateLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Change Password Modal
  const renderChangePasswordModal = () => {
    if (!isChangePasswordModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
            <button
              onClick={() => {
                setIsChangePasswordModalOpen(false);
                setPasswordError(null);
                setPasswordSuccess(false);
                setPasswordFormData({
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
              Đổi mật khẩu thành công!
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  required
                  value={passwordFormData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangePasswordModalOpen(false);
                  setPasswordError(null);
                  setPasswordSuccess(false);
                  setPasswordFormData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={passwordLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
      </div>

      {renderProfileContent()}
      {renderChangePasswordButton()}
      {renderEditProfileModal()}
      {renderChangePasswordModal()}
    </div>
  );
}
