import status from "http-status";
import { Request, Response } from "express";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  const review = await ReviewService.createReview(user, payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Review submitted successfully",
    data: review,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  const query = req.query;
  const result = await ReviewService.getMyReviews(user, query as IQueryParams);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "My reviews retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ReviewService.getAllReviews(query as IQueryParams);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Reviews retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  const review = await ReviewService.getReviewById(id as string, user);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Review retrieved successfully",
    data: review,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  const review = await ReviewService.updateReview(id as string, user, payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Review updated successfully",
    data: review,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  await ReviewService.deleteReview(id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Review deleted successfully",
  });
});

export const ReviewController = {
  createReview,
  getMyReviews,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
