import { Router } from "express";
import { SpecialityRoutes } from "../modules/speciality/speciality.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.route";
import { DoctorRoutes } from "../modules/doctor/doctor.routes";
import { adminRoutes } from "../modules/admin/admin.route";


const router=Router()
router.use("/auth",AuthRoutes)
router.use("/speciality",SpecialityRoutes)
router.use("/users",userRoutes)
router.use("/doctors",DoctorRoutes)
router.use("/admin",adminRoutes)
export const IndexRoutes=router