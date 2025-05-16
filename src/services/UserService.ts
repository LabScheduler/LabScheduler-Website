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

    async updateUserProfile(id: number, payload: { email: string; phone: string }): Promise<DataResponse<ManagerResponse | LecturerResponse | StudentResponse>> {
        return await axiosConfig.put(`/user/update/${id}`, payload);
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
}

export default new UserService();