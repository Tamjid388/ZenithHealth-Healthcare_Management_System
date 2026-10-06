"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { ViewPatientModal } from "@/components/modules/admin/patientsManagement/ViewPatientModal";
import DataTable, {
  type DataTableColumnDef,
} from "@/components/shared/table/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPatients } from "@/services/patients.service";
import {
  DEFAULT_PATIENTS_LIST_PARAMS,
  type Patient,
  type PatientsQueryParams,
} from "@/types/patients.types";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = DEFAULT_PATIENTS_LIST_PARAMS.limit ?? 10;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const patientsColumns: DataTableColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => {
      const patient = info.row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            {patient.profilePhoto ? (
              <AvatarImage src={patient.profilePhoto} alt={patient.name} />
            ) : null}
            <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <p className="truncate font-medium">{patient.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "contactNumber",
    header: "Contact",
    cell: (info) => info.getValue<string | null | undefined>() ?? "—",
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: (info) => formatDate(info.getValue<string | undefined>()),
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

const buildPatientsQueryParams = ({
  searchTerm,
  pagination,
  sorting,
}: {
  searchTerm: string;
  pagination: PaginationState;
  sorting: SortingState;
}): PatientsQueryParams => {
  const params: PatientsQueryParams = {
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

type PatientsTableProps = {
  initialSearchParams?: SearchParamsRecord;
};

export const PatientsTable = ({
  initialSearchParams = {},
}: PatientsTableProps) => {
  const pathname = usePathname();
  const initial = getStateFromSearchParams(initialSearchParams);
  const [searchTerm, setSearchTerm] = useState(initial.searchTerm);
  const [sorting, setSorting] = useState<SortingState>(initial.sorting);
  const [pagination, setPagination] = useState<PaginationState>(
    initial.pagination,
  );
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const queryParams = useMemo(
    () =>
      buildPatientsQueryParams({
        searchTerm,
        pagination,
        sorting,
      }),
    [searchTerm, pagination, sorting],
  );

  const {
    data: patientsDataResponse,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["patients", queryParams],
    queryFn: () => getPatients(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30 * 3,
  });

  const patients = patientsDataResponse?.data ?? [];

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
            : "Failed to load patients. Please try again."}
        </p>
      ) : null}

      {!isError ? (
        <DataTable
          tableKey="admin-patients-table"
          data={patients}
          columns={patientsColumns}
          isLoading={isFetching}
          emptyMessage="No patients found."
          getRowId={(row) => row.id}
          meta={patientsDataResponse?.meta}
          actions={{
            onView: (row) => {
              setSelectedPatient(row);
              setViewOpen(true);
            },
          }}
          search={{
            initialValue: searchTerm,
            placeholder: "Search patients...",
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

      <ViewPatientModal
        patientId={selectedPatient?.id ?? null}
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) {
            setSelectedPatient(null);
          }
        }}
      />
    </div>
  );
};

export default PatientsTable;
