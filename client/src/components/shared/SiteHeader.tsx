"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import SiteLogo from "@/components/shared/SiteLogo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resolveDashboardRoute } from "@/lib/authUtlils";
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
  const dashboardHref = resolveDashboardRoute(userInfo?.role)

  return (
    <header className="sticky top-0 z-50 border-b border-zh-blue-deep/10 bg-zh-mist/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Zenith Health home"
          className="transition-opacity hover:opacity-80"
        >
          <SiteLogo />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-5 text-base font-medium text-zh-ink/80 lg:gap-8 md:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-zh-blue"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex size-11 items-center justify-center rounded-lg text-zh-ink transition-colors hover:bg-muted md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52 text-base">
              {navLinks.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  render={<Link href={link.href} />}
                  className="px-2.5 py-2.5 text-base"
                >
                  {link.label}
                </DropdownMenuItem>
              ))}
              {dashboardHref && (
                <DropdownMenuItem
                  render={<Link href={dashboardHref} />}
                  className="px-2.5 py-2.5 text-base"
                >
                  Dashboard
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {dashboardHref ? (
            <Link href={dashboardHref}>
              <Button
                size="lg"
                className="h-11 rounded-xl bg-zh-blue px-5 text-base text-primary-foreground hover:bg-zh-blue-deep"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-11 px-4 text-base text-zh-ink"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-11 rounded-xl bg-zh-blue px-5 text-base text-primary-foreground hover:bg-zh-blue-deep"
                >
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
