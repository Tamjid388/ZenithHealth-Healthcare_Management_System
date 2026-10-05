import AdminDashboardContent from "@/components/modules/dashboard/admin/AdminDashboardContent";
import { getDashboardData } from "@/services/dashboard.service";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";


async function AdminDashboardPage () {
    const queryClient=new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ["admin-dashboard-data"],
        queryFn: getDashboardData,
    });
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminDashboardContent />
        </HydrationBoundary>
    )
}

export default AdminDashboardPage