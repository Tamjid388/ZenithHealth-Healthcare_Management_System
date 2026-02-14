import { Router } from "express";
import { SpecialityRoutes } from "../modules/speciality/speciality.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";


const router=Router()
router.use("/auth",AuthRoutes)
router.use("/speciality",SpecialityRoutes)
export const IndexRoutes=router