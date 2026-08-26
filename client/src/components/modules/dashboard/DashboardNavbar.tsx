import { isAuthUserRole, resolveDashboardRoute } from "@/lib/authUtlils"
import { getNavItemsByRole } from "@/lib/navItems"
import { getUserInfo } from "@/services/auth.service"
import { NavSection } from "@/types/dashboard.types"
import DashboardNavbarContent from "./DashboardNavbarContent"

export const DashboardNavbar = async () => {
  const userInfo = await getUserInfo()
  const hasValidRole = userInfo && isAuthUserRole(userInfo.role)
  const navItems: NavSection[] = hasValidRole
    ? getNavItemsByRole(userInfo.role)
    : []
  const dashboardHome = resolveDashboardRoute(userInfo?.role) ?? "/"

  return (
    <DashboardNavbarContent
      userInfo={hasValidRole ? userInfo : null}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  )
}
export default DashboardNavbar;
