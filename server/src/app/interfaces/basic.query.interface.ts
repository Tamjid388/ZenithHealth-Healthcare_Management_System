export type PrismaSortOrder = "asc" | "desc";

export interface PrismaFindManyArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | null | Record<string, unknown>>;
  orderBy?:
    | Record<string, PrismaSortOrder | Record<string, unknown>>
    | Record<string, unknown>[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;
}
export interface PrismaCountArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | null | Record<string, unknown>>;
  orderBy?: Record<string, boolean | null | Record<string, unknown>>;
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;
}

export interface PrismaModelDelegate {
  findMany: (args?: any) => Promise<any[]>;
  count: (args?: any) => Promise<number>;
}
export interface IqueryParams {
  searchterm?: string;
  /** Alias for `searchterm` (query string convenience). */
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  /** Comma-separated root field names to return (builds Prisma `select`). */
  fields?: string;
  /** Comma-separated relation names for Prisma `include` (top-level only). */
  includes?: string;
  [key: string]: string | undefined;
}
export interface IqueryConfig {
  searchableFields: string[];
  filterableFields: string[];
  /** Allowed `sortBy` keys; if omitted, `filterableFields` plus common timestamps are allowed. */
  sortableFields?: string[];
  /** Allowed `fields` select keys; if omitted, any requested field name is passed through. */
  selectableFields?: string[];
  /** Default relations to include when `includes` query param is not sent. */
  defaultInclude?: Record<string, boolean | Record<string, unknown>>;
  /** Upper bound for `limit` (default 100). */
  maxLimit?: number;
}

export interface PrismaStringFilter {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: "default" | "insensitive";
  equals?: string;
  not?: string;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
}

export interface PrismaWhereConditions {
  OR?: Record<string, unknown>[];
  AND?: Record<string, unknown>[];
  NOT?: Record<string, unknown>[];
  [key: string]: unknown;
}
