'use server'

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import {
  DEFAULT_DOCTORS_LIST_PARAMS,
  Doctor,
  DoctorsQueryParams,
  IDoctorDetails,
  Speciality,
} from "@/types/doctors.types";

export const getDoctors = async (
  params: DoctorsQueryParams = DEFAULT_DOCTORS_LIST_PARAMS,
): Promise<ApiResponse<Doctor[]>> => {
  return httpClient.get("/doctors", {
    params: params as Record<string, unknown>,
  });
};

export const getDoctorById = async (
  id: string,
): Promise<ApiResponse<IDoctorDetails>> => {
  return httpClient.get(`/doctors/${id}`);
};

export const getSpecialities = async (): Promise<ApiResponse<Speciality[]>> => {
  return httpClient.get("/speciality");
};
