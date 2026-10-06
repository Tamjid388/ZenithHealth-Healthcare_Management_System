"use server";

import axios from "axios";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse } from "@/types/api.types";
import {
  createSpecialityZodSchema,
  TCreateSpecialityInput,
  TUpdateSpecialityInput,
  updateSpecialityZodSchema,
} from "@/zod/speciality.validation";

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

export const createSpecialityAction = async (
  data: TCreateSpecialityInput,
): Promise<{ success: true } | ApiErorResponse> => {
  const parsedData = createSpecialityZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid Input Data",
    };
  }

  try {
    const formData = new FormData();
    formData.append("title", parsedData.data.title);
    if (parsedData.data.description) {
      formData.append("description", parsedData.data.description);
    }
    if (parsedData.data.icon) {
      formData.append("file", parsedData.data.icon);
    }

    await httpClient.post("/speciality/create-speciality", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create speciality"),
    };
  }
};

export const updateSpecialityAction = async (
  id: string,
  data: TUpdateSpecialityInput,
): Promise<{ success: true } | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Speciality ID is required",
    };
  }

  const parsedData = updateSpecialityZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid Input Data",
    };
  }

  try {
    if (parsedData.data.icon) {
      const formData = new FormData();
      formData.append("title", parsedData.data.title ?? "");
      if (parsedData.data.description) {
        formData.append("description", parsedData.data.description);
      }
      formData.append("file", parsedData.data.icon);
      await httpClient.patch(`/speciality/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await httpClient.patch(`/speciality/${id}`, {
        title: parsedData.data.title,
        description: parsedData.data.description,
      });
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update speciality"),
    };
  }
};

export const deleteSpecialityAction = async (
  id: string,
): Promise<{ success: true } | ApiErorResponse> => {
  if (!id.trim()) {
    return {
      success: false,
      message: "Speciality ID is required",
    };
  }

  try {
    await httpClient.delete(`/speciality/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete speciality"),
    };
  }
};
