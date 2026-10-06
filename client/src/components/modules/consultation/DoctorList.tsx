"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  MapPin,
  Search,
  SearchX,
  ShieldCheck,
  Star,
  Stethoscope,
  Wallet,
  X,
} from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { getDoctors } from "@/services/doctors.service";
import { getSpecialities } from "@/services/specialities.service";
import {
  DEFAULT_DOCTORS_LIST_PARAMS,
  type Doctor,
} from "@/types/doctors.types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;
const SPECIALITIES_PAGE_SIZE = 100;
const SEARCH_DEBOUNCE_MS = 400;

type SortOption =
  | "recommended"
  | "top-rated"
  | "most-experienced"
  | "lowest-fee";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "top-rated", label: "Top rated" },
  { value: "most-experienced", label: "Most experienced" },
  { value: "lowest-fee", label: "Lowest fee" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatFee(fee: number) {
  return `৳${fee.toLocaleString("en-BD")}`;
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const specialties =
    doctor.doctorSpecialities
      ?.map((item) => item.speciality?.title)
      .filter((title): title is string => Boolean(title)) ?? [];
  const visibleSpecialties = specialties.slice(0, 2);
  const remainingCount = specialties.length - visibleSpecialties.length;
  const rating = Number.isFinite(doctor.averageRating) ? doctor.averageRating : 0;

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-zh-blue-deep/10 transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-xl motion-safe:hover:ring-zh-blue-deep/25">
      <CardHeader className="pb-0">
        <div className="flex items-start gap-4">
          <Avatar className="size-16 shrink-0 ring-2 ring-zh-foam">
            {doctor.profilePhoto ? (
              <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
            ) : null}
            <AvatarFallback className="bg-zh-foam text-base font-semibold text-zh-blue-deep">
              {getInitials(doctor.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-1.5 truncate text-lg text-zh-ink">
              <span className="truncate">{doctor.name}</span>
              <BadgeCheck
                className="size-4 shrink-0 text-zh-blue"
                aria-label="Listed clinician"
                role="img"
              />
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-1 text-sm text-zh-ink/65">
              {doctor.designation || "Physician"}
              {doctor.currentWorkingPlace
                ? ` · ${doctor.currentWorkingPlace}`
                : ""}
            </CardDescription>
            {doctor.qualifications ? (
              <p className="mt-1.5 line-clamp-1 text-[13px] text-zh-ink/55">
                {doctor.qualifications}
              </p>
            ) : null}
          </div>
        </div>

        {specialties.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleSpecialties.map((title) => (
              <Badge
                key={title}
                variant="secondary"
                className="rounded-full border border-zh-blue-deep/10 bg-zh-mist px-2.5 py-1 text-xs font-medium text-zh-blue-deep"
              >
                <Stethoscope className="size-3" aria-hidden="true" />
                {title}
              </Badge>
            ))}
            {remainingCount > 0 ? (
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-1 text-xs text-zh-ink/60"
              >
                +{remainingCount} more
              </Badge>
            ) : null}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="pt-4">
        <dl className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-zh-mist/70 px-2 py-2.5 text-center">
            <dt className="sr-only">Average rating</dt>
            <dd className="inline-flex items-center gap-1 text-sm font-semibold text-zh-ink">
              <Star
                className="size-3.5 fill-zh-blue text-zh-blue"
                aria-hidden="true"
              />
              {rating.toFixed(1)}
            </dd>
            <p className="mt-0.5 text-[11px] text-zh-ink/55">Rating</p>
          </div>
          <div className="rounded-xl bg-zh-mist/70 px-2 py-2.5 text-center">
            <dt className="sr-only">Experience</dt>
            <dd className="inline-flex items-center gap-1 text-sm font-semibold text-zh-ink">
              <Briefcase
                className="size-3.5 text-zh-blue"
                aria-hidden="true"
              />
              {doctor.experience ?? 0} yrs
            </dd>
            <p className="mt-0.5 text-[11px] text-zh-ink/55">Experience</p>
          </div>
          <div className="rounded-xl bg-zh-mist/70 px-2 py-2.5 text-center">
            <dt className="sr-only">Consultation fee</dt>
            <dd className="inline-flex items-center gap-1 text-sm font-semibold text-zh-ink">
              <Wallet className="size-3.5 text-zh-blue" aria-hidden="true" />
              {formatFee(doctor.appointmentFee ?? 0)}
            </dd>
            <p className="mt-0.5 text-[11px] text-zh-ink/55">Fee</p>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="mt-auto border-t border-zh-blue-deep/10 bg-zh-mist/50 p-4">
        <Link
          href={`/consultation/doctor/${doctor.id}`}
          className="w-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label={`View profile of ${doctor.name}`}
        >
          <Button className="h-11 w-full cursor-pointer rounded-xl bg-zh-blue text-[15px] text-white transition-colors duration-200 hover:bg-zh-blue-deep">
            View profile
            <ArrowRight
              className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function DoctorListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-zh-blue-deep/10"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="size-16 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export const DoctorList = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeSpeciality, setActiveSpeciality] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("recommended");
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    resultsRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: specialitiesResponse } = useQuery({
    queryKey: [
      "specialities",
      { page: 1, limit: SPECIALITIES_PAGE_SIZE },
    ],
    queryFn: () =>
      getSpecialities({ page: 1, limit: SPECIALITIES_PAGE_SIZE }),
    staleTime: 1000 * 60 * 5,
  });
  const specialities = specialitiesResponse?.data ?? [];

  const queryParams = useMemo(() => {
    const params = {
      ...DEFAULT_DOCTORS_LIST_PARAMS,
      page,
      limit: PAGE_SIZE,
    };
    if (debouncedSearch) {
      params.searchTerm = debouncedSearch;
    }
    if (activeSpeciality) {
      params["doctorSpecialities.speciality.title"] = activeSpeciality;
    }
    if (sort === "top-rated") {
      params.sortBy = "averageRating";
      params.sortOrder = "desc" as const;
    } else if (sort === "most-experienced") {
      params.sortBy = "experience";
      params.sortOrder = "desc" as const;
    } else if (sort === "lowest-fee") {
      params.sortBy = "appointmentFee";
      params.sortOrder = "asc" as const;
    }
    return params;
  }, [page, debouncedSearch, activeSpeciality, sort]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["doctors", queryParams],
    queryFn: () => getDoctors(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30 * 3,
  });

  const doctors = data?.data ?? [];
  const total = data?.meta?.total ?? doctors.length;
  const totalPages = data?.meta?.totalPages ?? 1;
  const hasActiveFilters = debouncedSearch !== "" || activeSpeciality !== null;

  const handleSelectSpeciality = (title: string | null) => {
    setActiveSpeciality(title);
    setPage(1);
  };

  const handleClearAll = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setActiveSpeciality(null);
    setPage(1);
  };

  return (
    <div>
      {/* Hero — search focused */}
      <section className="relative overflow-hidden bg-zh-blue-deep">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-zh-blue/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-white uppercase">
              <Stethoscope className="size-3.5" aria-hidden="true" />
              Find your clinician
            </p>
            <h1 className="mt-4 font-heading text-4xl leading-tight tracking-tight text-white sm:text-5xl">
              The right doctor for your care
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Search by name, hospital, or speciality — compare experience,
              ratings, and fees, then book a visit that fits your needs.
            </p>
          </div>

          <form
            role="search"
            className="mt-8 max-w-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              scrollToResults();
            }}
          >
            <label htmlFor="doctor-search" className="sr-only">
              Search doctors by name, hospital, or speciality
            </label>
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-white/70">
              <Search
                className="ml-2 size-5 shrink-0 text-zh-ink/45"
                aria-hidden="true"
              />
              <input
                id="doctor-search"
                type="text"
                enterKeyHint="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Try a name, hospital, or speciality…"
                autoComplete="off"
                className="h-11 w-full bg-transparent text-base text-zh-ink outline-none placeholder:text-zh-ink/45"
              />
              {searchInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-xl text-zh-ink/60 hover:text-zh-ink"
                >
                  <X className="size-5" aria-hidden="true" />
                </Button>
              ) : null}
              <Button
                type="submit"
                className="h-11 shrink-0 cursor-pointer rounded-xl bg-zh-blue px-5 text-[15px] text-white hover:bg-zh-blue-deep"
              >
                Search
              </Button>
            </div>
          </form>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4" aria-hidden="true" />
              BMDC-registered doctors
            </li>
            <li className="inline-flex items-center gap-2">
              <Star className="size-4" aria-hidden="true" />
              Patient-rated profiles
            </li>
            <li className="inline-flex items-center gap-2">
              <CalendarCheck className="size-4" aria-hidden="true" />
              Transparent upfront fees
            </li>
          </ul>
        </div>
      </section>

      {/* Directory */}
      <section className="bg-zh-mist px-4 py-10 sm:px-6 lg:py-14">
        <div className="mx-auto max-w-6xl">
          {/* Speciality categories */}
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-zh-ink/60 uppercase">
              Browse by speciality
            </h2>
            <div
              className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
              role="group"
              aria-label="Filter by speciality"
            >
              <Button
                type="button"
                variant={activeSpeciality === null ? "default" : "outline"}
                onClick={() => handleSelectSpeciality(null)}
                aria-pressed={activeSpeciality === null}
                className={cn(
                  "h-11 shrink-0 cursor-pointer rounded-full px-4",
                  activeSpeciality === null
                    ? "bg-zh-blue-deep text-white hover:bg-zh-blue-deep"
                    : "bg-white",
                )}
              >
                All doctors
              </Button>
              {specialities.map((speciality) => {
                const isActive = activeSpeciality === speciality.title;
                return (
                  <Button
                    key={speciality.id}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    onClick={() =>
                      handleSelectSpeciality(
                        isActive ? null : speciality.title,
                      )
                    }
                    aria-pressed={isActive}
                    className={cn(
                      "h-11 shrink-0 cursor-pointer rounded-full px-4",
                      isActive
                        ? "bg-zh-blue-deep text-white hover:bg-zh-blue-deep"
                        : "bg-white",
                    )}
                  >
                    {speciality.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={speciality.icon}
                        alt=""
                        aria-hidden="true"
                        className="size-5 rounded-full object-cover"
                      />
                    ) : (
                      <Stethoscope className="size-4" aria-hidden="true" />
                    )}
                    {speciality.title}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Sticky results toolbar — keeps search + sort visible
              once the hero has scrolled away */}
          <div
            ref={resultsRef}
            className="sticky top-[81px] z-30 -mx-4 mt-6 scroll-mt-24 border-b border-zh-blue-deep/10 bg-zh-mist/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-4"
          >
            <div className="flex items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-zh-blue-deep/10 focus-within:ring-2 focus-within:ring-zh-blue/60">
              <Search
                className="size-4 shrink-0 text-zh-ink/45"
                aria-hidden="true"
              />
              <label htmlFor="doctor-search-compact" className="sr-only">
                Refine doctor search
              </label>
              <input
                id="doctor-search-compact"
                type="text"
                enterKeyHint="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Refine by name, hospital, or speciality…"
                autoComplete="off"
                className="h-10 w-full bg-transparent text-sm text-zh-ink outline-none placeholder:text-zh-ink/45"
              />
              {searchInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-lg text-zh-ink/60 hover:text-zh-ink"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-zh-ink/60" aria-live="polite">
                {isLoading
                  ? "Loading clinicians…"
                  : `${total} ${total === 1 ? "clinician" : "clinicians"} found`}
                {isFetching && !isLoading ? " — updating…" : ""}
              </p>
              <div className="flex items-center gap-2">
                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClearAll}
                    className="h-10 cursor-pointer rounded-xl text-zh-ink/70 hover:text-zh-ink"
                  >
                    <X className="size-4" aria-hidden="true" />
                    Clear filters
                  </Button>
                ) : null}
                <label
                  htmlFor="doctor-sort"
                  className="text-sm font-medium text-zh-ink/60"
                >
                  Sort by
                </label>
                <select
                  id="doctor-sort"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as SortOption);
                    setPage(1);
                  }}
                  className="h-10 cursor-pointer rounded-xl border border-zh-blue-deep/15 bg-white px-3 text-sm font-medium text-zh-ink outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mt-6">
            {isLoading ? <DoctorListSkeleton /> : null}

            {isError ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-destructive/20">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <CircleAlert className="size-5" aria-hidden="true" />
                </span>
                <p className="max-w-md text-sm leading-relaxed text-zh-ink/75">
                  {error instanceof Error
                    ? error.message
                    : "Failed to load doctors. Please try again."}
                </p>
              </div>
            ) : null}

            {!isLoading && !isError && doctors.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-zh-blue-deep/10">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-zh-foam text-zh-blue-deep">
                  <SearchX className="size-5" aria-hidden="true" />
                </span>
                <p className="text-base font-medium text-zh-ink">
                  No clinicians match your search
                </p>
                <p className="max-w-sm text-sm text-zh-ink/65">
                  {debouncedSearch ? (
                    <>
                      Try searching for a hospital or speciality instead — or
                      clear your filters to see everyone.
                    </>
                  ) : (
                    <>
                      Try a different speciality — or clear your filters to
                      see everyone.
                    </>
                  )}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearAll}
                  className="mt-1 h-11 cursor-pointer rounded-xl"
                >
                  <X className="size-4" aria-hidden="true" />
                  Clear search and filters
                </Button>
              </div>
            ) : null}

            {!isLoading && !isError && doctors.length > 0 ? (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor) => (
                  <li key={doctor.id} className="h-full">
                    <DoctorCard doctor={doctor} />
                  </li>
                ))}
              </ul>
            ) : null}

            {!isLoading && !isError && totalPages > 1 ? (
              <div className="mt-10 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1 || isFetching}
                  onClick={() => {
                    setPage((value) => Math.max(1, value - 1));
                    scrollToResults();
                  }}
                  className="h-11 cursor-pointer rounded-xl bg-white"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Previous
                </Button>
                <p className="text-sm text-zh-ink/60" aria-live="polite">
                  Page {page} of {totalPages}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => {
                    setPage((value) => Math.min(totalPages, value + 1));
                    scrollToResults();
                  }}
                  className="h-11 cursor-pointer rounded-xl bg-white"
                >
                  Next
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ) : null}
          </div>

          {/* Doctor CTA band */}
          <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-zh-blue-deep p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white sm:inline-flex">
                <Briefcase className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-xl tracking-tight text-white sm:text-2xl">
                  Are you a doctor?
                </h2>
                <p className="mt-1 max-w-lg text-sm leading-relaxed text-white/75">
                  Join ZenithHealth to manage your schedule, reach new
                  patients, and build your practice online.
                </p>
              </div>
            </div>
            <Link
              href="/register"
              className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/70"
            >
              <Button className="h-11 cursor-pointer rounded-xl bg-white px-6 text-[15px] text-zh-blue-deep hover:bg-zh-mist">
                Join as a doctor
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>

          {/* Location note */}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[13px] text-zh-ink/50">
            <MapPin className="size-3.5" aria-hidden="true" />
            Currently serving patients across Dhaka, Bangladesh.
          </p>
        </div>
      </section>
    </div>
  );
};

export default DoctorList;
