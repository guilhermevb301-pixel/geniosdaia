import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChallenges, ChallengeSubmission } from "@/hooks/useChallenges";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { useUserXP } from "@/hooks/useUserXP";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Clock, Users, ChevronUp, Gift, Star, Crown, History, Bot, FileText, Sparkles, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LEVEL_NAMES } from "@/lib/gamification";
import { SubmitChallengeModal } from "@/components/challenges/SubmitChallengeModal";
import { PersonalizedChallengeCard } from "@/components/challenges/PersonalizedChallengeCard";

// ============= Utility Functions =============

function formatCountdown(endDate: string) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Há 1 dia";
  return `Há ${diffDays} dias`;
}

function getWeekNumber(dateString: string): number {
  const date = new Date(dateString);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

function getDifficultyLevel(difficulty: string): number {
  switch (difficulty) {
    case "iniciante": return 1;
    case "intermediario": return 2;
    case "avancado": return 3;
    default: return 2;
  }
}

function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case "iniciante": return "Iniciante";
    case "intermediario": return "Intermediário";
    case "avancado": return "Avançado";
    default: return "Intermediário";
  }
}

// ============= Sub-Components =============

function CountdownTimer({ endDate }: { endDate: string }) {
  const [time, setTime] = useState(formatCountdown(endDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatCountdown(endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="flex gap-2 sm:gap-3">
      {[
        { value: time.days, label: "DIAS" },
        { value: time.hours, label: "HORAS" },
        { value: time.minutes, label: "MIN" },
        { value: time.seconds, label: "SEG" },
      ].map(({ value, label }, idx) => (
        <div key={label} className="flex items-center gap-2 sm:gap-3">
          <div className="text-center">
            <div className="bg-background/80 backdrop-blur rounded-lg px-3 py-2 min-w-[50px]">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{value.toString().padStart(2, '0')}</div>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
          </div>
          {idx < 3 && <span className="text-2xl text-muted-foreground font-light self-start mt-2">:</span>}
        </div>
      ))}
    </div>
  );
}

function getAvatarColor(userId: string): string {
  const colors = [
    "bg-pink-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-cyan-500",
  ];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
}

function PositionBadge({ position }: { position: number }) {
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

function DifficultyStars({ level = 2 }: { level?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((star) => (
        <Star 
          key={star} 
          className={cn(
            "h-4 w-4",
            star <= level ? "text-accent fill-accent" : "text-muted-foreground"
          )} 
        />
      ))}
      <span className="text-sm ml-1">
        {level === 1 ? "Iniciante" : level === 2 ? "Intermediário" : "Avançado"}
      </span>
    </div>
  );
}

function SubmissionCard({ 
  submission, 
  position,
  onVote,
  hasVoted
}: { 
  submission: ChallengeSubmission;
  position: number;
  onVote: (id: string) => void;
  hasVoted: boolean;
}) {
  const level = 3;
  const levelName = LEVEL_NAMES[level] || "Aprendiz";

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-card border-border",
      position <= 3 && "ring-1 ring-primary/20"
    )}>
      <PositionBadge position={position} />
      
      <div className="bg-muted h-32 flex items-center justify-center">
        {submission.image_url ? (
          <img src={submission.image_url} alt={submission.title} className="w-full h-full object-cover" />
        ) : (
          <Bot className="h-12 w-12 text-muted-foreground/50" />
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(submission.user_id))}>
              {submission.title.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Autor #{submission.user_id.substring(0, 4)}</p>
            <p className="text-xs text-muted-foreground">Nível {level} - {levelName}</p>
          </div>
        </div>

        <h4 className="font-semibold text-sm mb-1 line-clamp-1">{submission.title}</h4>
        
        {submission.track && (
          <Badge variant="secondary" className="text-xs mb-3">
            {submission.track}
          </Badge>
        )}

        <div className="flex items-center justify-between">
          <Button 
            variant="ghost"
            size="sm" 
            onClick={() => onVote(submission.id)}
            className={cn(
              "gap-1 transition-all bg-muted hover:bg-muted/80",
              hasVoted && "bg-primary/20 hover:bg-primary/30 text-primary"
            )}
          >
            <ChevronUp className={cn("h-4 w-4", hasVoted && "animate-pulse")} />
            {submission.votes_count}
          </Button>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(submission.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function RankingRow({ 
  submission, 
  position 
}: { 
  submission: ChallengeSubmission;
  position: number;
}) {
  const level = Math.min(position + 2, 6);
  const levelName = LEVEL_NAMES[level] || "Aprendiz";

  const positionStyles: Record<number, string> = {
    1: "bg-amber-500 text-amber-950",
    2: "bg-gray-400 text-gray-900",
    3: "bg-amber-700 text-amber-100",
  };

  const rowBgStyles: Record<number, string> = {
    1: "bg-amber-500/10 border-l-4 border-l-amber-500",
    2: "bg-gray-500/10 border-l-4 border-l-gray-400",
    3: "bg-amber-700/10 border-l-4 border-l-amber-700",
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg transition-colors",
      position <= 3 ? rowBgStyles[position] : "hover:bg-muted/30"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
        position <= 3 ? positionStyles[position] : "bg-muted text-muted-foreground"
      )}>
        {position === 1 && <Crown className="h-4 w-4" />}
        {position > 1 && position}
      </div>

      <Avatar className="h-10 w-10">
        <AvatarFallback className={cn("text-white font-semibold", getAvatarColor(submission.user_id))}>
          {submission.title.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{submission.title}</p>
        <p className="text-sm text-muted-foreground">Nível {level} - {levelName}</p>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold text-primary">{submission.votes_count}</p>
        <p className="text-xs text-muted-foreground">votos</p>
      </div>
    </div>
  );
}

function PastChallengeCard({ 
  challenge,
  weekNumber
}: { 
  challenge: { id: string; title: string; description: string; end_date: string };
  weekNumber: number;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="w-24 bg-muted flex-shrink-0 flex items-center justify-center">
          <Bot className="h-8 w-8 text-muted-foreground/50" />
        </div>
        
        <CardContent className="p-4 flex-1">
          <Badge variant="secondary" className="mb-2 text-xs">
            Semana {weekNumber}
          </Badge>
          <h4 className="font-medium text-sm line-clamp-1">{challenge.title}</h4>
          <div className="flex items-center gap-1 mt-2 text-xs text-accent">
            <Trophy className="h-3 w-3" />
            <span>Ver detalhes</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

// ============= Section Components =============

function ActiveChallengeHero({ 
  challenge, 
  submissionsCount,
  onSubmitSuccess,
  userTrack
}: { 
  challenge: { id: string; title: string; description: string; rules: string | null; xp_reward: number; end_date: string; difficulty?: string; reward_badge?: string | null; reward_highlight?: boolean };
  submissionsCount: number;
  onSubmitSuccess: () => void;
  userTrack: string;
}) {
  const [showRules, setShowRules] = useState(false);
  const difficulty = challenge.difficulty || "intermediario";
  const difficultyLevel = getDifficultyLevel(difficulty);

  return (
    <Card className="relative overflow-hidden border-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-800" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      <CardContent className="relative p-6 sm:p-8 text-white">
        <Badge className="bg-success hover:bg-success text-success-foreground border-0 mb-4">
          DESAFIO DA SEMANA
        </Badge>

        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{challenge.title}</h2>
        <p className="text-foreground/80 mb-6 max-w-2xl">{challenge.description}</p>

        <div className="flex flex-wrap gap-6 sm:gap-10 mb-6">
          <div>
            <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Tempo Restante</p>
            <CountdownTimer endDate={challenge.end_date} />
          </div>

          <div className="text-center">
            <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Participantes</p>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-white/80" />
              <span className="text-2xl font-bold">{submissionsCount}</span>
              <span className="text-sm text-white/60">inscritos</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Dificuldade</p>
            <DifficultyStars level={difficultyLevel} />
          </div>
        </div>

        <div className="bg-background/10 backdrop-blur rounded-lg p-4 mb-6 inline-flex items-center gap-3">
          <Gift className="h-6 w-6 text-accent" />
          <span className="font-medium">
            Prêmio: <span className="text-accent">+{challenge.xp_reward} XP</span>
            {challenge.reward_badge && <> + Badge "{challenge.reward_badge}"</>}
            {challenge.reward_highlight && <> + Destaque</>}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <SubmitChallengeModal 
            challengeId={challenge.id} 
            defaultTrack={userTrack as "agentes" | "videos" | "fotos" | "crescimento" | "propostas"}
            onSuccess={onSubmitSuccess} 
          />
          {challenge.rules && (
            <Button 
              variant="outline" 
              size="lg" 
              className="border-border/50 hover:bg-muted/20"
              onClick={() => setShowRules(!showRules)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Regras Completas
            </Button>
          )}
        </div>

        {showRules && challenge.rules && (
          <Dialog open={showRules} onOpenChange={setShowRules}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Regras do Desafio</DialogTitle>
              </DialogHeader>
              <div className="prose prose-sm dark:prose-invert">
                <p className="whitespace-pre-line">{challenge.rules}</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

function PersonalizedChallengesSection({ userTrack, userLevel }: { userTrack: string; userLevel: number }) {
  const { personalizedChallenge, bonusChallenge, isLoading } = useDailyChallenges(
    userTrack as "agentes" | "videos" | "fotos" | "crescimento" | "propostas",
    userLevel
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalized Daily Challenge */}
      {personalizedChallenge && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Seu Desafio Personalizado (Hoje)
          </h3>
          <PersonalizedChallengeCard challenge={personalizedChallenge} />
        </div>
      )}

      {/* Weekly Bonus Challenge */}
      {bonusChallenge && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Bônus da Semana: Propostas que Vendem
          </h3>
          <PersonalizedChallengeCard challenge={bonusChallenge} isBonus />
        </div>
      )}
    </div>
  );
}

function CommunitySubmissions({ 
  submissions, 
  onVote,
  sortBy,
  onSortChange,
  userVotes
}: { 
  submissions: ChallengeSubmission[];
  onVote: (id: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  userVotes: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Submissões da Comunidade
        </h3>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">Mais Votados</SelectItem>
            <SelectItem value="recent">Mais Recentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {submissions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission, index) => (
            <SubmissionCard 
              key={submission.id} 
              submission={submission}
              position={index + 1}
              onVote={onVote}
              hasVoted={userVotes.includes(submission.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhuma submissão ainda. Seja o primeiro!</p>
        </Card>
      )}
    </div>
  );
}

function ChallengeRanking({ submissions }: { submissions: ChallengeSubmission[] }) {
  const topSubmissions = submissions.slice(0, 10);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Crown className="h-5 w-5 text-amber-500" />
        Ranking do Desafio (Top 10)
      </h3>

      {topSubmissions.length > 0 ? (
        <Card>
          <CardContent className="p-2">
            <div className="space-y-2">
              {topSubmissions.map((submission, index) => (
                <RankingRow 
                  key={submission.id} 
                  submission={submission}
                  position={index + 1}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Crown className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Ranking vazio. Participe do desafio!</p>
        </Card>
      )}
    </div>
  );
}

function PastChallenges({ challenges }: { challenges: { id: string; title: string; description: string; end_date: string }[] }) {
  if (challenges.length === 0) {
    return (
      <Card className="p-8 text-center">
        <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Nenhum desafio anterior ainda.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        Desafios Anteriores
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {challenges.map((challenge) => (
          <PastChallengeCard 
            key={challenge.id} 
            challenge={challenge}
            weekNumber={getWeekNumber(challenge.end_date)}
          />
        ))}
      </div>
    </div>
  );
}

// ============= Main Component =============

export default function Desafios() {
  const { user } = useAuth();
  const { activeChallenge, pastChallenges, isLoading, fetchSubmissions, fetchUserVotes, vote } = useChallenges();
  const { mainTrack } = useUserProfile();
  const { userXP } = useUserXP();
  const [sortBy, setSortBy] = useState("votes");

  const userLevel = userXP?.current_level || 1;

  const { data: submissions = [], refetch: refetchSubmissions } = useQuery({
    queryKey: ["challengeSubmissions", activeChallenge?.id],
    queryFn: () => activeChallenge ? fetchSubmissions(activeChallenge.id) : [],
    enabled: !!activeChallenge,
  });

  const { data: userVotes = [], refetch: refetchVotes } = useQuery({
    queryKey: ["userVotes", activeChallenge?.id, user?.id],
    queryFn: () => activeChallenge ? fetchUserVotes(activeChallenge.id) : [],
    enabled: !!activeChallenge && !!user,
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
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-amber-950"
            >
              Desafio Ativo
            </TabsTrigger>
            <TabsTrigger 
              value="submissions"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-amber-950"
            >
              Submissões
            </TabsTrigger>
            <TabsTrigger 
              value="ranking"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-amber-950"
            >
              Ranking
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-amber-950"
            >
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Tab: Active Challenge */}
          <TabsContent value="active" className="space-y-8">
            {activeChallenge ? (
              <>
                <ActiveChallengeHero 
                  challenge={activeChallenge} 
                  submissionsCount={submissions.length}
                  onSubmitSuccess={() => refetchSubmissions()}
                  userTrack={mainTrack}
                />
                
                {/* Personalized Challenges Section */}
                <PersonalizedChallengesSection userTrack={mainTrack} userLevel={userLevel} />
                
                <CommunitySubmissions 
                  submissions={sortedSubmissions}
                  onVote={handleVote}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  userVotes={userVotes}
                />
                <ChallengeRanking submissions={sortedSubmissions} />
              </>
            ) : (
              <Card className="p-12 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum desafio ativo</h3>
                <p className="text-muted-foreground">Volte em breve para novos desafios!</p>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Submissions Only */}
          <TabsContent value="submissions">
            <CommunitySubmissions 
              submissions={sortedSubmissions}
              onVote={handleVote}
              sortBy={sortBy}
              onSortChange={setSortBy}
              userVotes={userVotes}
            />
          </TabsContent>

          {/* Tab: Ranking Only */}
          <TabsContent value="ranking">
            <ChallengeRanking submissions={sortedSubmissions} />
          </TabsContent>

          {/* Tab: History Only */}
          <TabsContent value="history">
            <PastChallenges challenges={pastChallenges} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
