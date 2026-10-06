import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { MyReviewsList } from "@/components/modules/doctor/myReviews/MyReviewsList";
import { getMyReviews } from "@/services/reviews.service";
import { DEFAULT_MY_REVIEWS_LIST_PARAMS } from "@/types/reviews.types";

async function DoctorReviewsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["my-reviews", DEFAULT_MY_REVIEWS_LIST_PARAMS],
    queryFn: () => getMyReviews(DEFAULT_MY_REVIEWS_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyReviewsList />
    </HydrationBoundary>
  );
}

export default DoctorReviewsPage;
