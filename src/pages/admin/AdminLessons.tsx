import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Edit, Trash2, ArrowLeft, Youtube, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  download_url: string | null;
  duration: string | null;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
}

export default function AdminLessons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [filterModuleId, setFilterModuleId] = useState<string>("all");

  // Form state
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [duration, setDuration] = useState("");

  const { data: modules } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id, title")
        .order("order_index");
      if (error) throw error;
      return data as Module[];
    },
  });

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons", filterModuleId],
    queryFn: async () => {
      let query = supabase
        .from("lessons")
        .select("*")
        .order("order_index");
      
      if (filterModuleId && filterModuleId !== "all") {
        query = query.eq("module_id", filterModuleId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Lesson[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newLesson: Omit<Lesson, "id">) => {
      const { data, error } = await supabase
        .from("lessons")
        .insert(newLesson)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast({ title: "Aula criada com sucesso!" });
      resetForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao criar aula", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (lesson: Lesson) => {
      const { data, error } = await supabase
        .from("lessons")
        .update({
          module_id: lesson.module_id,
          title: lesson.title,
          description: lesson.description,
          youtube_url: lesson.youtube_url,
          download_url: lesson.download_url,
          duration: lesson.duration,
        })
        .eq("id", lesson.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast({ title: "Aula atualizada com sucesso!" });
      resetForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao atualizar aula", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast({ title: "Aula excluída com sucesso!" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao excluir aula", description: error.message });
    },
  });

  function resetForm() {
    setDialogOpen(false);
    setEditingLesson(null);
    setModuleId("");
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setDownloadUrl("");
    setDuration("");
  }

  function handleEdit(lesson: Lesson) {
    setEditingLesson(lesson);
    setModuleId(lesson.module_id);
    setTitle(lesson.title);
    setDescription(lesson.description || "");
    setYoutubeUrl(lesson.youtube_url || "");
    setDownloadUrl(lesson.download_url || "");
    setDuration(lesson.duration || "");
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lessonData = {
      module_id: moduleId,
      title,
      description: description || null,
      youtube_url: youtubeUrl || null,
      download_url: downloadUrl || null,
      duration: duration || null,
      order_index: lessons ? lessons.filter(l => l.module_id === moduleId).length : 0,
    };

    if (editingLesson) {
      updateMutation.mutate({ ...lessonData, id: editingLesson.id });
    } else {
      createMutation.mutate(lessonData);
    }
  }

  function getModuleName(moduleId: string) {
    return modules?.find(m => m.id === moduleId)?.title || "Módulo desconhecido";
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/modules">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Aulas</h1>
              <p className="text-muted-foreground">Adicione aulas do YouTube aos módulos</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} disabled={!modules || modules.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Aula
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingLesson ? "Editar Aula" : "Nova Aula"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="module">Módulo</Label>
                  <Select value={moduleId} onValueChange={setModuleId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules?.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título da Aula</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: O que é n8n?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição da aula (opcional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-destructive" />
                    URL do YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração</Label>
                    <Input
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Ex: 10:30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="download" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      URL Download
                    </Label>
                    <Input
                      id="download"
                      value={downloadUrl}
                      onChange={(e) => setDownloadUrl(e.target.value)}
                      placeholder="URL para download (opcional)"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingLesson ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter by module */}
        <div className="flex items-center gap-4">
          <Label>Filtrar por módulo:</Label>
          <Select value={filterModuleId} onValueChange={setFilterModuleId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todos os módulos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os módulos</SelectItem>
              {modules?.map((module) => (
                <SelectItem key={module.id} value={module.id}>
                  {module.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aulas ({lessons?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!modules || modules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Crie módulos primeiro antes de adicionar aulas.{" "}
                <Link to="/admin/modules" className="text-primary underline">
                  Criar módulos
                </Link>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : lessons && lessons.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>YouTube</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {getModuleName(lesson.module_id)}
                      </TableCell>
                      <TableCell className="font-medium">{lesson.title}</TableCell>
                      <TableCell>{lesson.duration || "-"}</TableCell>
                      <TableCell>
                        {lesson.youtube_url ? (
                          <a
                            href={lesson.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-destructive hover:underline flex items-center gap-1"
                          >
                            <Youtube className="h-4 w-4" />
                            Ver
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(lesson)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir esta aula?")) {
                                deleteMutation.mutate(lesson.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma aula criada ainda. Clique em "Nova Aula" para começar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
