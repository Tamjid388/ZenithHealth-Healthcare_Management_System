"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { AppointmentDetailsModal } from "@/components/modules/appointments/AppointmentDetailsModal";
import { CancelAppointmentDialog } from "@/components/modules/appointments/CancelAppointmentDialog";
import DataTable, {
  type DataTableColumnDef,
} from "@/components/shared/table/DataTable";
import type {
  DataTableFilterConfig,
  DataTableFilterValue,
  DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyAppointments } from "@/services/appointments.service";
import {
  DEFAULT_MY_APPOINTMENTS_LIST_PARAMS,
  type MyAppointment,
  type MyAppointmentsQueryParams,
} from "@/types/appointments.types";

const DEFAULT_PAGE_SIZE = DEFAULT_MY_APPOINTMENTS_LIST_PARAMS.limit ?? 10;

const formatDateTime = (value?: string | Date | null) => {
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

const appointmentsFilterConfigs: DataTableFilterConfig[] = [
  {
    id: "status",
    label: "Status",
    type: "single-select",
    options: [
      { label: "Scheduled", value: "SCHEDULED" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Canceled", value: "CANCELED" },
    ],
  },
  {
    id: "paymentStatus",
    label: "Payment",
    type: "single-select",
    options: [
      { label: "Paid", value: "PAID" },
      { label: "Unpaid", value: "UNPAID" },
    ],
  },
];

type AppointmentsTableProps = {
  queryKeyPrefix: string;
  showPatientColumn?: boolean;
  showDoctorColumn?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

export const AppointmentsTable = ({
  queryKeyPrefix,
  showPatientColumn = false,
  showDoctorColumn = true,
  searchPlaceholder = "Search appointments...",
  emptyMessage = "No appointments found.",
}: AppointmentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filterValues, setFilterValues] = useState<DataTableFilterValues>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<MyAppointment | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const queryParams = useMemo((): MyAppointmentsQueryParams => {
    const params: MyAppointmentsQueryParams = {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    };

    if (searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }

    const activeSort = sorting[0];
    if (activeSort) {
      params.sortBy = activeSort.id;
      params.sortOrder = activeSort.desc ? "desc" : "asc";
    }

    const statusValue = filterValues.status;
    if (typeof statusValue === "string" && statusValue) {
      params.status = statusValue;
    }

    const paymentValue = filterValues.paymentStatus;
    if (typeof paymentValue === "string" && paymentValue) {
      params.paymentStatus = paymentValue;
    }

    return params;
  }, [searchTerm, pagination, sorting, filterValues]);

  const {
    data: appointmentsResponse,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [queryKeyPrefix, queryParams],
    queryFn: () => getMyAppointments(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30 * 3,
  });

  const appointments = appointmentsResponse?.data ?? [];

  const columns = useMemo((): DataTableColumnDef<MyAppointment>[] => {
    const cols: DataTableColumnDef<MyAppointment>[] = [];

    if (showDoctorColumn) {
      cols.push({
        id: "doctor",
        header: "Doctor",
        cell: (info) => info.row.original.doctor?.name ?? "—",
      });
    }

    if (showPatientColumn) {
      cols.push({
        id: "patient",
        header: "Patient",
        cell: (info) => info.row.original.patient?.name ?? "—",
      });
    }

    cols.push(
      {
        id: "startDateTime",
        header: "Schedule",
        cell: (info) =>
          formatDateTime(info.row.original.schedule?.startDateTime),
      },
      {
        id: "status",
        header: "Status",
        cell: (info) => (
          <Badge
            variant={
              info.row.original.status === "SCHEDULED"
                ? "default"
                : "secondary"
            }
            className="rounded-full"
          >
            {info.row.original.status}
          </Badge>
        ),
      },
      {
        id: "paymentStatus",
        header: "Payment",
        cell: (info) =>
          info.row.original.paymentStatus ? (
            <Badge variant="outline" className="rounded-full">
              {info.row.original.paymentStatus}
            </Badge>
          ) : (
            "—"
          ),
      },
      {
        id: "cancel",
        header: "Cancel",
        enableSorting: false,
        cell: (info) =>
          info.row.original.status === "SCHEDULED" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 cursor-pointer rounded-lg"
              onClick={() => {
                setSelectedAppointment(info.row.original);
                setCancelOpen(true);
              }}
            >
              Cancel
            </Button>
          ) : null,
      },
    );

    return cols;
  }, [showDoctorColumn, showPatientColumn]);

  const handleFilterChange = (
    filterId: string,
    value: DataTableFilterValue | undefined,
  ) => {
    setFilterValues((previous) => {
      const next = { ...previous };
      if (value === undefined) {
        delete next[filterId];
      } else {
        next[filterId] = value;
      }
      return next;
    });
    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
  };

  return (
    <div>
      {isError ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Failed to load appointments. Please try again."}
        </p>
      ) : null}

      {!isError ? (
        <DataTable
          tableKey={`${queryKeyPrefix}-table`}
          data={appointments}
          columns={columns}
          isLoading={isFetching}
          emptyMessage={emptyMessage}
          getRowId={(row) => row.id}
          meta={appointmentsResponse?.meta}
          actions={{
            onView: (row) => {
              setSelectedAppointment(row);
              setViewOpen(true);
            },
          }}
          search={{
            initialValue: searchTerm,
            placeholder: searchPlaceholder,
            onDebouncedChange: (value) => {
              setSearchTerm(value);
              setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            },
          }}
          filters={{
            configs: appointmentsFilterConfigs,
            values: filterValues,
            onFilterChange: handleFilterChange,
            onClearAll: () => {
              setFilterValues({});
              setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            },
          }}
          sorting={{
            state: sorting,
            onSortingChange: (next) => {
              setSorting(next);
              setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            },
          }}
          pagination={{
            state: pagination,
            onPaginationChange: setPagination,
          }}
        />
      ) : null}

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        showPatient={showPatientColumn}
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
      />

      <CancelAppointmentDialog
        appointment={selectedAppointment}
        invalidateKeys={[[queryKeyPrefix]]}
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open);
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
      />
    </div>
  );
};

export default AppointmentsTable;
