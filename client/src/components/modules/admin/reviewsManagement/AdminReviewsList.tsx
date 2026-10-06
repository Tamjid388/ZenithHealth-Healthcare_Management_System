"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getReviews } from "@/services/reviews.service";
import {
  DEFAULT_MY_REVIEWS_LIST_PARAMS,
  Review,
} from "@/types/reviews.types";

const PAGE_SIZE = DEFAULT_MY_REVIEWS_LIST_PARAMS.limit ?? 10;

function AdminReviewCard({ review }: { review: Review }) {
  return (
    <Card className="rounded-2xl bg-white ring-1 ring-zh-blue-deep/10">
      <CardContent className="space-y-2.5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zh-ink"
            aria-label={`Rated ${review.rating} out of 5`}
          >
            <Star
              aria-hidden="true"
              className="size-4 fill-zh-blue text-zh-blue"
            />
            {review.rating.toFixed(1)}
          </span>
          {review.createdAt ? (
            <time
              dateTime={new Date(review.createdAt).toISOString()}
              className="text-xs text-zh-ink/50"
            >
              {format(new Date(review.createdAt), "d MMM yyyy")}
            </time>
          ) : null}
        </div>
        {review.comment ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-zh-ink/80">
            {review.comment}
          </p>
        ) : (
          <p className="text-sm text-zh-ink/45 italic">No written comment.</p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="secondary" className="rounded-full">
            {review.doctor?.name ?? "—"}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {review.patient?.name ?? "Patient"}
          </Badge>
          {review.appointment?.status ? (
            <Badge variant="outline" className="rounded-full">
              {review.appointment.status}
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminReviewsList() {
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({ ...DEFAULT_MY_REVIEWS_LIST_PARAMS, page, limit: PAGE_SIZE }),
    [page],
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["reviews", queryParams],
    queryFn: () => getReviews(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30 * 3,
  });

  const reviews = data?.data ?? [];
  const total = data?.meta?.total ?? reviews.length;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
          Reviews
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading
            ? "Loading reviews…"
            : `${total} ${total === 1 ? "review" : "reviews"} on the platform.`}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-destructive/20">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <CircleAlert className="size-5" aria-hidden="true" />
          </span>
          <p className="max-w-md text-sm text-zh-ink/75">
            {error instanceof Error
              ? error.message
              : "Failed to load reviews. Please try again."}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && reviews.length === 0 ? (
        <p className="rounded-2xl bg-white px-6 py-10 text-center text-sm text-zh-ink/65 ring-1 ring-zh-blue-deep/10">
          No reviews on the platform yet.
        </p>
      ) : null}

      {!isLoading && !isError && reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id}>
              <AdminReviewCard review={review} />
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && !isError && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="h-11 cursor-pointer rounded-xl"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </Button>
          <p className="text-sm text-zh-ink/60" aria-live="polite">
            Page {page} of {totalPages}
            {isFetching ? " — updating…" : ""}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="h-11 cursor-pointer rounded-xl"
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
