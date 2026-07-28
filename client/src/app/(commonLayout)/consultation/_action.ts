'use server'
import { httpClient } from "@/lib/axios/httpClient";

export type DoctorSpeciality = {
  id: string;
  speciality?: {
    id: string;
    title: string;
  } | null;
};

export type Doctor = {
  id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  contactNumber: string | null;
  address: string | null;
  experience: number;
  gender: string;
  appointmentFee: number;
  qualifications: string;
  currentWorkingPlace: string | null;
  designation: string | null;
  averageRating: number;
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

export const getDoctors = async (): Promise<DoctorsResponse> => {
  return httpClient.get("/doctors");
};
