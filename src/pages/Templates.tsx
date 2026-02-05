import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Heart, MessageCircle, Sparkles, FileArchive } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Link } from "react-router-dom";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface Template {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  json_url: string | null;
  zip_url: string | null;
  tags: string[];
  downloads_count: number;
  author_name: string | null;
  created_at: string;
}

export default function Templates() {
  const { isAdmin } = useIsAdmin();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Template[];
    },
  });

  const incrementDownloadMutation = useMutation({
    mutationFn: async (templateId: string) => {
      // Simple increment - just update the count
      const template = templates?.find(t => t.id === templateId);
      if (template) {
        const { error } = await supabase
          .from("templates")
          .update({ downloads_count: template.downloads_count + 1 })
          .eq("id", templateId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  const handleDownload = (template: Template, type: 'json' | 'zip') => {
    const url = type === 'json' ? template.json_url : template.zip_url;
    if (url) {
      incrementDownloadMutation.mutate(template.id);
      window.open(url, "_blank");
    }
  };

  // Filter templates by search
  const filteredTemplates = templates?.filter((template) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.title.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Templates n8n</h1>
            <p className="text-muted-foreground">
              Workflows prontos para usar em suas automações
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin/templates">
                <Button variant="outline">Gerenciar Templates</Button>
              </Link>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredTemplates && filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group overflow-hidden hover:border-primary/50 transition-colors"
              >
                {/* Image */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {template.image_url ? (
                    <ImageWithSkeleton
                      src={template.image_url}
                      alt={template.title}
                      className="group-hover:scale-105 transition-transform duration-300"
                      containerClassName="w-full h-full"
                      fallbackIcon={<Sparkles className="h-12 w-12 text-muted-foreground/50" />}
                      optimizedWidth={400}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}

                  {/* Author avatar overlay */}
                  {template.author_name && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                        {template.author_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{template.author_name}</span>
                    </div>
                  )}

                  {/* Stats overlay */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <div className="flex items-center gap-1 text-sm">
                      <Heart className="h-4 w-4" />
                      <span>{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <MessageCircle className="h-4 w-4" />
                      <span>{Math.floor(Math.random() * 20)}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Title */}
                  <h3 className="font-semibold line-clamp-2">{template.title}</h3>

                  {/* Description */}
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Tags */}
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                                  {/* Actions */}
                                  <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm text-muted-foreground">
                                      {template.downloads_count} downloads
                                    </span>
                                    <div className="flex gap-2">
                                      {template.json_url && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDownload(template, 'json')}
                                        >
                                          <Download className="mr-2 h-4 w-4" />
                                          JSON
                                        </Button>
                                      )}
                                      {template.zip_url && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleDownload(template, 'zip')}
                                        >
                                          <FileArchive className="mr-2 h-4 w-4" />
                                          ZIP
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {searchQuery ? "Nenhum template encontrado" : "Sem templates disponíveis"}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {searchQuery
                ? "Tente buscar por outro termo"
                : "Os templates ainda não foram adicionados. Aguarde o administrador adicionar o conteúdo."}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
