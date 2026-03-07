import express from "express";
import { SpecialityController } from "./speciality.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { SpecialityZodValidation } from "./speciality.validate";
import validateRequest from "../../middleware/validateRequest";


const router = express.Router();

router.post("/create-speciality",
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN),

    multerUpload.single("file"),
    validateRequest(SpecialityZodValidation.CreateSpecialityZodSchema),
    SpecialityController.createSpeciality);

router.get("/", checkAuth(Role.PATIENT), SpecialityController.getAllSpecialities);


router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialityController.deleteSpecialityById);
router.patch("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialityController.updateSpeciality);
export const SpecialityRoutes = router;