import axiosConfig from "@/config/axios";
import AuthService from "./AuthService";
import { LecturerResponse, ManagerResponse, StudentResponse } from "@/types/TypeResponse";
import { DataResponse } from "@/types/DataResponse";


class UserService {
    async getManagerProfile() {
        return await axiosConfig.get("/user/get-current-manager");
    }

    async getLecturerProfile() {
        return await axiosConfig.get("/user/get-current-lecturer");
    }

    async getStudentProfile() {
        return await axiosConfig.get("/user/get-current-student");
    }

    getUserProfile() {
        const token = AuthService.getToken();
        if (!token) {
            return Promise.reject(new Error("Token not found"));
        }

        const payload = AuthService.getPayload(token);
        if (!payload) {
            return Promise.reject(new Error("Invalid token"));
        }

        const role = payload.authorities[0];
        switch (role) {
            case "MANAGER":
                return this.getManagerProfile();
            case "LECTURER":
                return this.getLecturerProfile();
            case "STUDENT":
                return this.getStudentProfile();
            default:
                return Promise.reject(new Error("Invalid role"));
        }
    }

    async updateUserProfile(payload: { email: string; phone: string }): Promise<DataResponse<ManagerResponse | LecturerResponse | StudentResponse>> {
        return await axiosConfig.put("/user", payload);
    }

    async getAllStudents(): Promise<DataResponse<StudentResponse[]>> {
        const response = (await axiosConfig.get(`/user/students`)).data;
        if (!response.success) {
            throw new Error("Lỗi kết nối đến máy chủ :(");
        }
        return response;
    }

    async getAllLecturers(): Promise<DataResponse<LecturerResponse[]>> {
        const response = (await axiosConfig.get(`/user/lecturers`)).data;
        if (!response.success) {
            throw new Error("Lỗi kết nối đến máy chủ :(");
        }
        return response;
    }

    async createStudent(payload: { 
        fullName: string; 
        email: string; 
        code: string; 
        phone: string; 
        gender: boolean; 
        birthday: Date; 
        classId: number;
    }): Promise<DataResponse<StudentResponse>> {
        const response = await axiosConfig.post(`/user/student`, payload);
        return response.data;
    }
    
    async createLecturer(payload: { 
        fullName: string; 
        code: string; 
        email: string; 
        phone: string; 
        gender: number; 
        birthday: string; 
        departmentId: number; 
    }): Promise<DataResponse<LecturerResponse>> {
        const response = await axiosConfig.post(`/user/lecturer`, payload);
        return response.data;
    }

    async deleteUser(id: number): Promise<DataResponse<StudentResponse>> {
        const response = await axiosConfig.delete(`/user/${id}`);
        return response.data;
    }

    async updateStudent(id: number, payload: { 
        fullName?: string; 
        email?: string; 
        code?: string; 
        phone?: string;
        gender?: boolean;
        birthday?: Date;
    }): Promise<DataResponse<StudentResponse>> {
        const response = await axiosConfig.patch(`/user/student/${id}`, payload);
        return response.data;
    }

    async updateLecturer(id: number, payload: { 
        fullName?: string; 
        email?: string; 
        code?: string; 
        phone?: string;
        gender?: boolean;
        birthday?: Date;
    }): Promise<DataResponse<LecturerResponse>> {
        const response = await axiosConfig.patch(`/user/lecturer/${id}`, payload);
        return response.data;
    }

    async lockUserAccount(id: number): Promise<DataResponse<StudentResponse | LecturerResponse>> {
        const response = await axiosConfig.patch(`/user/lock/${id}`);
        return response.data;
    }

    async unlockUserAccount(id: number): Promise<DataResponse<StudentResponse | LecturerResponse>> {
        const response = await axiosConfig.patch(`/user/unlock/${id}`);
        return response.data;
    }


}

export default new UserService();