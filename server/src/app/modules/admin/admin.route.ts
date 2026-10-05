import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";
import { AdminValidation } from "./admin.validator";
import { Role } from "../../../generated/prisma/enums";

const router = Router()
router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN,Role.PATIENT),
    AdminController.getAllAdmins);
router.get("/:id",checkAuth(Role.ADMIN, Role.SUPER_ADMIN),AdminController.getAdminById)
router.put("/:id",checkAuth(Role.SUPER_ADMIN),validateRequest(AdminValidation.updateAdminZodSchema),AdminController.updateAdmin)
router.delete("/:id",checkAuth(Role.SUPER_ADMIN),AdminController.deleteAdmin)
export const adminRoutes = router