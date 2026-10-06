import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interfaces";
import { Patient, Prisma } from "../../../generated/prisma/client";
import { QueryBuilder } from "../../utils/queryBuilder";

const patientSearchableFields = ["name", "email", "contactNumber"];

const patientFilterableFields = ["name", "email", "isDeleted"];

const getPatientById = async (id: string) => {
    const patient = await prisma.patient.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
            appointments: true,
            prescriptions: true,
            reviews: true,
            medicalReports: true,
            patientHealthData: true,
        },
    });
    if (!patient) {
        throw new AppError(status.NOT_FOUND, "Patient not found");
    }

    return patient;
};

const getAllPatients = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<
        Patient,
        Prisma.PatientWhereInput,
        Prisma.PatientInclude
    >(prisma.patient, query, {
        searchableFields: patientSearchableFields,
        filterableFields: patientFilterableFields,
    });

    const result = await queryBuilder
        .search()
        .filter()
        .where({ isDeleted: false })
        .paginate()
        .sort()
        .execute();

    return result;
};

export const PatientService = {
    getPatientById,
    getAllPatients,
};
