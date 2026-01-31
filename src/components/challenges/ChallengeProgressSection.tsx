import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Trophy, Lock } from "lucide-react";
import { ActiveChallengeCard } from "./ActiveChallengeCard";
import { LockedChallengeCard } from "./LockedChallengeCard";
import { CompletedChallengeCard } from "./CompletedChallengeCard";
import { useUserChallengeProgress } from "@/hooks/useUserChallengeProgress";
import { useObjectives } from "@/hooks/useObjectives";
import { useObjectiveChallengeLinks } from "@/hooks/useObjectiveChallengeLinks";
import { useDailyChallengesAdmin } from "@/hooks/useDailyChallengesAdmin";
import { useEffect, useMemo } from "react";
import { DailyChallenge } from "@/hooks/useDailyChallenges";
import { TimeUnit } from "@/lib/utils";

interface ChallengeProgressSectionProps {
  selectedObjectives: string[];
}

export function ChallengeProgressSection({ selectedObjectives }: ChallengeProgressSectionProps) {
  const { objectiveGroups } = useObjectives();
  const { allLinks, isLoadingAllLinks } = useObjectiveChallengeLinks();
  const { challenges: allChallenges, isLoading: isLoadingChallenges } = useDailyChallengesAdmin();

  // Get objective item IDs from selected keys
  const allObjectiveItems = objectiveGroups.flatMap((g) => g.items);
  const selectedItemIds = allObjectiveItems
    .filter((item) => selectedObjectives.includes(item.objective_key))
    .map((item) => item.id);

  // Get user progress for selected objectives
  const {
    progress,
    activeChallenge,
    completedChallenges,
    lockedChallenges,
    isLoading: isLoadingProgress,
    initProgress,
    completeChallenge,
    isCompleting,
  } = useUserChallengeProgress(selectedItemIds.length > 0 ? selectedItemIds : undefined);

  // Get linked challenges with their order for each objective
  const linkedChallengesMap = useMemo(() => {
    const map: Record<string, Array<{ challengeId: string; orderIndex: number }>> = {};
    
    allLinks.forEach((link) => {
      if (!map[link.objective_item_id]) {
        map[link.objective_item_id] = [];
      }
      map[link.objective_item_id].push({
        challengeId: link.daily_challenge_id,
        orderIndex: (link as unknown as { order_index: number }).order_index || 0,
      });
    });

    // Sort by order_index
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.orderIndex - b.orderIndex);
    });

    return map;
  }, [allLinks]);

  // Initialize progress when objectives change
  useEffect(() => {
    if (isLoadingAllLinks || isLoadingChallenges || isLoadingProgress) return;

    selectedItemIds.forEach((itemId) => {
      const linkedChallenges = linkedChallengesMap[itemId] || [];
      if (linkedChallenges.length === 0) return;

      // Check if user already has progress for this objective
      const existingProgress = progress.filter((p) => p.objective_item_id === itemId);
      if (existingProgress.length > 0) return;

      // Prepare challenges with order info
      const challengesWithOrder = linkedChallenges
        .map((link) => {
          const challenge = allChallenges.find((c) => c.id === link.challengeId);
          if (!challenge) return null;
          return {
            id: challenge.id,
            estimated_minutes: challenge.estimated_minutes,
            estimated_time_unit: (challenge.estimated_time_unit || "minutes") as TimeUnit,
            order_index: link.orderIndex,
          };
        })
        .filter(Boolean) as Array<{
          id: string;
          estimated_minutes: number | null;
          estimated_time_unit: TimeUnit;
          order_index: number;
        }>;

      if (challengesWithOrder.length > 0) {
        initProgress({ objectiveItemId: itemId, challenges: challengesWithOrder });
      }
    });
  }, [
    selectedItemIds,
    linkedChallengesMap,
    allChallenges,
    progress,
    isLoadingAllLinks,
    isLoadingChallenges,
    isLoadingProgress,
    initProgress,
  ]);

  // Loading state
  if (isLoadingAllLinks || isLoadingChallenges || isLoadingProgress) {
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

  return (
    <div className="space-y-6">
      {/* Active Challenge */}
      {activeChallenge && activeChallengeData && (
        <ActiveChallengeCard
          progress={activeChallenge}
          challenge={activeChallengeData}
          onComplete={() => completeChallenge(activeChallenge.id)}
          isCompleting={isCompleting}
        />
      )}

      {/* Locked Challenges */}
      {lockedChallenges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-muted-foreground" />
              Próximos Desafios
              <Badge variant="secondary" className="ml-auto">
                {lockedChallenges.length} bloqueado{lockedChallenges.length !== 1 && "s"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lockedChallenges.slice(0, 3).map((p, index) => {
              const challenge = p.daily_challenges as DailyChallenge | undefined;
              if (!challenge) return null;
              return (
                <LockedChallengeCard
                  key={p.id}
                  challenge={challenge}
                  position={completedChallenges.length + 2 + index}
                />
              );
            })}
            {lockedChallenges.length > 3 && (
              <p className="text-xs text-center text-muted-foreground">
                +{lockedChallenges.length - 3} desafio{lockedChallenges.length - 3 !== 1 && "s"}{" "}
                bloqueado{lockedChallenges.length - 3 !== 1 && "s"}
              </p>
            )}
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
