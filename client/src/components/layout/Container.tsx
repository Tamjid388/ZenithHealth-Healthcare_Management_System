import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ContainerWidth = "narrow" | "default" | "wide" | "full";

const widthStyles: Record<ContainerWidth, string> = {
  // Text-heavy content: comfortable reading measure.
  narrow: "max-w-3xl",
  // Default product width: 80rem. Roomier than the old 72rem cap
  // without stretching text on ultra-wide screens.
  default: "max-w-[80rem]",
  // Wide editorial / bento / hero grids that benefit from viewport width.
  wide: "max-w-[88rem]",
  // Full-bleed inner (still capped to avoid ultra-wide stretch).
  full: "max-w-[96rem]",
};

interface ContainerProps {
  as?: ElementType;
  width?: ContainerWidth;
  className?: string;
  children: ReactNode;
}

/**
 * Shared responsive container primitive.
 *
 * - Fluid inline padding via clamp(): 1rem on 320px phones,
 *   scaling to 2.5rem on large desktops.
 * - Width is capped per variant so ultra-wide screens stay composed.
 * - Sections compose this instead of one-off max-w / px values.
 */
export default function Container({
  as,
  width = "default",
  className,
  children,
}: ContainerProps) {
  const Tag = (as ?? "div") as ElementType;

  return (
    <Tag
      className={cn(
        "mx-auto w-full px-[clamp(1rem,4vw,2.5rem)]",
        widthStyles[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
