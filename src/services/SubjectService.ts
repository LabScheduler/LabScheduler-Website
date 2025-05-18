import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { SubjectResponse } from "@/types/TypeResponse";


class SubjectService {
  
    async getAllSubjects(): Promise<DataResponse<SubjectResponse[]>> {
        const response = await axiosConfig.get("/subject")
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }

    async createSubject(
        code: string,
        name: string,
        totalCredits: number,
        totalTheoryPeriods: number,
        totalPracticePeriods: number,
        totalExercisePeriods: number,
        totalSelfStudyPeriods: number,
    ): Promise<DataResponse<SubjectResponse>> {
        const response = await axiosConfig.post("/subject/create", {
            code,
            name,
            totalCredits,
            totalTheoryPeriods,
            totalPracticePeriods,
            totalExercisePeriods,
            totalSelfStudyPeriods
        })
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }

    async updateSubject(
        id: number,
        code: string,
        name: string,
        totalCredits: number,
        totalTheoryPeriods: number,
        totalPracticePeriods: number,
        totalExercisePeriods: number,
        totalSelfStudyPeriods: number,
    ): Promise<DataResponse<SubjectResponse>> {
        const response = await axiosConfig.patch(`/subject/update/${id}`, {
            code,
            name,
            totalCredits,
            totalTheoryPeriods,
            totalPracticePeriods,
            totalExercisePeriods,
            totalSelfStudyPeriods
        })
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }

    async deleteSubject(id: number): Promise<DataResponse<SubjectResponse>> {
        const response = await axiosConfig.delete(`/subject/delete/${id}`)
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }
}

export default new SubjectService();