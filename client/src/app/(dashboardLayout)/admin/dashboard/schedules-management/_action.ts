"use server";

import axios from "axios";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse, ApiResponse } from "@/types/api.types";
import { ScheduleDetails } from "@/types/schedules.types";
import {
  createScheduleZodSchema,
  TCreateScheduleInput,
  TUpdateScheduleInput,
  updateScheduleZodSchema,
} from "@/zod/schedule.validation";

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

export const createScheduleAction = async (
  data: TCreateScheduleInput,
): Promise<{ success: true } | ApiErorResponse> => {
  const parsedData = createScheduleZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid Input Data",
    };
  }

  try {
    await httpClient.post("/schedule", parsedData.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create schedule"),
    };
  }
};

export const getScheduleByIdAction = async (
  id: string,
): Promise<ApiResponse<ScheduleDetails> | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Schedule ID is required",
    };
  }

  try {
    return await httpClient.get<ScheduleDetails>(`/schedule/${id}`);
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to load schedule"),
    };
  }
};

export const updateScheduleAction = async (
  id: string,
  data: TUpdateScheduleInput,
): Promise<{ success: true } | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Schedule ID is required",
    };
  }

  const parsedData = updateScheduleZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid Input Data",
    };
  }

  try {
    await httpClient.patch(`/schedule/${id}`, parsedData.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update schedule"),
    };
  }
};

export const deleteScheduleAction = async (
  id: string,
): Promise<{ success: true } | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Schedule ID is required",
    };
  }

  try {
    await httpClient.delete(`/schedule/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete schedule"),
    };
  }
};
