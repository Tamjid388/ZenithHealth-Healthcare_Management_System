# TanStack Query prefetch reference (copied from this codebase)

Source files are canonical — snippets below are quoted from them, not rewritten.

## 1. Server page: prefetch + `HydrationBoundary`

From `client/src/app/(dashboardLayout)/admin/dashboard/specialties-management/page.tsx`:

```tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

async function SpecialtiesManagementPage({ searchParams }: SpecialtiesManagementPageProps) {
  const initialSearchParams = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["specialities", DEFAULT_SPECIALITIES_LIST_PARAMS],
    queryFn: () => getSpecialities(DEFAULT_SPECIALITIES_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        {/* ... */}
        <SpecialitiesTable initialSearchParams={initialSearchParams} />
      </div>
    </HydrationBoundary>
  );
}
```

Rules: `queryKey` embeds the exact params object; `staleTime` on prefetch matches the client `useQuery` so first paint serves cache with no refetch flash.

## 2. Client leaf: `useQuery` reads the same key

From `client/src/components/modules/admin/specialtiesManagement/SpecialitiesTable.tsx` (note: the `"use server"` service is called directly inside `queryFn` — this is the repo pattern):

```tsx
"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getSpecialities } from "@/services/specialities.service";

const {
  data: specialitiesDataResponse,
  isFetching,
  isError,
  error,
} = useQuery({
  queryKey: ["specialities", queryParams],
  queryFn: () => getSpecialities(queryParams),
  placeholderData: keepPreviousData, // keeps old rows visible across page/search changes
  staleTime: 1000 * 30 * 3,
});

const specialities = specialitiesDataResponse?.data ?? [];
```

Rules: same `queryKey` shape as the prefetch; `placeholderData: keepPreviousData` for paginated tables; read rows from `response.data` (the `ApiResponse<T>` envelope).

## 3. Server service: `"use server"` + `httpClient`

From `client/src/services/specialities.service.ts` (server-only — never import `httpClient` in client components):

```ts
"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";

export const getSpecialities = async (
  params: SpecialitiesQueryParams = DEFAULT_SPECIALITIES_LIST_PARAMS,
): Promise<ApiResponse<Speciality[]>> => {
  return httpClient.get("/speciality", {
    params: params as Record<string, unknown>,
  });
};
```

## 4. Mutation + cache update

From `client/src/components/modules/auth/LoginForm.tsx`:

```tsx
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();
const { mutateAsync } = useMutation({
  mutationFn: async (data: TLogin) => loginAction(data, redirectUrl),
});

// inside submit handler, after success:
queryClient.invalidateQueries({ queryKey: ["user"] });
```

For edit-in-place (Epic 4 pattern) prefer instant UI without refetch:

```tsx
const { mutateAsync } = useMutation({
  mutationFn: (data: TUpdateProfile) => updateMyProfile(data),
  onSuccess: (updated) => {
    queryClient.setQueryData(["user", "me"], updated);
    queryClient.invalidateQueries({ queryKey: ["user"] });
  },
});
```

## 5. Apply to this epic

| New page | Prefetch key | Service fn | Client leaf |
|---|---|---|---|
| `/my-profile` | `["user", "me"]` | `getMyProfile()` → `GET /auth/me` | `MyProfileContent` |
| `/admin/dashboard/admins-management` | `["admins", params]` | `getAdmins(params)` → `GET /admin` | `AdminsTable` |
| `/admin/dashboard/patients-management` | `["patients", params]` | `getPatients(params)` → `GET /patients` | `PatientsTable` |

Provider: `client/src/providers/QueryProvider.tsx` (default `staleTime: 60_000`, browser singleton + `ReactQueryStreamedHydration`). No setup needed per page.
