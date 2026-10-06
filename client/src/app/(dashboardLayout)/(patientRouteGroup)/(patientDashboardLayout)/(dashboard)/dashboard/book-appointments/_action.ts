"use server";

import axios from "axios";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse } from "@/types/api.types";
import { BookedAppointment } from "@/types/appointments.types";
import {
  bookAppointmentZodSchema,
  TBookAppointmentInput,
} from "@/zod/appointment.validation";

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

export type BookAppointmentActionResult =
  | { success: true; data: BookedAppointment }
  | ApiErorResponse;

export const bookAppointmentAction = async (
  data: TBookAppointmentInput,
): Promise<BookAppointmentActionResult> => {
  const parsedData = bookAppointmentZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid input data",
    };
  }

  try {
    const response = await httpClient.post<BookedAppointment>(
      "/appointments",
      parsedData.data,
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to book appointment"),
    };
  }
};
