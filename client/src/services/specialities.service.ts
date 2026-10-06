"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import {
  DEFAULT_SPECIALITIES_LIST_PARAMS,
  SpecialitiesQueryParams,
  Speciality,
} from "@/types/specialities.types";

export const getSpecialities = async (
  params: SpecialitiesQueryParams = DEFAULT_SPECIALITIES_LIST_PARAMS,
): Promise<ApiResponse<Speciality[]>> => {
  return httpClient.get("/speciality", {
    params: params as Record<string, unknown>,
  });
};
