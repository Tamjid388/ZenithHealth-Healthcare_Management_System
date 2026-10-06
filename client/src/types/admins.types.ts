export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified?: boolean;
};

export type Admin = {
  id: string;
  adminId: string | null;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  role: string;
  status: string;
  emailVerified?: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: AdminUser | null;
};

export type AdminsQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  name?: string;
  email?: string;
  isDeleted?: boolean;
};

export const DEFAULT_ADMINS_LIST_PARAMS: AdminsQueryParams = {
  page: 1,
  limit: 10,
};

export interface ICreateAdminPayload {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
  };
}

export interface IUpdateAdminPayload {
  admin: {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
  };
}
