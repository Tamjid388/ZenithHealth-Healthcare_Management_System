import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";
import { DoctorScheduleController } from "./doctorschedule.controller";
import { DoctorScheduleValidation } from "./doctorschedule.validator";

const router = Router();

router.post(
  "/my",
  checkAuth(Role.DOCTOR),
  validateRequest(DoctorScheduleValidation.createDoctorScheduleZodSchema),
  DoctorScheduleController.createMyDoctorSchedule,
);

router.get(
  "/my",
  checkAuth(Role.DOCTOR),
  DoctorScheduleController.getMyDoctorSchedules,
);

router.patch(
  "/my",
  checkAuth(Role.DOCTOR),
  validateRequest(DoctorScheduleValidation.updateDoctorScheduleZodSchema),
  DoctorScheduleController.updateMyDoctorSchedule,
);

router.delete(
  "/my/:id",
  checkAuth(Role.DOCTOR),
  DoctorScheduleController.deleteMyDoctorSchedule,
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DoctorScheduleController.getAllDoctorSchedules,
);

router.get(
  "/:doctorId/:scheduleId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  DoctorScheduleController.getDoctorScheduleById,
);

export const DoctorScheduleRoutes = router;
