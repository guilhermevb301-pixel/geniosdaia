import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PositionBadge({ position }: { position: number }) {
  if (position > 3) return null;

  const styles: Record<number, string> = {
    1: "bg-amber-500 text-amber-950",
    2: "bg-gray-400 text-gray-900",
    3: "bg-amber-700 text-amber-100",
  };

  return (
    <div className={cn("absolute top-3 left-3 px-2 py-1 rounded-md font-bold text-xs flex items-center gap-1 z-10", styles[position])}>
      {position === 1 && <Crown className="h-3 w-3" />}
      {position}º
    </div>
  );
}
