"use client";

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
import { LogoutButton } from "@/components/modules/dashboard/LogoutButton";
import { UserInfo } from "@/types/user.types";
import { Key, LayoutDashboard, User, UserRound } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDropdownProps {
  userInfo: UserInfo;
  dashboardHome: string;
}

const UserDropdown = ({ userInfo, dashboardHome }: UserDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={"outline"}
            size={"icon"}
            aria-label={`Account menu for ${userInfo.name}`}
            className="size-10 cursor-pointer overflow-hidden rounded-full p-0"
          />
        }
      >
        <Avatar className="size-full">
          {userInfo.image ? (
            <AvatarImage src={userInfo.image} alt={userInfo.name} />
          ) : null}
          <AvatarFallback>
            <UserRound className="size-5" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
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

        <LogoutButton variant="menu-item" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
