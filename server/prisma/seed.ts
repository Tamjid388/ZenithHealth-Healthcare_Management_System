import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AppointmentStatus,
  PaymentStatus,
  PrismaClient,
} from "../src/generated/prisma/client";

const SEED_SOURCE = "prisma-seed";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const REVIEW_COMMENTS = [
  "Clear explanation of next steps.",
  "Visit started on time and felt organized.",
  "Helpful follow-up after the consultation.",
  "Answered questions without rushing.",
];

type DemoRow = {
  monthsAgo: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  withReview: boolean;
  rating: number;
};

const DEMO_ROWS: DemoRow[] = [
  {
    monthsAgo: 5,
    status: AppointmentStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    withReview: true,
    rating: 4.5,
  },
  {
    monthsAgo: 4,
    status: AppointmentStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    withReview: true,
    rating: 5,
  },
  {
    monthsAgo: 3,
    status: AppointmentStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    withReview: true,
    rating: 4,
  },
  {
    monthsAgo: 3,
    status: AppointmentStatus.CANCELED,
    paymentStatus: PaymentStatus.UNPAID,
    withReview: false,
    rating: 0,
  },
  {
    monthsAgo: 2,
    status: AppointmentStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    withReview: true,
    rating: 4.5,
  },
  {
    monthsAgo: 2,
    status: AppointmentStatus.INPROGRESS,
    paymentStatus: PaymentStatus.PAID,
    withReview: false,
    rating: 0,
  },
  {
    monthsAgo: 1,
    status: AppointmentStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    withReview: true,
    rating: 3.5,
  },
  {
    monthsAgo: 1,
    status: AppointmentStatus.SCHEDULED,
    paymentStatus: PaymentStatus.UNPAID,
    withReview: false,
    rating: 0,
  },
  {
    monthsAgo: 0,
    status: AppointmentStatus.SCHEDULED,
    paymentStatus: PaymentStatus.UNPAID,
    withReview: false,
    rating: 0,
  },
  {
    monthsAgo: 0,
    status: AppointmentStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    withReview: true,
    rating: 5,
  },
];

const startOfMonthUtc = (monthsAgo: number, hourOffset: number) => {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 8, 9 + hourOffset, 0, 0),
  );
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return { start, end, createdAt: start };
};

const seed = async () => {
  const existingSeedPayments = await prisma.payment.count({
    where: {
      paymentGatewayData: {
        path: ["source"],
        equals: SEED_SOURCE,
      },
    },
  });

  if (existingSeedPayments > 0) {
    console.log(
      `Seed already applied (${existingSeedPayments} demo payments). Skipping.`,
    );
    return;
  }

  const patients = await prisma.patient.findMany({
    where: { isDeleted: false },
    select: { id: true },
  });
  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    select: { id: true, appointmentFee: true },
  });

  if (patients.length === 0 || doctors.length === 0) {
    throw new Error(
      "Seed needs at least one patient and one doctor. Register those users first, then run pnpm seed.",
    );
  }

  for (const [index, row] of DEMO_ROWS.entries()) {
    const patient = patients[index % patients.length];
    const doctor = doctors[index % doctors.length];
    const { start, end, createdAt } = startOfMonthUtc(row.monthsAgo, index % 6);

    await prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.create({
        data: {
          startDateTime: start,
          endDateTime: end,
          createdAt,
          updatedAt: createdAt,
        },
      });

      await tx.doctorSchedules.create({
        data: {
          doctorId: doctor.id,
          scheduleId: schedule.id,
          isBooked: true,
          createdAt,
          updatedAt: createdAt,
        },
      });

      const appointment = await tx.appointment.create({
        data: {
          videoCallingId: randomUUID(),
          status: row.status,
          paymentStatus: row.paymentStatus,
          patientId: patient.id,
          doctorId: doctor.id,
          scheduleId: schedule.id,
          createdAt,
          updatedAt: createdAt,
        },
      });

      await tx.payment.create({
        data: {
          amount: doctor.appointmentFee,
          transactionId: randomUUID(),
          status: row.paymentStatus,
          paymentGatewayData: { source: SEED_SOURCE },
          appointmentId: appointment.id,
          createdAt,
          updatedAt: createdAt,
        },
      });

      if (row.withReview) {
        await tx.review.create({
          data: {
            rating: row.rating,
            comment: REVIEW_COMMENTS[index % REVIEW_COMMENTS.length],
            appointmentId: appointment.id,
            patientId: patient.id,
            doctorId: doctor.id,
            createdAt,
            updatedAt: createdAt,
          },
        });
      }
    });
  }

  for (const doctor of doctors) {
    const aggregate = await prisma.review.aggregate({
      where: { doctorId: doctor.id },
      _avg: { rating: true },
    });
    await prisma.doctor.update({
      where: { id: doctor.id },
      data: { averageRating: aggregate._avg.rating ?? 0 },
    });
  }

  console.log(
    `Seeded ${DEMO_ROWS.length} appointments with payments` +
      ` and ${DEMO_ROWS.filter((row) => row.withReview).length} reviews.`,
  );
};

seed()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
