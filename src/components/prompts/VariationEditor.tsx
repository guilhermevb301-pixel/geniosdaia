import { useState, useRef } from "react";
import { Plus, X, Upload, GripVertical, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { validateImageFile, validateVideoFile } from "@/lib/fileValidation";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

type PromptCategory = "video" | "image" | "agent";

export interface Variation {
  id?: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  order_index: number;
  isNew?: boolean;
  imageFile?: File;
  imagePreview?: string;
  videoFile?: File;
  videoPreview?: string;
}

interface VariationEditorProps {
  variations: Variation[];
  onChange: (variations: Variation[]) => void;
  isUploading: boolean;
  category: PromptCategory;
}

export function VariationEditor({ variations, onChange, isUploading, category }: VariationEditorProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const videoInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isVideoCategory = category === 'video';

  const addVariation = () => {
    onChange([
      ...variations,
      {
        content: "",
        image_url: null,
        video_url: null,
        order_index: variations.length,
        isNew: true,
      },
    ]);
  };

  const removeVariation = (index: number) => {
    if (variations.length <= 1) {
      toast.error("É necessário ter pelo menos uma variação");
      return;
    }
    const updated = variations.filter((_, i) => i !== index);
    // Recalculate order_index
    onChange(updated.map((v, i) => ({ ...v, order_index: i })));
  };

  const updateVariation = (index: number, field: keyof Variation, value: string | File | null) => {
    const updated = [...variations];
    if (field === "imageFile" && value instanceof File) {
      updated[index] = {
        ...updated[index],
        imageFile: value,
        imagePreview: URL.createObjectURL(value),
      };
    } else if (field === "videoFile" && value instanceof File) {
      updated[index] = {
        ...updated[index],
        videoFile: value,
        videoPreview: URL.createObjectURL(value),
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange(updated);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Arquivo inválido");
        e.target.value = '';
        return;
      }
      updateVariation(index, "imageFile", file);
    }
  };

  const handleVideoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateVideoFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Arquivo inválido");
        e.target.value = '';
        return;
      }
      updateVariation(index, "videoFile", file);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...variations];
    updated[index] = {
      ...updated[index],
      image_url: null,
      imageFile: undefined,
      imagePreview: undefined,
    };
    onChange(updated);
  };

  const removeVideo = (index: number) => {
    const updated = [...variations];
    updated[index] = {
      ...updated[index],
      video_url: null,
      videoFile: undefined,
      videoPreview: undefined,
    };
    onChange(updated);
    if (videoInputRefs.current[index]) {
      videoInputRefs.current[index]!.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Variações do Prompt</Label>
        <span className="text-xs text-muted-foreground">{variations.length} variação(ões)</span>
      </div>

      <div className="space-y-4">
        {variations.map((variation, index) => {
          const imageToShow = variation.imagePreview || variation.image_url;
          const videoToShow = variation.videoPreview || variation.video_url;

          return (
            <div
              key={variation.id || `new-${index}`}
              className="border rounded-lg p-4 space-y-3 bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Variação {index + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeVariation(index)}
                  disabled={variations.length <= 1 || isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Prompt Content */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Texto do Prompt *</Label>
                <Textarea
                  value={variation.content}
                  onChange={(e) => updateVariation(index, "content", e.target.value)}
                  placeholder="Cole o texto do prompt aqui..."
                  rows={4}
                  disabled={isUploading}
                />
              </div>

              {/* Conditional Upload: Video for 'video' category, Image for others */}
              {isVideoCategory ? (
                /* Video Upload for video category */
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Vídeo do Resultado (MP4)</Label>
                  <input
                    ref={(el) => (videoInputRefs.current[index] = el)}
                    type="file"
                    accept="video/mp4"
                    onChange={(e) => handleVideoChange(index, e)}
                    className="hidden"
                  />

                  {videoToShow ? (
                    <div className="relative group">
                      <video
                        src={videoToShow}
                        controls
                        className="w-full max-h-48 rounded bg-background"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeVideo(index)}
                        disabled={isUploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => videoInputRefs.current[index]?.click()}
                      disabled={isUploading}
                      className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
                    >
                      <Video className="h-6 w-6 mb-2" />
                      <span className="text-sm">Adicionar vídeo MP4</span>
                      <span className="text-xs mt-1">Máximo 100MB</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Image Upload for image/agent categories */
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Imagem do Resultado</Label>
                  <input
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e)}
                    className="hidden"
                  />

                  {imageToShow ? (
                    <div className="relative group">
                      <img
                        src={getOptimizedImageUrl(imageToShow, { width: 400 }) || imageToShow}
                        alt={`Variação ${index + 1}`}
                        className="w-full max-h-48 object-contain rounded bg-background"
                        loading="lazy"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        disabled={isUploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      disabled={isUploading}
                      className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
                    >
                      <Upload className="h-6 w-6 mb-2" />
                      <span className="text-sm">Adicionar imagem</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addVariation}
        disabled={isUploading}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Variação
      </Button>
    </div>
  );
}
