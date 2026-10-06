import type { ReactNode } from "react";

import Container, { type ContainerWidth } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  headingId?: string;
  className?: string;
}

/**
 * Consistent section heading: eyebrow rule + fluid display type +
 * capped reading measure. Keeps hierarchy identical across
 * Features / Services / Path instead of one-off heading styles.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  headingId,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-[44rem]",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "flex items-center gap-2.5 text-[0.8125rem] font-semibold tracking-[0.16em] text-zh-blue uppercase",
            align === "center" && "justify-center",
          )}
        >
          <span
            aria-hidden="true"
            className="inline-block h-px w-7 bg-zh-blue/60"
          />
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={headingId}
        className="mt-3 font-heading text-[clamp(1.875rem,1.2rem+2.4vw,3rem)] leading-[1.04] tracking-tight text-balance text-zh-blue-deep"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-[62ch] text-[clamp(1rem,0.95rem+0.4vw,1.125rem)] leading-relaxed text-pretty text-zh-ink/70">
          {description}
        </p>
      ) : null}
    </div>
  );
}

type HomeSectionProps = {
  width?: ContainerWidth;
  innerClassName?: string;
  children: ReactNode;
} & React.ComponentPropsWithoutRef<"section">;

/**
 * Home section primitive: fluid vertical rhythm + shared container.
 *
 * - Vertical padding scales with viewport: 3.5rem on phones,
 *   up to 6rem on large desktops.
 * - Width variants fix the old fixed narrow container without
 *   media-query hacks: `wide` for grids/bento/hero, `default`
 *   for balanced sections, `narrow` for text-heavy content.
 */
export default function HomeSection({
  width = "wide",
  className,
  innerClassName,
  children,
  ...props
}: HomeSectionProps) {
  return (
    <section
      className={cn("py-[clamp(3.5rem,7vw,6rem)]", className)}
      {...props}
    >
      <Container width={width} className={innerClassName}>
        {children}
      </Container>
    </section>
  );
}
