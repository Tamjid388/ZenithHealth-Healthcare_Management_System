import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router=Router()

router.post("/register",AuthController.registerPatient)
router.post("/login",AuthController.loginUser)
router.post("/me",checkAuth("ADMIN","DOCTOR","PATIENT","SUPER_ADMIN"),AuthController.getMe)
router.post("/refresh-token",AuthController.getNewtoken)
export const AuthRoutes=router

