"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { DeleteScheduleDialog } from "@/components/modules/admin/schedulesManagement/DeleteScheduleDialog";
import { EditScheduleModal } from "@/components/modules/admin/schedulesManagement/EditScheduleModal";
import { ViewScheduleModal } from "@/components/modules/admin/schedulesManagement/ViewScheduleModal";
import DataTable, {
  type DataTableColumnDef,
} from "@/components/shared/table/DataTable";
import type {
  DataTableFilterConfig,
  DataTableFilterValue,
  DataTableFilterValues,
  DataTableRangeValue,
} from "@/components/shared/table/DataTableFilters";
import { getSchedules } from "@/services/schedules.service";
import {
  DEFAULT_SCHEDULES_LIST_PARAMS,
  type Schedule,
  type SchedulesQueryParams,
} from "@/types/schedules.types";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = DEFAULT_SCHEDULES_LIST_PARAMS.limit ?? 10;

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

const scheduleLabel = (schedule: Schedule) =>
  `${formatDateTime(schedule.startDateTime)} – ${formatDateTime(schedule.endDateTime)}`;

const schedulesColumns: DataTableColumnDef<Schedule>[] = [
  {
    accessorKey: "startDateTime",
    header: "Start",
    cell: (info) => formatDateTime(info.getValue<string | Date>()),
  },
  {
    accessorKey: "endDateTime",
    header: "End",
    cell: (info) => formatDateTime(info.getValue<string | Date>()),
  },
  {
    id: "duration",
    header: "Duration",
    enableSorting: false,
    cell: (info) =>
      formatDuration(
        info.row.original.startDateTime,
        info.row.original.endDateTime,
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: (info) => formatDateTime(info.getValue<string | Date>()),
  },
];

const scheduleFilterConfigs: DataTableFilterConfig[] = [
  {
    id: "startDateTime",
    label: "Start date",
    type: "range",
    inputType: "date",
  },
  {
    id: "endDateTime",
    label: "End date",
    type: "range",
    inputType: "date",
  },
];

const toDateTimeBound = (value: string, bound: "start" | "end") => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return bound === "start" ? `${value}T00:00:00` : `${value}T23:59:59.999`;
};

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
  const filterValues: DataTableFilterValues = {};

  const startDateTime = readRangeFromUrl(params, "startDateTime");
  if (startDateTime) {
    filterValues.startDateTime = startDateTime;
  }

  const endDateTime = readRangeFromUrl(params, "endDateTime");
  if (endDateTime) {
    filterValues.endDateTime = endDateTime;
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

const buildSchedulesQueryParams = ({
  searchTerm,
  pagination,
  sorting,
  filterValues,
}: {
  searchTerm: string;
  pagination: PaginationState;
  sorting: SortingState;
  filterValues: DataTableFilterValues;
}): SchedulesQueryParams => {
  const params: SchedulesQueryParams = {
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

  const startDateTime = toRangeFilter(filterValues.startDateTime);
  if (startDateTime) {
    params.startDateTime = {
      ...(startDateTime.gte
        ? { gte: toDateTimeBound(startDateTime.gte, "start") }
        : {}),
      ...(startDateTime.lte
        ? { lte: toDateTimeBound(startDateTime.lte, "end") }
        : {}),
    };
  }

  const endDateTime = toRangeFilter(filterValues.endDateTime);
  if (endDateTime) {
    params.endDateTime = {
      ...(endDateTime.gte
        ? { gte: toDateTimeBound(endDateTime.gte, "start") }
        : {}),
      ...(endDateTime.lte
        ? { lte: toDateTimeBound(endDateTime.lte, "end") }
        : {}),
    };
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

  const startDateTime = toRangeFilter(filterValues.startDateTime);
  if (startDateTime?.gte) {
    params.set("startDateTime[gte]", startDateTime.gte);
  }
  if (startDateTime?.lte) {
    params.set("startDateTime[lte]", startDateTime.lte);
  }

  const endDateTime = toRangeFilter(filterValues.endDateTime);
  if (endDateTime?.gte) {
    params.set("endDateTime[gte]", endDateTime.gte);
  }
  if (endDateTime?.lte) {
    params.set("endDateTime[lte]", endDateTime.lte);
  }

  const query = params.toString();
  window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
};

type SchedulesTableProps = {
  initialSearchParams?: SearchParamsRecord;
};

export const SchedulesTable = ({
  initialSearchParams = {},
}: SchedulesTableProps) => {
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
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const queryParams = useMemo(
    () =>
      buildSchedulesQueryParams({
        searchTerm,
        pagination,
        sorting,
        filterValues,
      }),
    [searchTerm, pagination, sorting, filterValues],
  );

  const {
    data: schedulesDataResponse,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["schedules", queryParams],
    queryFn: () => getSchedules(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30 * 3,
  });

  const schedules = schedulesDataResponse?.data ?? [];

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
            : "Failed to load schedules. Please try again."}
        </p>
      ) : null}

      {!isError ? (
        <DataTable
          tableKey="admin-schedules-table"
          data={schedules}
          columns={schedulesColumns}
          isLoading={isFetching}
          emptyMessage="No schedules found."
          getRowId={(row) => row.id}
          meta={schedulesDataResponse?.meta}
          actions={{
            onView: (row) => {
              setSelectedSchedule(row);
              setViewOpen(true);
            },
            onEdit: (row) => {
              setSelectedSchedule(row);
              setEditOpen(true);
            },
            onDelete: (row) => {
              setSelectedSchedule(row);
              setDeleteOpen(true);
            },
          }}
          search={{
            initialValue: searchTerm,
            placeholder: "Search schedules...",
            onDebouncedChange: handleSearchChange,
          }}
          filters={{
            configs: scheduleFilterConfigs,
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

      <ViewScheduleModal
        scheduleId={selectedSchedule?.id ?? null}
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) {
            setSelectedSchedule(null);
          }
        }}
      />

      <EditScheduleModal
        scheduleId={selectedSchedule?.id ?? null}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setSelectedSchedule(null);
          }
        }}
      />

      <DeleteScheduleDialog
        scheduleId={selectedSchedule?.id ?? null}
        scheduleLabel={
          selectedSchedule ? scheduleLabel(selectedSchedule) : null
        }
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setSelectedSchedule(null);
          }
        }}
      />
    </div>
  );
};
