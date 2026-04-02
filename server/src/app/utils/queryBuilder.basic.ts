import {
  IqueryConfig,
  IqueryParams,
  PrismaCountArgs,
  PrismaFindManyArgs,
  PrismaModelDelegate,
  PrismaStringFilter,
  PrismaWhereConditions,
} from "../interfaces/basic.query.interface";

const META_PARAM_KEYS = new Set([
  "searchterm",
  "searchTerm",
  "page",
  "limit",
  "sortBy",
  "sortOrder",
  "fields",
  "includes",
]);

const RELATION_FILTER_OPS = new Set(["some", "every", "none"]);

export interface QueryListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class QueryBuilder<T = unknown> {
  private query: PrismaFindManyArgs;
  private countQuery: PrismaCountArgs;
  private page = 1;
  private limit = 10;
  private skip = 0;
  private sortBy = "createdAt";
  private sortOrder: "asc" | "desc" = "desc";

  constructor(
    private model: PrismaModelDelegate,
    private queryParams: IqueryParams,
    private config: IqueryConfig,
  ) {
    this.query = {
      where: {},
      skip: 0,
      take: 10,
    };
    this.countQuery = {
      where: {},
    };
  }

  private getSearchText(): string | undefined {
    const t =
      this.queryParams.searchTerm ?? this.queryParams.searchterm ?? undefined;
    return t?.trim() || undefined;
  }

  search(): this {
    const searchTerm = this.getSearchText();
    const { searchableFields } = this.config;
    if (!searchTerm || !searchableFields?.length) {
      return this;
    }

    const searchConditions: Record<string, unknown>[] = [];

    for (const field of searchableFields) {
      const stringFilter: PrismaStringFilter = {
        contains: searchTerm,
        mode: "insensitive",
      };

      if (!field.includes(".")) {
        searchConditions.push({ [field]: stringFilter });
        continue;
      }

      const parts = field.split(".");
      if (parts.length === 2) {
        const [relation, leaf] = parts;
        searchConditions.push({
          [relation]: { [leaf]: stringFilter },
        });
      } else if (parts.length === 3) {
        const [relation, nestedRelation, leaf] = parts;
        searchConditions.push({
          [relation]: {
            [nestedRelation]: { [leaf]: stringFilter },
          },
        });
      }
    }

    if (searchConditions.length === 0) {
      return this;
    }

    const whereConditions = this.query.where as PrismaWhereConditions;
    const countWhereConditions = this.countQuery.where as PrismaWhereConditions;
    whereConditions.OR = searchConditions;
    countWhereConditions.OR = searchConditions;
    return this;
  }

  filter(): this {
    const { filterableFields } = this.config;
    if (!filterableFields?.length) {
      return this;
    }

    const allowed = new Set(filterableFields);
    const filterClauses: Record<string, unknown>[] = [];

    for (const [key, raw] of Object.entries(this.queryParams)) {
      if (META_PARAM_KEYS.has(key)) continue;
      if (!allowed.has(key)) continue;
      if (raw === undefined || raw === "") continue;
      filterClauses.push(this.buildFilterClause(key, raw));
    }

    if (filterClauses.length === 0) {
      return this;
    }

    const where = this.query.where as PrismaWhereConditions;
    const countWhere = this.countQuery.where as PrismaWhereConditions;
    where.AND = [...(where.AND ?? []), ...filterClauses];
    countWhere.AND = [...(countWhere.AND ?? []), ...filterClauses];
    return this;
  }

  private buildFilterClause(
    fieldPath: string,
    raw: string,
  ): Record<string, unknown> {
    const parts = fieldPath.split(".");
    const leafName = parts[parts.length - 1];
    const value = this.coerceFilterValue(leafName, raw);

    if (parts.length >= 3 && RELATION_FILTER_OPS.has(parts[1])) {
      const [relation, quantifier, ...rest] = parts;
      const inner = this.nestLinear(rest, value);
      return {
        [relation]: { [quantifier]: inner },
      };
    }

    return this.nestLinear(parts, value);
  }

  private nestLinear(parts: string[], value: unknown): Record<string, unknown> {
    if (parts.length === 1) {
      return { [parts[0]]: value };
    }
    return { [parts[0]]: this.nestLinear(parts.slice(1), value) };
  }

  private coerceFilterValue(fieldName: string, raw: string): unknown {
    const lower = raw.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;

    if (/^-?\d+$/.test(raw)) {
      return Number.parseInt(raw, 10);
    }
    if (/^-?\d+\.\d+$/.test(raw)) {
      return Number.parseFloat(raw);
    }

    const looksLikeDate =
      /(date|time|at)$/i.test(fieldName) || /^\d{4}-\d{2}-\d{2}/.test(raw);
    if (looksLikeDate) {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) {
        return d;
      }
    }

    return raw;
  }

  paginate(): this {
    const max = this.config.maxLimit ?? 100;
    const pageRaw = this.queryParams.page;
    const limitRaw = this.queryParams.limit;

    const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);
    let limit = Number.parseInt(limitRaw ?? "10", 10) || 10;
    limit = Math.min(Math.max(1, limit), max);

    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;

    this.query.skip = this.skip;
    this.query.take = limit;
    return this;
  }

  sort(): this {
    const sortByParam = this.queryParams.sortBy?.trim();
    const orderRaw = (this.queryParams.sortOrder ?? "desc").toLowerCase();
    const sortOrder: "asc" | "desc" = orderRaw === "asc" ? "asc" : "desc";

    const allowedSorts = this.allowedSortFields();
    const sortField =
      sortByParam && allowedSorts.has(sortByParam) ? sortByParam : "createdAt";

    this.sortBy = sortField;
    this.sortOrder = sortOrder;

    this.query.orderBy = { [sortField]: sortOrder };
    return this;
  }

  private allowedSortFields(): Set<string> {
    if (this.config.sortableFields?.length) {
      return new Set(this.config.sortableFields);
    }
    const base = new Set([
      "id",
      "createdAt",
      "updatedAt",
      ...this.config.filterableFields,
    ]);
    return base;
  }

  /**
   * Applies `?fields=a,b,c` as Prisma `select`. Mutually exclusive with `include` on the same query.
   */
  fields(): this {
    const raw = this.queryParams.fields?.trim();
    if (!raw) {
      return this;
    }

    const names = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const allowed = this.config.selectableFields?.length
      ? new Set(this.config.selectableFields)
      : null;

    const select: Record<string, boolean> = {};
    for (const name of names) {
      if (allowed && !allowed.has(name)) continue;
      select[name] = true;
    }

    if (Object.keys(select).length === 0) {
      return this;
    }

    delete this.query.include;
    this.query.select = select;
    return this;
  }

  /**
   * Merges `?includes=rel1,rel2` or config `defaultInclude` into Prisma `include`.
   */
  include(): this {
    if (this.query.select) {
      return this;
    }

    const fromQuery = this.queryParams.includes?.trim();
    let include: Record<string, boolean | Record<string, unknown>> = {};

    if (fromQuery) {
      for (const name of fromQuery
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)) {
        include[name] = true;
      }
    } else if (this.config.defaultInclude) {
      include = { ...this.config.defaultInclude };
    }

    if (Object.keys(include).length === 0) {
      return this;
    }

    this.query.include = include;
    return this;
  }

  private stripEmptyArgs(): void {
    const w = this.query.where as Record<string, unknown> | undefined;
    if (w && Object.keys(w).length === 0) {
      delete this.query.where;
      delete this.countQuery.where;
    }
  }

  async execute(): Promise<{ data: T[]; meta: QueryListMeta }> {
    this.stripEmptyArgs();

    const [data, total] = await Promise.all([
      this.model.findMany(this.query),
      this.model.count(this.countQuery),
    ]);

    const totalPages = this.limit > 0 ? Math.ceil(total / this.limit) : 0;

    return {
      data: data as T[],
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages,
      },
    };
  }

  /** Raw Prisma args after building (for custom calls). */
  getFindManyArgs(): PrismaFindManyArgs {
    this.stripEmptyArgs();
    return { ...this.query };
  }

  getCountArgs(): PrismaCountArgs {
    this.stripEmptyArgs();
    return { ...this.countQuery };
  }
}

/** Run list + count with the usual chain defaults. */
export async function runPagedQuery<T>(
  model: PrismaModelDelegate,
  queryParams: IqueryParams,
  config: IqueryConfig,
): Promise<{ data: T[]; meta: QueryListMeta }> {
  const qb = new QueryBuilder<T>(model, queryParams, config);
  return qb.search().filter().paginate().sort().fields().include().execute();
}
