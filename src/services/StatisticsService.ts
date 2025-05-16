import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import { StatisticsResponse } from "@/types/TypeResponse";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class StatisticsService {

  public async getStatistics(): Promise<DataResponse<StatisticsResponse>> {
        const response =await axiosConfig.get<DataResponse<StatisticsResponse>>(`${API_URL}/statistic`);
        return response.data;
  }
}

export default new StatisticsService();