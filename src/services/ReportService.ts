import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { ReportResponse } from "@/types/TypeResponse";


class ReportService {

    async getAllReports(): Promise<DataResponse<ReportResponse[]>> {
        const response = await axiosConfig.get<DataResponse<ReportResponse[]>>("/reports");

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async getReportByUserId(userId?: number): Promise<DataResponse<ReportResponse[]>> {
        const response = await axiosConfig.get<DataResponse<ReportResponse[]>>(`/reports/${userId}/reports`);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async getAllPendingReports() : Promise<DataResponse<ReportResponse[]>> {
        const response = await axiosConfig.get<DataResponse<ReportResponse[]>>(`/reports/pending`);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async getReportById(reportId: number): Promise<DataResponse<ReportResponse>> {
        const response = await axiosConfig.get<DataResponse<ReportResponse>>(`/reports/${reportId}`);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async createReport(payload: {
        title: string;
        content: string;
    }): Promise<DataResponse<ReportResponse>> {
        const response = await axiosConfig.post<DataResponse<ReportResponse>>("/reports", payload);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async updateReport(reportId: number, payload: {
        title?: string;
        content?: string;
    }): Promise<DataResponse<ReportResponse>> {
        const response = await axiosConfig.put<DataResponse<ReportResponse>>(`/reports/${reportId}`, payload);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async processReport(reportId: number, status: 'APPROVED' | 'REJECTED'): Promise<DataResponse<ReportResponse>> {
        const response = await axiosConfig.patch<DataResponse<ReportResponse>>(`/reports/${reportId}/process?status=${status}`,);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async cancelReport(reportId: number): Promise<DataResponse<ReportResponse>> {
        const response = await axiosConfig.patch<DataResponse<ReportResponse>>(`/reports/${reportId}`);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async deleteReport(reportId: number): Promise<DataResponse<ReportResponse>> {
        const response = await axiosConfig.delete<DataResponse<ReportResponse>>(`/reports/${reportId}`);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

}

export default new ReportService();