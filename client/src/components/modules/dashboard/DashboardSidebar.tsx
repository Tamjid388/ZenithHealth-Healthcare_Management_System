import { isAuthUserRole, resolveDashboardRoute } from "@/lib/authUtlils";
import { getNavItemsByRole } from "@/lib/navItems";
import { getUserInfo } from "@/services/auth.service";
import { NavSection } from "@/types/dashboard.types";
import DashboardSidebarContent from "./DashboardSidebarContent";

export const DashboardSidebar = async () => {
  const userInfo = await getUserInfo()
  const hasValidRole = userInfo && isAuthUserRole(userInfo.role)
  const navItems: NavSection[] = hasValidRole
    ? getNavItemsByRole(userInfo.role)
    : []
  const dashboardHome = resolveDashboardRoute(userInfo?.role) ?? "/"

  if (!hasValidRole) {
    return null
  }

  return (
    <div>
      <DashboardSidebarContent
        userInfo={userInfo}
        navItems={navItems}
        dashboardHome={dashboardHome}
      />
    </div>
  )
}
export default DashboardSidebar;
