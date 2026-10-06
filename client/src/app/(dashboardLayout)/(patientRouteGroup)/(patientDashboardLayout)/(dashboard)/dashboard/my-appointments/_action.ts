"use server";

import axios from "axios";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse } from "@/types/api.types";
import {
  createReviewZodSchema,
  TCreateReviewInput,
} from "@/zod/review.validation";

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

export type CreateReviewActionResult =
  | { success: true; alreadyReviewed?: false }
  | (ApiErorResponse & { alreadyReviewed?: boolean });
export const createReviewAction = async (
  data: TCreateReviewInput,
): Promise<CreateReviewActionResult> => {

  const parsedData = createReviewZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message || "Invalid input data",
    };
  }

  try {
    await httpClient.post("/reviews", parsedData.data);
    return { success: true };
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 409
    ) {
      return {
        success: false,
        alreadyReviewed: true,
        message: getActionErrorMessage(
          error,
          "This appointment has already been reviewed",
        ),
      };
    }
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to submit review"),
    };
  }
};

export type CancelAppointmentActionResult =
  | { success: true }
  | ApiErorResponse;

export const cancelAppointmentAction = async (
  appointmentId: string,
): Promise<CancelAppointmentActionResult> => {
  if (!appointmentId.trim()) {
    return {
      success: false,
      message: "Appointment ID is required",
    };
  }

  try {
    await httpClient.patch(`/appointments/${appointmentId}/cancel`, {});
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to cancel appointment"),
    };
  }
};
