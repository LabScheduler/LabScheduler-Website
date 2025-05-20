import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { MajorResponse } from "@/types/TypeResponse";


class MajorService{
    async getAllMajors(): Promise<DataResponse<MajorResponse[]>> {
        const response = await axiosConfig.get('/major');
        if (!response.data.success) {
            throw new Error('Lỗi kết nối đến máy chủ :(');
        }
        return response.data;
    }
}

export default new MajorService();