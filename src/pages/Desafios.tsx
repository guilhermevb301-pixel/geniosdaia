import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChallenges, ChallengeSubmission } from "@/hooks/useChallenges";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Clock, Users, ChevronUp, Upload, Gift, Star, Crown, History, Bot, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LEVEL_NAMES } from "@/lib/gamification";

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

function PositionBadge({ position }: { position: number }) {
  if (position > 3) return null;
  
  const styles: Record<number, string> = {
    1: "bg-amber-500 text-amber-950",
    2: "bg-gray-400 text-gray-900", 
    3: "bg-amber-700 text-amber-100",
  };
  
  return (
    <div className={cn("absolute -top-2 -left-2 px-2 py-1 rounded-md font-bold text-xs flex items-center gap-1 z-10", styles[position])}>
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

function SubmitModal({ challengeId, onSuccess }: { challengeId: string; onSuccess: () => void }) {
  const { submit, isSubmitting } = useChallenges();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: "Erro", description: "Adicione um título para seu projeto", variant: "destructive" });
      return;
    }

    submit({ 
      challengeId, 
      title, 
      description, 
      linkUrl: linkUrl || undefined 
    }, {
      onSuccess: () => {
        toast({ title: "Sucesso!", description: "Seu projeto foi submetido com sucesso!" });
        setOpen(false);
        setTitle("");
        setDescription("");
        setLinkUrl("");
        onSuccess();
      },
      onError: (error: Error) => {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" size="lg" className="gap-2 font-semibold">
          <Upload className="h-4 w-4" />
          Submeter Meu Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Submeter Projeto
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Drag & Drop Area */}
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Arraste seu arquivo ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (Em breve)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Título do Projeto *</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Nome do seu projeto"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Descreva seu projeto..."
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Link (opcional)</label>
            <Input 
              value={linkUrl} 
              onChange={(e) => setLinkUrl(e.target.value)} 
              placeholder="https://..."
              className="mt-1"
            />
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full" variant="accent">
            {isSubmitting ? "Enviando..." : "Enviar Submissão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
  const level = 3; // Mock level - would come from user_xp join
  const levelName = LEVEL_NAMES[level] || "Aprendiz";

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1",
      position <= 3 && "ring-1 ring-primary/20"
    )}>
      <PositionBadge position={position} />
      
      {/* Preview Placeholder */}
      <div className="bg-muted/50 h-32 flex items-center justify-center">
        {submission.image_url ? (
          <img src={submission.image_url} alt={submission.title} className="w-full h-full object-cover" />
        ) : (
          <Bot className="h-12 w-12 text-muted-foreground/50" />
        )}
      </div>
      
      <CardContent className="p-4">
        {/* Author Info */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {submission.title.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Autor #{submission.user_id.substring(0, 4)}</p>
            <p className="text-xs text-muted-foreground">Nível {level} - {levelName}</p>
          </div>
        </div>

        {/* Project Title */}
        <h4 className="font-semibold text-sm mb-3 line-clamp-1">{submission.title}</h4>

        {/* Footer: Vote + Date */}
        <div className="flex items-center justify-between">
          <Button 
            variant={hasVoted ? "default" : "outline"}
            size="sm" 
            onClick={() => onVote(submission.id)}
            className={cn(
              "gap-1 transition-all",
              hasVoted && "bg-primary/20 hover:bg-primary/30 text-primary border-primary/30"
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
  const level = Math.min(position + 2, 6); // Mock level
  const levelName = LEVEL_NAMES[level] || "Aprendiz";

  const positionStyles: Record<number, string> = {
    1: "bg-amber-500 text-amber-950",
    2: "bg-gray-400 text-gray-900",
    3: "bg-amber-700 text-amber-100",
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg transition-colors",
      position <= 3 ? "bg-muted/50" : "hover:bg-muted/30"
    )}>
      {/* Position */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
        position <= 3 ? positionStyles[position] : "bg-muted text-muted-foreground"
      )}>
        {position === 1 && <Crown className="h-4 w-4" />}
        {position > 1 && position}
      </div>

      {/* Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary">
          {submission.title.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{submission.title}</p>
        <p className="text-sm text-muted-foreground">Nível {level} - {levelName}</p>
      </div>

      {/* Votes */}
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
        {/* Thumbnail */}
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
            <span>Vencedor: Participante</span>
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
  onSubmitSuccess 
}: { 
  challenge: { id: string; title: string; description: string; rules: string | null; xp_reward: number; end_date: string };
  submissionsCount: number;
  onSubmitSuccess: () => void;
}) {
  const [showRules, setShowRules] = useState(false);

  return (
    <Card className="relative overflow-hidden border-0">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-800" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      <CardContent className="relative p-6 sm:p-8 text-white">
        {/* Badge */}
        <Badge className="bg-success hover:bg-success text-success-foreground border-0 mb-4">
          DESAFIO DA SEMANA
        </Badge>

        {/* Title & Description */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{challenge.title}</h2>
        <p className="text-foreground/80 mb-6 max-w-2xl">{challenge.description}</p>

        {/* Metrics Row */}
        <div className="flex flex-wrap gap-6 sm:gap-10 mb-6">
          {/* Countdown */}
          <div>
            <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Tempo Restante</p>
            <CountdownTimer endDate={challenge.end_date} />
          </div>

          {/* Participants */}
          <div className="text-center">
            <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Participantes</p>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-white/80" />
              <span className="text-2xl font-bold">{submissionsCount}</span>
              <span className="text-sm text-white/60">inscritos</span>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Dificuldade</p>
            <DifficultyStars level={2} />
          </div>
        </div>

        {/* Reward Card */}
        <div className="bg-background/10 backdrop-blur rounded-lg p-4 mb-6 inline-flex items-center gap-3">
          <Gift className="h-6 w-6 text-accent" />
          <span className="font-medium">
            Prêmio: <span className="text-accent">+{challenge.xp_reward} XP</span> + Badge "Mestre" + Destaque
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <SubmitModal challengeId={challenge.id} onSuccess={onSubmitSuccess} />
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

        {/* Rules Expandable */}
        {showRules && challenge.rules && (
          <div className="mt-6 p-4 bg-background/10 backdrop-blur rounded-lg">
            <h4 className="font-medium mb-2">Regras do Desafio</h4>
            <p className="text-sm text-foreground/80 whitespace-pre-line">{challenge.rules}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommunitySubmissions({ 
  submissions, 
  onVote,
  sortBy,
  onSortChange
}: { 
  submissions: ChallengeSubmission[];
  onVote: (id: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}) {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const handleVote = (id: string) => {
    setVotedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    onVote(id);
  };

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
              onVote={handleVote}
              hasVoted={votedIds.has(submission.id)}
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
  const topSubmissions = submissions.slice(0, 5);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Crown className="h-5 w-5 text-amber-500" />
        Ranking do Desafio
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
  const { activeChallenge, pastChallenges, isLoading, fetchSubmissions, vote } = useChallenges();
  const [sortBy, setSortBy] = useState("votes");

  const { data: submissions = [], refetch: refetchSubmissions } = useQuery({
    queryKey: ["challengeSubmissions", activeChallenge?.id],
    queryFn: () => activeChallenge ? fetchSubmissions(activeChallenge.id) : [],
    enabled: !!activeChallenge,
  });

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortBy === "votes") return b.votes_count - a.votes_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleVote = async (submissionId: string) => {
    if (!user) {
      toast({ title: "Erro", description: "Faça login para votar", variant: "destructive" });
      return;
    }
    vote(submissionId, {
      onSuccess: () => refetchSubmissions(),
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
                />
                <CommunitySubmissions 
                  submissions={sortedSubmissions}
                  onVote={handleVote}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
                <ChallengeRanking submissions={sortedSubmissions} />
                <PastChallenges challenges={pastChallenges} />
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
