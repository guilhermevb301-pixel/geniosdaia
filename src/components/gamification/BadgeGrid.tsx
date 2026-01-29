import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  Award, 
  Flame, 
  Copy, 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  Crown, 
  Users,
  Footprints,
  type LucideIcon 
} from "lucide-react";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

interface BadgeGridProps {
  badges: BadgeItem[];
  size?: "sm" | "md";
}

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  footprints: Footprints,
  flame: Flame,
  fire: Flame,
  copy: Copy,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  trophy: Trophy,
  crown: Crown,
  users: Users,
  award: Award,
};

function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Award;
}

export function BadgeGrid({ badges, size = "md" }: BadgeGridProps) {
  const sizeClasses = {
    sm: {
      container: "w-10 h-10",
      icon: "h-5 w-5",
    },
    md: {
      container: "w-14 h-14",
      icon: "h-7 w-7",
    },
  };

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const IconComponent = getIcon(badge.icon);
        
        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "rounded-xl flex items-center justify-center transition-all",
                  sizeClasses[size].container,
                  badge.earned
                    ? "bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 cursor-pointer hover:scale-110"
                    : "bg-muted/50 border border-border/50 grayscale opacity-50"
                )}
              >
                <IconComponent
                  className={cn(
                    sizeClasses[size].icon,
                    badge.earned ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px]">
              <p className="font-semibold">{badge.name}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
              {badge.earned && badge.earnedAt && (
                <p className="text-xs text-primary mt-1">
                  Conquistado em {new Date(badge.earnedAt).toLocaleDateString("pt-BR")}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
