import { isAuthUserRole, TAuthUser } from "@/lib/authUtlils";

export interface UserInfo {
  id : string;
  name : string,
  email : string,
  role : TAuthUser
  image?: string | null;
}

export function isUserInfo(value: unknown): value is UserInfo {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    isAuthUserRole(candidate.role) &&
    (candidate.image === undefined ||
      candidate.image === null ||
      typeof candidate.image === "string")
  )
}

export interface MyPatientProfile {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
  appointments?: unknown[];
  prescriptions?: unknown[];
  medicalReports?: unknown[];
  patientHealthData?: unknown | null;
}

export interface MyDoctorSpeciality {
  specialityId: string;
  doctorId: string;
  speciality?: {
    id: string;
    title: string;
  } | null;
}

export interface MyDoctorProfile {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  registrationNumber?: string | null;
  experience?: number;
  appointmentFee?: number;
  qualifications?: string | null;
  currentWorkingPlace?: string | null;
  designation?: string | null;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
  doctorSpecialities?: MyDoctorSpeciality[];
}

export interface MyAdminProfile {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TMyProfile {
  id: string;
  name: string;
  email: string;
  role: TAuthUser;
  status?: string;
  emailVerified?: boolean;
  needPasswordChange?: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: MyPatientProfile | null;
  doctor?: MyDoctorProfile | null;
  admin?: MyAdminProfile | null;
  admins?: MyAdminProfile[];
}