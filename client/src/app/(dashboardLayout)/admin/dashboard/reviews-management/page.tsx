import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { AdminReviewsList } from "@/components/modules/admin/reviewsManagement/AdminReviewsList";
import { getReviews } from "@/services/reviews.service";
import { DEFAULT_MY_REVIEWS_LIST_PARAMS } from "@/types/reviews.types";

async function ReviewsManagementPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["reviews", DEFAULT_MY_REVIEWS_LIST_PARAMS],
    queryFn: () => getReviews(DEFAULT_MY_REVIEWS_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminReviewsList />
    </HydrationBoundary>
  );
}

export default ReviewsManagementPage;
