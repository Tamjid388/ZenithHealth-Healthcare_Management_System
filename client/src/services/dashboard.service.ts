"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse, ApiResponse } from "@/types/api.types";
import { IAdminDashboardData } from "@/types/dashboard.types";

export const getDashboardData = async (): Promise<
  ApiResponse<IAdminDashboardData> | ApiErorResponse
> => {
  try {
    const response = await httpClient.get<IAdminDashboardData>("/stats");
    return response;
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    return {
      success: false,
      message: "Failed to fetch dashboard stats",
    };
  }
};
