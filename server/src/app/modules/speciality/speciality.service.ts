import { prisma } from "../../../app/lib/prisma";
import { Prisma, Speciality } from "../../../generated/prisma/client";
import { IQueryParams } from "../../../app/interfaces";
import { QueryBuilder } from "../../../app/utils/queryBuilder";

const specialitySearchableFields = ["title", "description"];

const specialityFilterableFields = ["title", "isDeleted"];

const createSpeciality = async (payload: Speciality): Promise<Speciality> => {
  const speciality = await prisma.speciality.create({
    data: payload,
  });
  return speciality;
};
const getAllSpecialities = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Speciality,
    Prisma.SpecialityWhereInput,
    Prisma.SpecialityInclude
  >(prisma.speciality, query, {
    searchableFields: specialitySearchableFields,
    filterableFields: specialityFilterableFields,
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

const deleteSpecialityById = async (id: string): Promise<Speciality> => {
  await prisma.speciality.findFirstOrThrow({
    where: { id, isDeleted: false },
  });
  const speciality = await prisma.speciality.update({
    where: { id },
    data: { isDeleted: true },
  });
  return speciality;
};

const updateSpeciality = async (
  id: string,
  payload: Partial<Speciality>,
): Promise<Speciality | null> => {
  await prisma.speciality.findFirstOrThrow({
    where: { id, isDeleted: false },
  });
  const updatedInfo = await prisma.speciality.update({
    data: payload,
    where: {
      id,
    },
  });
  return updatedInfo;
};

export const SpecialityService = {
  createSpeciality,
  getAllSpecialities,
  deleteSpecialityById,
  updateSpeciality,
};
