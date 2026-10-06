import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { PatientService } from "./patient.service";
import { IQueryParams } from "../../interfaces";

const getPatientById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const patient = await PatientService.getPatientById(id as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Patient fetched successfully",
        data: patient,
    });
});

const getAllPatients = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await PatientService.getAllPatients(query as IQueryParams);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "All patients fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

export const PatientController = {
    getPatientById,
    getAllPatients,
};
