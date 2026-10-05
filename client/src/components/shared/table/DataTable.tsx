"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationMeta } from "@/types/api.types";
import {
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useSyncExternalStore, type ReactNode } from "react";
import DataTableFilters, {
  type DataTableFilterConfig,
  type DataTableFilterValue,
  type DataTableFilterValues,
} from "./DataTableFilters";
import DataTablePagination from "./DataTablePagination";
import DataTableSearch from "./DataTableSearch";

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns,
});

export type DataTableColumnDef<TData extends RowData> = ColumnDef<
  typeof dataTableFeatures,
  TData
>;

interface DataTableActions<TData extends RowData> {
  onView?: (data: TData) => void;
  onEdit?: (data: TData) => void;
  onDelete?: (data: TData) => void;
}

interface DataTableProps<TData extends RowData> {
  data: TData[];
  columns: DataTableColumnDef<TData>[];
  actions?: DataTableActions<TData>;
  toolbarAction?: ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  getRowId?: (originalRow: TData, index: number) => string;
  tableKey?: string;
  sorting?: {
    state: SortingState;
    onSortingChange: (state: SortingState) => void;
  };
  pagination?: {
    state: PaginationState;
    onPaginationChange: (state: PaginationState) => void;
  };
  search?: {
    initialValue?: string;
    placeholder?: string;
    debounceMs?: number;
    onDebouncedChange: (value: string) => void;
  };
  filters?: {
    configs: DataTableFilterConfig[];
    values: DataTableFilterValues;
    onFilterChange: (
      filterId: string,
      value: DataTableFilterValue | undefined,
    ) => void;
    onClearAll?: () => void;
  };
  meta?: PaginationMeta;
}

const applyUpdater = <T,>(updater: Updater<T>, current: T): T => {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(current)
    : updater;
};

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const DataTable = <TData extends RowData,>({
  data,
  columns,
  actions,
  toolbarAction,
  emptyMessage,
  isLoading,
  getRowId,
  tableKey = "data-table",
  sorting,
  pagination,
  search,
  filters,
  meta,
}: DataTableProps<TData>) => {
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot,
  );
  const hydratedIsLoading = isClient && Boolean(isLoading);

  const tableColumns: DataTableColumnDef<TData>[] = actions
    ? [
        ...columns,
        {
          id: "actions",
          header: "Actions",
          enableSorting: false,
          cell: (info) => {
            const rowData = info.row.original;

            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="h-8 w-8 p-0" />
                  }
                >
                  <span className="sr-only">Open Menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {actions.onView ? (
                    <DropdownMenuItem
                      onClick={() => actions.onView?.(rowData)}
                    >
                      View
                    </DropdownMenuItem>
                  ) : null}

                  {actions.onEdit ? (
                    <DropdownMenuItem
                      onClick={() => actions.onEdit?.(rowData)}
                    >
                      Edit
                    </DropdownMenuItem>
                  ) : null}

                  {actions.onDelete ? (
                    <DropdownMenuItem
                      onClick={() => actions.onDelete?.(rowData)}
                    >
                      Delete
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ]
    : columns;

  const table = useTable({
    key: tableKey,
    features: dataTableFeatures,
    data,
    columns: tableColumns,
    getRowId,
    manualSorting: Boolean(sorting),
    manualPagination: Boolean(pagination),
    pageCount: pagination ? Math.max(meta?.totalPages ?? 0, 0) : undefined,
    rowCount: pagination ? meta?.total : undefined,
    initialState: pagination
      ? undefined
      : {
          pagination: {
            pageIndex: 0,
            pageSize: Number.POSITIVE_INFINITY,
          },
        },
    state: {
      ...(sorting ? { sorting: sorting.state } : {}),
      ...(pagination ? { pagination: pagination.state } : {}),
    },
    onSortingChange: sorting
      ? (updater) => {
          sorting.onSortingChange(applyUpdater(updater, sorting.state));
        }
      : undefined,
    onPaginationChange: pagination
      ? (updater) => {
          pagination.onPaginationChange(
            applyUpdater(updater, pagination.state),
          );
        }
      : undefined,
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="relative">
      {hydratedIsLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Spinner className="size-8" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      ) : null}

      {search || filters || toolbarAction ? (
        <div className="mb-4 flex flex-wrap items-start gap-3">
          {search ? (
            <DataTableSearch
              initialValue={search.initialValue}
              placeholder={search.placeholder}
              debounceMs={search.debounceMs}
              onDebouncedChange={search.onDebouncedChange}
              isLoading={hydratedIsLoading}
            />
          ) : null}

          {filters ? (
            <DataTableFilters
              filters={filters.configs}
              values={filters.values}
              onFilterChange={filters.onFilterChange}
              onClearAll={filters.onClearAll}
              isLoading={hydratedIsLoading}
            />
          ) : null}

          {toolbarAction ? (
            <div className="ml-auto shrink-0">{toolbarAction}</div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="-ml-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="ml-1 h-4 w-4" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage || "No data available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {pagination ? (
          <DataTablePagination
            table={table}
            totalPages={meta?.totalPages}
            totalRows={meta?.total}
            isLoading={hydratedIsLoading}
          />
        ) : null}
      </div>
    </div>
  );
};

export default DataTable;
