import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { ScheduleResponse } from "@/types/TypeResponse";


class scheduleService {
    async createSchedule(payload: {
        courseId: number;
        courseSectionId: number;
        roomId: number;
        lecturerId: number;
        semesterWeekId: number;
        dayOfWeek: number;
        startPeriod: number;
        totalPeriod: number;
    }): Promise<DataResponse<ScheduleResponse>> {
        const response = await axiosConfig.post<DataResponse<ScheduleResponse>>(
            "/schedule", payload
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        return response.data;
    }

    async getscheduleBySemesterId(semesterId: number): Promise<DataResponse<ScheduleResponse[]>> {
        const response = await axiosConfig.get<DataResponse<ScheduleResponse[]>>(
            `/schedule?semesterId=${semesterId}`
        );
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async getscheduleByCourseId(semesterId: number, courseId: number): Promise<DataResponse<ScheduleResponse[]>> {
        const response = await axiosConfig.get<DataResponse<ScheduleResponse[]>>(
            `/schedule/course?semesterId=${semesterId}&courseId=${courseId}`
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        return response.data;
    }

    async getscheduleByLecturerId(semesterId: number, lecturerId: number): Promise<DataResponse<ScheduleResponse[]>> {
        const response = await axiosConfig.get<DataResponse<ScheduleResponse[]>>(
            `/schedule/lecturer?semesterId=${semesterId}&lecturerId=${lecturerId}`
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        return response.data;
    }

    async getscheduleByClassId(semesterId: number, classId: number): Promise<DataResponse<ScheduleResponse[]>> {
        const response = await axiosConfig.get<DataResponse<ScheduleResponse[]>>(
            `/schedule/class?semesterId=${semesterId}&classId=${classId}`
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        return response.data;
    }

    async updateSchedule(scheduleId: number,
        payload: {
            roomId: number;
            lecturerId: number;
            semesterWeekId: number;
            dayOfWeek: number;
            startPeriod: number;
            totalPeriod: number;
        }): Promise<DataResponse<ScheduleResponse>> {
        const response = await axiosConfig.put<DataResponse<ScheduleResponse>>(
            `/schedule/${scheduleId}`, payload 
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        return response.data;
    }

    async cancelSchedule(scheduleId: number): Promise<DataResponse<ScheduleResponse>> {
        const response = await axiosConfig.patch<DataResponse<ScheduleResponse>>(
            `/schedule/${scheduleId}`
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        return response.data;
    }

    async deleteSchedule(scheduleId: number): Promise<DataResponse<any>> {
        const response = await axiosConfig.delete<DataResponse<ScheduleResponse>>(
            `/schedule/${scheduleId}`
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        return response.data;
    }

}

export default new scheduleService();