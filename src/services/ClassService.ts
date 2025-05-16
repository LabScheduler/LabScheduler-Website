import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { ClassResponse } from "@/types/TypeResponse";

class ClassService {
    async getAllClasses(classType?:"major" | "specialization" | "" ): Promise<DataResponse<ClassResponse[]>> {
        const response = await axiosConfig.get(`/class?classType=${classType}`);
        console.log(response);
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }
}

export default new ClassService();