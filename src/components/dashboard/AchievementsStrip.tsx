import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { useUserBadges } from "@/hooks/useUserBadges";

export function AchievementsStrip() {
  const { badgesWithStatus, isLoading } = useUserBadges();

  if (isLoading) return <div className="h-28 animate-pulse rounded-lg bg-muted" />;
  if (badgesWithStatus.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[13px] font-medium">Suas conquistas</h3>
        <Link
          to="/perfil"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver perfil
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <BadgeGrid badges={badgesWithStatus} size="md" />
    </section>
  );
}
