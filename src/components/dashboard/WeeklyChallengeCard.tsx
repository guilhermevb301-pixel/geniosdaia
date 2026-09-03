import { Button } from "@/components/ui/button";
import { useChallenges } from "@/hooks/useChallenges";
import { Trophy, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function formatTimeRemaining(endDate: string) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Encerrado";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d restantes`;
  if (hours > 0) return `${hours}h restantes`;
  return "Encerra em breve";
}

export function WeeklyChallengeCard() {
  const { activeChallenge, isLoading } = useChallenges();
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    if (!activeChallenge) return;
    setTimeRemaining(formatTimeRemaining(activeChallenge.end_date));
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(activeChallenge.end_date));
    }, 60000);
    return () => clearInterval(interval);
  }, [activeChallenge]);

  if (isLoading) {
    return <div className="h-full min-h-[140px] animate-pulse rounded-lg bg-muted" />;
  }

  if (!activeChallenge) {
    return (
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-card p-5">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-1.5 text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" />
            Desafios
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Complete desafios e desbloqueie conquistas.
          </p>
        </div>
        <span className="mt-3 text-xs text-muted-foreground/70">Em breve, novos desafios.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-3 rounded-lg border border-primary/25 bg-card p-5">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="eyebrow flex items-center gap-1.5 text-primary">
            <Trophy className="h-3.5 w-3.5" />
            Desafio da semana
          </p>
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </span>
        </div>
        <h3 className="mb-1 line-clamp-1 text-[15px] font-medium">{activeChallenge.title}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {activeChallenge.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-primary">+{activeChallenge.xp_reward} XP</span>
        <Button asChild size="sm" variant="outline">
          <Link to="/desafios">
            Participar
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
