import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { SemesterResponse, SemesterWeekResponse } from "@/types/TypeResponse";


class SemesterService {

    async getAllSemesters(): Promise<DataResponse<SemesterResponse[]>> {
        const response = await axiosConfig.get("/semester");
        if (!response.data.success) {
            throw new Error("Lỗi kết nối đến máy chủ :(");
        }
        return response.data;

    }

    async getCurrentSemester(): Promise<DataResponse<SemesterResponse>> {
        const response = await axiosConfig.get(`/semester/current`);

        if (!response.data.success) {
            throw new Error("Lỗi kết nối đến máy chủ :(");
        }
        return response.data;
    }

    //semesterId can "" cause server will response all weeks in current semester
    async getSemesterWeekBySemesterId(semesterId?: string): Promise<DataResponse<SemesterWeekResponse[]>> {
        const response = await axiosConfig.get(`/semester/weeks?semesterId=${semesterId}`);
        if (!response.data.success) {
            throw new Error("Lỗi kết nối đến máy chủ :(");
        }
        return response.data;
    }

    async createSemester(
        payload: {
            code: string,
            name: string,
            startDate: Date,
            endDate: Date,
            startWeek: number,
        }
    ): Promise<DataResponse<SemesterResponse>> {
        const response = await axiosConfig.post("/semester",
            payload)
        if ((payload.startDate.getDay() !== 1)) {
            throw new Error("Ngày bắt đầu kỳ phải là thứ 2");
        }
        if (!response.data.success) {
            throw new Error("Lỗi kết nối đến máy chủ :(");
        }
        return response.data;
    }

}

export default new SemesterService();