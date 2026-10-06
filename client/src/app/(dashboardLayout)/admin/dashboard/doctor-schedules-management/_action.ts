"use server";

import axios from "axios";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse, ApiResponse } from "@/types/api.types";
import { AdminDoctorScheduleDetails } from "@/types/doctor-schedules.types";

const getActionErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    if (message) {
      return message;
    }
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const getAdminDoctorScheduleByIdAction = async (
  doctorId: string,
  scheduleId: string,
): Promise<ApiResponse<AdminDoctorScheduleDetails> | ApiErorResponse> => {
  if (!doctorId.trim() || !scheduleId.trim()) {
    return {
      success: false,
      message: "Doctor ID and schedule ID are required",
    };
  }

  try {
    return await httpClient.get<AdminDoctorScheduleDetails>(
      `/doctor-schedules/${doctorId}/${scheduleId}`,
    );
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to load doctor schedule"),
    };
  }
};
