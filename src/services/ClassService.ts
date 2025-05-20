import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { ClassResponse, StudentResponse } from "@/types/TypeResponse";

class ClassService {
    //major = get all major class
    //specialization = get all specialization class
    //"" = get all class
    async getAllClasses(classType?:"major" | "specialization" | "" ): Promise<DataResponse<ClassResponse[]>> {
        const response = await axiosConfig.get(`/class?classType=${classType}`);
        console.log(response);
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }

    async createClass(
        name: string,
        majorId: number,
        classType: "MAJOR" | "SPECIALIZATION",
        specializationId?: number | null,
    ): Promise<DataResponse<ClassResponse>> {
        const response = await axiosConfig.post('/class', {
            name,
            majorId,
            classType,
            specializationId,
        });
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }

    async updateMajorClass(
        id: number,
        name: string,
        majorId: number,
    ): Promise<DataResponse<ClassResponse>> {
        const response = await axiosConfig.patch(`/class/${id}`, {
            name,
            majorId,
        });
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }

    async updateSpecializationClass(
        id: number,
        name: string,
        majorId: number,
        specializationId: number,
    ): Promise<DataResponse<ClassResponse>> {
        const response = await axiosConfig.patch(`/class/${id}`, {
            name,
            majorId,
            specializationId,
        });
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }

    async deleteClass(id: number): Promise<DataResponse<ClassResponse>> {
        const response = await axiosConfig.delete(`/class/${id}`);
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }

    async getAllStudentsInClass(classId: number): Promise<DataResponse<StudentResponse[]>> {
        const response = await axiosConfig.get(`/class/${classId}/students`);
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }

    async addStudentToClass(
        classId: number,
        studentIds: number[],
    ): Promise<DataResponse<StudentResponse>> {
        const response = await axiosConfig.post(`/class/${classId}/students`, studentIds);
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }

    async deleteStudentFromClass(
        classId: number,
        studentId: number,
    ): Promise<DataResponse<StudentResponse>> {
        const response = await axiosConfig.delete(`/class/${classId}/students`, {
            data: studentId,
        });
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }
}

export default new ClassService();