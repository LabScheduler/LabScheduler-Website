import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { CourseResponse, CourseSectionResponse, LecturerResponse, NewCourseResponse } from "@/types/TypeResponse";


class CourseService{
    async getAllCoursesBySemesterId(semesterId: number): Promise<DataResponse<CourseResponse[]>> {
        const response = await axiosConfig.get(`/course?semesterId=${semesterId}`);
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
        
    }

    async createCourse(
        payload: {
            subjectId: number,
            classId: number,
            lecturersIds: number[],
            semesterId: number,
            totalStudents: number,
            startWeekId: number,
        }
    ): Promise<DataResponse<NewCourseResponse>> {
        const response = await axiosConfig.post("/course", payload);
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        if(response.status == 404){
            throw new Error("Học phần này đã tồn tại");
        }
        return response.data;
    }

    async updateCourse(
        id: number,
        payload: {
            subjectId: number,
            classId: number,
            lecturersIds: number[],
            totalStudents: number,
        }
    ): Promise<DataResponse<CourseResponse>> {
        const response = await axiosConfig.patch(`/course/${id}`, payload);
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }

    async deleteCourse(courseId: number): Promise<DataResponse<any>> {
        const response = await axiosConfig.delete(`/course/${courseId}`);
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data
    }

    async getSectionByCourseId(courseId: number): Promise<DataResponse<CourseSectionResponse[]>> {
        const response = await axiosConfig.get(`/course/${courseId}/sections`);
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }

    async getCourseByLecturerId(lecturerId: number): Promise<DataResponse<CourseResponse[]>> {
        const response = await axiosConfig.get(`/course/lecturer`);
        if(!response.data.success)
            throw new Error("Lỗi kết nối đến máy chủ :(");
        return response.data;
    }

    async getLecturerCourses(): Promise<DataResponse<CourseResponse[]>> {
        const response = await axiosConfig.get<DataResponse<CourseResponse[]>>(
            "/course/lecturer"
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    async getCourseLecturers(courseId: number): Promise<DataResponse<LecturerResponse[]>> {
        const response = await axiosConfig.get<DataResponse<LecturerResponse[]>>(
            `/course/${courseId}/lecturers`
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    }
}

export default new CourseService();