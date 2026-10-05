
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
BLOCKED = "BLOCKED",
DELETED = "DELETED",
}

export type DoctorSpeciality = {
  specialityId: string;
  doctorId: string;
  speciality: {
    id: string;
    title: string;
    icon?: string | null;
  };
};

export type Doctor = {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  registrationNumber: string;
  experience?: number;
  gender: Gender;
  appointmentFee: number;
  qualifications: string;
  currentWorkingPlace: string;
  designation: string;
  averageRating: number;
  createdAt: Date;
  user: {
    status: UserStatus;
  };
  doctorSpecialities?: DoctorSpeciality[];
};

export type DoctorsResponse = {
  success: boolean;
  message: string;
  data: Doctor[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DoctorsRangeFilter = {
  gte?: string;
  lte?: string;
};

export type DoctorsQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  gender?: string;
  experience?: DoctorsRangeFilter;
  appointmentFee?: DoctorsRangeFilter;
};

export const DEFAULT_DOCTORS_LIST_PARAMS: DoctorsQueryParams = {
  page: 1,
  limit: 10,
};

export type Speciality = {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
};

export interface ICreateDoctorPayload {
  password: string;
  doctor: {
      name: string;
      email: string;
      contactNumber?: string;
      address?: string;
      registrationNumber: string;
      experience: number;
      gender: Gender.MALE | Gender.FEMALE | Gender.OTHER;
      appointmentFee: number;
      qualifications: string;
      currentWorkingPlace: string;
      designation: string;
  };
  specialities: string[];
}

export interface IUpdateDoctorSpecialityChange {
  specialityId: string;
  shouldDelete?: boolean;
}

export interface IUpdateDoctorPayload {
  doctor?: {
    name?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber?: string;
    experience?: number;
    gender?: Gender.MALE | Gender.FEMALE | Gender.OTHER;
    appointmentFee?: number;
    qualifications?: string;
    currentWorkingPlace?: string;
    designation?: string;
  };
  specialities?: IUpdateDoctorSpecialityChange[];
}


export interface IDoctorUserDetails {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  image?: string;
  isDeleted?: boolean;
  deletedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IDoctorReview {
  id?: string;
  rating?: number;
  comment?: string;
  patientId?: string;
  createdAt?: string | Date;
}

export interface IDoctorScheduleItem {
  id?: string;
  isBooked?: boolean;
  schedule?: {
      id?: string;
      startDateTime?: string | Date;
      endDateTime?: string | Date;
  };
}
export interface IDoctorAppointmentItem {
  id?: string;
  status?: string;
  createdAt?: string | Date;
  patient?: {
      id?: string;
      name?: string;
      email?: string;
  };
  schedule?: {
      id?: string;
      startDateTime?: string | Date;
      endDateTime?: string | Date;
  };
  prescription?: {
      id?: string;
  } | null;
}

export interface IDoctorDetails extends Doctor {
  user: {
    status: UserStatus;
  };
  appointments?: IDoctorAppointmentItem[];
  doctorSchedules?: IDoctorScheduleItem[];
  reviews?: IDoctorReview[];
}