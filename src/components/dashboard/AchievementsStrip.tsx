import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { useUserBadges } from "@/hooks/useUserBadges";

export function AchievementsStrip() {
  const { badgesWithStatus, isLoading } = useUserBadges();

  if (isLoading) return <div className="h-20 animate-pulse rounded-md bg-muted" />;
  if (badgesWithStatus.length === 0) return null;

  return (
    <section className="border-t border-border/70 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="micro-label text-muted-foreground">Suas conquistas</h3>
        <Link
          to="/perfil"
          className="focus-ring flex items-center gap-1 rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver perfil
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <BadgeGrid badges={badgesWithStatus} size="sm" />
    </section>
  );
}
