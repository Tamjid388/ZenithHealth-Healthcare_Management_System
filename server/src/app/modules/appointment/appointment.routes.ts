import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";
import { AppointmentController } from "./appointment.controller";
import { AppointmentValidation } from "./appointment.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.PATIENT),
  validateRequest(AppointmentValidation.bookAppointmentZodSchema),
  AppointmentController.bookAppointment,
);

router.get(
  "/my",
  checkAuth(Role.PATIENT, Role.DOCTOR),
  AppointmentController.getMyAppointments,
);

router.get(
  "/:id",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  AppointmentController.getAppointmentById,
);

router.patch(
  "/:id/cancel",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  AppointmentController.cancelAppointment,
);

export const AppointmentRoutes = router;
