import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarClock,
  Clock,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Star,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TAuthUser } from "@/lib/authUtlils";
import { IDoctorDetails } from "@/types/doctors.types";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatFee(fee: number) {
  return `৳${(fee ?? 0).toLocaleString("en-BD")}`;
}

function formatSlotDate(value: string | Date) {
  return format(new Date(value), "EEE, d MMM");
}

function formatSlotTime(start: string | Date, end: string | Date) {
  return `${format(new Date(start), "h:mm a")} – ${format(new Date(end), "h:mm a")}`;
}

function RatingStars({ value, className = "size-4" }: { value: number; className?: string }) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`${className} ${i < rounded ? "fill-zh-blue text-zh-blue" : "fill-zh-foam text-zh-foam"}`}
        />
      ))}
    </span>
  );
}

export function DoctorDetails({
  doctor,
  viewerRole = null,
}: {
  doctor: IDoctorDetails;
  viewerRole?: TAuthUser | null;
}) {
  const specialties =
    doctor.doctorSpecialities
      ?.map((item) => item.speciality)
      .filter((s): s is NonNullable<typeof s> => Boolean(s?.title)) ?? [];

  const schedules = (doctor.doctorSchedules ?? [])
    .filter((s) => s.schedule?.startDateTime && s.schedule?.endDateTime)
    .map((s, index) => ({
      key: `${s.schedule?.id ?? `slot-${index}`}`,
      isBooked: Boolean(s.isBooked),
      start: new Date(s.schedule!.startDateTime as string),
      end: new Date(s.schedule!.endDateTime as string),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const upcoming = schedules.filter((s) => s.end.getTime() >= now);
  const openSlots = upcoming.filter((s) => !s.isBooked);
  const nextSlot = openSlots[0];
  const shownSlots = upcoming.slice(0, 8);

  const reviews = [...(doctor.reviews ?? [])].sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });
  const reviewCount = reviews.length;
  const rating = Number.isFinite(doctor.averageRating) ? doctor.averageRating : 0;
  const completedCount = (doctor.appointments ?? []).filter(
    (a) => a.status === "COMPLETED",
  ).length;

  return (
    <section className="bg-zh-mist px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <Link
            href="/consultation"
            className="inline-flex h-11 items-center gap-2 rounded-xl px-3 font-medium text-zh-blue transition-colors hover:bg-white hover:text-zh-blue-deep focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All doctors
          </Link>
          <span aria-hidden="true" className="text-zh-ink/30">
            /
          </span>
          <span className="max-w-56 truncate font-medium text-zh-ink/60 sm:max-w-none">
            {doctor.name}
          </span>
        </nav>

        {/* Profile header */}
        <Card className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-zh-blue-deep/10">
          <div
            aria-hidden="true"
            className="h-20 bg-gradient-to-r from-zh-blue-deep via-zh-blue to-zh-foam sm:h-24"
          />
          <CardContent className="px-5 pb-6 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <Avatar className="-mt-12 size-24 shrink-0 ring-4 ring-white sm:-mt-14 sm:size-28">
                {doctor.profilePhoto ? (
                  <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
                ) : null}
                <AvatarFallback className="bg-zh-foam text-2xl font-semibold text-zh-blue-deep">
                  {getInitials(doctor.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-3xl tracking-tight text-zh-blue-deep sm:text-4xl">
                    {doctor.name}
                  </h1>
                  {doctor.user?.status === "ACTIVE" ? (
                    <Badge className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      <BadgeCheck className="size-3.5" aria-hidden="true" />
                      Verified
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[15px] text-zh-ink/70">
                  {doctor.designation || "Physician"}
                  {doctor.currentWorkingPlace
                    ? ` · ${doctor.currentWorkingPlace}`
                    : ""}
                </p>
                {doctor.qualifications ? (
                  <p className="mt-1 text-sm text-zh-ink/60">
                    {doctor.qualifications}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] font-medium text-zh-ink/75">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zh-foam/70 px-3 py-1.5">
                <Briefcase className="size-4 text-zh-blue" aria-hidden="true" />
                {doctor.experience ?? 0} yrs experience
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zh-foam/70 px-3 py-1.5">
                <Star className="size-4 fill-zh-blue text-zh-blue" aria-hidden="true" />
                {rating.toFixed(1)}
                <span className="font-normal text-zh-ink/55">
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zh-foam/70 px-3 py-1.5">
                <Wallet className="size-4 text-zh-blue" aria-hidden="true" />
                {formatFee(doctor.appointmentFee ?? 0)} / visit
              </span>
              {completedCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zh-foam/70 px-3 py-1.5">
                  <ShieldCheck className="size-4 text-zh-blue" aria-hidden="true" />
                  {completedCount} completed consultations
                </span>
              ) : null}
            </div>

            {specialties.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <Badge
                    key={s.id}
                    variant="secondary"
                    className="rounded-full border border-zh-blue-deep/10 bg-white px-3 py-1.5 text-[13px] font-medium text-zh-blue-deep"
                  >
                    <Stethoscope className="size-3.5" aria-hidden="true" />
                    {s.title}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main column */}
          <div className="min-w-0 space-y-6">
            <Card className="rounded-2xl bg-white ring-1 ring-zh-blue-deep/10">
              <CardHeader>
                <CardTitle className="text-lg text-zh-blue-deep">About</CardTitle>
                <CardDescription>
                  Practice background and credentials at a glance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-zh-mist/60 p-4">
                    <dt className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-zh-ink/55 uppercase">
                      <Building2 className="size-3.5" aria-hidden="true" />
                      Workplace
                    </dt>
                    <dd className="mt-1.5 font-medium text-zh-ink">
                      {doctor.currentWorkingPlace || "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-zh-mist/60 p-4">
                    <dt className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-zh-ink/55 uppercase">
                      <BadgeCheck className="size-3.5" aria-hidden="true" />
                      Registration
                    </dt>
                    <dd className="mt-1.5 font-medium text-zh-ink">
                      {doctor.registrationNumber || "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-zh-mist/60 p-4">
                    <dt className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-zh-ink/55 uppercase">
                      <Briefcase className="size-3.5" aria-hidden="true" />
                      Designation
                    </dt>
                    <dd className="mt-1.5 font-medium text-zh-ink">
                      {doctor.designation || "Physician"}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-zh-mist/60 p-4">
                    <dt className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-zh-ink/55 uppercase">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      Location
                    </dt>
                    <dd className="mt-1.5 font-medium text-zh-ink">
                      {doctor.address || doctor.currentWorkingPlace || "—"}
                    </dd>
                  </div>
                </dl>
                {doctor.qualifications ? (
                  <p className="mt-4 text-sm leading-relaxed text-zh-ink/70">
                    <span className="font-semibold text-zh-ink">Qualifications: </span>
                    {doctor.qualifications}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {specialties.length > 0 ? (
              <Card className="rounded-2xl bg-white ring-1 ring-zh-blue-deep/10">
                <CardHeader>
                  <CardTitle className="text-lg text-zh-blue-deep">
                    Specialties
                  </CardTitle>
                  <CardDescription>
                    Areas this clinician focuses on.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {specialties.map((s) => (
                      <li
                        key={s.id}
                        className="flex gap-3 rounded-xl border border-zh-blue-deep/10 p-4"
                      >
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-zh-foam text-zh-blue">
                          <Stethoscope className="size-5" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block font-semibold text-zh-ink">
                            {s.title}
                          </span>
                          {s.description ? (
                            <span className="mt-1 block text-sm leading-relaxed text-zh-ink/65">
                              {s.description}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-2xl bg-white ring-1 ring-zh-blue-deep/10">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="inline-flex items-center gap-2 text-lg text-zh-blue-deep">
                      <CalendarClock className="size-5" aria-hidden="true" />
                      Availability
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Read-only schedule preview. Booking happens from the
                      patient dashboard.
                    </CardDescription>
                  </div>
                  {openSlots.length > 0 ? (
                    <Badge className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {openSlots.length} open
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                {shownSlots.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-zh-mist/60 px-4 py-8 text-center">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-zh-blue ring-1 ring-zh-blue-deep/10">
                      <Clock className="size-5" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-medium text-zh-ink">
                      No upcoming slots published
                    </p>
                    <p className="max-w-xs text-[13px] text-zh-ink/60">
                      This clinician hasn&apos;t published availability yet.
                      Check back soon.
                    </p>
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {shownSlots.map((slot) => (
                      <li
                        key={slot.key}
                        className={`rounded-xl border p-3.5 ${
                          slot.isBooked
                            ? "border-zh-blue-deep/10 bg-zh-mist/50 text-zh-ink/55"
                            : "border-emerald-600/20 bg-emerald-50/60"
                        }`}
                      >
                        <p className="text-sm font-semibold text-zh-ink">
                          {formatSlotDate(slot.start)}
                        </p>
                        <p className="mt-0.5 text-[13px] text-zh-ink/65">
                          {formatSlotTime(slot.start, slot.end)}
                        </p>
                        <p className="mt-2">
                          {slot.isBooked ? (
                            <Badge
                              variant="outline"
                              className="rounded-full text-xs text-zh-ink/55"
                            >
                              Booked
                            </Badge>
                          ) : (
                            <Badge className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                              Available
                            </Badge>
                          )}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-white ring-1 ring-zh-blue-deep/10">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="inline-flex items-center gap-2 text-lg text-zh-blue-deep">
                      <MessageSquareText className="size-5" aria-hidden="true" />
                      Patient reviews
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {reviewCount === 0
                        ? "No reviews yet for this clinician."
                        : `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"} from past consultations.`}
                    </CardDescription>
                  </div>
                  {reviewCount > 0 ? (
                    <div className="flex items-center gap-2 rounded-xl bg-zh-mist/70 px-3 py-2">
                      <RatingStars value={rating} />
                      <span className="text-sm font-bold text-zh-blue-deep">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                {reviewCount === 0 ? (
                  <p className="rounded-xl bg-zh-mist/60 px-4 py-6 text-center text-sm text-zh-ink/60">
                    Reviews will appear here after completed visits.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {reviews.slice(0, 5).map((review) => (
                      <li
                        key={review.id}
                        className="rounded-xl border border-zh-blue-deep/10 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <RatingStars
                            value={review.rating ?? 0}
                            className="size-3.5"
                          />
                          {review.createdAt ? (
                            <time
                              dateTime={new Date(review.createdAt).toISOString()}
                              className="text-xs text-zh-ink/50"
                            >
                              {format(new Date(review.createdAt), "d MMM yyyy")}
                            </time>
                          ) : null}
                        </div>
                        {review.comment ? (
                          <p className="mt-2 text-sm leading-relaxed text-zh-ink/75">
                            {review.comment}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="min-w-0">
            <div className="space-y-6 lg:sticky lg:top-24">
              <Card className="overflow-hidden rounded-2xl bg-zh-blue-deep text-white ring-1 ring-zh-blue-deep">
                <CardContent className="space-y-4 p-6">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">
                      Consultation fee
                    </p>
                    <p className="mt-1 font-heading text-4xl">
                      {formatFee(doctor.appointmentFee ?? 0)}
                    </p>
                    <p className="mt-1 text-sm text-white/65">per visit</p>
                  </div>
                  <Separator className="bg-white/15" />
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-white/65">Experience</dt>
                      <dd className="font-semibold">
                        {doctor.experience ?? 0} yrs
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-white/65">Rating</dt>
                      <dd className="font-semibold">{rating.toFixed(1)} / 5</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-white/65">Next available</dt>
                      <dd className="text-right font-semibold">
                        {nextSlot ? formatSlotDate(nextSlot.start) : "—"}
                      </dd>
                    </div>
                  </dl>
                  <div className="space-y-2.5 pt-1">
                    {viewerRole === "PATIENT" ? (
                      <Link
                        href={`/dashboard/book-appointments?doctorId=${doctor.id}`}
                        className="block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/60"
                      >
                        <Button className="h-11 w-full cursor-pointer rounded-xl bg-white text-[15px] font-semibold text-zh-blue-deep hover:bg-zh-foam">
                          Book this doctor
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Button>
                      </Link>
                    ) : viewerRole === null ? (
                      <Link
                        href={`/login?redirect=${encodeURIComponent(`/dashboard/book-appointments?doctorId=${doctor.id}`)}`}
                        className="block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/60"
                      >
                        <Button className="h-11 w-full cursor-pointer rounded-xl bg-white text-[15px] font-semibold text-zh-blue-deep hover:bg-zh-foam">
                          Log in to book
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Button>
                      </Link>
                    ) : (
                      <p className="rounded-xl bg-white/10 px-4 py-3 text-center text-sm text-white/75">
                        Booking is for patients. Switch to a patient account
                        to book this doctor.
                      </p>
                    )}
                    <p className="text-center text-xs leading-relaxed text-white/60">
                      {viewerRole === "PATIENT"
                        ? "You will pick a time slot and confirm in the patient dashboard."
                        : "Final appointment booking is completed from the patient dashboard."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-white ring-1 ring-zh-blue-deep/10">
                <CardHeader>
                  <CardTitle className="text-base text-zh-blue-deep">
                    Practice info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="flex items-start gap-2.5 text-zh-ink/75">
                    <Building2
                      className="mt-0.5 size-4 shrink-0 text-zh-blue"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block font-semibold text-zh-ink">
                        {doctor.designation || "Physician"}
                      </span>
                      <span className="text-zh-ink/65">
                        {doctor.currentWorkingPlace || "—"}
                      </span>
                    </span>
                  </p>
                  <p className="flex items-start gap-2.5 text-zh-ink/75">
                    <MapPin
                      className="mt-0.5 size-4 shrink-0 text-zh-blue"
                      aria-hidden="true"
                    />
                    {doctor.address ||
                      doctor.currentWorkingPlace ||
                      "Location not listed"}
                  </p>
                  <p className="flex items-start gap-2.5 text-zh-ink/75">
                    <ShieldCheck
                      className="mt-0.5 size-4 shrink-0 text-zh-blue"
                      aria-hidden="true"
                    />
                    Reg. {doctor.registrationNumber || "—"}
                  </p>
                  <Separator />
                  <Link
                    href="/consultation"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-zh-blue transition-colors hover:text-zh-blue-deep focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    Browse other clinicians
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
