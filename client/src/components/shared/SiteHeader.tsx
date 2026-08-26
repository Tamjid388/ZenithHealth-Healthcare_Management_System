"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

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
    <header className="sticky top-0 z-50 border-b border-zh-teal-deep/10 bg-zh-mist/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-xl tracking-tight text-zh-teal-deep transition-colors hover:text-zh-teal"
        >
          Zenith Health
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 text-sm text-zh-ink/75 md:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-zh-teal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex size-8 items-center justify-center rounded-lg text-zh-ink transition-colors hover:bg-muted md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              {navLinks.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  render={<Link href={link.href} />}
                >
                  {link.label}
                </DropdownMenuItem>
              ))}
              {dashboardHref && (
                <DropdownMenuItem render={<Link href={dashboardHref} />}>
                  Dashboard
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {dashboardHref ? (
            <Link href={dashboardHref}>
              <Button className="bg-zh-teal text-primary-foreground hover:bg-zh-teal-deep">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-zh-ink">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-zh-teal text-primary-foreground hover:bg-zh-teal-deep">
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
