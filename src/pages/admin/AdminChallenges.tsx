import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trophy, Plus, Pencil, Trash2, CalendarIcon, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useChallenges, Challenge } from "@/hooks/useChallenges";
import { toast } from "@/hooks/use-toast";

interface FormData {
  title: string;
  description: string;
  rules: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  xp_reward: number;
  status: string;
  difficulty: string;
  reward_badge: string;
  reward_highlight: boolean;
  tracks: string[];
}

const initialFormData: FormData = {
  title: "",
  description: "",
  rules: "",
  start_date: undefined,
  end_date: undefined,
  xp_reward: 100,
  status: "active",
  difficulty: "intermediario",
  reward_badge: "",
  reward_highlight: false,
  tracks: [],
};

const availableTracks = [
  { value: "agentes", label: "Agentes de IA" },
  { value: "videos", label: "Vídeos com IA" },
  { value: "fotos", label: "Imagens com IA" },
  { value: "crescimento", label: "Crescimento" },
  { value: "propostas", label: "Propostas" },
];

export default function AdminChallenges() {
  const [activeTab, setActiveTab] = useState("active");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [deletingChallengeId, setDeletingChallengeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const {
    allChallenges,
    isLoading,
    createChallenge,
    isCreating,
    updateChallenge,
    isUpdating,
    deleteChallenge,
    isDeleting,
  } = useChallenges();

  // Filter challenges by status
  const now = new Date();
  const activeChallenges = allChallenges.filter((c) => {
    const startDate = new Date(c.start_date);
    const endDate = new Date(c.end_date);
    return c.status === "active" && startDate <= now && endDate >= now;
  });
  
  const scheduledChallenges = allChallenges.filter((c) => {
    const startDate = new Date(c.start_date);
    return c.status === "active" && startDate > now;
  });
  
  const endedChallenges = allChallenges.filter((c) => c.status === "ended" || new Date(c.end_date) < now);

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      rules: challenge.rules || "",
      start_date: new Date(challenge.start_date),
      end_date: new Date(challenge.end_date),
      xp_reward: challenge.xp_reward,
      status: challenge.status,
      difficulty: challenge.difficulty || "intermediario",
      reward_badge: challenge.reward_badge || "",
      reward_highlight: challenge.reward_highlight || false,
      tracks: challenge.tracks || [],
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingChallengeId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || formData.title.length < 5) {
      toast({
        title: "Erro de validação",
        description: "O título deve ter pelo menos 5 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description || formData.description.length < 20) {
      toast({
        title: "Erro de validação",
        description: "A descrição deve ter pelo menos 20 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast({
        title: "Erro de validação",
        description: "As datas de início e fim são obrigatórias.",
        variant: "destructive",
      });
      return;
    }

    if (formData.end_date <= formData.start_date) {
      toast({
        title: "Erro de validação",
        description: "A data de fim deve ser posterior à data de início.",
        variant: "destructive",
      });
      return;
    }

    const challengeData = {
      title: formData.title,
      description: formData.description,
      rules: formData.rules || null,
      start_date: formData.start_date.toISOString(),
      end_date: formData.end_date.toISOString(),
      xp_reward: formData.xp_reward,
      status: formData.status,
      difficulty: formData.difficulty,
      reward_badge: formData.reward_badge || null,
      reward_highlight: formData.reward_highlight,
      tracks: formData.tracks,
    };

    try {
      if (editingChallenge) {
        await updateChallenge({ id: editingChallenge.id, data: challengeData });
        toast({
          title: "Desafio atualizado!",
          description: "O desafio foi atualizado com sucesso.",
        });
      } else {
        await createChallenge(challengeData);
        toast({
          title: "Desafio criado!",
          description: "O novo desafio foi criado com sucesso.",
        });
      }
      setIsDialogOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o desafio.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingChallengeId) return;

    try {
      await deleteChallenge(deletingChallengeId);
      toast({
        title: "Desafio excluído!",
        description: "O desafio foi excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setDeletingChallengeId(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o desafio.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (challenge: Challenge) => {
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    
    if (challenge.status === "ended" || endDate < now) {
      return <Badge variant="secondary">Encerrado</Badge>;
    }
    if (startDate > now) {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Agendado</Badge>;
    }
    return <Badge className="bg-success hover:bg-success/90">Ativo</Badge>;
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{challenge.title}</CardTitle>
          {getStatusBadge(challenge)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {challenge.description}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {format(new Date(challenge.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
            {format(new Date(challenge.end_date), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Trophy className="h-3 w-3" />
              {challenge.xp_reward} XP
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenEdit(challenge)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenDelete(challenge.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  const ChallengeGrid = ({ challenges, emptyMessage }: { challenges: Challenge[]; emptyMessage: string }) => (
    <div>
      {challenges.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Gerenciar Desafios</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie os desafios semanais da Arena
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Desafio
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              Ativos
              {activeChallenges.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {activeChallenges.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              Agendados
              {scheduledChallenges.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {scheduledChallenges.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ended" className="gap-2">
              Encerrados
              {endedChallenges.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {endedChallenges.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <ChallengeGrid 
              challenges={activeChallenges} 
              emptyMessage="Nenhum desafio ativo no momento" 
            />
          </TabsContent>

          <TabsContent value="scheduled" className="mt-6">
            <ChallengeGrid 
              challenges={scheduledChallenges} 
              emptyMessage="Nenhum desafio agendado" 
            />
          </TabsContent>

          <TabsContent value="ended" className="mt-6">
            <ChallengeGrid 
              challenges={endedChallenges} 
              emptyMessage="Nenhum desafio encerrado" 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingChallenge ? "Editar Desafio" : "Novo Desafio"}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para {editingChallenge ? "editar o" : "criar um novo"} desafio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Crie um Agente de IA para Atendimento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o desafio em detalhes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Regras (opcional)</Label>
              <Textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                placeholder="Regras e critérios de avaliação..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date
                        ? format(formData.start_date, "dd/MM/yyyy", { locale: ptBR })
                        : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => setFormData({ ...formData, start_date: date })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data de Fim *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date
                        ? format(formData.end_date, "dd/MM/yyyy", { locale: ptBR })
                        : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => setFormData({ ...formData, end_date: date })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xp_reward">Recompensa XP</Label>
                <Input
                  id="xp_reward"
                  type="number"
                  min={50}
                  max={1000}
                  value={formData.xp_reward}
                  onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 100 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="ended">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reward Badge */}
            <div className="space-y-2">
              <Label htmlFor="reward_badge">Nome do Badge (opcional)</Label>
              <Input
                id="reward_badge"
                value={formData.reward_badge}
                onChange={(e) => setFormData({ ...formData, reward_badge: e.target.value })}
                placeholder="Ex: Mestre dos Agentes"
              />
            </div>

            {/* Reward Highlight */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reward_highlight"
                checked={formData.reward_highlight}
                onChange={(e) => setFormData({ ...formData, reward_highlight: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="reward_highlight">Dar destaque ao vencedor</Label>
            </div>

            {/* Tracks */}
            <div className="space-y-2">
              <Label>Trilhas aplicáveis</Label>
              <div className="flex flex-wrap gap-2">
                {availableTracks.map((track) => (
                  <Button
                    key={track.value}
                    type="button"
                    size="sm"
                    variant={formData.tracks.includes(track.value) ? "default" : "outline"}
                    onClick={() => {
                      const newTracks = formData.tracks.includes(track.value)
                        ? formData.tracks.filter(t => t !== track.value)
                        : [...formData.tracks, track.value];
                      setFormData({ ...formData, tracks: newTracks });
                    }}
                  >
                    {track.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? "Salvando..." : editingChallenge ? "Salvar" : "Criar Desafio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Desafio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este desafio? Esta ação não pode ser desfeita.
              Todas as submissões relacionadas também serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
