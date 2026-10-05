import { randomUUID } from "node:crypto";
import status from "http-status";
import { Appointment, Prisma } from "../../../generated/prisma/client";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams, IReqUser } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import { IAppointmentPayload } from "./appointment.interface";

const appointmentSearchableFields = ["doctor.name", "doctor.email"];

const appointmentFilterableFields = [
  "status",
  "paymentStatus",
  "doctorId",
  "scheduleId",
  "doctor.name",
  "doctor.email",
];

const appointmentInclude = {
  doctor: {
    include: {
      user: true,
    },
  },
  patient: true,
  schedule: true,
  payment: true,
} satisfies Prisma.AppointmentInclude;

const bookAppointment = async (payload: IAppointmentPayload, user: IReqUser) => {
  const patientData = await prisma.patient.findFirstOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });
  const doctorSchedules = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: payload.doctorId,
        scheduleId: payload.scheduleId,
      },
    },
  });

  if (doctorSchedules.isBooked) {
    throw new AppError(status.BAD_REQUEST, "Slot already booked");
  }

  const result = await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.create({
      data: {
        videoCallingId: randomUUID(),
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: doctorSchedules.scheduleId,
      },
    });

    // Atomic claim: only one booking can flip the slot from free to booked.
    const slotUpdate = await tx.doctorSchedules.updateMany({
      where: {
        doctorId: payload.doctorId,
        scheduleId: payload.scheduleId,
        isBooked: false,
      },
      data: {
        isBooked: true,
      },
    });
    if (slotUpdate.count === 0) {
      throw new AppError(status.BAD_REQUEST, "Slot already booked");
    }

    // Placeholder row — stays UNPAID until the future payment EPIC wires Stripe.
    const paymentData = await tx.payment.create({
      data: {
        amount: doctorData.appointmentFee,
        transactionId: randomUUID(),
        appointmentId: appointment.id,
      },
    });
    return {
      appointment,
      paymentData,
    };
  });
  return {
    appointment: result.appointment,
    paymentData: result.paymentData,
  };
};

const getMyAppointments = async (user: IReqUser, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Appointment,
    Prisma.AppointmentWhereInput,
    Prisma.AppointmentInclude
  >(prisma.appointment, query, {
    searchableFields: appointmentSearchableFields,
    filterableFields: appointmentFilterableFields,
  });

  if (user.role === Role.PATIENT) {
    queryBuilder.where({ patient: { email: user.email } });
  } else if (user.role === Role.DOCTOR) {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        userId: user.userId,
      },
    });
    queryBuilder.where({ doctorId: doctorData.id });
  }
  // ADMIN / SUPER_ADMIN: no ownership filter, see all rows.

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .include(appointmentInclude)
    .sort()
    .execute();

  return result;
};

const assertAppointmentOwnership = async (
  appointment: Appointment & { patient: { email: string } },
  user: IReqUser,
) => {
  if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
    return;
  }
  if (user.role === Role.PATIENT) {
    if (appointment.patient.email !== user.email) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not authorized to access this appointment",
      );
    }
    return;
  }
  if (user.role === Role.DOCTOR) {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        userId: user.userId,
      },
    });
    if (appointment.doctorId !== doctorData.id) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not authorized to access this appointment",
      );
    }
  }
};

const getAppointmentById = async (id: string, user: IReqUser) => {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: {
      id,
    },
    include: appointmentInclude,
  });
  await assertAppointmentOwnership(appointment, user);
  return appointment;
};

const cancelAppointment = async (id: string, user: IReqUser) => {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      patient: true,
    },
  });
  await assertAppointmentOwnership(appointment, user);

  if (appointment.status !== AppointmentStatus.SCHEDULED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only scheduled appointments can be canceled",
    );
  }

  // If paymentStatus is PAID, refund stays manual (Stripe dashboard) in this EPIC.
  const updatedAppointment = await prisma.$transaction(async (tx) => {
    const canceled = await tx.appointment.update({
      where: {
        id,
      },
      data: {
        status: AppointmentStatus.CANCELED,
      },
    });

    const otherActiveAppointments = await tx.appointment.count({
      where: {
        doctorId: appointment.doctorId,
        scheduleId: appointment.scheduleId,
        status: {
          not: AppointmentStatus.CANCELED,
        },
        id: {
          not: id,
        },
      },
    });
    if (otherActiveAppointments === 0) {
      await tx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: appointment.doctorId,
            scheduleId: appointment.scheduleId,
          },
        },
        data: {
          isBooked: false,
        },
      });
    }
    return canceled;
  });

  return updatedAppointment;
};

export const AppointmentService = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
};
