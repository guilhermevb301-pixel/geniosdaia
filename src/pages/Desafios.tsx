import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChallenges, ChallengeSubmission } from "@/hooks/useChallenges";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useObjectives } from "@/hooks/useObjectives";
import { useDailyChallenges, DailyChallenge } from "@/hooks/useDailyChallenges";
import { useUserXP } from "@/hooks/useUserXP";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SubmitChallengeModal } from "@/components/challenges/SubmitChallengeModal";
import { ObjectivesModal } from "@/components/challenges/ObjectivesModal";
import { ObjectivesSummary } from "@/components/challenges/ObjectivesSummary";
import { YourChallengesBanner } from "@/components/challenges/YourChallengesBanner";
import { ChallengeProgressSection } from "@/components/challenges/ChallengeProgressSection";
import { CommunitySubmissions } from "@/components/challenges/CommunitySubmissions";
import { ChallengeRanking } from "@/components/challenges/ChallengeRanking";
import { PastChallenges } from "@/components/challenges/PastChallenges";
import { useChallengeProgressData } from "@/hooks/useChallengeProgressData";
import { supabase } from "@/integrations/supabase/client";

export default function Desafios() {
  const { user } = useAuth();
  const { activeChallenge: weeklyChallenge, pastChallenges, isLoading, fetchSubmissions, fetchUserVotes, vote } = useChallenges();
  const { profile, mainTrack, updateProfile } = useUserProfile();
  const { userXP } = useUserXP();
  const [sortBy, setSortBy] = useState("votes");
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [showObjectivesModal, setShowObjectivesModal] = useState(false);
  const hasCheckedObjectives = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const userLevel = userXP?.current_level || 1;
  const objectivesRef = useRef<HTMLDivElement>(null);

  // Carregar objetivos salvos do perfil
  useEffect(() => {
    if (profile?.goals?.selected_objectives) {
      setSelectedObjectives(profile.goals.selected_objectives);
    }

    if (!hasCheckedObjectives.current && profile !== undefined) {
      hasCheckedObjectives.current = true;
      const hasObjectives = profile?.goals?.selected_objectives && profile.goals.selected_objectives.length > 0;
      if (!hasObjectives) {
        setShowObjectivesModal(true);
      }
    }
  }, [profile]);

  const { objectives: objectivesData } = useObjectives();

  const {
    activeChallengeData,
    activeChallengesData,
    activeChallenge: activeProgress,
    activeChallenges,
    completeChallenge,
    isCompleting,
    restartChallenge,
    isRestarting,
    lockedChallenges,
    completedChallenges,
    clearProgress,
  } = useChallengeProgressData(selectedObjectives);

  const handleObjectivesChange = useCallback((objectives: string[]) => {
    const removedObjectives = selectedObjectives.filter((o) => !objectives.includes(o));

    if (removedObjectives.length > 0 && objectivesData.length > 0) {
      const objectiveItemsToRemove = objectivesData
        .filter((item) => removedObjectives.includes(item.objective_key))
        .map((item) => item.id);

      objectiveItemsToRemove.forEach((itemId) => {
        clearProgress(itemId);
      });
    }

    setSelectedObjectives(objectives);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      updateProfile({
        goals: {
          ...profile?.goals,
          selected_objectives: objectives,
        },
      }).catch((err) => {
        console.error("Erro ao salvar objetivos:", err);
        toast.error("Erro ao salvar seus objetivos");
      });
    }, 500);
  }, [profile?.goals, updateProfile, selectedObjectives, objectivesData, clearProgress]);

  const { data: allDailyChallenges = [] } = useQuery({
    queryKey: ["allDailyChallenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_challenges")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((challenge) => ({
        ...challenge,
        steps: Array.isArray(challenge.steps) ? challenge.steps : JSON.parse(challenge.steps as string || "[]"),
        checklist: Array.isArray(challenge.checklist) ? challenge.checklist : JSON.parse(challenge.checklist as string || "[]"),
      })) as DailyChallenge[];
    },
  });

  const { data: submissions = [], refetch: refetchSubmissions } = useQuery({
    queryKey: ["challengeSubmissions", weeklyChallenge?.id],
    queryFn: () => weeklyChallenge ? fetchSubmissions(weeklyChallenge.id) : [],
    enabled: !!weeklyChallenge,
  });

  const { data: userVotes = [], refetch: refetchVotes } = useQuery({
    queryKey: ["userVotes", weeklyChallenge?.id, user?.id],
    queryFn: () => weeklyChallenge ? fetchUserVotes(weeklyChallenge.id) : [],
    enabled: !!weeklyChallenge && !!user,
  });

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortBy === "votes") return b.votes_count - a.votes_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleVote = async (submissionId: string) => {
    if (!user) {
      toast.error("Faça login para votar");
      return;
    }
    vote(submissionId, {
      onSuccess: () => {
        refetchSubmissions();
        refetchVotes();
      },
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-accent" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Arena dos Gênios</h1>
            <p className="text-muted-foreground text-sm">
              Participe de desafios semanais, mostre suas habilidades e conquiste prêmios!
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="active" className="data-[state=active]:bg-amber-500 data-[state=active]:text-amber-950">
              Desafio Ativo
            </TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-amber-500 data-[state=active]:text-amber-950">
              Submissões
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-amber-500 data-[state=active]:text-amber-950">
              Ranking
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-amber-500 data-[state=active]:text-amber-950">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-8">
            <YourChallengesBanner
              userTrack={mainTrack}
              userLevel={userLevel}
              recommendedCount={lockedChallenges.length + (activeChallenges?.length || 0)}
              selectedObjectivesCount={selectedObjectives.length}
              onScrollToObjectives={() => {
                objectivesRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              activeChallenges={activeChallengesData}
              activeProgressList={activeChallenges}
              onCompleteChallenge={(progressId) => completeChallenge(progressId)}
              onRestartChallenge={(progressId) => restartChallenge(progressId)}
              isCompleting={isCompleting}
              isRestarting={isRestarting}
            />

            <ObjectivesModal
              open={showObjectivesModal}
              onOpenChange={setShowObjectivesModal}
              selectedObjectives={selectedObjectives}
              onConfirm={handleObjectivesChange}
            />

            <div ref={objectivesRef}>
              <ObjectivesSummary
                selectedObjectives={selectedObjectives}
                onEdit={() => setShowObjectivesModal(true)}
                onResetObjective={(objectiveItemId) => {
                  clearProgress(objectiveItemId);
                  toast.success("Progresso reiniciado! Os desafios serão recarregados.");
                }}
              />
            </div>

            <ChallengeProgressSection selectedObjectives={selectedObjectives} />

            {weeklyChallenge && (
              <>
                <CommunitySubmissions
                  submissions={sortedSubmissions}
                  onVote={handleVote}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  userVotes={userVotes}
                />
                <ChallengeRanking submissions={sortedSubmissions} />
              </>
            )}
          </TabsContent>

          <TabsContent value="submissions">
            <CommunitySubmissions
              submissions={sortedSubmissions}
              onVote={handleVote}
              sortBy={sortBy}
              onSortChange={setSortBy}
              userVotes={userVotes}
            />
          </TabsContent>

          <TabsContent value="ranking">
            <ChallengeRanking submissions={sortedSubmissions} />
          </TabsContent>

          <TabsContent value="history">
            <PastChallenges challenges={pastChallenges} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
