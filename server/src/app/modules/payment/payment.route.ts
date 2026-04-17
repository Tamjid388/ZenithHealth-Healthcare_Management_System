import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create-payment-intent",
  checkAuth(Role.PATIENT),
  PaymentController.handleStripeWebhook,
);

export const paymentRoutes = router;
