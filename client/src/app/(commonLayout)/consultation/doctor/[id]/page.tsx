import { notFound } from "next/navigation";

import { DoctorDetails } from "@/components/modules/consultation/DoctorDetails";
import { getDoctorById } from "@/services/doctors.service";
import { getMyProfile } from "@/services/profile.service";
import type { TAuthUser } from "@/lib/authUtlils";

interface ConsultationDoctorPageProps {
  params: Promise<{ id: string }>;
}

async function ConsultationDoctorPage({ params }: ConsultationDoctorPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  try {
    const response = await getDoctorById(id);

    if (!response?.data) {
      notFound();
    }

    let viewerRole: TAuthUser | null = null;
    try {
      const profile = await getMyProfile();
      viewerRole = profile.role ?? null;
    } catch {
      viewerRole = null;
    }

    return <DoctorDetails doctor={response.data} viewerRole={viewerRole} />;
  } catch {
    notFound();
  }
}

export default ConsultationDoctorPage;
