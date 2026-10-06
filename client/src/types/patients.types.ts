export type Patient = {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type PatientDetails = Patient & {
  user?: {
    id: string;
    name: string;
    email: string;
    status: string;
    emailVerified?: boolean;
  } | null;
  appointments?: unknown[];
  prescriptions?: unknown[];
  reviews?: unknown[];
  medicalReports?: unknown[];
  patientHealthData?: unknown | null;
};

export type PatientsQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  name?: string;
  email?: string;
  isDeleted?: boolean;
};

export const DEFAULT_PATIENTS_LIST_PARAMS: PatientsQueryParams = {
  page: 1,
  limit: 10,
};
