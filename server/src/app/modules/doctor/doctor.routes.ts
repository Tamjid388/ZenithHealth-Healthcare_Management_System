import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { DoctorController } from "./doctor.controller";

const router = Router();
// Reads stay public by decision: the consultation page needs unauthenticated
// doctor listing. Writes below are gated to ADMIN / SUPER_ADMIN.
router.get("/", DoctorController.getAllDoctors);

router.get("/:id", DoctorController.getDoctorById);
router.put(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DoctorController.updateDoctor,
);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DoctorController.deleteDoctor,
);

export const DoctorRoutes=router