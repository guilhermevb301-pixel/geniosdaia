import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Sparkles, Clock, X } from "lucide-react";
import { useDailyChallengesAdmin, DailyChallengeFormData } from "@/hooks/useDailyChallengesAdmin";
import { DailyChallenge } from "@/hooks/useDailyChallenges";

const trackOptions = [
  { value: "agentes", label: "Agentes de IA" },
  { value: "videos", label: "Vídeos com IA" },
  { value: "fotos", label: "Imagens com IA" },
  { value: "crescimento", label: "Crescimento" },
  { value: "propostas", label: "Propostas" },
  { value: "n8n", label: "N8N/Automação" },
  { value: "vendas", label: "Vendas" },
];

const difficultyOptions = [
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

const initialFormData: DailyChallengeFormData = {
  title: "",
  objective: "",
  track: "agentes",
  difficulty: "iniciante",
  estimated_minutes: 30,
  steps: [],
  checklist: [],
  deliverable: "",
  is_bonus: false,
};

export function DailyChallengesEditor() {
  const {
    challenges,
    isLoading,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDailyChallengesAdmin();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<DailyChallenge | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DailyChallengeFormData>(initialFormData);
  
  // Temporary inputs for steps/checklist
  const [newStep, setNewStep] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (challenge: DailyChallenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      objective: challenge.objective,
      track: challenge.track,
      difficulty: challenge.difficulty,
      estimated_minutes: challenge.estimated_minutes,
      steps: challenge.steps || [],
      checklist: challenge.checklist || [],
      deliverable: challenge.deliverable,
      is_bonus: challenge.is_bonus || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.objective.trim() || !formData.deliverable.trim()) {
      return;
    }

    if (editingChallenge) {
      updateChallenge({ id: editingChallenge.id, data: formData });
    } else {
      createChallenge(formData);
    }
    setIsDialogOpen(false);
    setFormData(initialFormData);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteChallenge(deletingId);
      setDeletingId(null);
    }
  };

  const addStep = () => {
    if (newStep.trim()) {
      setFormData({ ...formData, steps: [...formData.steps, newStep.trim()] });
      setNewStep("");
    }
  };

  const removeStep = (index: number) => {
    setFormData({ ...formData, steps: formData.steps.filter((_, i) => i !== index) });
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData({ ...formData, checklist: [...formData.checklist, newChecklistItem.trim()] });
      setNewChecklistItem("");
    }
  };

  const removeChecklistItem = (index: number) => {
    setFormData({ ...formData, checklist: formData.checklist.filter((_, i) => i !== index) });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "iniciante":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "avancado":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Desafios Recomendados
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie o catálogo de desafios personalizados para os alunos
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Desafio
        </Button>
      </div>

      {/* Grid */}
      {challenges.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Nenhum desafio cadastrado. Clique em "Novo Desafio" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {challenge.is_bonus && (
                        <Badge className="bg-amber-500 text-amber-950 text-xs">
                          BÔNUS
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(challenge.difficulty)}
                      >
                        {difficultyOptions.find(d => d.value === challenge.difficulty)?.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{challenge.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {challenge.objective}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{challenge.track}</Badge>
                  {challenge.estimated_minutes && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {challenge.estimated_minutes}min
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(challenge)}
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingId(challenge.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingChallenge ? "Editar Desafio" : "Novo Desafio Recomendado"}
            </DialogTitle>
            <DialogDescription>
              {editingChallenge
                ? "Altere as informações do desafio"
                : "Crie um novo desafio personalizado para os alunos"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Crie seu primeiro Agente de IA"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="objective">Objetivo *</Label>
                <Textarea
                  id="objective"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="Descreva o objetivo deste desafio..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Trilha *</Label>
                <Select
                  value={formData.track}
                  onValueChange={(value) => setFormData({ ...formData, track: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trackOptions.map((track) => (
                      <SelectItem key={track.value} value={track.value}>
                        {track.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dificuldade *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_minutes">Tempo Estimado (min)</Label>
                <Input
                  id="estimated_minutes"
                  type="number"
                  value={formData.estimated_minutes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_minutes: parseInt(e.target.value) || null })
                  }
                  placeholder="30"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <Checkbox
                  id="is_bonus"
                  checked={formData.is_bonus}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_bonus: !!checked })
                  }
                />
                <Label htmlFor="is_bonus">Desafio Bônus</Label>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="deliverable">Entregável *</Label>
                <Input
                  id="deliverable"
                  value={formData.deliverable}
                  onChange={(e) => setFormData({ ...formData, deliverable: e.target.value })}
                  placeholder="Ex: Print do agente funcionando no WhatsApp"
                />
              </div>

              {/* Steps */}
              <div className="col-span-2 space-y-2">
                <Label>Passos</Label>
                <div className="flex gap-2">
                  <Input
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    placeholder="Adicionar passo..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStep())}
                  />
                  <Button type="button" variant="secondary" onClick={addStep}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.steps.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {formData.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded"
                      >
                        <span className="text-muted-foreground">{idx + 1}.</span>
                        <span className="flex-1">{step}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="col-span-2 space-y-2">
                <Label>Checklist</Label>
                <div className="flex gap-2">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Adicionar item..."
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addChecklistItem())
                    }
                  />
                  <Button type="button" variant="secondary" onClick={addChecklistItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.checklist.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {formData.checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded"
                      >
                        <Checkbox disabled checked={false} />
                        <span className="flex-1">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChecklistItem(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isCreating ||
                isUpdating ||
                !formData.title.trim() ||
                !formData.objective.trim() ||
                !formData.deliverable.trim()
              }
            >
              {editingChallenge ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este desafio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
