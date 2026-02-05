import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Image, Video, X, Loader2, Upload } from "lucide-react";

interface CreateNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function CreateNoteModal({ open, onOpenChange, onSuccess }: CreateNoteModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return { valid: false, error: "Tipo de arquivo não suportado" };
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return { valid: false, error: "Imagem deve ter no máximo 10MB" };
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return { valid: false, error: "Vídeo deve ter no máximo 50MB" };
    }

    return { valid: true };
  };

  const uploadFile = async (file: File) => {
    if (!user) return null;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast({ title: validation.error, variant: "destructive" });
      return null;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("user-notes")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("user-notes")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Erro ao fazer upload", variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file);
    if (url) {
      setMediaUrls([...mediaUrls, url]);
    }
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;

    if (!title.trim() && !content.trim()) {
      toast({ title: "Adicione um título ou conteúdo", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("user_notes").insert({
        user_id: user.id,
        title: title.trim() || null,
        content: content.trim(),
        media_urls: mediaUrls,
        lesson_id: null,
        prompt_id: null,
      });

      if (error) throw error;

      toast({ title: "Nota criada com sucesso!" });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({ title: "Erro ao salvar nota", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setMediaUrls([]);
    onOpenChange(false);
  };

  const isMediaImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Nota</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-title">Título</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ideias para projeto..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Conteúdo</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva suas anotações aqui..."
              rows={6}
            />
          </div>

          {/* Media Upload Buttons */}
          <div className="space-y-2">
            <Label>Mídia</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
              >
                <Image className="h-4 w-4 mr-2" />
                Imagem
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploading}
              >
                <Video className="h-4 w-4 mr-2" />
                Vídeo
              </Button>
              {isUploading && (
                <span className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </span>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept={ACCEPTED_VIDEO_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Imagens até 10MB • Vídeos até 50MB
            </p>
          </div>

          {/* Media Preview */}
          {mediaUrls.length > 0 && (
            <div className="space-y-2">
              <Label>Arquivos anexados</Label>
              <div className="grid grid-cols-2 gap-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    {isMediaImage(url) ? (
                      <img
                        src={url}
                        alt={`Anexo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                    ) : (
                      <video
                        src={url}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeMedia(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Nota"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
