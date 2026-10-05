"use client";

import AppointmentBarChart from "@/components/shared/AppointmentBarChart";
import AppointmentPieChart from "@/components/shared/AppointmentPieChart";
import StatsCard from "@/components/shared/StatsCard";
import { getDashboardData } from "@/services/dashboard.service";
import { IAdminDashboardData } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";

type DashboardStatKey = keyof Pick<
  IAdminDashboardData,
  | "appointmentCount"
  | "doctorCount"
  | "patientCount"
  | "userCount"
  | "adminCount"
  | "superAdminCount"
  | "paymentCount"
  | "totalRevenue"
>;

const STAT_CARDS: {
  key: DashboardStatKey;
  title: string;
  iconName: string;
  description: string;
  format?: "currency";
}[] = [
  {
    key: "appointmentCount",
    title: "Appointments",
    iconName: "CalendarClock",
    description: "Total appointments",
  },
  {
    key: "doctorCount",
    title: "Doctors",
    iconName: "Stethoscope",
    description: "Registered doctors",
  },
  {
    key: "patientCount",
    title: "Patients",
    iconName: "HeartPulse",
    description: "Registered patients",
  },
  {
    key: "userCount",
    title: "Users",
    iconName: "Users",
    description: "All accounts",
  },
  {
    key: "adminCount",
    title: "Admins",
    iconName: "Shield",
    description: "Admin accounts",
  },
  {
    key: "superAdminCount",
    title: "Super admins",
    iconName: "ShieldCheck",
    description: "Super admin accounts",
  },
  {
    key: "paymentCount",
    title: "Payments",
    iconName: "CreditCard",
    description: "Payment records",
  },
  {
    key: "totalRevenue",
    title: "Revenue",
    iconName: "Banknote",
    description: "Paid payments total",
    format: "currency",
  },
];

const formatStatValue = (value: number, format?: "currency") => {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  return value.toLocaleString("en-US");
};

const AdminDashboardContent = () => {
  const { data: adminDashboardData, isPending } = useQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: getDashboardData,
    staleTime: 1000 * 30,
  });

  const stats =
    adminDashboardData?.success === true ? adminDashboardData.data : undefined;

  const barChartData = (stats?.barChartData ?? []).map((item) => {
    const date = new Date(item.month);
    const month = Number.isNaN(date.getTime())
      ? String(item.month)
      : date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

    return {
      month,
      appointments: Number(item.count),
    };
  });

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Loading dashboard stats…</p>
    );
  }

  if (!stats) {
    return (
      <p className="text-sm text-muted-foreground">
        {adminDashboardData?.message ?? "Dashboard stats are unavailable."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.filter((card) => stats[card.key] !== undefined).map(
          (card) => (
            <StatsCard
              key={card.key}
              title={card.title}
              iconName={card.iconName}
              description={card.description}
              value={formatStatValue(Number(stats[card.key]), card.format)}
            />
          ),
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <AppointmentPieChart
          data={stats.pieChartData}
          title="Appointment status"
          description="Distribution of appointment statuses"
        />
        <AppointmentBarChart data={barChartData} />
      </div>
    </div>
  );
};

export default AdminDashboardContent;
