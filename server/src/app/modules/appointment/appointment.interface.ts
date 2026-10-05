import { AppointmentStatus } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces";

export interface IAppointmentPayload{
    doctorId: string;
    scheduleId: string;
}
export interface IUpdateAppointmentPayload{
    doctorId?: string;
    scheduleId?: string;
    status?: string;

}
export interface IAppointmentQueryParams extends IQueryParams {}
export interface IUpdateAppointmentStatus {
    status: AppointmentStatus;
}