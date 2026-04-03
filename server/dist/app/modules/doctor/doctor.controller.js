import { catchAsync } from "../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
const getAllDoctors = catchAsync(async (req, res) => {
    const result = await DoctorService.getAllDoctors();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctors Retrived successfully",
        data: result
    });
});
const getDoctorById = catchAsync(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new Error("Doctor ID is required");
    }
    const result = await DoctorService.getDoctorById(id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctor Retrived successfully",
        data: result
    });
});
const updateDoctor = catchAsync(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new Error("Doctor ID is required");
    }
    const result = await DoctorService.updateDoctor(id, req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctor Updated successfully",
        data: result
    });
});
const deleteDoctor = catchAsync(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new Error("Doctor ID is required");
    }
    const result = await DoctorService.deleteDoctor(id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctor Deleted successfully",
        data: result
    });
});
export const DoctorController = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
};
