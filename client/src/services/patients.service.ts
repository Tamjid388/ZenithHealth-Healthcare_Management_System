"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import {
  Patient,
  PatientDetails,
  PatientsQueryParams,
  DEFAULT_PATIENTS_LIST_PARAMS,
} from "@/types/patients.types";

export const getPatients = async (
  params: PatientsQueryParams = DEFAULT_PATIENTS_LIST_PARAMS,
): Promise<ApiResponse<Patient[]>> => {
  return httpClient.get("/patients", {
    params: params as Record<string, unknown>,
  });
};

export const getPatientById = async (
  id: string,
): Promise<ApiResponse<PatientDetails>> => {
  return httpClient.get(`/patients/${id}`);
};
