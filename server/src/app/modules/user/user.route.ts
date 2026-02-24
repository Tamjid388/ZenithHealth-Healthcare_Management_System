import { Router } from "express";
import { userController } from "./user.controller";
import validateRequest from "../../middleware/validateRequest";
import { createAdminZodSchema, createDoctorZodSchema } from "./user.validator";
import { checkAuth } from "../../middleware/checkAuth";
import { role } from "better-auth/plugins";
import { Role } from "../../../generated/prisma/enums";


const router = Router()

router.post("/create-doctor", validateRequest(createDoctorZodSchema), userController.createDoctor)

router.post("/create-admin",validateRequest(createAdminZodSchema)
,checkAuth(Role.SUPER_ADMIN)
,userController.createAdmin)
// router.post("/create-superadmin",userController.createNurse)


export const userRoutes = router;