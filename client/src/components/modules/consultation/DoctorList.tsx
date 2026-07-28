"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getDoctors, type Doctor } from "@/app/(commonLayout)/consultation/_action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const specialties =
    doctor.doctorSpecialities
      ?.map((item) => item.speciality?.title)
      .filter((title): title is string => Boolean(title)) ?? [];

  return (
    <Card className="h-full bg-white/90 ring-zh-teal-deep/10 transition-shadow duration-300 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-16">
            {doctor.profilePhoto ? (
              <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
            ) : null}
            <AvatarFallback className="bg-zh-foam text-zh-teal-deep">
              {getInitials(doctor.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <CardTitle className="truncate text-lg text-zh-ink">
              {doctor.name}
            </CardTitle>
            <CardDescription className="mt-1 text-zh-ink/65">
              {doctor.designation || "Physician"}
              {doctor.currentWorkingPlace
                ? ` · ${doctor.currentWorkingPlace}`
                : ""}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm leading-relaxed text-zh-ink/70">
          {doctor.qualifications}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-zh-ink/70">
          <span className="rounded-md bg-zh-foam px-2 py-1">
            {doctor.experience} yrs exp
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-zh-foam px-2 py-1">
            <Star className="size-3 fill-zh-teal text-zh-teal" aria-hidden />
            {doctor.averageRating.toFixed(1)}
          </span>
          <span className="rounded-md bg-zh-foam px-2 py-1">
            Fee ৳{doctor.appointmentFee}
          </span>
        </div>

        {specialties.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {specialties.slice(0, 3).map((title) => (
              <span
                key={title}
                className="rounded-md border border-zh-teal-deep/15 px-2 py-1 text-xs text-zh-teal-deep"
              >
                {title}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="border-zh-teal-deep/10 bg-zh-mist/40">
        <Link href={`/consultation/doctor/${doctor.id}`} className="w-full">
          <Button className="w-full bg-zh-teal text-primary-foreground hover:bg-zh-teal-deep">
            View profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function DoctorListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-xl bg-white p-5 ring-1 ring-zh-teal-deep/10">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export const DoctorList = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });
console.log(data)
  const doctors = data?.data ?? [];

  return (
    <section className="bg-zh-mist px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h1 className="font-heading text-4xl tracking-tight text-zh-teal-deep sm:text-5xl">
            Consultation
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zh-ink/70 sm:text-lg">
            Browse available doctors and book a visit that fits your care needs.
          </p>
        </div>

        <div className="mt-10">
          {isLoading ? <DoctorListSkeleton /> : null}

          {isError ? (
            <p className="rounded-xl bg-white px-4 py-6 text-sm text-destructive ring-1 ring-destructive/20">
              {error instanceof Error
                ? error.message
                : "Failed to load doctors. Please try again."}
            </p>
          ) : null}

          {!isLoading && !isError && doctors.length === 0 ? (
            <p className="rounded-xl bg-white px-4 py-10 text-center text-sm text-zh-ink/65 ring-1 ring-zh-teal-deep/10">
              No doctors available right now. Check back soon.
            </p>
          ) : null}

          {!isLoading && !isError && doctors.length > 0 ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <li key={doctor.id}>
                  <DoctorCard doctor={doctor} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
};
