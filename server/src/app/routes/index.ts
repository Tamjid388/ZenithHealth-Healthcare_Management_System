import { Router } from "express";
import { SpecialityRoutes } from "../../modules/speciality/speciality.routes";

const router=Router()

router.use("/speciality",SpecialityRoutes)
export const IndexRoutes=router