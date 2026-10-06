import { Router } from "express";
import { PatientController } from "./patient.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    PatientController.getAllPatients,
);
router.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    PatientController.getPatientById,
);

export const patientRoutes = router;
