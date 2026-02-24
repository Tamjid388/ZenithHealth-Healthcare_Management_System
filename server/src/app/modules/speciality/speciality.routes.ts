import express, { NextFunction, Request, Response } from "express";
import { SpecialityController } from "./speciality.controller";
import { cookieUtils } from "../../utils/cookie";

import AppError from "../../errorHelpers/AppError";

import { envVars } from "../../config/env";
import { jwtUtils } from "../../utils/jwt";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";


const router = express.Router();

router.post("/create-speciality", SpecialityController.createSpeciality);
router.get("/", checkAuth(Role.PATIENT), SpecialityController.getAllSpecialities);


router.delete("/:id", SpecialityController.deleteSpecialityById);
router.patch("/:id", SpecialityController.updateSpeciality);
export const SpecialityRoutes = router;