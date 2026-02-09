import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Trophy, Lock } from "lucide-react";
import { CompletedChallengeCard } from "./CompletedChallengeCard";
import { DailyChallenge } from "@/hooks/useDailyChallenges";
import { useChallengeProgressData } from "@/hooks/useChallengeProgressData";

interface ChallengeProgressSectionProps {
  selectedObjectives: string[];
}

export function ChallengeProgressSection({ selectedObjectives }: ChallengeProgressSectionProps) {
  const {
    isLoading,
    completedChallenges,
    lockedChallenges,
    activeChallenges,
    activeChallenge,
  } = useChallengeProgressData(selectedObjectives);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Seu Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // No objectives selected
  if (selectedObjectives.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-semibold text-lg mb-2">Seu Progresso nos Desafios</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Marque seus objetivos acima para começar a receber desafios personalizados com
            contagem regressiva.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No progress yet (no linked challenges)
  if (progress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Seu Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            Nenhum desafio vinculado aos seus objetivos ainda. Aguarde enquanto nossos
            mentores preparam desafios para você!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get the active challenge details
  const activeChallengeData = activeChallenge?.daily_challenges as DailyChallenge | undefined;

  // Return data for parent component to use in banner
  // Active challenge is now rendered in the banner, not here
  return (
    <div className="space-y-6">
      {/* Locked Challenges - Show count only, no details */}
      {lockedChallenges.length > 0 && (
        <Card className="border-dashed border-border/50">
          <CardContent className="py-6 text-center">
            <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Você tem <strong>{lockedChallenges.length}</strong> desafio
              {lockedChallenges.length !== 1 && "s"} pendente
              {lockedChallenges.length !== 1 && "s"} nesta trilha.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Complete os desafios ativos para desbloquear os próximos!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-amber-500" />
              Desafios Completados
              <Badge className="ml-auto bg-emerald-500/20 text-emerald-400">
                {completedChallenges.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedChallenges.map((p) => {
              const challenge = p.daily_challenges as DailyChallenge | undefined;
              if (!challenge) return null;
              return (
                <CompletedChallengeCard key={p.id} challenge={challenge} progress={p} />
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All completed message */}
      {activeChallenge === undefined && lockedChallenges.length === 0 && completedChallenges.length > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="py-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <h3 className="font-semibold text-lg mb-2">Parabéns! 🎉</h3>
            <p className="text-muted-foreground text-sm">
              Você completou todos os desafios vinculados aos seus objetivos!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
