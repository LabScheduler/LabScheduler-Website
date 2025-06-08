import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { RoomResponse } from "@/types/TypeResponse";

class RoomService{

    async getAllRooms(): Promise<DataResponse<RoomResponse[]>> {
        const response = await axiosConfig.get("/room")
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }

    async createRoom(
        name: string,
        capacity: number,
        status: "AVAILABLE" | "UNAVAILABLE" | "REPAIRING",
        description: string,
        type: "COMPUTER_LAB" | "LECTURE_HALL"
    ): Promise<DataResponse<RoomResponse>> {
        const response = await axiosConfig.post("/room/create", {
            name,
            capacity,
            status,
            description,
            type
        })
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }

    async updateRoom(
        id: string,
        name: string,
        capacity: number,
        status: "AVAILABLE" | "UNAVAILABLE" | "REPAIRING",
        description: string,
    ): Promise<DataResponse<RoomResponse>> {
        const response = await axiosConfig.patch(`/room/update/${id}`, {
            name,
            capacity,
            status,
            description
        })
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }

    async deleteRoom(id: string): Promise<DataResponse<RoomResponse>> {
        const response = await axiosConfig.delete(`/room/delete/${id}`)
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }
}

export default new RoomService();