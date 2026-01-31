import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Video, Image, Bot, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FocalPointSelector } from "@/components/prompts/FocalPointSelector";
import { VariationEditor, Variation } from "@/components/prompts/VariationEditor";
import { validateImageFile, validateVideoFile, ALLOWED_IMAGE_EXTENSIONS, MAX_VIDEO_SIZE } from "@/lib/fileValidation";

type PromptCategory = "video" | "image" | "agent";

interface PromptVariation {
  id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  order_index: number;
}

interface Prompt {
  id: string;
  category: PromptCategory;
  title: string;
  content: string;
  description: string | null;
  tags: string[];
  thumbnail_url: string | null;
  thumbnail_focus: string | null;
  example_images: string[] | null;
  example_video_url: string | null;
  created_at: string;
  variations?: PromptVariation[];
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
    description: "",
    category: "video" as PromptCategory,
    tags: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [thumbnailFocus, setThumbnailFocus] = useState<string>("center");
  const [variations, setVariations] = useState<Variation[]>([
    { content: "", image_url: null, video_url: null, order_index: 0, isNew: true },
  ]);
  
  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["admin-prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select(`
          *,
          variations:prompt_variations(
            id, content, image_url, video_url, order_index
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Prompt[];
    },
  });

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Arquivo inválido");
      throw new Error(validation.error);
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage.from("prompts").upload(fileName, file);
    
    if (error) {
      console.error("Upload error:", error);
      toast.error(`Erro no upload: ${error.message}`);
      throw error;
    }

    const { data: urlData } = supabase.storage.from("prompts").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const uploadVideoFile = async (file: File): Promise<string> => {
    // Validate video file before upload
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Arquivo inválido");
      throw new Error(validation.error);
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage.from("prompts").upload(fileName, file);
    
    if (error) {
      console.error("Video upload error:", error);
      toast.error(`Erro no upload do vídeo: ${error.message}`);
      throw error;
    }

    const { data: urlData } = supabase.storage.from("prompts").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);

      let thumbnailUrl: string | null = null;
      let exampleVideoUrl: string | null = null;

      // Upload thumbnail
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
      }

      // Upload video file or use external URL
      if (videoFile) {
        setIsUploadingVideo(true);
        exampleVideoUrl = await uploadVideoFile(videoFile);
        setIsUploadingVideo(false);
      } else if (videoUrl) {
        exampleVideoUrl = videoUrl;
      }

      // Create prompt first
      const { data: promptData, error: promptError } = await supabase
        .from("prompts")
        .insert({
          title: formData.title,
          content: variations[0]?.content || "", // Use first variation as main content for backwards compatibility
          description: formData.description || null,
          category: formData.category,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          thumbnail_url: thumbnailUrl,
          thumbnail_focus: thumbnailFocus,
          example_video_url: exampleVideoUrl,
        })
        .select()
        .single();

      if (promptError) throw promptError;

      // Upload variation media and create variations
      for (const variation of variations) {
        let imageUrl = variation.image_url;
        let videoUrl = variation.video_url;
        
        if (variation.imageFile) {
          imageUrl = await uploadFile(variation.imageFile, "variations");
        }
        
        if (variation.videoFile) {
          videoUrl = await uploadVideoFile(variation.videoFile);
        }

        const { error: variationError } = await supabase
          .from("prompt_variations")
          .insert({
            prompt_id: promptData.id,
            content: variation.content,
            image_url: imageUrl,
            video_url: videoUrl,
            order_index: variation.order_index,
          });

        if (variationError) throw variationError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt criado com sucesso!");
      closeDialog();
    },
    onError: (error: Error) => toast.error(error.message || "Erro ao criar prompt"),
    onSettled: () => setIsUploading(false),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingPrompt) return;
      setIsUploading(true);

      let thumbnailUrl = editingPrompt.thumbnail_url;
      let exampleVideoUrl = editingPrompt.example_video_url;

      // Upload new thumbnail if provided
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
      }

      // Upload video file or use external URL
      if (videoFile) {
        setIsUploadingVideo(true);
        exampleVideoUrl = await uploadVideoFile(videoFile);
        setIsUploadingVideo(false);
      } else if (videoUrl !== editingPrompt.example_video_url) {
        exampleVideoUrl = videoUrl || null;
      }

      // Update prompt
      const { error: promptError } = await supabase
        .from("prompts")
        .update({
          title: formData.title,
          content: variations[0]?.content || "",
          description: formData.description || null,
          category: formData.category,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          thumbnail_url: thumbnailUrl,
          thumbnail_focus: thumbnailFocus,
          example_video_url: exampleVideoUrl,
        })
        .eq("id", editingPrompt.id);

      if (promptError) throw promptError;

      // Delete existing variations
      await supabase
        .from("prompt_variations")
        .delete()
        .eq("prompt_id", editingPrompt.id);

      // Create new variations
      for (const variation of variations) {
        let imageUrl = variation.image_url;
        let videoUrl = variation.video_url;
        
        if (variation.imageFile) {
          imageUrl = await uploadFile(variation.imageFile, "variations");
        }
        
        if (variation.videoFile) {
          videoUrl = await uploadVideoFile(variation.videoFile);
        }

        const { error: variationError } = await supabase
          .from("prompt_variations")
          .insert({
            prompt_id: editingPrompt.id,
            content: variation.content,
            image_url: imageUrl,
            video_url: videoUrl,
            order_index: variation.order_index,
          });

        if (variationError) throw variationError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt atualizado com sucesso!");
      closeDialog();
    },
    onError: (error: Error) => toast.error(error.message || "Erro ao atualizar prompt"),
    onSettled: () => setIsUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prompts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt excluído com sucesso!");
      setDeleteId(null);
    },
    onError: () => toast.error("Erro ao excluir prompt"),
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file before setting
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Arquivo inválido");
        e.target.value = ''; // Reset input
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const openNewDialog = () => {
    setEditingPrompt(null);
    setFormData({
      title: "",
      description: "",
      category: activeTab,
      tags: "",
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setThumbnailFocus("center");
    setVariations([{ content: "", image_url: null, video_url: null, order_index: 0, isNew: true }]);
    setVideoFile(null);
    setVideoPreview("");
    setVideoUrl("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      title: prompt.title,
      description: prompt.description || "",
      category: prompt.category,
      tags: prompt.tags?.join(", ") || "",
    });
    setThumbnailFile(null);
    setThumbnailPreview(prompt.thumbnail_url || "");
    setThumbnailFocus(prompt.thumbnail_focus || "center");
    setVideoFile(null);
    setVideoPreview(prompt.example_video_url || "");
    setVideoUrl(prompt.example_video_url || "");
    
    // Load existing variations or create one from legacy content
    if (prompt.variations && prompt.variations.length > 0) {
      setVariations(
        prompt.variations
          .sort((a, b) => a.order_index - b.order_index)
          .map((v) => ({
            id: v.id,
            content: v.content,
            image_url: v.image_url,
            video_url: v.video_url,
            order_index: v.order_index,
          }))
      );
    } else {
      // Fallback for prompts without variations
      setVariations([
        {
          content: prompt.content,
          image_url: null,
          video_url: null,
          order_index: 0,
          isNew: true,
        },
      ]);
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPrompt(null);
    setThumbnailFile(null);
    setThumbnailPreview("");
    setThumbnailFocus("center");
    setVariations([{ content: "", image_url: null, video_url: null, order_index: 0, isNew: true }]);
    setVideoFile(null);
    setVideoPreview("");
    setVideoUrl("");
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateVideoFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Arquivo inválido");
        e.target.value = '';
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setVideoUrl(""); // Clear external URL when file is selected
    }
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
    setVideoUrl("");
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error("Preencha o título");
      return;
    }
    if (!variations.some((v) => v.content.trim())) {
      toast.error("Adicione pelo menos uma variação com conteúdo");
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
                    const variationCount = prompt.variations?.length || 0;
                    return (
                      <Card key={prompt.id} className="overflow-hidden">
                        {/* Thumbnail preview with focal point */}
                        <div className="aspect-video bg-muted relative">
                          {prompt.thumbnail_url ? (
                            <img
                              src={prompt.thumbnail_url}
                              alt={prompt.title}
                              className="w-full h-full object-cover"
                              style={{ objectPosition: prompt.thumbnail_focus || 'center' }}
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
                          {/* Variation count badge */}
                          {variationCount > 0 && (
                            <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                              {variationCount} variação(ões)
                            </div>
                          )}
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
                      style={{ objectPosition: thumbnailFocus }}
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

              {/* Focal Point Selector with Drag */}
              {thumbnailPreview && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Ponto Focal</Label>
                  <FocalPointSelector
                    imageUrl={thumbnailPreview}
                    value={thumbnailFocus}
                    onChange={setThumbnailFocus}
                  />
                </div>
              )}
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

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="marketing, storytelling, viral"
              />
            </div>

            {/* Video Upload Section */}
            <div className="space-y-2">
              <Label>Vídeo de Exemplo</Label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4"
                onChange={handleVideoChange}
                className="hidden"
              />
              
              {videoPreview ? (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full aspect-video"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearVideo();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {videoFile && (
                    <p className="text-xs text-muted-foreground">
                      Arquivo: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)}MB)
                    </p>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                    <Video className="h-8 w-8 mb-2" />
                    <p className="text-sm">Clique para adicionar vídeo MP4</p>
                    <p className="text-xs text-muted-foreground mt-1">Máximo 100MB</p>
                  </div>
                </div>
              )}

              {/* External URL fallback */}
              {!videoFile && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">ou cole uma URL externa</Label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      if (e.target.value) {
                        setVideoPreview(e.target.value);
                      } else {
                        setVideoPreview("");
                      }
                    }}
                    placeholder="https://exemplo.com/video.mp4"
                  />
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="border-t pt-4">
              <VariationEditor
                variations={variations}
                onChange={setVariations}
                isUploading={isUploading || isUploadingVideo}
                category={formData.category}
              />
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
