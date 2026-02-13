import express from "express";
import { SpecialityController } from "./speciality.controller";


const router = express.Router();

router.post("/create-speciality", SpecialityController.createSpeciality);
router.get("/", SpecialityController.getAllSpecialities);


router.delete("/:id", SpecialityController.deleteSpecialityById);
router.patch("/:id", SpecialityController.updateSpeciality);
export const SpecialityRoutes = router;