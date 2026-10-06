export type Speciality = {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type SpecialitiesQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  title?: string;
};

export const DEFAULT_SPECIALITIES_LIST_PARAMS: SpecialitiesQueryParams = {
  page: 1,
  limit: 10,
};
