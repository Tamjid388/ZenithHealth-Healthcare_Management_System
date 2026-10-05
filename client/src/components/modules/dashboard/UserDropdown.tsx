"use client";

import { logoutAction } from "@/app/(commonLayout)/(auth)/logout/_action";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { UserInfo } from "@/types/user.types";
import { useQueryClient } from "@tanstack/react-query";
import { Key, LayoutDashboard, LogOut, User } from "lucide-react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";

interface UserDropdownProps {
  userInfo: UserInfo;
  dashboardHome: string;
}

const UserDropdown = ({ userInfo, dashboardHome }: UserDropdownProps) => {
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    queryClient.clear();
    try {
      await logoutAction();
    } catch (error) {
      unstable_rethrow(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={"outline"} size={"icon"} className="size-10 rounded-full" />
        }
      >
        <span className="text-base font-semibold">
          {userInfo.name.charAt(0).toUpperCase()}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={"end"} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{userInfo.name}</p>

              <p className="text-xs text-muted-foreground">{userInfo.email}</p>

              <p className="text-xs text-primary capitalize">
                {userInfo.role.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href={dashboardHome} />}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem render={<Link href={"/my-profile"} />}>
          <User className="mr-2 h-4 w-4" />
          My Profile
        </DropdownMenuItem>

        <DropdownMenuItem render={<Link href={"/change-password"} />}>
          <Key className="mr-2 h-4 w-4" />
          Change Password
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            void handleLogout();
          }}
          className="cursor-pointer text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
