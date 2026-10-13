import { cn } from "@/lib/utils";

export const TOOTH_PATH =
  "M20 14c-6 0-9 5-9 11 0 7 3 11 5 17 2 7 3 12 6 12 4 0 3-10 10-10s6 10 10 10c3 0 4-5 6-12 2-6 5-10 5-17 0-6-3-11-9-11-5 0-7 3-12 3s-7-3-12-3z";

export function ToothGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d={TOOTH_PATH} fill="currentColor" />
    </svg>
  );
}

export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn("shrink-0", className)} aria-label="Logo">
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#48C089" />
          <stop offset="0.55" stopColor="#178559" />
          <stop offset="1" stopColor="#0B4A33" />
        </linearGradient>
        <linearGradient id="logoTooth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D6F5E3" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#logoBg)" />
      <rect x="1" y="1" width="62" height="62" rx="17" fill="none" stroke="#fff" strokeOpacity="0.18" />
      <path d={TOOTH_PATH} fill="url(#logoTooth)" transform="translate(4 3) scale(0.875)" />
      <path d="M45 11l1.4 3.6L50 16l-3.6 1.4L45 21l-1.4-3.6L40 16l3.6-1.4z" fill="#fff" opacity="0.9" />
    </svg>
  );
}

/** Padrão decorativo de dentes para cabeçalhos */
export function ToothPattern({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden>
      <defs>
        <pattern id="toothPattern" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
          <path d={TOOTH_PATH} transform="scale(0.34) translate(20 20)" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#toothPattern)" />
    </svg>
  );
}
