"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { DeleteAdminDialog } from "@/components/modules/admin/adminsManagement/DeleteAdminDialog";
import { EditAdminModal } from "@/components/modules/admin/adminsManagement/EditAdminModal";
import { ViewAdminModal } from "@/components/modules/admin/adminsManagement/ViewAdminModal";
import DataTable, {
  type DataTableColumnDef,
} from "@/components/shared/table/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAdmins } from "@/services/admins.service";
import {
  DEFAULT_ADMINS_LIST_PARAMS,
  type Admin,
  type AdminsQueryParams,
} from "@/types/admins.types";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = DEFAULT_ADMINS_LIST_PARAMS.limit ?? 10;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const adminsColumns: DataTableColumnDef<Admin>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => {
      const admin = info.row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            {admin.profilePhoto ? (
              <AvatarImage src={admin.profilePhoto} alt={admin.name} />
            ) : null}
            <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
          </Avatar>
          <p className="truncate font-medium">{admin.name}</p>
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
    id: "role",
    accessorKey: "user",
    header: "Role",
    cell: (info) => {
      const role = info.row.original.user?.role;
      return role ? (
        <Badge variant="secondary">
          {role.toLowerCase().replace("_", " ")}
        </Badge>
      ) : (
        "—"
      );
    },
  },
  {
    id: "status",
    accessorKey: "user",
    header: "Status",
    cell: (info) => {
      const statusValue = info.row.original.user?.status;
      return statusValue ? (
        <Badge variant={statusValue === "ACTIVE" ? "secondary" : "destructive"}>
          {statusValue}
        </Badge>
      ) : (
        "—"
      );
    },
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

const buildAdminsQueryParams = ({
  searchTerm,
  pagination,
  sorting,
}: {
  searchTerm: string;
  pagination: PaginationState;
  sorting: SortingState;
}): AdminsQueryParams => {
  const params: AdminsQueryParams = {
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

type AdminsTableProps = {
  initialSearchParams?: SearchParamsRecord;
  canManage?: boolean;
};

export const AdminsTable = ({
  initialSearchParams = {},
  canManage = false,
}: AdminsTableProps) => {
  const pathname = usePathname();
  const initial = getStateFromSearchParams(initialSearchParams);
  const [searchTerm, setSearchTerm] = useState(initial.searchTerm);
  const [sorting, setSorting] = useState<SortingState>(initial.sorting);
  const [pagination, setPagination] = useState<PaginationState>(
    initial.pagination,
  );
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const queryParams = useMemo(
    () =>
      buildAdminsQueryParams({
        searchTerm,
        pagination,
        sorting,
      }),
    [searchTerm, pagination, sorting],
  );

  const {
    data: adminsDataResponse,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["admins", queryParams],
    queryFn: () => getAdmins(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30 * 3,
  });

  const admins = adminsDataResponse?.data ?? [];

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
            : "Failed to load admins. Please try again."}
        </p>
      ) : null}

      {!isError ? (
        <DataTable
          tableKey="admin-admins-table"
          data={admins}
          columns={adminsColumns}
          isLoading={isFetching}
          emptyMessage="No admins found."
          getRowId={(row) => row.id}
          meta={adminsDataResponse?.meta}
          actions={{
            onView: (row) => {
              setSelectedAdmin(row);
              setViewOpen(true);
            },
            onEdit: canManage
              ? (row) => {
                  setSelectedAdmin(row);
                  setEditOpen(true);
                }
              : undefined,
            onDelete: canManage
              ? (row) => {
                  setSelectedAdmin(row);
                  setDeleteOpen(true);
                }
              : undefined,
          }}
          search={{
            initialValue: searchTerm,
            placeholder: "Search admins...",
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

      <ViewAdminModal
        adminId={selectedAdmin?.id ?? null}
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) {
            setSelectedAdmin(null);
          }
        }}
      />

      {canManage ? (
        <>
          <EditAdminModal
            adminId={selectedAdmin?.id ?? null}
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) {
                setSelectedAdmin(null);
              }
            }}
          />

          <DeleteAdminDialog
            adminId={selectedAdmin?.id ?? null}
            adminName={selectedAdmin?.name ?? null}
            open={deleteOpen}
            onOpenChange={(open) => {
              setDeleteOpen(open);
              if (!open) {
                setSelectedAdmin(null);
              }
            }}
          />
        </>
      ) : null}
    </div>
  );
};

export default AdminsTable;
