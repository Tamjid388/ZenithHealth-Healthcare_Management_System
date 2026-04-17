import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import AppError from "../../errorHelpers/AppError";

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
