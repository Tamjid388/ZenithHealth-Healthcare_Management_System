import { Router } from "express";
import { userController } from "./user.controller";
import validateRequest from "../../middleware/validateRequest";
import { createAdminZodSchema, createDoctorZodSchema, updateMyProfileZodSchema } from "./user.validator";
import { checkAuth } from "../../middleware/checkAuth";
import { role } from "better-auth/plugins";
import { Role } from "../../../generated/prisma/enums";


const router = Router()

router.post(
  "/create-doctor",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createDoctorZodSchema),
  userController.createDoctor,
)

router.post("/create-admin",validateRequest(createAdminZodSchema)
,checkAuth(Role.SUPER_ADMIN)
,userController.createAdmin)
// router.post("/create-superadmin",userController.createNurse)

router.patch(
  "/me",
  checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
  validateRequest(updateMyProfileZodSchema),
  userController.updateMe,
)


export const userRoutes = router;