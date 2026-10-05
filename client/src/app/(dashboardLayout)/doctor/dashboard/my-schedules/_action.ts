"use server";

import axios from "axios";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse } from "@/types/api.types";
import {
  createMyDoctorScheduleZodSchema,
  TCreateMyDoctorScheduleInput,
} from "@/zod/doctor-schedule.validation";

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

export const createMyDoctorScheduleAction = async (
  data: TCreateMyDoctorScheduleInput,
): Promise<{ success: true } | ApiErorResponse> => {
  const parsedData = createMyDoctorScheduleZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid Input Data",
    };
  }

  try {
    await httpClient.post("/doctor-schedules/my", parsedData.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to claim schedule"),
    };
  }
};

export const deleteMyDoctorScheduleAction = async (
  scheduleId: string,
): Promise<{ success: true } | ApiErorResponse> => {
  if (!scheduleId.trim()) {
    return {
      success: false,
      message: "Schedule ID is required",
    };
  }

  try {
    await httpClient.delete(`/doctor-schedules/my/${scheduleId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to release schedule"),
    };
  }
};
