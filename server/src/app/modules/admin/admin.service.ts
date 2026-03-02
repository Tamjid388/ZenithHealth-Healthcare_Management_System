import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IReqUser } from "../../interfaces";
import { th } from "zod/locales";
import { UserStatus } from "../../../generated/prisma/enums";
const getAdminById = async (id: string) => {
  console.log("Fetching admin with ID:", id);
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

  console.log("Admin fetched:", admin);
  return admin;
};

const getAllAdmins = async () => {
  const admins = await prisma.admin.findMany({
    include: {
      user: true,
    },
  });
  return admins;
};
const updateAdmin = async (id: string, updateData: any) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: {
      id,
    },
  });
  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
  }
  const { admin } = updateData;
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
