import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces";

const bookAppointment = catchAsync( async (req : Request, res : Response) => {
    const payload = req.body;
    const user = req.user;
    if (!user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }
    const appointment = await AppointmentService.bookAppointment(payload, user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED, 
        message: 'Appointment booked successfully',
        data: appointment
    });
});

const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }
    const query = req.query;
    const result = await AppointmentService.getMyAppointments(user, query as IQueryParams);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Appointments retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});

const getAppointmentById = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }
    const { id } = req.params;
    const appointment = await AppointmentService.getAppointmentById(id as string, user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Appointment retrieved successfully',
        data: appointment,
    });
});

const cancelAppointment = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }
    const { id } = req.params;
    const appointment = await AppointmentService.cancelAppointment(id as string, user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Appointment canceled successfully',
        data: appointment,
    });
});

export const AppointmentController = {
    bookAppointment,
    getMyAppointments,
    getAppointmentById,
    cancelAppointment,
};
