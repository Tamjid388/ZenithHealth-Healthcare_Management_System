"use client"

import { Separator } from "@/components/ui";
import { LogoutButton } from "@/components/modules/dashboard/LogoutButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetTitle } from "@/components/ui/sheet";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import SiteLogo from "@/components/shared/SiteLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardMobileSidebarProps{
    userInfo : UserInfo;
    navItems : NavSection[];
    dashboardHome : string;
}


const DashboardMobileSidebar = ({dashboardHome, navItems, userInfo} : DashboardMobileSidebarProps ) => {
    const pathname = usePathname()
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Logo / Brand */}
      <div className="flex min-h-20 items-center border-b px-6 py-6">
        <Link href={dashboardHome} aria-label="Zenith Health dashboard">
          <SiteLogo size="sm" />
        </Link>
      </div>

      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

      {/* Navigation Area  */}

      <ScrollArea className="flex-1 px-3 py-6">
        <nav className="space-y-1">
          {navItems.map((section, sectionId) => (
            <div key={sectionId}>
              {section.title && (
                <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                  {section.title}
                </h4>
              )}

              <div className="space-y-1">
                {section.items.map((item, id) => {
                  const isActive = pathname === item.href;
                  const Icon = getIconComponent(item.icon);

                  return (
                    <Link
                      href={item.href}
                      key={id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                    </Link>
                  );
                })}
              </div>

              {sectionId < navItems.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info */}
      <div className="space-y-3 border-t px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {/* if profile doesnt exist , use first letter of user name as profile photo like component */}
            <span className="text-sm font-semibold text-primary">
              {userInfo.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{userInfo.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {userInfo.role.toLocaleLowerCase().replace("_", " ")}
            </p>
          </div>

          <LogoutButton variant="sidebar" />
        </div>

        <LogoutButton variant="full" />
      </div>
    </div>
  );
}

export default DashboardMobileSidebar