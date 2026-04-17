import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import Stripe from "stripe";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendResponse";

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const webHookSecret = envVars.STRIPE.WEBHOOK_SECRET;
  if (!signature || !webHookSecret) {
    console.error("Missing signature or webhook secret");
    throw new AppError(
      status.BAD_REQUEST,
      "Missing signature or webhook secret",
    );
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webHookSecret);
  } catch (error) {
    console.error("Error constructing event", error);
    throw new AppError(status.BAD_REQUEST, "Error constructing event");
  }
  try {
    const result = await PaymentService.handleStripeWebhook(event);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Stripe webhook processed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error processing webhook", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Error processing webhook");
  }
});

export const PaymentController = {
  handleStripeWebhook,
};
