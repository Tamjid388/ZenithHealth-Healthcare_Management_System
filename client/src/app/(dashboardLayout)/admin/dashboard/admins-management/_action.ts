"use server";

import axios from "axios";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse, ApiResponse } from "@/types/api.types";
import { Admin, ICreateAdminPayload, IUpdateAdminPayload } from "@/types/admins.types";
import {
  createAdminZodSchema,
  updateAdminZodSchema,
} from "@/zod/admin.validation";

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

export const createAdminAction = async (
  data: ICreateAdminPayload,
): Promise<{ success: true } | ApiErorResponse> => {
  const parsedData = createAdminZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid Input Data",
    };
  }

  try {
    await httpClient.post("/users/create-admin", parsedData.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create admin"),
    };
  }
};

export const getAdminByIdAction = async (
  id: string,
): Promise<ApiResponse<Admin> | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Admin ID is required",
    };
  }

  try {
    return await httpClient.get<Admin>(`/admin/${id}`);
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to load admin"),
    };
  }
};

export const updateAdminAction = async (
  id: string,
  data: IUpdateAdminPayload,
): Promise<{ success: true } | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Admin ID is required",
    };
  }

  const parsedData = updateAdminZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid Input Data",
    };
  }

  try {
    await httpClient.put(`/admin/${id}`, parsedData.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update admin"),
    };
  }
};

export const deleteAdminAction = async (
  id: string,
): Promise<{ success: true } | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Admin ID is required",
    };
  }

  try {
    await httpClient.delete(`/admin/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete admin"),
    };
  }
};
