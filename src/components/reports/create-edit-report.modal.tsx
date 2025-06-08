import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReportResponse } from '@/types/TypeResponse';
import { Textarea } from '@/components/ui/textarea';
import { ReportTemplateForm } from './report-template.form';

interface CreateEditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  initialData?: ReportResponse;
  mode: 'create' | 'edit';
}

export const CreateEditReportModal: React.FC<CreateEditReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title?: string; content?: string }>({});
  const [isTemplateMode, setIsTemplateMode] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title);
      setContent(initialData.authorContent);
    } else if (isOpen) {
      setTitle('');
      setContent('');
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors: { title?: string; content?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    }
    if (!content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung';
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await onSubmit({ title, content });
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSubmit = async (data: { title: string; content: string }) => {
    setTitle(data.title);
    setContent(data.content);
    setIsTemplateMode(false);
  };

  if (!isOpen) return null;

  if (isTemplateMode) {
    return (
      <ReportTemplateForm
        isOpen={true}
        onClose={() => setIsTemplateMode(false)}
        onSubmit={handleTemplateSubmit}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Tạo báo cáo mới' : 'Chỉnh sửa báo cáo'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {mode === 'create' && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setIsTemplateMode(true)}
              className="w-full py-3 px-4 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 flex items-center justify-center gap-2"
            >
              Sử dụng mẫu báo cáo có sẵn
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-1
                ${error.title 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
              placeholder="Nhập tiêu đề báo cáo"
            />
            {error.title && (
              <p className="mt-2 text-sm text-red-600">{error.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-1 resize-none
                ${error.content 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
              placeholder="Nhập nội dung báo cáo..."
            />
            {error.content && (
              <p className="mt-2 text-sm text-red-600">{error.content}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
              disabled={loading}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-150"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : mode === 'create' ? 'Tạo báo cáo' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 