import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChallenges } from "@/hooks/useChallenges";
import { Trophy, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function formatTimeRemaining(endDate: string) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return "Encerrado";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h restantes`;
  if (hours > 0) return `${hours}h ${minutes}m restantes`;
  return `${minutes}m restantes`;
}

export function WeeklyChallengeCard() {
  const { activeChallenge, isLoading } = useChallenges();
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    if (activeChallenge) {
      setTimeRemaining(formatTimeRemaining(activeChallenge.end_date));
      
      const interval = setInterval(() => {
        setTimeRemaining(formatTimeRemaining(activeChallenge.end_date));
      }, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [activeChallenge]);

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (!activeChallenge) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30 border-muted">
        <CardContent className="p-4 text-center">
          <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhum desafio ativo no momento
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Volte em breve para novos desafios!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <CardContent className="relative p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Desafio da Semana
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </div>
        </div>

        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
          {activeChallenge.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {activeChallenge.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            +{activeChallenge.xp_reward} XP
          </span>
          
          <Button asChild size="sm" variant="outline" className="border-amber-500/30 hover:bg-amber-500/10">
            <Link to="/desafios">
              Participar
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
