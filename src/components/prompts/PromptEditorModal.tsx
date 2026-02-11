import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { FocalPointSelector } from "@/components/prompts/FocalPointSelector";
import { VariationEditor, Variation } from "@/components/prompts/VariationEditor";
import { validateImageFile, validateVideoFile } from "@/lib/fileValidation";

export type PromptCategory = "video" | "image" | "modifier";

export interface PromptData {
  id: string;
  category: PromptCategory;
  title: string;
  content: string;
  description: string | null;
  tags: string[];
  thumbnail_url: string | null;
  thumbnail_focus: string | null;
  example_video_url: string | null;
  variations?: {
    id: string;
    content: string;
    image_url: string | null;
    video_url: string | null;
    order_index: number;
  }[];
}

interface PromptEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPrompt: PromptData | null;
  defaultCategory?: PromptCategory;
}

export function PromptEditorModal({
  open,
  onOpenChange,
  editingPrompt,
  defaultCategory = "image",
}: PromptEditorModalProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: editingPrompt?.title || "",
    description: editingPrompt?.description || "",
    category: editingPrompt?.category || defaultCategory,
    tags: editingPrompt?.tags?.join(", ") || "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(editingPrompt?.thumbnail_url || "");
  const [thumbnailFocus, setThumbnailFocus] = useState<string>(editingPrompt?.thumbnail_focus || "center");
  const [variations, setVariations] = useState<Variation[]>(() => {
    if (editingPrompt?.variations && editingPrompt.variations.length > 0) {
      return editingPrompt.variations
        .sort((a, b) => a.order_index - b.order_index)
        .map((v) => ({
          id: v.id,
          content: v.content,
          image_url: v.image_url,
          video_url: v.video_url,
          order_index: v.order_index,
        }));
    }
    if (editingPrompt?.content) {
      return [{ content: editingPrompt.content, image_url: null, video_url: null, order_index: 0, isNew: true }];
    }
    return [{ content: "", image_url: null, video_url: null, order_index: 0, isNew: true }];
  });

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>(editingPrompt?.example_video_url || "");
  const [videoUrl, setVideoUrl] = useState<string>(editingPrompt?.example_video_url || "");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when editingPrompt changes or modal opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, editingPrompt]);

  // Reset form when modal opens with new data
  const resetForm = () => {
    setFormData({
      title: editingPrompt?.title || "",
      description: editingPrompt?.description || "",
      category: editingPrompt?.category || defaultCategory,
      tags: editingPrompt?.tags?.join(", ") || "",
    });
    setThumbnailFile(null);
    setThumbnailPreview(editingPrompt?.thumbnail_url || "");
    setThumbnailFocus(editingPrompt?.thumbnail_focus || "center");
    setVideoFile(null);
    setVideoPreview(editingPrompt?.example_video_url || "");
    setVideoUrl(editingPrompt?.example_video_url || "");
    
    if (editingPrompt?.variations && editingPrompt.variations.length > 0) {
      setVariations(
        editingPrompt.variations
          .sort((a, b) => a.order_index - b.order_index)
          .map((v) => ({
            id: v.id,
            content: v.content,
            image_url: v.image_url,
            video_url: v.video_url,
            order_index: v.order_index,
          }))
      );
    } else if (editingPrompt?.content) {
      setVariations([{ content: editingPrompt.content, image_url: null, video_url: null, order_index: 0, isNew: true }]);
    } else {
      setVariations([{ content: "", image_url: null, video_url: null, order_index: 0, isNew: true }]);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Arquivo inválido");
      throw new Error(validation.error);
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage.from("prompts").upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = supabase.storage.from("prompts").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const uploadVideoFile = async (file: File): Promise<string> => {
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Arquivo inválido");
      throw new Error(validation.error);
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage.from("prompts").upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = supabase.storage.from("prompts").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);

      let thumbnailUrl: string | null = null;
      let exampleVideoUrl: string | null = null;

      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
      }

      if (videoFile) {
        setIsUploadingVideo(true);
        exampleVideoUrl = await uploadVideoFile(videoFile);
        setIsUploadingVideo(false);
      } else if (videoUrl) {
        exampleVideoUrl = videoUrl;
      }

      const { data: promptData, error: promptError } = await supabase
        .from("prompts")
        .insert({
          title: formData.title,
          content: variations[0]?.content || "",
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

      for (const variation of variations) {
        let imageUrl = variation.image_url;
        let videoUrlVar = variation.video_url;

        if (variation.imageFile) {
          imageUrl = await uploadFile(variation.imageFile, "variations");
        }
        if (variation.videoFile) {
          videoUrlVar = await uploadVideoFile(variation.videoFile);
        }

        const { error: variationError } = await supabase
          .from("prompt_variations")
          .insert({
            prompt_id: promptData.id,
            content: variation.content,
            image_url: imageUrl,
            video_url: videoUrlVar,
            order_index: variation.order_index,
          });

        if (variationError) throw variationError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt criado com sucesso!");
      onOpenChange(false);
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

      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
      }

      if (videoFile) {
        setIsUploadingVideo(true);
        exampleVideoUrl = await uploadVideoFile(videoFile);
        setIsUploadingVideo(false);
      } else if (videoUrl !== editingPrompt.example_video_url) {
        exampleVideoUrl = videoUrl || null;
      }

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

      await supabase.from("prompt_variations").delete().eq("prompt_id", editingPrompt.id);

      for (const variation of variations) {
        let imageUrl = variation.image_url;
        let videoUrlVar = variation.video_url;

        if (variation.imageFile) {
          imageUrl = await uploadFile(variation.imageFile, "variations");
        }
        if (variation.videoFile) {
          videoUrlVar = await uploadVideoFile(variation.videoFile);
        }

        const { error: variationError } = await supabase
          .from("prompt_variations")
          .insert({
            prompt_id: editingPrompt.id,
            content: variation.content,
            image_url: imageUrl,
            video_url: videoUrlVar,
            order_index: variation.order_index,
          });

        if (variationError) throw variationError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt atualizado com sucesso!");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message || "Erro ao atualizar prompt"),
    onSettled: () => setIsUploading(false),
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Arquivo inválido");
        e.target.value = "";
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateVideoFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Arquivo inválido");
        e.target.value = "";
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setVideoUrl("");
    }
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
    setVideoUrl("");
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
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
                <SelectItem value="modifier">Modificador de Imagens</SelectItem>
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
                  <video src={videoPreview} controls className="w-full aspect-video" />
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
  );
}

interface DeletePromptDialogProps {
  promptId: string | null;
  onClose: () => void;
}

export function DeletePromptDialog({ promptId, onClose }: DeletePromptDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prompts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt excluído com sucesso!");
      onClose();
    },
    onError: () => toast.error("Erro ao excluir prompt"),
  });

  return (
    <AlertDialog open={!!promptId} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir prompt?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => promptId && deleteMutation.mutate(promptId)}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
