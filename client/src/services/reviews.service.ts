'use server'

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import {
  DEFAULT_MY_REVIEWS_LIST_PARAMS,
  Review,
  ReviewsQueryParams,
} from "@/types/reviews.types";

export const getMyReviews = async (
  params: ReviewsQueryParams = DEFAULT_MY_REVIEWS_LIST_PARAMS,
): Promise<ApiResponse<Review[]>> => {
  return httpClient.get("/reviews/my", {
    params: params as Record<string, unknown>,
  });
};

export const getReviews = async (
  params: ReviewsQueryParams = DEFAULT_MY_REVIEWS_LIST_PARAMS,
): Promise<ApiResponse<Review[]>> => {
  return httpClient.get("/reviews", {
    params: params as Record<string, unknown>,
  });
};

export const getReviewById = async (
  id: string,
): Promise<ApiResponse<Review>> => {
  return httpClient.get(`/reviews/${id}`);
};
