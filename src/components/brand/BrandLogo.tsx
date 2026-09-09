import { cn } from "@/lib/utils";

type BrandLogoSize = "sm" | "md" | "lg";

interface BrandLogoProps {
  size?: BrandLogoSize;
  className?: string;
  markOnly?: boolean;
}

const textSize: Record<BrandLogoSize, string> = {
  sm: "text-[1.35rem]",
  md: "text-[1.7rem]",
  lg: "text-[2.05rem]",
};

const markSize: Record<BrandLogoSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

export function BrandLogo({
  size = "md",
  className,
  markOnly = false,
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div
        aria-hidden="true"
        className={cn(
          "relative grid shrink-0 place-items-center overflow-hidden rounded-[10px] border border-primary/30 bg-[#0b1110] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
          markSize[size],
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(52,211,153,0.18),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.08),transparent_48%)]" />
        <div className="absolute inset-[5px] rounded-[7px] border border-white/10" />
        <svg
          viewBox="0 0 42 42"
          className="relative h-[78%] w-[78%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 31V11h13.2c4.1 0 6.6 2.3 6.6 5.7 0 2.5-1.4 4.4-3.8 5.2l5.6 9.1h-6.2l-4.9-8.3h-5.1V31H10Z"
            className="fill-white"
            opacity="0.94"
          />
          <path
            d="M15.4 18.4h7.1c1.2 0 2-.7 2-1.8s-.8-1.8-2-1.8h-7.1v3.6Z"
            className="fill-[#0b1110]"
          />
          <path
            d="M31.5 10.4v20.2"
            className="stroke-primary"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M35 13.4v14.2"
            className="stroke-primary"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>

      {!markOnly && (
        <div className="min-w-0">
          <p
            className={cn(
              "font-display font-semibold leading-none tracking-[-0.045em] text-foreground",
              textSize[size],
            )}
          >
            RealFrame<span className="ml-1.5 text-primary">IA</span>
          </p>
        </div>
      )}
    </div>
  );
}
