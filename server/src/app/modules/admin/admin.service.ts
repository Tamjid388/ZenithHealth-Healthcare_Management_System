import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IQueryParams, IReqUser } from "../../interfaces";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { Admin, Prisma, User } from "../../../generated/prisma/client";
import { QueryBuilder } from "../../utils/queryBuilder";
import { IAdminListItem, IUPdateAdmin } from "./admin.interface";

const adminSearchableFields = ["name", "email"];

const adminFilterableFields = ["name", "email", "isDeleted"];

type UserWithAdminRow = User & { admins: Admin[] };

const toAdminListItem = (user: UserWithAdminRow): IAdminListItem => {
  const profileRow = user.admins[0] ?? null;
  return {
    id: profileRow?.id ?? user.id,
    adminId: profileRow?.id ?? null,
    userId: user.id,
    name: profileRow?.name ?? user.name,
    email: user.email,
    profilePhoto: profileRow?.profilePhoto ?? user.image ?? null,
    contactNumber: profileRow?.contactNumber ?? null,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    isDeleted: user.isDeleted,
    createdAt: profileRow?.createdAt ?? user.createdAt,
    updatedAt: profileRow?.updatedAt ?? user.updatedAt,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    },
  };
};

// Resolve the target user from either an `admin` row id or a `user` id.
// Only ADMIN / SUPER_ADMIN users are manageable here.
const resolveManagedUser = async (id: string): Promise<UserWithAdminRow> => {
  const byAdminRow = await prisma.admin.findUnique({
    where: { id },
    include: { user: true },
  });
  if (byAdminRow) {
    const user = await prisma.user.findUnique({
      where: { id: byAdminRow.userId },
      include: { admins: true },
    });
    if (!user) {
      throw new AppError(status.NOT_FOUND, "Admin not found");
    }
    return user;
  }
  const user = await prisma.user.findUnique({
    where: { id },
    include: { admins: true },
  });
  if (
    !user ||
    (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)
  ) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }
  return user;
};

const getAdminById = async (id: string) => {
  const user = await resolveManagedUser(id);
  return toAdminListItem(user);
};

const getAllAdmins = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    User,
    Prisma.UserWhereInput,
    Prisma.UserInclude
  >(prisma.user, query, {
    searchableFields: adminSearchableFields,
    filterableFields: adminFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ isDeleted: false, role: { in: [Role.ADMIN, Role.SUPER_ADMIN] } })
    .paginate()
    .include({ admins: true })
    .sort()
    .execute();

  const users = result.data as unknown as UserWithAdminRow[];

  return {
    data: users.map(toAdminListItem),
    meta: result.meta,
  };
};
const updateAdmin = async (id: string, updateData: IUPdateAdmin) => {
  const user = await resolveManagedUser(id);
  const { admin } = updateData;
  if (!admin || Object.keys(admin).length === 0) {
    throw new AppError(status.BAD_REQUEST, "No admin data provided to update");
  }
  const { name, profilePhoto, contactNumber } = admin;
  await prisma.$transaction(async (tx) => {
    if (name !== undefined || profilePhoto !== undefined) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(profilePhoto !== undefined ? { image: profilePhoto } : {}),
        },
      });
    }
    const profileData: { name?: string; profilePhoto?: string; contactNumber?: string } = {
      ...(name !== undefined ? { name } : {}),
      ...(profilePhoto !== undefined ? { profilePhoto } : {}),
      ...(contactNumber !== undefined ? { contactNumber } : {}),
    };
    if (Object.keys(profileData).length > 0) {
      await tx.admin.upsert({
        where: { userId: user.id },
        create: {
          name: name ?? user.name,
          email: user.email,
          profilePhoto,
          contactNumber,
          userId: user.id,
        },
        update: profileData,
      });
    }
  });
  const updated = await prisma.user.findUnique({
    where: { id: user.id },
    include: { admins: true },
  });
  return toAdminListItem(updated as UserWithAdminRow);
};

const deleteAdmin = async (id: string, user: IReqUser) => {
  const target = await resolveManagedUser(id);
  if (target.id === user.userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
  }
  await prisma.$transaction(async (tx) => {
    if (target.admins[0]) {
      await tx.admin.update({
        where: { id: target.admins[0].id },
        data: {
          isDeleted: true,
        },
      });
    }

    await tx.user.update({
      where: { id: target.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });
    await tx.session.deleteMany({
      where: { userId: target.id },
    });

    await tx.account.deleteMany({
      where: { userId: target.id },
    });
  });
  const deleted = await prisma.user.findUnique({
    where: { id: target.id },
    include: { admins: true },
  });
  return toAdminListItem(deleted as UserWithAdminRow);
};

export const AdminService = {
  getAdminById,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
};
