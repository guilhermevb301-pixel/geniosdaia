import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Save,
  GripVertical,
  Video,
  Layers,
  Target,
  CheckSquare,
  MessageCircle,
  Folder,
  Wrench,
  Eye,
  Heart,
  Briefcase,
  Star,
  Lightbulb,
  Rocket,
  Code,
  Palette,
  Globe,
  Settings,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenteeData, type Stage, type Task, type Note, type Meeting, type Pillar } from "@/hooks/useMenteeData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const iconOptions = [
  { value: "folder", label: "Pasta", icon: Folder },
  { value: "wrench", label: "Técnico", icon: Wrench },
  { value: "briefcase", label: "Vendas", icon: Briefcase },
  { value: "rocket", label: "Entrega", icon: Rocket },
  { value: "target", label: "Objetivo", icon: Target },
  { value: "star", label: "Destaque", icon: Star },
  { value: "lightbulb", label: "Ideias", icon: Lightbulb },
  { value: "code", label: "Código", icon: Code },
  { value: "palette", label: "Design", icon: Palette },
  { value: "globe", label: "Global", icon: Globe },
  { value: "settings", label: "Config", icon: Settings },
  { value: "zap", label: "Energia", icon: Zap },
  { value: "heart", label: "Saúde", icon: Heart },
  { value: "eye", label: "Visão", icon: Eye },
];

const colorOptions = [
  { value: "#FFD93D", label: "Amarelo" },
  { value: "#6BCB77", label: "Verde" },
  { value: "#4D96FF", label: "Azul" },
  { value: "#FF6B6B", label: "Vermelho" },
  { value: "#C084FC", label: "Roxo" },
  { value: "#F59E0B", label: "Laranja" },
  { value: "#14B8A6", label: "Teal" },
  { value: "#EC4899", label: "Rosa" },
];

export default function MenteeEditor() {
  const { menteeId } = useParams<{ menteeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mentee, meetings, stages, pillars, isLoading } = useMenteeData(menteeId);

  // Meeting dialog state
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    meeting_date: "",
    video_url: "",
    notes: "",
  });

  // Pillar dialog state
  const [isPillarOpen, setIsPillarOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);
  const [pillarForm, setPillarForm] = useState({
    title: "",
    icon: "folder",
    icon_color: "#FFD93D",
  });

  // Stage dialog state
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [stageForm, setStageForm] = useState({
    title: "",
    objective: "",
    icon_color: "#F59E0B",
    pillar_id: "",
  });

  // Task dialog state
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    content: "",
    is_subtask: false,
  });

  // Note dialog state
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({
    content: "",
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["meetings", menteeId] });
    queryClient.invalidateQueries({ queryKey: ["stages", menteeId] });
    queryClient.invalidateQueries({ queryKey: ["pillars", menteeId] });
    queryClient.invalidateQueries({ queryKey: ["menteeProfile", menteeId] });
  };

  // Meeting CRUD
  const handleSaveMeeting = async () => {
    if (!menteeId || !meetingForm.title || !meetingForm.meeting_date) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (editingMeeting) {
      const { error } = await supabase
        .from("mentorship_meetings")
        .update({
          title: meetingForm.title,
          meeting_date: meetingForm.meeting_date,
          video_url: meetingForm.video_url || null,
          notes: meetingForm.notes || null,
        })
        .eq("id", editingMeeting.id);

      if (error) {
        toast.error("Erro ao atualizar encontro");
        return;
      }
      toast.success("Encontro atualizado!");
    } else {
      const { error } = await supabase.from("mentorship_meetings").insert({
        mentee_id: menteeId,
        title: meetingForm.title,
        meeting_date: meetingForm.meeting_date,
        video_url: meetingForm.video_url || null,
        notes: meetingForm.notes || null,
      });

      if (error) {
        toast.error("Erro ao criar encontro");
        return;
      }
      toast.success("Encontro criado!");
    }

    invalidateAll();
    setIsMeetingOpen(false);
    setEditingMeeting(null);
    setMeetingForm({ title: "", meeting_date: "", video_url: "", notes: "" });
  };

  const handleDeleteMeeting = async (id: string) => {
    const { error } = await supabase.from("mentorship_meetings").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir encontro");
      return;
    }
    toast.success("Encontro excluído!");
    invalidateAll();
  };

  // Pillar CRUD
  const handleSavePillar = async () => {
    if (!menteeId || !pillarForm.title) {
      toast.error("Preencha o título do pilar");
      return;
    }

    if (editingPillar) {
      const { error } = await supabase
        .from("mentorship_pillars")
        .update({
          title: pillarForm.title,
          icon: pillarForm.icon,
          icon_color: pillarForm.icon_color,
        })
        .eq("id", editingPillar.id);

      if (error) {
        toast.error("Erro ao atualizar pilar");
        return;
      }
      toast.success("Pilar atualizado!");
    } else {
      const maxOrder = pillars.length > 0 ? Math.max(...pillars.map((p) => p.order_index)) + 1 : 0;
      const { error } = await supabase.from("mentorship_pillars").insert({
        mentee_id: menteeId,
        title: pillarForm.title,
        icon: pillarForm.icon,
        icon_color: pillarForm.icon_color,
        order_index: maxOrder,
      });

      if (error) {
        toast.error("Erro ao criar pilar");
        return;
      }
      toast.success("Pilar criado!");
    }

    invalidateAll();
    setIsPillarOpen(false);
    setEditingPillar(null);
    setPillarForm({ title: "", icon: "folder", icon_color: "#FFD93D" });
  };

  const handleDeletePillar = async (id: string) => {
    const { error } = await supabase.from("mentorship_pillars").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir pilar");
      return;
    }
    toast.success("Pilar excluído!");
    invalidateAll();
  };

  // Stage CRUD
  const handleSaveStage = async () => {
    if (!menteeId || !stageForm.title) {
      toast.error("Preencha o título");
      return;
    }

    if (editingStage) {
      const { error } = await supabase
        .from("mentorship_stages")
        .update({
          title: stageForm.title,
          objective: stageForm.objective || null,
          icon_color: stageForm.icon_color,
          pillar_id: stageForm.pillar_id || null,
        })
        .eq("id", editingStage.id);

      if (error) {
        toast.error("Erro ao atualizar fase");
        return;
      }
      toast.success("Fase atualizada!");
    } else {
      const maxOrder = stages.length > 0 ? Math.max(...stages.map((s) => s.order_index)) + 1 : 0;
      const { error } = await supabase.from("mentorship_stages").insert({
        mentee_id: menteeId,
        title: stageForm.title,
        objective: stageForm.objective || null,
        icon_color: stageForm.icon_color,
        pillar_id: stageForm.pillar_id || null,
        order_index: maxOrder,
      });

      if (error) {
        toast.error("Erro ao criar fase");
        return;
      }
      toast.success("Fase criada!");
    }

    invalidateAll();
    setIsStageOpen(false);
    setEditingStage(null);
    setStageForm({ title: "", objective: "", icon_color: "#F59E0B", pillar_id: "" });
  };

  const handleDeleteStage = async (id: string) => {
    const { error } = await supabase.from("mentorship_stages").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir fase");
      return;
    }
    toast.success("Fase excluída!");
    invalidateAll();
  };

  // Task CRUD
  const handleSaveTask = async () => {
    if (!selectedStageId || !taskForm.content) {
      toast.error("Preencha o conteúdo da tarefa");
      return;
    }

    if (editingTask) {
      const { error } = await supabase
        .from("mentorship_tasks")
        .update({
          content: taskForm.content,
          is_subtask: taskForm.is_subtask,
        })
        .eq("id", editingTask.id);

      if (error) {
        toast.error("Erro ao atualizar tarefa");
        return;
      }
      toast.success("Tarefa atualizada!");
    } else {
      const stage = stages.find((s) => s.id === selectedStageId);
      const maxOrder = stage?.tasks?.length
        ? Math.max(...stage.tasks.map((t) => t.order_index)) + 1
        : 0;

      const { error } = await supabase.from("mentorship_tasks").insert({
        stage_id: selectedStageId,
        content: taskForm.content,
        is_subtask: taskForm.is_subtask,
        order_index: maxOrder,
      });

      if (error) {
        toast.error("Erro ao criar tarefa");
        return;
      }
      toast.success("Tarefa criada!");
    }

    invalidateAll();
    setIsTaskOpen(false);
    setEditingTask(null);
    setTaskForm({ content: "", is_subtask: false });
  };

  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase.from("mentorship_tasks").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir tarefa");
      return;
    }
    toast.success("Tarefa excluída!");
    invalidateAll();
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from("mentorship_tasks")
      .update({ completed })
      .eq("id", taskId);

    if (error) {
      toast.error("Erro ao atualizar tarefa");
      return;
    }
    invalidateAll();
  };

  // Note CRUD
  const handleSaveNote = async () => {
    if (!selectedStageId || !noteForm.content) {
      toast.error("Preencha o conteúdo da nota");
      return;
    }

    if (editingNote) {
      const { error } = await supabase
        .from("mentorship_notes")
        .update({ content: noteForm.content })
        .eq("id", editingNote.id);

      if (error) {
        toast.error("Erro ao atualizar nota");
        return;
      }
      toast.success("Nota atualizada!");
    } else {
      const stage = stages.find((s) => s.id === selectedStageId);
      const maxOrder = stage?.notes?.length
        ? Math.max(...stage.notes.map((n) => n.order_index)) + 1
        : 0;

      const { error } = await supabase.from("mentorship_notes").insert({
        stage_id: selectedStageId,
        content: noteForm.content,
        order_index: maxOrder,
      });

      if (error) {
        toast.error("Erro ao criar nota");
        return;
      }
      toast.success("Nota criada!");
    }

    invalidateAll();
    setIsNoteOpen(false);
    setEditingNote(null);
    setNoteForm({ content: "" });
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase.from("mentorship_notes").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir nota");
      return;
    }
    toast.success("Nota excluída!");
    invalidateAll();
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const option = iconOptions.find((o) => o.value === iconName);
    return option?.icon || Folder;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (!mentee) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Mentorado não encontrado</p>
          <Button variant="outline" onClick={() => navigate("/admin/mentees")} className="mt-4">
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/mentees")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{mentee.display_name}</h1>
              <Badge variant="secondary">{mentee.plan_tag}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Editar conteúdo do mentorado</p>
          </div>
        </div>

        {/* Meetings Section */}
        <Card className="bg-card border-border">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              Encontros
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingMeeting(null);
                setMeetingForm({ title: "", meeting_date: "", video_url: "", notes: "" });
                setIsMeetingOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Tema</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      Nenhum encontro cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  meetings.map((meeting) => (
                    <TableRow key={meeting.id} className="border-border">
                      <TableCell className="font-medium">{meeting.title}</TableCell>
                      <TableCell>
                        {format(new Date(meeting.meeting_date), "dd MMM yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {meeting.video_url || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingMeeting(meeting);
                              setMeetingForm({
                                title: meeting.title,
                                meeting_date: meeting.meeting_date,
                                video_url: meeting.video_url || "",
                                notes: meeting.notes || "",
                              });
                              setIsMeetingOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pillars Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Pilares</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingPillar(null);
                setPillarForm({ title: "", icon: "folder", icon_color: "#FFD93D" });
                setIsPillarOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo Pilar
            </Button>
          </div>

          {pillars.length === 0 ? (
            <Card className="bg-card border-border p-6 text-center">
              <p className="text-muted-foreground">
                Nenhum pilar criado ainda. Crie pilares para organizar as etapas.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map((pillar) => {
                const IconComponent = getIconComponent(pillar.icon);
                return (
                  <Card key={pillar.id} className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                            style={{ backgroundColor: `${pillar.icon_color}20` }}
                          >
                            <IconComponent
                              className="h-5 w-5"
                              style={{ color: pillar.icon_color }}
                            />
                          </div>
                          <h3 className="font-semibold">{pillar.title}</h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingPillar(pillar);
                              setPillarForm({
                                title: pillar.title,
                                icon: pillar.icon,
                                icon_color: pillar.icon_color,
                              });
                              setIsPillarOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePillar(pillar.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {pillar.phases.length} fase(s) vinculada(s)
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setEditingStage(null);
                          setStageForm({ title: "", objective: "", icon_color: pillar.icon_color, pillar_id: pillar.id });
                          setIsStageOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar Fase
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Stages Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Fases (Etapas)</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingStage(null);
                setStageForm({ title: "", objective: "", icon_color: "#F59E0B", pillar_id: "" });
                setIsStageOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Fase
            </Button>
          </div>

          {stages.length === 0 ? (
            <Card className="bg-card border-border p-6 text-center">
              <p className="text-muted-foreground">Nenhuma fase criada ainda.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {stages.map((stage) => {
                const linkedPillar = pillars.find((p) => p.id === stage.pillar_id);
                return (
                  <Card key={stage.id} className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 cursor-move"
                            style={{ backgroundColor: `${stage.icon_color}20` }}
                          >
                            <GripVertical className="h-4 w-4" style={{ color: stage.icon_color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{stage.title}</h3>
                              {linkedPillar && (
                                <Badge variant="outline" className="text-xs">
                                  {linkedPillar.title}
                                </Badge>
                              )}
                            </div>
                            {stage.objective && (
                              <p
                                className="text-xs mt-1 font-medium flex items-center gap-1"
                                style={{ color: stage.icon_color }}
                              >
                                <Target className="h-3 w-3" />
                                {stage.objective}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingStage(stage);
                              setStageForm({
                                title: stage.title,
                                objective: stage.objective || "",
                                icon_color: stage.icon_color,
                                pillar_id: stage.pillar_id || "",
                              });
                              setIsStageOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteStage(stage.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Tasks */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <CheckSquare className="h-3 w-3" />
                            Tarefas
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedStageId(stage.id);
                              setEditingTask(null);
                              setTaskForm({ content: "", is_subtask: false });
                              setIsTaskOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                        {stage.tasks && stage.tasks.length > 0 ? (
                          <div className="space-y-1">
                            {stage.tasks.map((task) => (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between group ${
                                  task.is_subtask ? "ml-4" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={(checked) =>
                                      handleToggleTask(task.id, checked as boolean)
                                    }
                                  />
                                  <span
                                    className={`text-sm ${
                                      task.completed ? "line-through text-muted-foreground" : ""
                                    }`}
                                  >
                                    {task.content}
                                  </span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      setSelectedStageId(stage.id);
                                      setEditingTask(task);
                                      setTaskForm({
                                        content: task.content,
                                        is_subtask: task.is_subtask,
                                      });
                                      setIsTaskOpen(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleDeleteTask(task.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Nenhuma tarefa</p>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <MessageCircle className="h-3 w-3" />
                            Notas de Mentoria
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedStageId(stage.id);
                              setEditingNote(null);
                              setNoteForm({ content: "" });
                              setIsNoteOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                        {stage.notes && stage.notes.length > 0 ? (
                          <ul className="space-y-1">
                            {stage.notes.map((note) => (
                              <li
                                key={note.id}
                                className="flex items-start justify-between group text-sm"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span>
                                  <span className="text-muted-foreground">{note.content}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      setSelectedStageId(stage.id);
                                      setEditingNote(note);
                                      setNoteForm({ content: note.content });
                                      setIsNoteOpen(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground">Nenhuma nota</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Meeting Dialog */}
      <Dialog open={isMeetingOpen} onOpenChange={setIsMeetingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMeeting ? "Editar Encontro" : "Novo Encontro"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tema *</Label>
              <Input
                value={meetingForm.title}
                onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                placeholder="Tema do encontro"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={meetingForm.meeting_date}
                onChange={(e) => setMeetingForm({ ...meetingForm, meeting_date: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>URL do Vídeo</Label>
              <Input
                value={meetingForm.video_url}
                onChange={(e) => setMeetingForm({ ...meetingForm, video_url: e.target.value })}
                placeholder="https://..."
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={meetingForm.notes}
                onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                placeholder="Anotações sobre o encontro..."
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMeetingOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" onClick={handleSaveMeeting}>
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pillar Dialog */}
      <Dialog open={isPillarOpen} onOpenChange={setIsPillarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPillar ? "Editar Pilar" : "Novo Pilar"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={pillarForm.title}
                onChange={(e) => setPillarForm({ ...pillarForm, title: e.target.value })}
                placeholder="Ex: Pilar Técnico"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select
                value={pillarForm.icon}
                onValueChange={(value) => setPillarForm({ ...pillarForm, icon: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {iconOptions.map((option) => {
                    const IconComp = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComp className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      pillarForm.icon_color === color.value ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setPillarForm({ ...pillarForm, icon_color: color.value })}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPillarOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" onClick={handleSavePillar}>
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage Dialog */}
      <Dialog open={isStageOpen} onOpenChange={setIsStageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStage ? "Editar Fase" : "Nova Fase"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={stageForm.title}
                onChange={(e) => setStageForm({ ...stageForm, title: e.target.value })}
                placeholder="Nome da fase"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Input
                value={stageForm.objective}
                onChange={(e) => setStageForm({ ...stageForm, objective: e.target.value })}
                placeholder="Objetivo desta fase"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Pilar (opcional)</Label>
              <Select
                value={stageForm.pillar_id}
                onValueChange={(value) => setStageForm({ ...stageForm, pillar_id: value === "none" ? "" : value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione um pilar" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="none">Nenhum (fase avulsa)</SelectItem>
                  {pillars.map((pillar) => (
                    <SelectItem key={pillar.id} value={pillar.id}>
                      {pillar.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      stageForm.icon_color === color.value ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setStageForm({ ...stageForm, icon_color: color.value })}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStageOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" onClick={handleSaveStage}>
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Conteúdo *</Label>
              <Input
                value={taskForm.content}
                onChange={(e) => setTaskForm({ ...taskForm, content: e.target.value })}
                placeholder="Descrição da tarefa"
                className="bg-background"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_subtask"
                checked={taskForm.is_subtask}
                onCheckedChange={(checked) =>
                  setTaskForm({ ...taskForm, is_subtask: checked as boolean })
                }
              />
              <Label htmlFor="is_subtask" className="cursor-pointer">
                É uma subtarefa (indentada)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" onClick={handleSaveTask}>
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Editar Nota" : "Nova Nota"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Conteúdo *</Label>
              <Textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                placeholder="Nota de mentoria..."
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" onClick={handleSaveNote}>
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
