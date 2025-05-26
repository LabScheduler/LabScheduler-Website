'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';

export default function LoginPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Redirect if already logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && !AuthService.isAuthenticated()) {
        router.push('/');
      }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await AuthService.login(formData);
      if (response.success) {
        router.push('/');
      } else {
        setError(response.message || 'Đăng nhập không thành công');
      }
    } catch (err) {
      setError('Có lỗi xảy ra trong quá trình đăng nhập');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Đăng nhập
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 mb-4"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => router.push('/forgotPassword')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Quên mật khẩu?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
