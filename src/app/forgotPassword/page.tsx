'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';

type Step = 'REQUEST' | 'VERIFY' | 'RESET';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('REQUEST');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await AuthService.forgotPassword(username);
      if (response.success) {
        setSuccessMessage('Mã OTP đã được gửi đến email của bạn');
        setCurrentStep('VERIFY');
      } else {
        setError(response.message || 'Không thể gửi mã OTP');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi gửi mã OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await AuthService.verifyOtp(username, otp);
      if (response.success) {
        setSuccessMessage('Xác thực mã OTP thành công');
        setCurrentStep('RESET');
      } else {
        setError(response.message || 'Mã OTP không hợp lệ');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi xác thực mã OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.resetPassword(username, newPassword);
      if (response.success) {
        setSuccessMessage('Đặt lại mật khẩu thành công');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(response.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Quên mật khẩu
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          {currentStep === 'REQUEST' && (
            <form onSubmit={handleRequestOTP}>
              <div className="mb-5">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên đăng nhập của bạn"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 mb-4"
              >
                {isLoading ? 'Đang xử lý...' : 'Gửi mã OTP'}
              </button>
            </form>
          )}

          {currentStep === 'VERIFY' && (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-5">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Mã OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mã OTP đã gửi đến email"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 mb-4"
              >
                {isLoading ? 'Đang xử lý...' : 'Xác thực OTP'}
              </button>
            </form>
          )}

          {currentStep === 'RESET' && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-5">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 mb-4"
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}

          <div className="text-center">
            <button 
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
