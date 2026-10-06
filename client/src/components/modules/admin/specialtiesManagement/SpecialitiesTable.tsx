"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { DeleteSpecialityDialog } from "@/components/modules/admin/specialtiesManagement/DeleteSpecialityDialog";
import { EditSpecialityModal } from "@/components/modules/admin/specialtiesManagement/EditSpecialityModal";
import { ViewSpecialityModal } from "@/components/modules/admin/specialtiesManagement/ViewSpecialityModal";
import DataTable, {
  type DataTableColumnDef,
} from "@/components/shared/table/DataTable";
import { getSpecialities } from "@/services/specialities.service";
import {
  DEFAULT_SPECIALITIES_LIST_PARAMS,
  type SpecialitiesQueryParams,
  type Speciality,
} from "@/types/specialities.types";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = DEFAULT_SPECIALITIES_LIST_PARAMS.limit ?? 10;

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

function getInitials(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const specialitiesColumns: DataTableColumnDef<Speciality>[] = [
  {
    accessorKey: "title",
    header: "Speciality",
    cell: (info) => {
      const speciality = info.row.original;
      return (
        <div className="flex items-center gap-3">
          {speciality.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={speciality.icon}
              alt={speciality.title}
              className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-zh-blue-deep/10"
            />
          ) : (
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-zh-blue-deep/10 text-sm font-semibold text-zh-blue-deep">
              {getInitials(speciality.title)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{speciality.title}</p>
            {speciality.description ? (
              <p className="max-w-md truncate text-xs text-muted-foreground">
                {speciality.description}
              </p>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: (info) => formatDateTime(info.getValue<string | Date>()),
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

const buildSpecialitiesQueryParams = ({
  searchTerm,
  pagination,
  sorting,
}: {
  searchTerm: string;
  pagination: PaginationState;
  sorting: SortingState;
}): SpecialitiesQueryParams => {
  const params: SpecialitiesQueryParams = {
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

type SpecialitiesTableProps = {
  initialSearchParams?: SearchParamsRecord;
};

export const SpecialitiesTable = ({
  initialSearchParams = {},
}: SpecialitiesTableProps) => {
  const pathname = usePathname();
  const initial = getStateFromSearchParams(initialSearchParams);
  const [searchTerm, setSearchTerm] = useState(initial.searchTerm);
  const [sorting, setSorting] = useState<SortingState>(initial.sorting);
  const [pagination, setPagination] = useState<PaginationState>(
    initial.pagination,
  );
  const [selectedSpeciality, setSelectedSpeciality] =
    useState<Speciality | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const queryParams = useMemo(
    () =>
      buildSpecialitiesQueryParams({
        searchTerm,
        pagination,
        sorting,
      }),
    [searchTerm, pagination, sorting],
  );

  const {
    data: specialitiesDataResponse,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["specialities", queryParams],
    queryFn: () => getSpecialities(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30 * 3,
  });

  const specialities = specialitiesDataResponse?.data ?? [];

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
            : "Failed to load specialities. Please try again."}
        </p>
      ) : null}

      {!isError ? (
        <DataTable
          tableKey="admin-specialities-table"
          data={specialities}
          columns={specialitiesColumns}
          isLoading={isFetching}
          emptyMessage="No specialities found."
          getRowId={(row) => row.id}
          meta={specialitiesDataResponse?.meta}
          actions={{
            onView: (row) => {
              setSelectedSpeciality(row);
              setViewOpen(true);
            },
            onEdit: (row) => {
              setSelectedSpeciality(row);
              setEditOpen(true);
            },
            onDelete: (row) => {
              setSelectedSpeciality(row);
              setDeleteOpen(true);
            },
          }}
          search={{
            initialValue: searchTerm,
            placeholder: "Search specialities...",
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

      <ViewSpecialityModal
        speciality={selectedSpeciality}
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) {
            setSelectedSpeciality(null);
          }
        }}
      />

      <EditSpecialityModal
        speciality={selectedSpeciality}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setSelectedSpeciality(null);
          }
        }}
      />

      <DeleteSpecialityDialog
        specialityId={selectedSpeciality?.id ?? null}
        specialityTitle={selectedSpeciality?.title ?? null}
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setSelectedSpeciality(null);
          }
        }}
      />
    </div>
  );
};

export default SpecialitiesTable;
