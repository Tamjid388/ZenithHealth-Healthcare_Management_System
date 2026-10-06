"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import DataTable, {
  type DataTableColumnDef,
} from "@/components/shared/table/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getDoctors } from "@/services/doctors.service";
import {
  DEFAULT_DOCTORS_LIST_PARAMS,
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

const doctorSpecialitiesColumns: DataTableColumnDef<Doctor>[] = [
  {
    accessorKey: "name",
    header: "Doctor",
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
    id: "specialities",
    header: "Specialities",
    enableSorting: false,
    cell: (info) => {
      const specialities = info.row.original.doctorSpecialities ?? [];
      if (specialities.length === 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex max-w-md flex-wrap gap-1.5">
          {specialities.map((item) => (
            <Badge
              key={`${item.doctorId}-${item.specialityId}`}
              variant="secondary"
              className="rounded-full"
            >
              {item.speciality?.title ?? "—"}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "specialityCount",
    header: "Total",
    enableSorting: false,
    cell: (info) => info.row.original.doctorSpecialities?.length ?? 0,
  },
];

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

const getStateFromSearchParams = (params: SearchParamsRecord) => {
  const searchTerm = readParam(params, "searchTerm")?.trim() ?? "";
  const page = parsePositiveInt(readParam(params, "page"), 1);
  const limit = parsePositiveInt(
    readParam(params, "limit"),
    DEFAULT_PAGE_SIZE,
  );
  const sortBy = readParam(params, "sortBy")?.trim();
  const sortOrder = readParam(params, "sortOrder");

  return {
    searchTerm,
    pagination: {
      pageIndex: page - 1,
      pageSize: limit,
    } satisfies PaginationState,
    sorting: (sortBy
      ? [{ id: sortBy, desc: sortOrder !== "asc" }]
      : []) satisfies SortingState,
  };
};

const buildQueryParams = ({
  searchTerm,
  pagination,
  sorting,
}: {
  searchTerm: string;
  pagination: PaginationState;
  sorting: SortingState;
}): DoctorsQueryParams => {
  const params: DoctorsQueryParams = {
    ...DEFAULT_DOCTORS_LIST_PARAMS,
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

  return params;
};

const writeTableUrl = (
  pathname: string,
  {
    searchTerm,
    pagination,
    sorting,
  }: {
    searchTerm: string;
    pagination: PaginationState;
    sorting: SortingState;
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

  const query = params.toString();
  window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
};

type DoctorSpecialitiesTableProps = {
  initialSearchParams?: SearchParamsRecord;
};

export const DoctorSpecialitiesTable = ({
  initialSearchParams = {},
}: DoctorSpecialitiesTableProps) => {
  const pathname = usePathname();
  const initial = getStateFromSearchParams(initialSearchParams);
  const [searchTerm, setSearchTerm] = useState(initial.searchTerm);
  const [sorting, setSorting] = useState<SortingState>(initial.sorting);
  const [pagination, setPagination] = useState<PaginationState>(
    initial.pagination,
  );

  const queryParams = useMemo(
    () => buildQueryParams({ searchTerm, pagination, sorting }),
    [searchTerm, pagination, sorting],
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
      });
    },
    [pagination, pathname, sorting],
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
      });
    },
    [pagination, pathname, searchTerm],
  );

  const handlePaginationChange = useCallback(
    (next: PaginationState) => {
      setPagination(next);
      writeTableUrl(pathname, {
        searchTerm,
        pagination: next,
        sorting,
      });
    },
    [pathname, searchTerm, sorting],
  );

  return (
    <div>
      {isError ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Failed to load doctor specialities. Please try again."}
        </p>
      ) : null}

      {!isError ? (
        <DataTable
          tableKey="admin-doctor-specialities-table"
          data={doctors}
          columns={doctorSpecialitiesColumns}
          isLoading={isFetching}
          emptyMessage="No doctors found."
          getRowId={(row) => row.id}
          meta={doctorsDataResponse?.meta}
          search={{
            initialValue: searchTerm,
            placeholder: "Search doctors...",
            onDebouncedChange: handleSearchChange,
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
    </div>
  );
};

export default DoctorSpecialitiesTable;
