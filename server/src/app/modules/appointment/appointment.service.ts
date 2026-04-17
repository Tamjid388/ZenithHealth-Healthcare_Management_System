import { uuidv7 } from "zod";
import { IReqUser } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { IAppointmentPayload } from "./appointment.interface";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";
import app from "../../../app";

const bookAppointment = async (
  payload: IAppointmentPayload,
  user: IReqUser,
) => {
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

  const videoCallingId = String(uuidv7()); //generate a unique video calling id
  const result = await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.create({
      data: {
        videoCallingId,
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: doctorSchedules.scheduleId,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });
    // todo payment integration
    const transactionId = String(uuidv7());
    const paymentData = await tx.payment.create({
      data: {
        amount: doctorData.appointmentFee,
        transactionId,
        appointmentId: appointment.id,
      },
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appointment with ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 122,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointment.id,
        paymentId: paymentData.id,
      },
      success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-cancel`,
    });
    return {
      appointment,
      paymentData,
     paymentUrl:session.url,
    };
  });
 return {
  appointment:result.appointment,
  paymentData:result.paymentData,
  paymentUrl:result.paymentUrl,
 }
};

const getMyAppointments = async (user: IReqUser) => {
  const patientData = await prisma.patient.findFirstOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: {
      email: user.email,
    },
  });
};

export const AppointmentService = {
  bookAppointment,
};

// 41.7