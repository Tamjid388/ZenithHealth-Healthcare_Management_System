"use client";

import { logoutAction } from "@/app/(commonLayout)/(auth)/logout/_action";
import { Button, DropdownMenuItem } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { unstable_rethrow } from "next/navigation";

type LogoutButtonProps = {
  variant?: "menu-item" | "ghost" | "sidebar" | "full";
  className?: string;
};

export const LogoutButton = ({
  variant = "menu-item",
  className,
}: LogoutButtonProps) => {
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    queryClient.clear();
    try {
      await logoutAction();
    } catch (error) {
      unstable_rethrow(error);
    }
  };

  if (variant === "menu-item") {
    return (
      <DropdownMenuItem
        onClick={() => {
          void handleLogout();
        }}
        className={cn("cursor-pointer text-red-600", className)}
      >
        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
        Logout
      </DropdownMenuItem>
    );
  }

  if (variant === "sidebar") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Log out"
        title="Log out"
        onClick={() => {
          void handleLogout();
        }}
        className={cn("shrink-0 cursor-pointer text-red-600 hover:text-red-600", className)}
      >
        <LogOut className="size-4" aria-hidden="true" />
      </Button>
    );
  }

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void handleLogout();
        }}
        className={cn("w-full cursor-pointer text-red-600", className)}
      >
        <LogOut className="mr-2 size-4" aria-hidden="true" />
        Log out
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => {
        void handleLogout();
      }}
      className={cn("cursor-pointer text-red-600 hover:text-red-600", className)}
    >
      <LogOut className="mr-2 size-4" aria-hidden="true" />
      Log out
    </Button>
  );
};

export default LogoutButton;
