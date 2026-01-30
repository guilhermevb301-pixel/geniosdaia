import { useState, useEffect } from "react";
import { Copy, Video, Image, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface PromptVariation {
  id: string;
  content: string;
  image_url: string | null;
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
}

const categoryIcons = {
  video: Video,
  image: Image,
  agent: Bot,
};

export function PromptCard({ prompt }: PromptCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0);
  const Icon = categoryIcons[prompt.category];

  // Sort variations by order_index
  const variations = (prompt.variations || []).sort((a, b) => a.order_index - b.order_index);
  const hasVariations = variations.length > 0;
  const currentVariation = variations[currentVariationIndex];

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
                  {/* Imagem da Variação */}
                  {currentVariation.image_url && (
                    <img
                      src={currentVariation.image_url}
                      alt={`Resultado do Prompt ${currentVariationIndex + 1}`}
                      className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
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
                  src={prompt.thumbnail_url}
                  alt={prompt.title}
                  className="w-full rounded-lg"
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
                        src={img}
                        alt={`Exemplo ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(img)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Vídeo de exemplo */}
              {prompt.example_video_url && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Vídeo de exemplo</h4>
                  <video
                    src={prompt.example_video_url}
                    controls
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              {/* Botão de copiar */}
              <Button onClick={() => handleCopy(prompt.content)} className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Prompt
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
