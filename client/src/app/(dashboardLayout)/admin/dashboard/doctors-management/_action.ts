"use server";

import axios from "axios";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse, ApiResponse } from "@/types/api.types";
import { IDoctorDetails } from "@/types/doctors.types";
import {
  createDoctorZodSchema,
  TCreateDoctorInput,
  TUpdateDoctorInput,
  updateDoctorZodSchema,
} from "@/zod/doctor.validation";

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

export const createDoctorAction = async (
  data: TCreateDoctorInput,
): Promise<{ success: true } | ApiErorResponse> => {
  const parsedData = createDoctorZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid Input Data",
    };
  }

  try {
    await httpClient.post("/users/create-doctor", parsedData.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create doctor"),
    };
  }
};

export const getDoctorByIdAction = async (
  id: string,
): Promise<ApiResponse<IDoctorDetails> | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Doctor ID is required",
    };
  }

  try {
    return await httpClient.get<IDoctorDetails>(`/doctors/${id}`);
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to load doctor"),
    };
  }
};

export const updateDoctorAction = async (
  id: string,
  data: TUpdateDoctorInput,
): Promise<{ success: true } | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Doctor ID is required",
    };
  }

  const parsedData = updateDoctorZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid Input Data",
    };
  }

  try {
    await httpClient.put(`/doctors/${id}`, parsedData.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update doctor"),
    };
  }
};

export const deleteDoctorAction = async (
  id: string,
): Promise<{ success: true } | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Doctor ID is required",
    };
  }

  try {
    await httpClient.patch(`/doctors/${id}`, {});
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete doctor"),
    };
  }
};
