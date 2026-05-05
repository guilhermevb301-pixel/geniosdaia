import { useState, useEffect } from "react";
import { Copy, Video, Image, Bot, Wand2, ChevronLeft, ChevronRight, Download, Lock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

interface PromptVariation {
  id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  order_index: number;
}

interface Prompt {
  id: string;
  category: 'video' | 'image' | 'agent' | 'modifier';
  title: string;
  content: string;
  description: string | null;
  tags: string[];
  thumbnail_url: string | null;
  thumbnail_focus: string | null;
  example_images: string[] | null;
  example_video_url: string | null;
  is_locked: boolean;
  variations?: PromptVariation[];
}

interface PromptCardProps {
  prompt: Prompt;
  priority?: boolean;
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const categoryConfig = {
  video: { icon: Video, label: "Vídeo", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  image: { icon: Image, label: "Imagem", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  agent: { icon: Bot, label: "Agente", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  modifier: { icon: Wand2, label: "Modificador", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
};

export function PromptCard({ prompt, priority = false, canManage, onEdit, onDelete }: PromptCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0);

  const config = categoryConfig[prompt.category] || categoryConfig.image;
  const Icon = config.icon;

  const variations = (prompt.variations || []).sort((a, b) => a.order_index - b.order_index);

  const thumbnailSrc =
    prompt.thumbnail_url ||
    prompt.example_images?.[0] ||
    variations[0]?.image_url ||
    null;
  const hasVariations = variations.length > 0;
  const currentVariation = variations[currentVariationIndex];
  const isVideoCategory = prompt.category === 'video';

  useEffect(() => {
    if (isModalOpen) setCurrentVariationIndex(0);
  }, [isModalOpen]);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Prompt copiado!");
    } catch {
      toast.error("Erro ao copiar prompt");
    }
  };

  const handleDownloadVideo = async (url: string) => {
    try {
      toast.info("Iniciando download...");
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.split('/').pop() || 'video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Download concluído!");
    } catch {
      toast.error("Erro ao baixar vídeo");
    }
  };

  return (
    <>
      {/* ── Card ──────────────────────────────────────── */}
      <div
        className="group relative cursor-pointer rounded-xl overflow-hidden border border-border bg-card hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Thumbnail — portrait 3:4 */}
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {thumbnailSrc ? (
            <ImageWithSkeleton
              src={thumbnailSrc}
              alt={prompt.title}
              className="transition-transform duration-300 group-hover:scale-105"
              containerClassName="w-full h-full"
              objectPosition={prompt.thumbnail_focus || 'center'}
              fallbackIcon={<Icon className="h-10 w-10 text-muted-foreground/30" />}
              optimizedWidth={400}
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Icon className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}

          {/* Lock overlay */}
          {prompt.is_locked && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
              <div className="bg-white/10 rounded-full p-3">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-xs font-semibold tracking-wide px-3 text-center">
                Conteúdo Restrito
              </span>
            </div>
          )}

          {/* Category badge — top-left */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${config.color}`}>
              <Icon className="h-2.5 w-2.5" />
              {config.label}
            </span>
          </div>

          {/* Admin controls — top-right on hover */}
          {canManage && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="h-7 w-7 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background"
                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                className="h-7 w-7 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-destructive/20"
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          )}
        </div>

        {/* Title row */}
        <div className="p-3">
          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
            {prompt.title}
          </p>
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {prompt.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ──────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base">{prompt.title}</DialogTitle>
                {prompt.is_locked && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-400 mt-0.5">
                    <Lock className="h-3 w-3" />
                    Conteúdo restrito
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>

          {prompt.description && (
            <p className="text-muted-foreground text-sm">{prompt.description}</p>
          )}

          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Locked state */}
          {prompt.is_locked ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Lock className="h-8 w-8 text-amber-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-foreground">Conteúdo Restrito</p>
                <p className="text-sm text-muted-foreground">
                  Este prompt está disponível apenas para membros com acesso especial.
                </p>
              </div>
              {/* Blurred preview */}
              <div
                className="w-full bg-muted rounded-lg p-4 select-none pointer-events-none"
                style={{ filter: "blur(5px)" }}
                aria-hidden
              >
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap line-clamp-4">
                  Ultra-realistic professional portrait photography, cinematic
                  lighting setup, shallow depth of field, Sony A7R IV, 85mm f/1.4,
                  natural skin texture, bokeh background, golden hour...
                </pre>
              </div>
            </div>
          ) : hasVariations ? (
            /* Variations */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <Button variant="ghost" size="icon" onClick={() => setCurrentVariationIndex(v => Math.max(0, v - 1))} disabled={currentVariationIndex === 0} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Prompt {currentVariationIndex + 1} de {variations.length}
                </span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentVariationIndex(v => Math.min(variations.length - 1, v + 1))} disabled={currentVariationIndex === variations.length - 1} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {currentVariation && (
                <div className="space-y-4">
                  {isVideoCategory && currentVariation.video_url && (
                    <div className="space-y-2">
                      <video src={currentVariation.video_url} controls className="w-full rounded-lg" />
                      <Button variant="outline" size="sm" onClick={() => handleDownloadVideo(currentVariation.video_url!)} className="w-full">
                        <Download className="h-4 w-4 mr-2" />Baixar vídeo
                      </Button>
                    </div>
                  )}
                  {!isVideoCategory && currentVariation.image_url && (
                    <img
                      src={getOptimizedImageUrl(currentVariation.image_url, { width: 800 }) || currentVariation.image_url}
                      alt={`Resultado ${currentVariationIndex + 1}`}
                      className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      loading="lazy"
                      onClick={() => setSelectedImage(currentVariation.image_url)}
                    />
                  )}
                  <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">{currentVariation.content}</pre>
                  </div>
                  <Button onClick={() => handleCopy(currentVariation.content)} className="w-full">
                    <Copy className="h-4 w-4 mr-2" />Copiar Prompt {currentVariationIndex + 1}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Simple prompt (no variations) */
            <div className="space-y-4">
              {prompt.thumbnail_url && (
                <img
                  src={getOptimizedImageUrl(prompt.thumbnail_url, { width: 800 }) || prompt.thumbnail_url}
                  alt={prompt.title}
                  className="w-full rounded-lg"
                  loading="lazy"
                />
              )}
              <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">{prompt.content}</pre>
              </div>
              {prompt.example_images && prompt.example_images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Exemplos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {prompt.example_images.map((img, i) => (
                      <img
                        key={i}
                        src={getOptimizedImageUrl(img, { width: 400 }) || img}
                        alt={`Exemplo ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        loading="lazy"
                        onClick={() => setSelectedImage(img)}
                      />
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={() => handleCopy(prompt.content)} className="w-full">
                <Copy className="h-4 w-4 mr-2" />Copiar Prompt
              </Button>
            </div>
          )}

          {prompt.example_video_url && (
            <div className="space-y-3 border-t pt-4 mt-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" />Vídeo de exemplo
              </p>
              <video src={prompt.example_video_url} controls className="w-full rounded-lg" />
              <Button variant="outline" size="sm" onClick={() => handleDownloadVideo(prompt.example_video_url!)} className="w-full">
                <Download className="h-4 w-4 mr-2" />Baixar vídeo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen image */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-4 flex items-center justify-center">
          {selectedImage && (
            <img src={selectedImage} alt="Exemplo ampliado" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
