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
import { Plus, Edit, Trash2, ArrowLeft, X, Image, FolderOpen, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { validateImageFile, ALLOWED_IMAGE_EXTENSIONS } from "@/lib/fileValidation";
import { Badge } from "@/components/ui/badge";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

interface Module {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  section_id: string | null;
  created_at: string;
}

interface ModuleSection {
  id: string;
  title: string;
  order_index: number;
  created_at: string;
}

export default function AdminModules() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Module dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Section dialog state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ModuleSection | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");

  // Fetch sections
  const { data: sections } = useQuery({
    queryKey: ["module_sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_sections")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as ModuleSection[];
    },
  });

  // Fetch modules
  const { data: modules, isLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as Module[];
    },
  });

  // Section mutations
  const createSectionMutation = useMutation({
    mutationFn: async (newSection: { title: string; order_index: number }) => {
      const { data, error } = await supabase
        .from("module_sections")
        .insert(newSection)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module_sections"] });
      toast({ title: "Seção criada com sucesso!" });
      resetSectionForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao criar seção", description: error.message });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data, error } = await supabase
        .from("module_sections")
        .update({ title })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module_sections"] });
      toast({ title: "Seção atualizada com sucesso!" });
      resetSectionForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao atualizar seção", description: error.message });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("module_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module_sections"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast({ title: "Seção excluída com sucesso!" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao excluir seção", description: error.message });
    },
  });

  // Module mutations
  const createMutation = useMutation({
    mutationFn: async (newModule: { title: string; description: string; cover_image_url: string | null; order_index: number; section_id: string | null }) => {
      const { data, error } = await supabase
        .from("modules")
        .insert(newModule)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast({ title: "Módulo criado com sucesso!" });
      resetForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao criar módulo", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, description, cover_image_url, section_id }: { id: string; title: string; description: string; cover_image_url: string | null; section_id: string | null }) => {
      const { data, error } = await supabase
        .from("modules")
        .update({ title, description, cover_image_url, section_id })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast({ title: "Módulo atualizado com sucesso!" });
      resetForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao atualizar módulo", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast({ title: "Módulo excluído com sucesso!" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao excluir módulo", description: error.message });
    },
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({ variant: "destructive", title: "Erro", description: validation.error });
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `covers/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from("modules")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("modules")
        .getPublicUrl(fileName);

      setCoverImageUrl(publicUrl);
      toast({ title: "Imagem enviada com sucesso!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao enviar imagem", description: error.message });
    } finally {
      setIsUploading(false);
    }
  }

  function resetForm() {
    setDialogOpen(false);
    setEditingModule(null);
    setTitle("");
    setDescription("");
    setCoverImageUrl(null);
    setSectionId("");
  }

  function resetSectionForm() {
    setSectionDialogOpen(false);
    setEditingSection(null);
    setSectionTitle("");
  }

  function handleEdit(module: Module) {
    setEditingModule(module);
    setTitle(module.title);
    setDescription(module.description || "");
    setCoverImageUrl(module.cover_image_url);
    setSectionId(module.section_id || "");
    setDialogOpen(true);
  }

  function handleEditSection(section: ModuleSection) {
    setEditingSection(section);
    setSectionTitle(section.title);
    setSectionDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalSectionId = sectionId === "" ? null : sectionId;
    
    if (editingModule) {
      updateMutation.mutate({ 
        id: editingModule.id, 
        title, 
        description, 
        cover_image_url: coverImageUrl,
        section_id: finalSectionId 
      });
    } else {
      const nextOrder = modules ? modules.length : 0;
      createMutation.mutate({ 
        title, 
        description, 
        cover_image_url: coverImageUrl, 
        order_index: nextOrder,
        section_id: finalSectionId 
      });
    }
  }

  function handleSectionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingSection) {
      updateSectionMutation.mutate({ id: editingSection.id, title: sectionTitle });
    } else {
      const nextOrder = sections ? sections.length : 0;
      createSectionMutation.mutate({ title: sectionTitle, order_index: nextOrder });
    }
  }

  function getSectionName(sectionId: string | null): string {
    if (!sectionId) return "Sem seção";
    const section = sections?.find((s) => s.id === sectionId);
    return section?.title || "Sem seção";
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Módulos</h1>
              <p className="text-muted-foreground">Crie e organize os módulos do curso</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Section Dialog */}
            <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => { setEditingSection(null); setSectionTitle(""); }}>
                  <Layers className="mr-2 h-4 w-4" />
                  Nova Seção
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingSection ? "Editar Seção" : "Nova Seção"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSectionSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sectionTitle">Título da Seção</Label>
                    <Input
                      id="sectionTitle"
                      value={sectionTitle}
                      onChange={(e) => setSectionTitle(e.target.value)}
                      placeholder="Ex: Cursos - Fundamentos"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetSectionForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createSectionMutation.isPending || updateSectionMutation.isPending}>
                      {editingSection ? "Salvar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Module Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingModule(null); setTitle(""); setDescription(""); setCoverImageUrl(null); setSectionId(""); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Módulo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingModule ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Módulo 1 - Introdução ao n8n"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrição do módulo (opcional)"
                    />
                  </div>

                  {/* Section Select */}
                  <div className="space-y-2">
                    <Label>Seção</Label>
                    <Select value={sectionId || "none"} onValueChange={(val) => setSectionId(val === "none" ? "" : val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sem seção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem seção</SelectItem>
                        {sections?.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Cover Image Upload */}
                  <div className="space-y-2">
                    <Label>Imagem de Capa</Label>
                    {coverImageUrl ? (
                      <div className="relative">
                        <img
                          src={getOptimizedImageUrl(coverImageUrl, { width: 400 }) || coverImageUrl}
                          alt="Capa do módulo"
                          className="w-full h-40 object-cover rounded-lg border"
                          loading="lazy"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => setCoverImageUrl(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {isUploading ? (
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                          ) : (
                            <>
                              <Image className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Clique para enviar uma imagem
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {ALLOWED_IMAGE_EXTENSIONS.join(", ").toUpperCase()} (máx. 10MB)
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept={ALLOWED_IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(",")}
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading}>
                      {editingModule ? "Salvar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Sections List */}
        {sections && sections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Seções ({sections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="font-medium">{section.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {modules?.filter((m) => m.section_id === section.id).length || 0} módulos
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSection(section)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta seção? Os módulos não serão excluídos, apenas desvinculados.")) {
                            deleteSectionMutation.mutate(section.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modules List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Módulos ({modules?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : modules && modules.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((module, index) => (
                  <Card key={module.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      {module.cover_image_url ? (
                        <img
                          src={module.cover_image_url}
                          alt={module.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
                          <Image className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-xs font-medium">
                        Módulo {index + 1}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{module.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {module.description || "Sem descrição"}
                      </p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getSectionName(module.section_id)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(module)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este módulo? Todas as aulas serão excluídas também.")) {
                              deleteMutation.mutate(module.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum módulo criado ainda. Clique em "Novo Módulo" para começar.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Link to="/admin/lessons">
            <Button variant="outline">
              Gerenciar Aulas →
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
