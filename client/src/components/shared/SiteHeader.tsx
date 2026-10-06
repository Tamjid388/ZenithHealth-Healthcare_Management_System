"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import SiteLogo from "@/components/shared/SiteLogo";
import Container from "@/components/layout/Container";
import { LogoutButton } from "@/components/modules/dashboard/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resolveDashboardRoute } from "@/lib/authUtlils";
import { cn } from "@/lib/utils";
import { UserInfo } from "@/types/user.types";

interface SiteHeaderProps {
  userInfo: UserInfo | null;
}

const navLinks = [
  { href: "/consultation", label: "Consultation" },
  { href: "/medicines", label: "Medicines" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/health-plans", label: "Health Plans" },
  { href: "/ngos", label: "NGOs" },
] as const;

export default function SiteHeader({ userInfo }: SiteHeaderProps) {
  const dashboardHref = resolveDashboardRoute(userInfo?.role);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zh-blue-deep/10 bg-zh-mist/80 backdrop-blur-md">
      <Container width="wide">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <Link
            href="/"
            aria-label="Zenith Health home"
            className="rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <SiteLogo />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 text-[0.9375rem] font-medium text-zh-ink/75 md:flex lg:gap-1"
          >
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative rounded-lg px-3 py-2 transition-colors hover:bg-zh-foam/60 hover:text-zh-blue-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    isActive && "text-zh-blue-deep",
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-zh-blue transition-transform duration-300",
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex size-11 items-center justify-center rounded-xl text-zh-ink transition-colors hover:bg-zh-foam focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-6" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56 text-base">
                {navLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.href}
                    render={<Link href={link.href} />}
                    className="px-3 py-3 text-base"
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
                {dashboardHref && (
                  <DropdownMenuItem
                    render={<Link href={dashboardHref} />}
                    className="px-3 py-3 text-base"
                  >
                    Dashboard
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {dashboardHref ? (
              <>
                <Link href={dashboardHref} className="hidden sm:block">
                  <Button
                    size="lg"
                    className="h-11 rounded-xl bg-zh-blue px-5 text-[0.9375rem] text-primary-foreground transition-colors hover:bg-zh-blue-deep active:scale-[0.98]"
                  >
                    Dashboard
                  </Button>
                </Link>
                <LogoutButton
                  variant="ghost"
                  className="hidden h-11 px-4 text-[0.9375rem] sm:inline-flex"
                />
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-11 px-4 text-[0.9375rem] text-zh-ink transition-colors hover:bg-zh-foam"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-11 rounded-xl bg-zh-blue px-4 text-[0.9375rem] text-primary-foreground transition-colors hover:bg-zh-blue-deep active:scale-[0.98] sm:px-5"
                  >
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
