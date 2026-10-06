"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import {
  Admin,
  AdminsQueryParams,
  DEFAULT_ADMINS_LIST_PARAMS,
} from "@/types/admins.types";

export const getAdmins = async (
  params: AdminsQueryParams = DEFAULT_ADMINS_LIST_PARAMS,
): Promise<ApiResponse<Admin[]>> => {
  return httpClient.get("/admin", {
    params: params as Record<string, unknown>,
  });
};

export const getAdminById = async (
  id: string,
): Promise<ApiResponse<Admin>> => {
  return httpClient.get(`/admin/${id}`);
};
