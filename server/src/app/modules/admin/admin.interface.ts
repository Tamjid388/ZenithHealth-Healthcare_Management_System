export interface IUPdateAdmin {
  admin?:{
    name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  }
}

// Unified row returned by the admin endpoints. Covers both ADMIN and
// SUPER_ADMIN users, whether or not they have a linked `admin` table row
// (seeded super admins often exist only in `user`).
export interface IAdminListItem {
  id: string;
  adminId: string | null;
  userId: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    emailVerified: boolean;
  };
}
