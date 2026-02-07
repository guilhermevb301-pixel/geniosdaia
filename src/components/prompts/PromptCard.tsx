import { useState, useEffect } from "react";
import { Copy, Video, Image, Bot, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
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
  category: 'video' | 'image' | 'agent';
  title: string;
  content: string;
  description: string | null;
  tags: string[];
  thumbnail_url: string | null;
  thumbnail_focus: string | null;
  example_images: string[] | null;
  example_video_url: string | null;
  variations?: PromptVariation[];
}

interface PromptCardProps {
  prompt: Prompt;
  /** If true, images load eagerly (for above-the-fold cards) */
  priority?: boolean;
}

const categoryIcons = {
  video: Video,
  image: Image,
  agent: Bot,
};

export function PromptCard({ prompt, priority = false }: PromptCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0);
  const Icon = categoryIcons[prompt.category];

  // Sort variations by order_index
  const variations = (prompt.variations || []).sort((a, b) => a.order_index - b.order_index);
  const hasVariations = variations.length > 0;
  const currentVariation = variations[currentVariationIndex];
  const isVideoCategory = prompt.category === 'video';

  // Reset variation index when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setCurrentVariationIndex(0);
    }
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
      
      const filename = url.split('/').pop() || 'video.mp4';
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success("Download concluído!");
    } catch (error) {
      console.error("Erro ao baixar vídeo:", error);
      toast.error("Erro ao baixar vídeo");
    }
  };

  const goToPrevious = () => {
    setCurrentVariationIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentVariationIndex((prev) => Math.min(variations.length - 1, prev + 1));
  };

  return (
    <>
      {/* Card Clicável - Estilo Galeria */}
      <Card
        onClick={() => setIsModalOpen(true)}
        className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      >
        {/* Imagem de capa com foco ajustável */}
        <div className="aspect-video bg-muted overflow-hidden">
          {prompt.thumbnail_url ? (
            <ImageWithSkeleton
              src={prompt.thumbnail_url}
              alt={prompt.title}
              className="transition-transform duration-300 group-hover:scale-105"
              containerClassName="w-full h-full"
              objectPosition={prompt.thumbnail_focus || 'center'}
              fallbackIcon={<Icon className="h-12 w-12 text-muted-foreground/40" />}
              optimizedWidth={400}
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Icon className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Título abaixo da imagem */}
        <div className="p-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium line-clamp-2 text-sm text-foreground">{prompt.title}</span>
          </div>
        </div>
      </Card>

      {/* Modal com detalhes */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <DialogTitle className="text-lg">{prompt.title}</DialogTitle>
            </div>
          </DialogHeader>

          {/* Descrição */}
          {prompt.description && (
            <p className="text-muted-foreground text-sm">{prompt.description}</p>
          )}

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Conteúdo com Variações */}
          {hasVariations ? (
            <div className="space-y-4">
              {/* Navegação de Variações */}
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  disabled={currentVariationIndex === 0}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Prompt {currentVariationIndex + 1} de {variations.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  disabled={currentVariationIndex === variations.length - 1}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Conteúdo da Variação Atual */}
              {currentVariation && (
                <div className="space-y-4">
                  {/* Video da Variação (para categoria video) */}
                  {isVideoCategory && currentVariation.video_url && (
                    <div className="space-y-2">
                      <video
                        src={currentVariation.video_url}
                        controls
                        className="w-full rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadVideo(currentVariation.video_url!)}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar vídeo
                      </Button>
                    </div>
                  )}

                  {/* Imagem da Variação (para categorias image/agent) */}
                  {!isVideoCategory && currentVariation.image_url && (
                    <img
                      src={getOptimizedImageUrl(currentVariation.image_url, { width: 800 }) || currentVariation.image_url}
                      alt={`Resultado do Prompt ${currentVariationIndex + 1}`}
                      className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      loading="lazy"
                      onClick={() => setSelectedImage(currentVariation.image_url)}
                    />
                  )}

                  {/* Texto do Prompt */}
                  <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">
                      {currentVariation.content}
                    </pre>
                  </div>

                  {/* Botão de Copiar */}
                  <Button onClick={() => handleCopy(currentVariation.content)} className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Prompt {currentVariationIndex + 1}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Fallback para prompts sem variações (legado) */
            <div className="space-y-4">
              {/* Thumbnail principal */}
              {prompt.thumbnail_url && (
                <img
                  src={getOptimizedImageUrl(prompt.thumbnail_url, { width: 800 }) || prompt.thumbnail_url}
                  alt={prompt.title}
                  className="w-full rounded-lg"
                  loading="lazy"
                />
              )}

              {/* Conteúdo do Prompt */}
              <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">
                  {prompt.content}
                </pre>
              </div>

              {/* Galeria de imagens de exemplo (legado) */}
              {prompt.example_images && prompt.example_images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Exemplos de imagem</h4>
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

              {/* Botão de copiar */}
              <Button onClick={() => handleCopy(prompt.content)} className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Prompt
              </Button>
            </div>
          )}

          {/* Vídeo de exemplo - SEMPRE visível se existir */}
          {prompt.example_video_url && (
            <div className="space-y-3 border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Video className="h-4 w-4" />
                Vídeo de exemplo
              </h4>
              <video
                src={prompt.example_video_url}
                controls
                className="w-full rounded-lg"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadVideo(prompt.example_video_url!)}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar vídeo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de imagem ampliada */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-4 flex items-center justify-center">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Exemplo ampliado"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
