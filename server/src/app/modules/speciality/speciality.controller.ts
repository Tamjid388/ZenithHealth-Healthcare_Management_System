import { Request, Response } from "express";
import status from "http-status";
import { SpecialityService } from "./speciality.service";

import { catchAsync } from "../../../app/shared/catchAsync";
import { sendResponse } from "../../../app/shared/sendResponse";
import { IQueryParams } from "../../../app/interfaces";

const createSpeciality=catchAsync(async (req: Request, res: Response) => {
  const payload={
    ...req.body,
    icon:req.file?.path
  }
  const result = await SpecialityService.createSpeciality(payload);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Speciality Created Successfully",
    data: result,
  });
});




const getAllSpecialities = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await SpecialityService.getAllSpecialities(query as IQueryParams);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Specialities fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const deleteSpecialityById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpecialityService.deleteSpecialityById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Speciality deleted successfully",
    data: result,
  });
});

const updateSpeciality = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = {
    ...req.body,
    ...(req.file?.path ? { icon: req.file.path } : {}),
  };

  const result = await SpecialityService.updateSpeciality(id as string, data);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Speciality updated successfully",
    data: result,
  });
});

export const SpecialityController = {
  createSpeciality,
  getAllSpecialities,
  deleteSpecialityById,
  updateSpeciality,
};
