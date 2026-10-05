import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type HomeSectionProps<T extends ElementType = "section"> = {
  as?: T;
  innerClassName?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export default function HomeSection<T extends ElementType = "section">({
  as,
  className,
  innerClassName,
  children,
  ...props
}: HomeSectionProps<T>) {
  const Tag = as ?? "section";

  return (
    <Tag
      className={cn("px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24", className)}
      {...props}
    >
      <div className={cn("mx-auto w-full max-w-7xl", innerClassName)}>{children}</div>
    </Tag>
  );
}
