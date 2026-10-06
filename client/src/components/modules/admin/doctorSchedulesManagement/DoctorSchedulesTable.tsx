"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { ViewDoctorScheduleModal } from "@/components/modules/admin/doctorSchedulesManagement/ViewDoctorScheduleModal";
import DataTable, {
  type DataTableColumnDef,
} from "@/components/shared/table/DataTable";
import type {
  DataTableFilterConfig,
  DataTableFilterValue,
  DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import { Badge } from "@/components/ui/badge";
import { getAdminDoctorSchedules } from "@/services/doctor-schedules.service";
import {
  DEFAULT_ADMIN_DOCTOR_SCHEDULES_LIST_PARAMS,
  type AdminDoctorSchedule,
  type AdminDoctorSchedulesQueryParams,
} from "@/types/doctor-schedules.types";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE =
  DEFAULT_ADMIN_DOCTOR_SCHEDULES_LIST_PARAMS.limit ?? 10;

const formatDateTime = (value?: string | Date) => {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatDuration = (start?: string | Date, end?: string | Date) => {
  if (!start || !end) {
    return "—";
  }

  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "—";
  }

  const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  if (minutes <= 0) {
    return "—";
  }

  return `${minutes} min`;
};

const doctorSchedulesColumns: DataTableColumnDef<AdminDoctorSchedule>[] = [
  {
    id: "doctor.name",
    header: "Doctor",
    cell: (info) => info.row.original.doctor?.name ?? "—",
  },
  {
    id: "doctor.email",
    header: "Email",
    cell: (info) => info.row.original.doctor?.email ?? "—",
  },
  {
    id: "startDateTime",
    header: "Start",
    cell: (info) =>
      formatDateTime(info.row.original.schedule?.startDateTime),
  },
  {
    id: "endDateTime",
    header: "End",
    cell: (info) => formatDateTime(info.row.original.schedule?.endDateTime),
  },
  {
    id: "duration",
    header: "Duration",
    enableSorting: false,
    cell: (info) =>
      formatDuration(
        info.row.original.schedule?.startDateTime,
        info.row.original.schedule?.endDateTime,
      ),
  },
  {
    id: "isBooked",
    header: "Status",
    cell: (info) => (
      <Badge variant="outline">
        {info.row.original.isBooked ? "Booked" : "Free"}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    header: "Assigned",
    cell: (info) => formatDateTime(info.row.original.createdAt),
  },
];

const doctorSchedulesFilterConfigs: DataTableFilterConfig[] = [
  {
    id: "isBooked",
    label: "Status",
    type: "single-select",
    options: [
      { label: "Free", value: "false" },
      { label: "Booked", value: "true" },
    ],
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
  const limit = parsePositiveInt(readParam(params, "limit"), DEFAULT_PAGE_SIZE);
  const sortBy = readParam(params, "sortBy")?.trim();
  const sortOrder = readParam(params, "sortOrder");
  const filterValues: DataTableFilterValues = {};

  const isBooked = readParam(params, "isBooked")?.trim();
  if (isBooked === "true" || isBooked === "false") {
    filterValues.isBooked = isBooked;
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

const buildDoctorSchedulesQueryParams = ({
  searchTerm,
  pagination,
  sorting,
  filterValues,
}: {
  searchTerm: string;
  pagination: PaginationState;
  sorting: SortingState;
  filterValues: DataTableFilterValues;
}): AdminDoctorSchedulesQueryParams => {
  const params: AdminDoctorSchedulesQueryParams = {
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

  const isBookedValue = filterValues.isBooked;
  if (typeof isBookedValue === "string") {
    if (isBookedValue === "true" || isBookedValue === "false") {
      params.isBooked = isBookedValue === "true";
    }
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

  const isBookedValue = filterValues.isBooked;
  if (typeof isBookedValue === "string" && isBookedValue) {
    params.set("isBooked", isBookedValue);
  }

  const query = params.toString();
  window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
};

type DoctorSchedulesTableProps = {
  initialSearchParams?: SearchParamsRecord;
};

export const DoctorSchedulesTable = ({
  initialSearchParams = {},
}: DoctorSchedulesTableProps) => {
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
  const [selectedSchedule, setSelectedSchedule] =
    useState<AdminDoctorSchedule | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const queryParams = useMemo(
    () =>
      buildDoctorSchedulesQueryParams({
        searchTerm,
        pagination,
        sorting,
        filterValues,
      }),
    [searchTerm, pagination, sorting, filterValues],
  );

  const {
    data: doctorSchedulesDataResponse,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-doctor-schedules", queryParams],
    queryFn: () => getAdminDoctorSchedules(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30 * 3,
  });

  const doctorSchedules = doctorSchedulesDataResponse?.data ?? [];

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
            : "Failed to load doctor schedules. Please try again."}
        </p>
      ) : null}

      {!isError ? (
        <DataTable
          tableKey="admin-doctor-schedules-table"
          data={doctorSchedules}
          columns={doctorSchedulesColumns}
          isLoading={isFetching}
          emptyMessage="No doctor schedules found."
          getRowId={(row) => `${row.doctorId}-${row.scheduleId}`}
          meta={doctorSchedulesDataResponse?.meta}
          actions={{
            onView: (row) => {
              setSelectedSchedule(row);
              setViewOpen(true);
            },
          }}
          search={{
            initialValue: searchTerm,
            placeholder: "Search by doctor name, email, or IDs...",
            onDebouncedChange: handleSearchChange,
          }}
          filters={{
            configs: doctorSchedulesFilterConfigs,
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

      <ViewDoctorScheduleModal
        doctorId={selectedSchedule?.doctorId ?? null}
        scheduleId={selectedSchedule?.scheduleId ?? null}
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) {
            setSelectedSchedule(null);
          }
        }}
      />
    </div>
  );
};

export default DoctorSchedulesTable;
