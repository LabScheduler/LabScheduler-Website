import React, { useState } from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface FilterOption {
  id: string;
  label: string;
  type?: 'select' | 'search';
  options?: { value: string; label: string }[];
  value: string;
  placeholder?: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  filterOptions: FilterOption[];
  onFilterChange: (filterId: string, value: string) => void;
  onReset: () => void;
  title?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onToggle,
  filterOptions,
  onFilterChange,
  onReset,
  title = 'Tùy chọn lọc'
}) => {
  return (
    <div className="relative">
      {/* Filter button */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 rounded-md ${isOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} hover:bg-blue-50`}
        aria-expanded={isOpen}
      >
        <FunnelIcon className="w-4 h-4" />
        <span>Lọc</span>
      </button>

      {/* Filter panel with absolute positioning */}
      <div 
        className={`absolute top-full right-0 mt-2 z-50 w-[320px] md:w-[500px] lg:w-[700px] bg-white rounded-lg border border-gray-200 shadow-lg transition-all duration-200 ease-in-out ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ maxHeight: isOpen ? '80vh' : '0', overflow: 'auto' }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            <button 
              onClick={onReset}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <XMarkIcon className="w-3 h-3 mr-1" />
              Đặt lại
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterOptions.map((option) => (
              <div key={option.id}>
                <label 
                  htmlFor={`${option.id}-filter`} 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {option.label}
                </label>
                
                {option.type === 'search' ? (
                  <input
                    type="text"
                    id={`${option.id}-filter`}
                    value={option.value}
                    onChange={(e) => onFilterChange(option.id, e.target.value)}
                    placeholder={option.placeholder || `Tìm kiếm ${option.label.toLowerCase()}...`}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <select
                    id={`${option.id}-filter`}
                    value={option.value}
                    onChange={(e) => onFilterChange(option.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tất cả</option>
                    {option.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 