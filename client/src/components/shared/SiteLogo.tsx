import { cn } from "@/lib/utils";

interface SiteLogoProps {
  inverted?: boolean;
  showWordmark?: boolean;
  size?: "sm" | "md";
  className?: string;
}

function LogoMark({ inverted, size }: { inverted: boolean; size: "sm" | "md" }) {
  const plate = inverted ? "#d6e6f4" : "#0b3a5c";
  const peak = inverted ? "#0b3a5c" : "#f5fafe";
  const accent = inverted ? "#1b6ca8" : "#7eb6dc";

  return (
    <svg
      viewBox="0 0 40 40"
      className={size === "sm" ? "size-8 shrink-0" : "size-10 shrink-0"}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill={plate} />
      <path
        d="M6 31.5 16.2 16.8 20 22.2 24.1 15.4 34 31.5Z"
        fill={peak}
      />
      <circle cx="24.1" cy="14.2" r="2.15" fill={accent} />
      <path
        d="M7.5 27.2h6.2l1.35-3.4 1.9 6.1 2.05-8.6 1.7 5.9H32.5"
        fill="none"
        stroke={accent}
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SiteLogo({
  inverted = false,
  showWordmark = true,
  size = "md",
  className,
}: SiteLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark inverted={inverted} size={size} />
      {showWordmark && (
        <span
          className={cn(
            "font-heading leading-none tracking-tight max-[420px]:hidden",
            size === "sm" ? "text-xl" : "text-2xl",
            inverted ? "text-white" : "text-zh-blue-deep",
          )}
        >
          Zenith Health
        </span>
      )}
    </span>
  );
}
