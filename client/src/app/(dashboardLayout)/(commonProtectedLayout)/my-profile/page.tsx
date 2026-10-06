import { MyProfileContent } from "@/components/modules/profile/MyProfileContent";
import { getMyProfile } from "@/services/profile.service";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

async function MyProfilePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["user", "me"],
    queryFn: getMyProfile,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account and role information.
          </p>
        </div>
        <MyProfileContent />
      </div>
    </HydrationBoundary>
  );
}

export default MyProfilePage;
