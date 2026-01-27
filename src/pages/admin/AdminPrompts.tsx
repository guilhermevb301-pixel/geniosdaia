import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Video, Image, Bot, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PromptCategory = "video" | "image" | "agent";

interface Prompt {
  id: string;
  category: PromptCategory;
  title: string;
  content: string;
  description: string | null;
  tags: string[];
  thumbnail_url: string | null;
  example_images: string[] | null;
  example_video_url: string | null;
  created_at: string;
}

const categoryIcons = {
  video: Video,
  image: Image,
  agent: Bot,
};

const categoryLabels = {
  video: "Vídeos",
  image: "Imagens",
  agent: "Agentes de IA",
};

export default function AdminPrompts() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PromptCategory>("video");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    category: "video" as PromptCategory,
    tags: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [exampleImageFiles, setExampleImageFiles] = useState<File[]>([]);
  const [exampleImagePreviews, setExampleImagePreviews] = useState<string[]>([]);
  const [existingExampleImages, setExistingExampleImages] = useState<string[]>([]);
  const [exampleVideoFile, setExampleVideoFile] = useState<File | null>(null);
  const [exampleVideoPreview, setExampleVideoPreview] = useState<string>("");

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const exampleImagesInputRef = useRef<HTMLInputElement>(null);
  const exampleVideoInputRef = useRef<HTMLInputElement>(null);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Prompt[];
    },
  });

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log("Uploading file:", fileName);
    const { error, data } = await supabase.storage.from("prompts").upload(fileName, file);
    
    if (error) {
      console.error("Upload error:", error);
      toast.error(`Erro no upload: ${error.message}`);
      throw error;
    }

    console.log("Upload success:", data);
    const { data: urlData } = supabase.storage.from("prompts").getPublicUrl(fileName);
    console.log("Public URL:", urlData.publicUrl);
    return urlData.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);

      let thumbnailUrl: string | null = null;
      let exampleImages: string[] = [];
      let videoUrl: string | null = null;

      // Upload thumbnail
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
      }

      // Upload example images
      for (const file of exampleImageFiles) {
        const url = await uploadFile(file, "examples");
        exampleImages.push(url);
      }

      // Upload example video
      if (exampleVideoFile) {
        videoUrl = await uploadFile(exampleVideoFile, "videos");
      }

      const { error } = await supabase.from("prompts").insert({
        title: formData.title,
        content: formData.content,
        description: formData.description || null,
        category: formData.category,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        thumbnail_url: thumbnailUrl,
        example_images: exampleImages.length > 0 ? exampleImages : null,
        example_video_url: videoUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt criado com sucesso!");
      closeDialog();
    },
    onError: () => toast.error("Erro ao criar prompt"),
    onSettled: () => setIsUploading(false),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingPrompt) return;
      setIsUploading(true);

      let thumbnailUrl = editingPrompt.thumbnail_url;
      let exampleImages = [...existingExampleImages];
      let videoUrl = editingPrompt.example_video_url;

      // Upload new thumbnail if provided
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
      }

      // Upload new example images
      for (const file of exampleImageFiles) {
        const url = await uploadFile(file, "examples");
        exampleImages.push(url);
      }

      // Upload new example video if provided
      if (exampleVideoFile) {
        videoUrl = await uploadFile(exampleVideoFile, "videos");
      }

      const { error } = await supabase
        .from("prompts")
        .update({
          title: formData.title,
          content: formData.content,
          description: formData.description || null,
          category: formData.category,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          thumbnail_url: thumbnailUrl,
          example_images: exampleImages.length > 0 ? exampleImages : null,
          example_video_url: videoUrl,
        })
        .eq("id", editingPrompt.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt atualizado com sucesso!");
      closeDialog();
    },
    onError: () => toast.error("Erro ao atualizar prompt"),
    onSettled: () => setIsUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prompts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt excluído com sucesso!");
      setDeleteId(null);
    },
    onError: () => toast.error("Erro ao excluir prompt"),
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleExampleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingExampleImages.length + exampleImageFiles.length + files.length;
    
    if (totalImages > 6) {
      toast.error("Máximo de 6 imagens de exemplo");
      return;
    }

    setExampleImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setExampleImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeExampleImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingExampleImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setExampleImageFiles((prev) => prev.filter((_, i) => i !== index));
      setExampleImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleExampleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExampleVideoFile(file);
      setExampleVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeExampleVideo = () => {
    setExampleVideoFile(null);
    setExampleVideoPreview("");
  };

  const openNewDialog = () => {
    setEditingPrompt(null);
    setFormData({
      title: "",
      content: "",
      description: "",
      category: activeTab,
      tags: "",
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setExampleImageFiles([]);
    setExampleImagePreviews([]);
    setExistingExampleImages([]);
    setExampleVideoFile(null);
    setExampleVideoPreview("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      title: prompt.title,
      content: prompt.content,
      description: prompt.description || "",
      category: prompt.category,
      tags: prompt.tags?.join(", ") || "",
    });
    setThumbnailFile(null);
    setThumbnailPreview(prompt.thumbnail_url || "");
    setExampleImageFiles([]);
    setExampleImagePreviews([]);
    setExistingExampleImages(prompt.example_images || []);
    setExampleVideoFile(null);
    setExampleVideoPreview(prompt.example_video_url || "");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPrompt(null);
    setThumbnailFile(null);
    setThumbnailPreview("");
    setExampleImageFiles([]);
    setExampleImagePreviews([]);
    setExistingExampleImages([]);
    setExampleVideoFile(null);
    setExampleVideoPreview("");
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast.error("Preencha título e conteúdo");
      return;
    }
    if (editingPrompt) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const filteredPrompts = prompts?.filter((p) => p.category === activeTab);

  const tabItems = [
    { value: "video" as PromptCategory, label: "Vídeos", icon: Video },
    { value: "image" as PromptCategory, label: "Imagens", icon: Image },
    { value: "agent" as PromptCategory, label: "Agentes de IA", icon: Bot },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar Prompts</h1>
            <p className="text-muted-foreground mt-1">Crie e gerencie prompts do banco</p>
          </div>
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Prompt
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PromptCategory)}>
          <TabsList>
            {tabItems.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabItems.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : filteredPrompts && filteredPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPrompts.map((prompt) => {
                    const Icon = categoryIcons[prompt.category];
                    return (
                      <Card key={prompt.id} className="overflow-hidden">
                        {/* Thumbnail preview */}
                        <div className="aspect-video bg-muted relative">
                          {prompt.thumbnail_url ? (
                            <img
                              src={prompt.thumbnail_url}
                              alt={prompt.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon className="h-10 w-10 text-muted-foreground/40" />
                            </div>
                          )}
                          {/* Actions overlay */}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(prompt)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeleteId(prompt.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base line-clamp-2">{prompt.title}</CardTitle>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <tab.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum prompt de {categoryLabels[tab.value].toLowerCase()}</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? "Editar Prompt" : "Novo Prompt"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as PromptCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeos</SelectItem>
                  <SelectItem value="image">Imagens</SelectItem>
                  <SelectItem value="agent">Agentes de IA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
              >
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full aspect-video object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setThumbnailFile(null);
                        setThumbnailPreview("");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Upload className="h-8 w-8 mb-2" />
                    <p className="text-sm">Clique para adicionar imagem de capa</p>
                  </div>
                )}
              </div>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nome do prompt"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descrição"
              />
            </div>

            {/* Conteúdo */}
            <div className="space-y-2">
              <Label>Conteúdo do Prompt *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Cole o prompt aqui..."
                rows={6}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="marketing, storytelling, viral"
              />
            </div>

            {/* Separator */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-4">Exemplos (opcional)</h4>

              {/* Example Images */}
              <div className="space-y-2">
                <Label>Imagens de Exemplo (máx. 6)</Label>
                <input
                  ref={exampleImagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleExampleImagesChange}
                  className="hidden"
                />
                <div className="grid grid-cols-4 gap-2">
                  {/* Existing images */}
                  {existingExampleImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={url}
                        alt={`Exemplo ${index + 1}`}
                        className="w-full aspect-square object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExampleImage(index, true)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {/* New images */}
                  {exampleImagePreviews.map((url, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={url}
                        alt={`Novo exemplo ${index + 1}`}
                        className="w-full aspect-square object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExampleImage(index, false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {/* Add button */}
                  {existingExampleImages.length + exampleImageFiles.length < 6 && (
                    <button
                      type="button"
                      onClick={() => exampleImagesInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed rounded flex items-center justify-center hover:border-primary/50 transition-colors"
                    >
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Example Video Upload */}
              <div className="space-y-2 mt-4">
                <Label>Vídeo de Exemplo</Label>
                <input
                  ref={exampleVideoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleExampleVideoChange}
                  className="hidden"
                />
                <div
                  onClick={() => !exampleVideoPreview && exampleVideoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    !exampleVideoPreview ? "cursor-pointer hover:border-primary/50" : ""
                  }`}
                >
                  {exampleVideoPreview ? (
                    <div className="relative">
                      <video
                        src={exampleVideoPreview}
                        controls
                        className="w-full rounded max-h-48"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExampleVideo();
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                      <Video className="h-8 w-8 mb-2" />
                      <p className="text-sm">Clique para adicionar vídeo</p>
                      <p className="text-xs mt-1">MP4, WebM ou MOV</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || isUploading}
            >
              {isUploading ? "Enviando..." : editingPrompt ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir prompt?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
