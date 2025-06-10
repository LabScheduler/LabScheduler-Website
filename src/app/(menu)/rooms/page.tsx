"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { PlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { FilterPanel } from "@/components/ui/filter-panel";
import RoomService from "@/services/RoomService";
import { RoomResponse } from "@/types/TypeResponse";
import { NotificationDialog } from "@/components/ui/notification-dialog";

interface Room {
  id: number;
  name: string;
  capacity: number;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'REPAIRING';
  description: string;
  last_updated: string;
  type: 'LECTURE_HALL' | 'COMPUTER_LAB';
}

const mapRoomResponseToRoom = (room: RoomResponse): Room => ({
  id: room.id,
  name: room.name,
  capacity: room.capacity,
  status: room.status,
  description: room.description,
  last_updated: typeof room.lastUpdated === 'string' ? room.lastUpdated : new Date(room.lastUpdated).toISOString(),
  type: room.type,
});

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    capacity: '',
    status: '',
    name: ''
  });
  const [successRoom, setSuccessRoom] = useState<Room | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'edit' | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await RoomService.getAllRooms();
        if (response.success) {
          setRooms(response.data.map(mapRoomResponseToRoom));
        } else {
          setError(response.message || 'Không thể tải danh sách phòng học');
        }
      } catch (err) {
        setError('Lỗi khi tải phòng học: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Extract unique values for filter dropdowns
  const capacityOptions = useMemo(() => 
    Array.from(new Set(rooms.map(r => r.capacity))).sort(), [rooms]);
  
  const statusOptions = useMemo(() => [
    { value: 'AVAILABLE', label: 'Đang hoạt động' },
    { value: 'UNAVAILABLE', label: 'Không hoạt động' },
    { value: 'REPAIRING', label: 'Đang sửa chữa' }
  ], []);

  const filterOptions = useMemo(() => [
    {
      id: 'name',
      label: 'Mã phòng',
      type: 'search' as const,
      value: filters.name || '',
      placeholder: 'Nhập mã phòng...'
    },
    {
      id: 'capacity',
      label: 'Sức chứa',
      type: 'select' as const,
      value: filters.capacity,
      options: capacityOptions.map(cap => ({ 
        value: cap.toString(), 
        label: `${cap} người` 
      }))
    },
    {
      id: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      value: filters.status,
      options: statusOptions
    }
  ], [filters, capacityOptions, statusOptions]);

  // Apply filters
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Filter by name
      if (filters.name && !room.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      // Filter by capacity
      if (filters.capacity && room.capacity !== parseInt(filters.capacity)) {
        return false;
      }
      
      // Filter by status
      if (filters.status && room.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  }, [rooms, filters]);

  // Use our pagination hook with filtered data
  const {
    currentPage,
    pageSize,
    totalPages,
    currentData: paginatedRooms,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination({
    data: filteredRooms,
    defaultPageSize: 10,
    initialPage: 1
  });

  const handleFilterChange = (filterId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      capacity: '',
      status: '',
      name: ''
    });
  };

  const handleAddRoom = async (newRoom: Omit<Room, 'id' | 'last_updated'>) => {
    try {
      const response = await RoomService.createRoom(
        newRoom.name,
        newRoom.capacity,
        newRoom.status,
        newRoom.description,
        newRoom.type,
      );
      
      if (response.success) {
        const createdRoom = mapRoomResponseToRoom(response.data);
        setRooms(prev => [...prev, createdRoom]);
        setSuccessRoom(createdRoom);
        setActionType('add');
        setIsSuccessDialogOpen(true);
        setIsAddModalOpen(false);
      } else {
        setError(response.message || 'Có lỗi khi tạo phòng học');
      }
    } catch (err) {
      setError('Có lỗi khi tạo phòng học: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleEditRoom = async (editedRoom: Room) => {
    try {
      const response = await RoomService.updateRoom(
        editedRoom.id.toString(),
        editedRoom.name,
        editedRoom.capacity,
        editedRoom.status,
        editedRoom.description
      );
      
      if (response.success) {
        const updatedRoom = mapRoomResponseToRoom(response.data);
        setRooms(prev => prev.map(room => 
          room.id === updatedRoom.id ? updatedRoom : room
        ));
        setSuccessRoom(updatedRoom);
        setActionType('edit');
        setIsSuccessDialogOpen(true);
        setIsEditModalOpen(false);
        setSelectedRoom(null);
      } else {
        setError(response.message || 'Có lỗi khi cập nhật phòng học');
      }
    } catch (err) {
      setError('Có lỗi khi cập nhật phòng học: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const getStatusBadgeClass = (status: Room['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'REPAIRING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNAVAILABLE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Room['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Đang hoạt động';
      case 'REPAIRING':
        return 'Đang bảo trì';
      case 'UNAVAILABLE':
        return 'Không hoạt động';
      default:
        return status;
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
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
    <div className="p-6">
      {/* Success notification dialog */}
      {successRoom && (
        <NotificationDialog
          isOpen={isSuccessDialogOpen}
          onClose={() => {
            setIsSuccessDialogOpen(false);
            setSuccessRoom(null);
            setActionType(null);
          }}
          title={
            actionType === 'add' ? "Thêm phòng học thành công!" :
            "Cập nhật phòng học thành công!"
          }
          details={{
            "Mã phòng": successRoom.name,
            "Sức chứa": `${successRoom.capacity} người`,
            "Trạng thái": getStatusLabel(successRoom.status),
            "Mô tả": successRoom.description || "Không có",
            "Loại phòng": successRoom.type === 'LECTURE_HALL' ? "Giảng đường" : "Phòng máy",
          }}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng học</h1>
        <div className="flex items-center gap-4">
          {/* Filter component */}
          <FilterPanel
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
          
          {/* Add room button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm phòng học
          </button>
        </div>
      </div>

      {/* Room Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sức chứa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cập nhật cuối
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room.capacity} người
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(room.status)}`}>
                      {getStatusLabel(room.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room.description || "Không có"}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room.type === 'LECTURE_HALL' ? "Giảng đường" : "Phòng máy"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(room.last_updated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Add pagination component */}
        {rooms.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Suspense fallback={<div>Loading pagination...</div>}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                totalItems={totalItems}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm phòng học mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                handleAddRoom({
                  name: formData.get('name') as string,
                  capacity: parseInt(formData.get('capacity') as string, 10),
                  status: formData.get('status') as 'AVAILABLE' | 'UNAVAILABLE' | 'REPAIRING',
                  description: formData.get('description') as string,
                  type: formData.get('type') as 'LECTURE_HALL' | 'COMPUTER_LAB'
                });
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Mã phòng</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập mã phòng"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Sức chứa</label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập số lượng người"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <select
                      name="status"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 appearance-none bg-white"
                    >
                      <option value="AVAILABLE">Đang hoạt động</option>
                      <option value="REPAIRING">Đang sửa chữa</option>
                      <option value="UNAVAILABLE">Không hoạt động</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Loại phòng</label>
                    <select
                      name="type"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 appearance-none bg-white"
                    >
                      <option value="LECTURE_HALL">Giảng đường</option>
                      <option value="COMPUTER_LAB">Phòng máy</option>
                    </select>
                  </div>
                  <div className="mb-4 col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      placeholder="Nhập mô tả phòng học (nếu có)"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Thêm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {isEditModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa thông tin phòng học</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedRoom(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              handleEditRoom({
                ...selectedRoom,
                name: formData.get('name') as string,
                capacity: parseInt(formData.get('capacity') as string, 10),
                status: formData.get('status') as 'AVAILABLE' | 'UNAVAILABLE' | 'REPAIRING',
                description: formData.get('description') as string
              });
            }} className="h-[calc(100%-4rem)] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Thông tin cơ bản */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Mã phòng</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={selectedRoom.name}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mã phòng"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Sức chứa</label>
                      <input
                        type="number"
                        name="capacity"
                        defaultValue={selectedRoom.capacity}
                        min="1"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số lượng người"
                      />
                    </div>
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Trạng thái</h4>
                  <div>
                    <select
                      name="status"
                      defaultValue={selectedRoom.status}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="AVAILABLE">Đang hoạt động</option>
                      <option value="REPAIRING">Đang sửa chữa</option>
                      <option value="UNAVAILABLE">Không hoạt động</option>
                    </select>
                  </div>
                </div>

                {/* Mô tả */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mô tả</h4>
                  <div>
                    <textarea
                      name="description"
                      defaultValue={selectedRoom.description}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập mô tả phòng học (nếu có)"
                    ></textarea>
                  </div>
                </div>

                {/* Thông tin cập nhật */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin cập nhật</h4>
                  <div>
                    <p className="text-sm text-gray-600">
                      Cập nhật lần cuối: {formatDateTime(selectedRoom.last_updated)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedRoom(null);
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
