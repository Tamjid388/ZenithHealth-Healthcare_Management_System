import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IQueryParams, IReqUser } from "../../interfaces";
import { UserStatus } from "../../../generated/prisma/enums";
import { Admin, Prisma } from "../../../generated/prisma/client";
import { QueryBuilder } from "../../utils/queryBuilder";
import { IUPdateAdmin } from "./admin.interface";

const adminSearchableFields = ["name", "email", "contactNumber"];

const adminFilterableFields = ["name", "email", "isDeleted"];

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });
  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  return admin;
};

const getAllAdmins = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Admin,
    Prisma.AdminWhereInput,
    Prisma.AdminInclude
  >(prisma.admin, query, {
    searchableFields: adminSearchableFields,
    filterableFields: adminFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ isDeleted: false })
    .paginate()
    .include({ user: true })
    .sort()
    .execute();

  return result;
};
const updateAdmin = async (id: string, updateData: IUPdateAdmin) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: {
      id,
    },
  });
  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
  }
  const { admin } = updateData;
  if (!admin || Object.keys(admin).length === 0) {
    throw new AppError(status.BAD_REQUEST, "No admin data provided to update");
  }
  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: { ...admin },
  });
  return updatedAdmin;
};

const deleteAdmin = async (id: string, user: IReqUser) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: {
      id,
    },
  });
  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
  }
  if (isAdminExist.userId === user.userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
  }
  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await tx.user.update({
      where: { id: isAdminExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });
    await tx.session.deleteMany({
      where: { userId: isAdminExist.userId },
    });

    await tx.account.deleteMany({
      where: { userId: isAdminExist.userId },
    });

    const admin = await getAdminById(id);

    return admin;
  });
  return result;
};

export const AdminService = {
  getAdminById,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
};
