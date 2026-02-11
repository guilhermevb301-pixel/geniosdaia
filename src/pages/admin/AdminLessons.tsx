import { useState, useMemo } from "react";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ArrowLeft, Youtube, Download, Upload, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { validateVideoFile } from "@/lib/fileValidation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableLessonRow } from "@/components/admin/SortableLessonRow";

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
  const [filterModuleId, setFilterModuleId] = useState<string>("all");

  // Form state
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [videoSourceType, setVideoSourceType] = useState<"youtube" | "upload">("youtube");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Ordenar aulas por módulo e order_index
  const sortedLessons = useMemo(() => {
    if (!lessons) return [];
    return [...lessons].sort((a, b) => {
      if (a.module_id !== b.module_id) {
        return a.module_id.localeCompare(b.module_id);
      }
      return a.order_index - b.order_index;
    });
  }, [lessons]);

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

  const reorderMutation = useMutation({
    mutationFn: async ({ lessonId, newIndex, moduleId }: { lessonId: string; newIndex: number; moduleId: string }) => {
      if (!lessons) return;
      
      // Filtra aulas do mesmo módulo
      const moduleLessons = lessons
        .filter(l => l.module_id === moduleId)
        .sort((a, b) => a.order_index - b.order_index);
      
      // Atualiza os order_index de todas as aulas do módulo
      const updates = moduleLessons.map((lesson, idx) => {
        let newOrderIndex = idx;
        
        if (lesson.id === lessonId) {
          newOrderIndex = newIndex;
        } else {
          const oldIndex = moduleLessons.findIndex(l => l.id === lessonId);
          if (oldIndex < newIndex && idx > oldIndex && idx <= newIndex) {
            newOrderIndex = idx - 1;
          } else if (oldIndex > newIndex && idx < oldIndex && idx >= newIndex) {
            newOrderIndex = idx + 1;
          }
        }
        
        return supabase
          .from("lessons")
          .update({ order_index: newOrderIndex })
          .eq("id", lesson.id);
      });
      
      const results = await Promise.all(updates);
      results.forEach(r => { if (r.error) throw r.error; });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao reordenar", description: error.message });
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !lessons) return;
    
    const activeLesson = lessons.find(l => l.id === active.id);
    const overLesson = lessons.find(l => l.id === over.id);
    
    if (!activeLesson || !overLesson) return;
    
    // Só permite reordenar dentro do mesmo módulo
    if (activeLesson.module_id !== overLesson.module_id) {
      toast({ 
        variant: "destructive", 
        title: "Não é possível mover entre módulos",
        description: "Você só pode reordenar aulas dentro do mesmo módulo."
      });
      return;
    }
    
    const moduleLessons = lessons
      .filter(l => l.module_id === activeLesson.module_id)
      .sort((a, b) => a.order_index - b.order_index);
    
    const newIndex = moduleLessons.findIndex(l => l.id === over.id);
    
    reorderMutation.mutate({ 
      lessonId: activeLesson.id, 
      newIndex, 
      moduleId: activeLesson.module_id 
    });
  }

  function resetForm() {
    setDialogOpen(false);
    setEditingLesson(null);
    setModuleId("");
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setDownloadUrl("");
    setDuration("");
    setVideoFile(null);
    setVideoSourceType("youtube");
  }

  function handleEdit(lesson: Lesson) {
    setEditingLesson(lesson);
    setModuleId(lesson.module_id);
    setTitle(lesson.title);
    setDescription(lesson.description || "");
    setYoutubeUrl(lesson.youtube_url || "");
    setDownloadUrl(lesson.download_url || "");
    setDuration(lesson.duration || "");
    setVideoFile(null);
    // Detect if existing lesson uses uploaded video (not YouTube)
    const url = lesson.youtube_url || "";
    setVideoSourceType(url.includes('/lesson-videos/') || url.endsWith('.mp4') ? "upload" : "youtube");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let finalYoutubeUrl = videoSourceType === "youtube" ? (youtubeUrl || null) : null;

    // Upload video file if provided
    if (videoSourceType === "upload" && videoFile) {
      setIsUploading(true);
      try {
        const fileName = `${crypto.randomUUID()}.mp4`;
        const { error: uploadError } = await supabase.storage
          .from("lesson-videos")
          .upload(fileName, videoFile, { contentType: "video/mp4" });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("lesson-videos")
          .getPublicUrl(fileName);
        finalYoutubeUrl = urlData.publicUrl;
      } catch (err: any) {
        toast({ variant: "destructive", title: "Erro no upload do vídeo", description: err.message });
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const lessonData = {
      module_id: moduleId,
      title,
      description: description || null,
      youtube_url: finalYoutubeUrl,
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
              <p className="text-muted-foreground">Adicione aulas aos módulos via YouTube ou upload de MP4. Arraste para reordenar.</p>
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

                {/* Video Source Toggle */}
                <div className="space-y-3">
                  <Label>Fonte do Vídeo</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={videoSourceType === "youtube" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVideoSourceType("youtube")}
                      className="flex items-center gap-2"
                    >
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </Button>
                    <Button
                      type="button"
                      variant={videoSourceType === "upload" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVideoSourceType("upload")}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload MP4
                    </Button>
                  </div>

                  {videoSourceType === "youtube" ? (
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
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="video-upload" className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Vídeo MP4 (máx. 1GB)
                      </Label>
                      {editingLesson?.youtube_url?.includes('/lesson-videos/') && !videoFile && (
                        <p className="text-xs text-muted-foreground">Vídeo atual já enviado. Selecione um novo arquivo para substituir.</p>
                      )}
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/mp4,.mp4"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const validation = validateVideoFile(file);
                            if (!validation.valid) {
                              toast({ variant: "destructive", title: "Arquivo inválido", description: validation.error });
                              e.target.value = "";
                              return;
                            }
                            setVideoFile(file);
                          }
                        }}
                      />
                    </div>
                  )}
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
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading}>
                    {isUploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando vídeo...</>
                    ) : editingLesson ? "Salvar" : "Criar"}
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
            ) : sortedLessons && sortedLessons.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>YouTube</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <SortableContext
                    items={sortedLessons.map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <TableBody>
                      {sortedLessons.map((lesson) => (
                        <SortableLessonRow
                          key={lesson.id}
                          lesson={lesson}
                          moduleName={getModuleName(lesson.module_id)}
                          onEdit={handleEdit}
                          onDelete={(id) => deleteMutation.mutate(id)}
                        />
                      ))}
                    </TableBody>
                  </SortableContext>
                </Table>
              </DndContext>
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
