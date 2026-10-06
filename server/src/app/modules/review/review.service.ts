import status from "http-status";
import {
  AppointmentStatus,
  Prisma,
  Review,
} from "../../../generated/prisma/client";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams, IReqUser } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import {
  reviewFilterableFields,
  reviewIncludeConfig,
  reviewSearchableFields,
} from "./review.constants";
import {
  ICreateReviewPayload,
  IUpdateReviewPayload,
} from "./review.interface";

type ReviewTx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const recomputeDoctorAverage = async (
  tx: ReviewTx,
  doctorId: string,
) => {
  const aggregate = await tx.review.aggregate({
    where: { doctorId },
    _avg: { rating: true },
  });
  await tx.doctor.update({
    where: { id: doctorId },
    data: { averageRating: aggregate._avg.rating ?? 0 },
  });
};

const createReview = async (user: IReqUser, payload: ICreateReviewPayload) => {
  const patient = await prisma.patient.findFirstOrThrow({
    where: { email: user.email },
  });

  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: payload.appointmentId },
    include: { review: true },
  });

  if (appointment.patientId !== patient.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only review your own appointments",
    );
  }

  if (appointment.status !== AppointmentStatus.COMPLETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only completed appointments can be reviewed",
    );
  }

  if (appointment.review) {
    throw new AppError(
      status.CONFLICT,
      "This appointment has already been reviewed",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        appointmentId: payload.appointmentId,
        patientId: patient.id,
        doctorId: appointment.doctorId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    await recomputeDoctorAverage(tx, appointment.doctorId);

    return review;
  });

  return result;
};

const getMyReviews = async (user: IReqUser, query: IQueryParams) => {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const queryBuilder = new QueryBuilder<
    Review,
    Prisma.ReviewWhereInput,
    Prisma.ReviewInclude
  >(prisma.review, query, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ doctorId: doctor.id })
    .paginate()
    .include({
      appointment: {
        include: {
          schedule: true,
        },
      },
      patient: {
        select: {
          name: true,
        },
      },
    })
    .sort()
    .fields()
    .dynamicInclude(reviewIncludeConfig)
    .execute();

  return result;
};

const getAllReviews = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Review,
    Prisma.ReviewWhereInput,
    Prisma.ReviewInclude
  >(prisma.review, query, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .include({
      doctor: {
        select: {
          id: true,
          name: true,
        },
      },
      patient: {
        select: {
          name: true,
        },
      },
      appointment: {
        select: {
          id: true,
          status: true,
        },
      },
    })
    .sort()
    .fields()
    .dynamicInclude(reviewIncludeConfig)
    .execute();

  return result;
};

const getReviewById = async (id: string, user: IReqUser) => {
  const review = await prisma.review.findUniqueOrThrow({
    where: { id },
    include: {
      appointment: {
        include: {
          schedule: true,
        },
      },
      patient: {
        select: {
          name: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (user.role === Role.PATIENT) {
    const patient = await prisma.patient.findFirstOrThrow({
      where: { email: user.email },
    });
    if (review.patientId !== patient.id) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not authorized to access this resource",
      );
    }
  }

  if (user.role === Role.DOCTOR) {
    const doctor = await prisma.doctor.findUniqueOrThrow({
      where: { userId: user.userId },
    });
    if (review.doctorId !== doctor.id) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not authorized to access this resource",
      );
    }
  }

  return review;
};

const updateReview = async (
  id: string,
  user: IReqUser,
  payload: IUpdateReviewPayload,
) => {
  const patient = await prisma.patient.findFirstOrThrow({
    where: { email: user.email },
  });

  const existing = await prisma.review.findUniqueOrThrow({
    where: { id },
  });

  if (existing.patientId !== patient.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only update your own reviews",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.update({
      where: { id },
      data: {
        ...(payload.rating !== undefined ? { rating: payload.rating } : {}),
        ...(payload.comment !== undefined ? { comment: payload.comment } : {}),
      },
    });

    await recomputeDoctorAverage(tx, review.doctorId);

    return review;
  });

  return result;
};

const deleteReview = async (id: string) => {
  const existing = await prisma.review.findUniqueOrThrow({
    where: { id },
  });

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({
      where: { id },
    });

    await recomputeDoctorAverage(tx, existing.doctorId);
  });
};

export const ReviewService = {
  createReview,
  getMyReviews,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
