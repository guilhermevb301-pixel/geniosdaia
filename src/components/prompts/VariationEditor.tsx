import { useState, useRef } from "react";
import { Plus, X, Upload, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateImageFile } from "@/lib/fileValidation";

export interface Variation {
  id?: string;
  content: string;
  image_url: string | null;
  order_index: number;
  isNew?: boolean;
  imageFile?: File;
  imagePreview?: string;
}

interface VariationEditorProps {
  variations: Variation[];
  onChange: (variations: Variation[]) => void;
  isUploading: boolean;
}

export function VariationEditor({ variations, onChange, isUploading }: VariationEditorProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addVariation = () => {
    onChange([
      ...variations,
      {
        content: "",
        image_url: null,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Variações do Prompt</Label>
        <span className="text-xs text-muted-foreground">{variations.length} variação(ões)</span>
      </div>

      <div className="space-y-4">
        {variations.map((variation, index) => {
          const imageToShow = variation.imagePreview || variation.image_url;

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

              {/* Image Upload */}
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
                      src={imageToShow}
                      alt={`Variação ${index + 1}`}
                      className="w-full max-h-48 object-contain rounded bg-background"
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
