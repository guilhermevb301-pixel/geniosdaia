import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Clock, Users, ThumbsUp, Upload, ExternalLink, Medal } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

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

function CountdownTimer({ endDate }: { endDate: string }) {
  const [time, setTime] = useState(formatCountdown(endDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatCountdown(endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="flex gap-4 justify-center">
      {[
        { value: time.days, label: "Dias" },
        { value: time.hours, label: "Horas" },
        { value: time.minutes, label: "Min" },
        { value: time.seconds, label: "Seg" },
      ].map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-primary">{value.toString().padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}

function SubmitModal({ challengeId, onSuccess }: { challengeId: string; onSuccess: () => void }) {
  const { submit, isSubmitting } = useChallenges();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [open, setOpen] = useState(false);

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
        <Button size="lg" className="gap-2">
          <Upload className="h-4 w-4" />
          Submeter Meu Projeto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submeter Projeto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium">Título do Projeto *</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Nome do seu projeto"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Descreva seu projeto..."
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Link (opcional)</label>
            <Input 
              value={linkUrl} 
              onChange={(e) => setLinkUrl(e.target.value)} 
              placeholder="https://..."
            />
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Enviando..." : "Enviar Submissão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubmissionCard({ 
  submission, 
  rank,
  onVote 
}: { 
  submission: { id: string; title: string; description: string | null; votes_count: number; created_at: string; is_winner: boolean };
  rank: number;
  onVote: (id: string) => void;
}) {
  const medalColors = ["text-amber-500", "text-gray-400", "text-amber-700"];

  return (
    <Card className={submission.is_winner ? "border-amber-500/50 bg-amber-500/5" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {rank <= 3 && (
                <Medal className={`h-5 w-5 ${medalColors[rank - 1]}`} />
              )}
              <h4 className="font-semibold">{submission.title}</h4>
              {submission.is_winner && (
                <Badge variant="default" className="bg-amber-500 text-amber-950">Vencedor</Badge>
              )}
            </div>
            {submission.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{submission.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(submission.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onVote(submission.id)}
            className="flex items-center gap-1"
          >
            <ThumbsUp className="h-4 w-4" />
            {submission.votes_count}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Desafios() {
  const { user } = useAuth();
  const { activeChallenge, pastChallenges, isLoading, fetchSubmissions, vote } = useChallenges();
  const [sortBy, setSortBy] = useState<"recent" | "votes">("votes");

  const { data: submissions, refetch: refetchSubmissions } = useQuery({
    queryKey: ["challengeSubmissions", activeChallenge?.id],
    queryFn: () => activeChallenge ? fetchSubmissions(activeChallenge.id) : [],
    enabled: !!activeChallenge,
  });

  const sortedSubmissions = [...(submissions || [])].sort((a, b) => {
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
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500" />
            Arena dos Gênios
          </h1>
          <p className="text-muted-foreground mt-1">
            Desafios semanais para testar suas habilidades
          </p>
        </div>

        {/* Active Challenge */}
        {activeChallenge ? (
          <Card className="relative overflow-hidden border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <CardHeader className="relative">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Trophy className="h-5 w-5" />
                <span className="text-sm font-medium">Desafio Ativo</span>
              </div>
              <CardTitle className="text-2xl">{activeChallenge.title}</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <p className="text-muted-foreground">{activeChallenge.description}</p>
              
              {activeChallenge.rules && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Regras</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{activeChallenge.rules}</p>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    +{activeChallenge.xp_reward} XP
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Encerra em:</span>
                  </div>
                </div>
              </div>

              <CountdownTimer endDate={activeChallenge.end_date} />

              <div className="flex justify-center pt-4">
                <SubmitModal challengeId={activeChallenge.id} onSuccess={() => refetchSubmissions()} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Nenhum desafio ativo</h3>
            <p className="text-muted-foreground">Volte em breve para novos desafios!</p>
          </Card>
        )}

        {/* Submissions */}
        {activeChallenge && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Submissões da Comunidade
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant={sortBy === "votes" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy("votes")}
                >
                  Mais Votados
                </Button>
                <Button 
                  variant={sortBy === "recent" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy("recent")}
                >
                  Mais Recentes
                </Button>
              </div>
            </div>

            {sortedSubmissions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {sortedSubmissions.map((submission, index) => (
                  <SubmissionCard 
                    key={submission.id} 
                    submission={submission}
                    rank={index + 1}
                    onVote={handleVote}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma submissão ainda. Seja o primeiro!</p>
              </Card>
            )}
          </div>
        )}

        {/* Past Challenges */}
        {pastChallenges.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Desafios Anteriores</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastChallenges.map((challenge) => (
                <Card key={challenge.id} className="opacity-75">
                  <CardContent className="p-4">
                    <h4 className="font-medium">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{challenge.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Encerrado em {new Date(challenge.end_date).toLocaleDateString("pt-BR")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
