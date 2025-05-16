import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { Department } from "@/types/TypeResponse";

class DepartmentService {
    async getAllDepartments(): Promise<DataResponse<Department[]>> {
        const response = await axiosConfig.get(`/department`);
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }
}

export default new DepartmentService();