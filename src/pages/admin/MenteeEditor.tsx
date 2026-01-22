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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenteeData, type Stage, type Task, type Note, type Meeting } from "@/hooks/useMenteeData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MenteeEditor() {
  const { menteeId } = useParams<{ menteeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mentee, meetings, stages, isLoading } = useMenteeData(menteeId);

  // Meeting dialog state
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    meeting_date: "",
    video_url: "",
    notes: "",
  });

  // Stage dialog state
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [stageForm, setStageForm] = useState({
    title: "",
    objective: "",
    icon_color: "#F59E0B",
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
        })
        .eq("id", editingStage.id);

      if (error) {
        toast.error("Erro ao atualizar etapa");
        return;
      }
      toast.success("Etapa atualizada!");
    } else {
      const maxOrder = stages.length > 0 ? Math.max(...stages.map((s) => s.order_index)) + 1 : 0;
      const { error } = await supabase.from("mentorship_stages").insert({
        mentee_id: menteeId,
        title: stageForm.title,
        objective: stageForm.objective || null,
        icon_color: stageForm.icon_color,
        order_index: maxOrder,
      });

      if (error) {
        toast.error("Erro ao criar etapa");
        return;
      }
      toast.success("Etapa criada!");
    }

    invalidateAll();
    setIsStageOpen(false);
    setEditingStage(null);
    setStageForm({ title: "", objective: "", icon_color: "#F59E0B" });
  };

  const handleDeleteStage = async (id: string) => {
    const { error } = await supabase.from("mentorship_stages").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir etapa");
      return;
    }
    toast.success("Etapa excluída!");
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

        {/* Stages Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Etapas</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingStage(null);
                setStageForm({ title: "", objective: "", icon_color: "#F59E0B" });
                setIsStageOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Etapa
            </Button>
          </div>

          {stages.length === 0 ? (
            <Card className="bg-card border-border p-6 text-center">
              <p className="text-muted-foreground">Nenhuma etapa criada ainda.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {stages.map((stage) => (
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
                          <h3 className="font-medium">{stage.title}</h3>
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
              ))}
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

      {/* Stage Dialog */}
      <Dialog open={isStageOpen} onOpenChange={setIsStageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStage ? "Editar Etapa" : "Nova Etapa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={stageForm.title}
                onChange={(e) => setStageForm({ ...stageForm, title: e.target.value })}
                placeholder="Nome da etapa"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Input
                value={stageForm.objective}
                onChange={(e) => setStageForm({ ...stageForm, objective: e.target.value })}
                placeholder="Objetivo desta etapa"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor do ícone</Label>
              <Input
                type="color"
                value={stageForm.icon_color}
                onChange={(e) => setStageForm({ ...stageForm, icon_color: e.target.value })}
                className="h-10 w-20"
              />
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
