import { Request, Response } from "express";
import { SpecialityService } from "./speciality.service";

import { catchAsync } from "../../app/shared/catchAsync";
import { sendResponse } from "../../app/shared/sendResponse";



const createSpeciality = async (req: Request, res: Response) => {
  const result = await SpecialityService.createSpeciality(req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Speciality Created Successfully",
    data: result,
  });
};

const getAllSpecialities = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialityService.getAllSpecialities();
  res.status(200).json({
    success: true,
    message: "Specialities fetched successfully",
    data: result,
  });
});

const deleteSpecialityById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpecialityService.deleteSpecialityById(id as string);
  res.status(200).json({
    success: true,
    message: "Specialities fetched successfully",
    data: result,
  });
});

const updateSpeciality = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await SpecialityService.updateSpeciality(id as string, data);

    res.status(200).json({
      success: true,
      message: "Speciality updated successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: "Failed to update speciality",
    });
  }
};

export const SpecialityController = {
  createSpeciality,
  getAllSpecialities,
  deleteSpecialityById,
  updateSpeciality,
};
