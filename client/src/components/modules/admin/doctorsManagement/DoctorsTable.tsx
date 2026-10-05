"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { Star } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import DataTable, {
  type DataTableColumnDef,
} from "@/components/shared/table/DataTable";
import type {
  DataTableFilterConfig,
  DataTableFilterValue,
  DataTableFilterValues,
  DataTableRangeValue,
} from "@/components/shared/table/DataTableFilters";
import { DeleteDoctorDialog } from "@/components/modules/admin/doctorsManagement/DeleteDoctorDialog";
import { EditDoctorModal } from "@/components/modules/admin/doctorsManagement/EditDoctorModal";
import { ViewDoctorModal } from "@/components/modules/admin/doctorsManagement/ViewDoctorModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDoctors } from "@/services/doctors.service";
import {
  DEFAULT_DOCTORS_LIST_PARAMS,
  Gender,
  type Doctor,
  type DoctorsQueryParams,
} from "@/types/doctors.types";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = DEFAULT_DOCTORS_LIST_PARAMS.limit ?? 10;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const doctorsColumns: DataTableColumnDef<Doctor>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => {
      const doctor = info.row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            {doctor.profilePhoto ? (
              <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
            ) : null}
            <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{doctor.name}</p>
            {doctor.designation ? (
              <p className="truncate text-xs text-muted-foreground">
                {doctor.designation}
              </p>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "experience",
    header: "Experience",
    cell: (info) => {
      const years = info.getValue<number | undefined>();
      return years == null ? "—" : `${years} yrs`;
    },
  },
  {
    accessorKey: "averageRating",
    header: "Average Rating",
    cell: (info) => (
      <span className="inline-flex items-center gap-1">
        <Star className="size-3 fill-zh-blue text-zh-blue" aria-hidden />
        {(info.getValue<number | undefined>() ?? 0).toFixed(1)}
      </span>
    ),
  },
];

const doctorFilterConfigs: DataTableFilterConfig[] = [
  {
    id: "gender",
    label: "Gender",
    type: "single-select",
    options: [
      { label: "Male", value: Gender.MALE },
      { label: "Female", value: Gender.FEMALE },
      { label: "Other", value: Gender.OTHER },
    ],
  },
  { id: "experience", label: "Experience (yrs)", type: "range" },
  { id: "appointmentFee", label: "Appointment fee", type: "range" },
];

const toRangeFilter = (
  value: DataTableFilterValue | undefined,
): DataTableRangeValue | undefined => {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }

  const range: DataTableRangeValue = {};
  if (value.gte?.trim()) {
    range.gte = value.gte.trim();
  }
  if (value.lte?.trim()) {
    range.lte = value.lte.trim();
  }

  return range.gte || range.lte ? range : undefined;
};

const readParam = (params: SearchParamsRecord, key: string) => {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const readRangeFromUrl = (
  params: SearchParamsRecord,
  key: string,
): DataTableRangeValue | undefined => {
  const range: DataTableRangeValue = {};
  const gte = readParam(params, `${key}[gte]`)?.trim();
  const lte = readParam(params, `${key}[lte]`)?.trim();

  if (gte) {
    range.gte = gte;
  }
  if (lte) {
    range.lte = lte;
  }

  return range.gte || range.lte ? range : undefined;
};

const getStateFromSearchParams = (params: SearchParamsRecord) => {
  const searchTerm = readParam(params, "searchTerm")?.trim() ?? "";
  const page = parsePositiveInt(readParam(params, "page"), 1);
  const limit = parsePositiveInt(
    readParam(params, "limit"),
    DEFAULT_PAGE_SIZE,
  );
  const sortBy = readParam(params, "sortBy")?.trim();
  const sortOrder = readParam(params, "sortOrder");
  const gender = readParam(params, "gender");
  const filterValues: DataTableFilterValues = {};

  if (gender === Gender.MALE || gender === Gender.FEMALE || gender === Gender.OTHER) {
    filterValues.gender = gender;
  }

  const experience = readRangeFromUrl(params, "experience");
  if (experience) {
    filterValues.experience = experience;
  }

  const appointmentFee = readRangeFromUrl(params, "appointmentFee");
  if (appointmentFee) {
    filterValues.appointmentFee = appointmentFee;
  }

  return {
    searchTerm,
    pagination: {
      pageIndex: page - 1,
      pageSize: limit,
    } satisfies PaginationState,
    sorting: (sortBy
      ? [{ id: sortBy, desc: sortOrder !== "asc" }]
      : []) satisfies SortingState,
    filterValues,
  };
};

const buildDoctorsQueryParams = ({
  searchTerm,
  pagination,
  sorting,
  filterValues,
}: {
  searchTerm: string;
  pagination: PaginationState;
  sorting: SortingState;
  filterValues: DataTableFilterValues;
}): DoctorsQueryParams => {
  const params: DoctorsQueryParams = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  };

  if (searchTerm) {
    params.searchTerm = searchTerm;
  }

  const activeSort = sorting[0];
  if (activeSort) {
    params.sortBy = activeSort.id;
    params.sortOrder = activeSort.desc ? "desc" : "asc";
  }

  const gender = filterValues.gender;
  if (typeof gender === "string" && gender.length > 0) {
    params.gender = gender;
  }

  const experience = toRangeFilter(filterValues.experience);
  if (experience) {
    params.experience = experience;
  }

  const appointmentFee = toRangeFilter(filterValues.appointmentFee);
  if (appointmentFee) {
    params.appointmentFee = appointmentFee;
  }

  return params;
};

const writeTableUrl = (
  pathname: string,
  {
    searchTerm,
    pagination,
    sorting,
    filterValues,
  }: {
    searchTerm: string;
    pagination: PaginationState;
    sorting: SortingState;
    filterValues: DataTableFilterValues;
  },
) => {
  const params = new URLSearchParams();

  if (searchTerm) {
    params.set("searchTerm", searchTerm);
  }

  const page = pagination.pageIndex + 1;
  if (page > 1) {
    params.set("page", String(page));
  }

  if (pagination.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("limit", String(pagination.pageSize));
  }

  const activeSort = sorting[0];
  if (activeSort) {
    params.set("sortBy", activeSort.id);
    params.set("sortOrder", activeSort.desc ? "desc" : "asc");
  }

  if (typeof filterValues.gender === "string" && filterValues.gender) {
    params.set("gender", filterValues.gender);
  }

  const experience = toRangeFilter(filterValues.experience);
  if (experience?.gte) {
    params.set("experience[gte]", experience.gte);
  }
  if (experience?.lte) {
    params.set("experience[lte]", experience.lte);
  }

  const appointmentFee = toRangeFilter(filterValues.appointmentFee);
  if (appointmentFee?.gte) {
    params.set("appointmentFee[gte]", appointmentFee.gte);
  }
  if (appointmentFee?.lte) {
    params.set("appointmentFee[lte]", appointmentFee.lte);
  }

  const query = params.toString();
  window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
};

type DoctorsTableProps = {
  initialSearchParams?: SearchParamsRecord;
};

export const DoctorsTable = ({
  initialSearchParams = {},
}: DoctorsTableProps) => {
  const pathname = usePathname();
  const initial = getStateFromSearchParams(initialSearchParams);
  const [searchTerm, setSearchTerm] = useState(initial.searchTerm);
  const [sorting, setSorting] = useState<SortingState>(initial.sorting);
  const [filterValues, setFilterValues] = useState<DataTableFilterValues>(
    initial.filterValues,
  );
  const [pagination, setPagination] = useState<PaginationState>(
    initial.pagination,
  );
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const queryParams = useMemo(
    () =>
      buildDoctorsQueryParams({
        searchTerm,
        pagination,
        sorting,
        filterValues,
      }),
    [searchTerm, pagination, sorting, filterValues],
  );

  const {
    data: doctorsDataResponse,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["doctors", queryParams],
    queryFn: () => getDoctors(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30 * 3,
  });

  const doctors = doctorsDataResponse?.data ?? [];

  const handleSearchChange = useCallback(
    (value: string) => {
      const nextPagination = { ...pagination, pageIndex: 0 };
      setSearchTerm(value);
      setPagination(nextPagination);
      writeTableUrl(pathname, {
        searchTerm: value,
        pagination: nextPagination,
        sorting,
        filterValues,
      });
    },
    [filterValues, pagination, pathname, sorting],
  );

  const handleSortingChange = useCallback(
    (next: SortingState) => {
      const nextPagination = { ...pagination, pageIndex: 0 };
      setSorting(next);
      setPagination(nextPagination);
      writeTableUrl(pathname, {
        searchTerm,
        pagination: nextPagination,
        sorting: next,
        filterValues,
      });
    },
    [filterValues, pagination, pathname, searchTerm],
  );

  const handleFilterChange = useCallback(
    (filterId: string, value: DataTableFilterValue | undefined) => {
      const nextFilters = { ...filterValues };
      if (value === undefined) {
        delete nextFilters[filterId];
      } else {
        nextFilters[filterId] = value;
      }

      const nextPagination = { ...pagination, pageIndex: 0 };
      setFilterValues(nextFilters);
      setPagination(nextPagination);
      writeTableUrl(pathname, {
        searchTerm,
        pagination: nextPagination,
        sorting,
        filterValues: nextFilters,
      });
    },
    [filterValues, pagination, pathname, searchTerm, sorting],
  );

  const handleClearFilters = useCallback(() => {
    const nextPagination = { ...pagination, pageIndex: 0 };
    setFilterValues({});
    setPagination(nextPagination);
    writeTableUrl(pathname, {
      searchTerm,
      pagination: nextPagination,
      sorting,
      filterValues: {},
    });
  }, [pagination, pathname, searchTerm, sorting]);

  const handlePaginationChange = useCallback(
    (next: PaginationState) => {
      setPagination(next);
      writeTableUrl(pathname, {
        searchTerm,
        pagination: next,
        sorting,
        filterValues,
      });
    },
    [filterValues, pathname, searchTerm, sorting],
  );

  return (
    <div>
      {isError ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Failed to load doctors. Please try again."}
        </p>
      ) : null}

      {!isError ? (
        <DataTable
          tableKey="admin-doctors-table"
          data={doctors}
          columns={doctorsColumns}
          isLoading={isFetching}
          emptyMessage="No doctors found."
          getRowId={(row) => row.id}
          meta={doctorsDataResponse?.meta}
          actions={{
            onView: (row) => {
              setSelectedDoctor(row);
              setViewOpen(true);
            },
            onEdit: (row) => {
              setSelectedDoctor(row);
              setEditOpen(true);
            },
            onDelete: (row) => {
              setSelectedDoctor(row);
              setDeleteOpen(true);
            },
          }}
          search={{
            initialValue: searchTerm,
            placeholder: "Search doctors...",
            onDebouncedChange: handleSearchChange,
          }}
          filters={{
            configs: doctorFilterConfigs,
            values: filterValues,
            onFilterChange: handleFilterChange,
            onClearAll: handleClearFilters,
          }}
          sorting={{
            state: sorting,
            onSortingChange: handleSortingChange,
          }}
          pagination={{
            state: pagination,
            onPaginationChange: handlePaginationChange,
          }}
        />
      ) : null}

      <ViewDoctorModal
        doctorId={selectedDoctor?.id ?? null}
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) {
            setSelectedDoctor(null);
          }
        }}
      />

      <EditDoctorModal
        doctorId={selectedDoctor?.id ?? null}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setSelectedDoctor(null);
          }
        }}
      />

      <DeleteDoctorDialog
        doctorId={selectedDoctor?.id ?? null}
        doctorName={selectedDoctor?.name ?? null}
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setSelectedDoctor(null);
          }
        }}
      />
    </div>
  );
};
