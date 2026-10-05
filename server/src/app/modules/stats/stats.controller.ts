import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { StatsService } from "./stats.service";

const createStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new Error("User not found");
  }
  const result = await StatsService.createStats(user);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Stats fetched successfully",
    data: result,
  });
});

export const StatsController = {
  createStats,
};
