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
import { Plus, Edit, Trash2, ArrowLeft, Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { validateImageFile, ALLOWED_IMAGE_EXTENSIONS } from "@/lib/fileValidation";

interface Module {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  created_at: string;
}

export default function AdminModules() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const createMutation = useMutation({
    mutationFn: async (newModule: { title: string; description: string; cover_image_url: string | null; order_index: number }) => {
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
    mutationFn: async ({ id, title, description, cover_image_url }: { id: string; title: string; description: string; cover_image_url: string | null }) => {
      const { data, error } = await supabase
        .from("modules")
        .update({ title, description, cover_image_url })
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
  }

  function handleEdit(module: Module) {
    setEditingModule(module);
    setTitle(module.title);
    setDescription(module.description || "");
    setCoverImageUrl(module.cover_image_url);
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingModule) {
      updateMutation.mutate({ id: editingModule.id, title, description, cover_image_url: coverImageUrl });
    } else {
      const nextOrder = modules ? modules.length : 0;
      createMutation.mutate({ title, description, cover_image_url: coverImageUrl, order_index: nextOrder });
    }
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingModule(null); setTitle(""); setDescription(""); setCoverImageUrl(null); }}>
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
                
                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <Label>Imagem de Capa</Label>
                  {coverImageUrl ? (
                    <div className="relative">
                      <img
                        src={coverImageUrl}
                        alt="Capa do módulo"
                        className="w-full h-40 object-cover rounded-lg border"
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

        <Card>
          <CardHeader>
            <CardTitle>Módulos ({modules?.length || 0})</CardTitle>
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
