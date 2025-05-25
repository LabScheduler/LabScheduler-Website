import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { LecturerRequestResponse, ScheduleResponse } from "@/types/TypeResponse";


class LecturerRequestService {
    async getAllRequests(): Promise<DataResponse<LecturerRequestResponse[]>> {
        const response = await axiosConfig.get<DataResponse<LecturerRequestResponse[]>>(
            "/request"
        );

        if (!response.data.success){
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async getAllPendingRequests(): Promise<DataResponse<LecturerRequestResponse[]>> {
        const response = await axiosConfig.get<DataResponse<LecturerRequestResponse[]>>(
            "/request/pending"
        );

        if (!response.data.success){
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async getRequestsByLecturer(): Promise<DataResponse<LecturerRequestResponse[]>> {
        const response = await axiosConfig.get<DataResponse<LecturerRequestResponse[]>>(
            `/request/lecturer`
        );

        if (!response.data.success){
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async createRequest(payload: {
        courseId: number;
        courseSectionId: number;
        newRoomId: number;
        newSemesterWeekId: number;
        newDayOfWeek: number;
        newStartPeriod: number;
        newTotalPeriod: number;
        body: string;
    }): Promise<DataResponse<LecturerRequestResponse> | ScheduleResponse>  {
            const response = await axiosConfig.post<DataResponse<LecturerRequestResponse>>(
                "/request",
                payload
            );

            if (!response.data.success){
                throw new Error(response.data.message);
            }
            return response.data;
    }

    async processRequest(payload: {
        requestId: number;
        status: "APPROVED" | "REJECTED";
        body: string;
    }): Promise<DataResponse<LecturerRequestResponse>> {
        const response = await axiosConfig.post<DataResponse<LecturerRequestResponse>>(
            "/request/process",
            payload
        );

        if (!response.data.success){
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async cancelRequest(requestId: number): Promise<DataResponse<LecturerRequestResponse>> {
        const response = await axiosConfig.delete<DataResponse<LecturerRequestResponse>>(
            `/request/cancel/${requestId}`
        );

        if (!response.data.success){
            throw new Error(response.data.message);
        }
        return response.data;
    }

    //Dataresponse is null if no conflict
    //Dataresponse is a ScheduleResponse if conflict
    async checkRequestConflictWithExistingSchedule(payload: {
        courseId: number;
        courseSectionId: number;
        newRoomId: number;
        newSemesterWeekId: number;
        newDayOfWeek: number;
        newStartPeriod: number;
        newTotalPeriod: number;
        body: string;
    }): Promise<DataResponse<ScheduleResponse>> {
        const response = await axiosConfig.post<DataResponse<ScheduleResponse>>(
            "/request/checkRequestConflict",
            payload
        );

        if (!response.data.success){
            throw new Error(response.data.message);
        }
        return response.data;
    }
}

export default new LecturerRequestService();