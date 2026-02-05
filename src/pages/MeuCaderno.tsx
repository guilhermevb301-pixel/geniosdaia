import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserNotes } from "@/hooks/useUserNotes";
import { useUserFavorites } from "@/hooks/useUserFavorites";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Star, Search, FileText, Trash2, ExternalLink, Heart, Plus, Image, Video } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { CreateNoteModal } from "@/components/notes/CreateNoteModal";

function NotesTab() {
  const { notes, isLoading, deleteNote, isDeleting } = useUserNotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch lessons for notes
  const { data: lessons } = useQuery({
    queryKey: ["lessonsForNotes"],
    queryFn: async () => {
      const lessonIds = notes.filter(n => n.lesson_id).map(n => n.lesson_id);
      if (lessonIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, module_id")
        .in("id", lessonIds);
      
      if (error) throw error;
      return data;
    },
    enabled: notes.length > 0,
  });

  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    return (
      note.content.toLowerCase().includes(searchLower) ||
      (note.title && note.title.toLowerCase().includes(searchLower))
    );
  });

  // Separate free notes from lesson notes
  const freeNotes = filteredNotes.filter(n => !n.lesson_id && !n.prompt_id);
  const lessonNotes = filteredNotes.filter(n => n.lesson_id || n.prompt_id);

  const handleDelete = async (noteId: string) => {
    deleteNote(noteId, {
      onSuccess: () => toast({ title: "Nota excluída" }),
    });
  };

  const handleNoteCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["userNotes"] });
  };

  const isMediaImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nas notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Nota
        </Button>
      </div>

      {/* Free Notes Section */}
      {freeNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Notas Livres</h3>
          {freeNotes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {note.title && (
                      <h4 className="font-medium mb-1">{note.title}</h4>
                    )}
                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                      {note.content}
                    </p>
                    {/* Media Preview */}
                    {note.media_urls && note.media_urls.length > 0 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto">
                        {note.media_urls.slice(0, 4).map((url, idx) => (
                          <div key={idx} className="flex-shrink-0">
                            {isMediaImage(url) ? (
                              <img
                                src={url}
                                alt=""
                                className="h-16 w-16 object-cover rounded border"
                              />
                            ) : (
                              <div className="h-16 w-16 flex items-center justify-center bg-muted rounded border">
                                <Video className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                        {note.media_urls.length > 4 && (
                          <div className="h-16 w-16 flex items-center justify-center bg-muted rounded border text-sm text-muted-foreground">
                            +{note.media_urls.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.updated_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(note.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lesson Notes Section */}
      {lessonNotes.length > 0 && (
        <div className="space-y-3">
          {freeNotes.length > 0 && (
            <h3 className="text-sm font-medium text-muted-foreground">Notas de Aulas</h3>
          )}
          {lessonNotes.map((note) => {
            const lesson = lessons?.find(l => l.id === note.lesson_id);
            
            return (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {lesson && (
                        <Link 
                          to={`/aulas/${lesson.module_id}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1 mb-1"
                        >
                          <BookOpen className="h-3 w-3" />
                          {lesson.title}
                        </Link>
                      )}
                      <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                        {note.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(note.updated_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(note.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma nota encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Tente uma busca diferente" : "Crie sua primeira nota livre ou adicione notas nas aulas"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Nota
            </Button>
          )}
        </Card>
      )}

      <CreateNoteModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleNoteCreated}
      />
    </div>
  );
}

function FavoritesTab() {
  const { lessonFavorites, promptFavorites, isLoading, toggleFavorite, isToggling } = useUserFavorites();

  // Fetch lesson details
  const { data: lessons } = useQuery({
    queryKey: ["favoriteLessons", lessonFavorites.map(f => f.lesson_id)],
    queryFn: async () => {
      const lessonIds = lessonFavorites.map(f => f.lesson_id).filter(Boolean);
      if (lessonIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, module_id, duration")
        .in("id", lessonIds);
      
      if (error) throw error;
      return data;
    },
    enabled: lessonFavorites.length > 0,
  });

  // Fetch prompt details
  const { data: prompts } = useQuery({
    queryKey: ["favoritePrompts", promptFavorites.map(f => f.prompt_id)],
    queryFn: async () => {
      const promptIds = promptFavorites.map(f => f.prompt_id).filter(Boolean);
      if (promptIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("prompts")
        .select("id, title, category")
        .in("id", promptIds);
      
      if (error) throw error;
      return data;
    },
    enabled: promptFavorites.length > 0,
  });

  const handleRemoveFavorite = (lessonId?: string, promptId?: string) => {
    toggleFavorite({ lessonId, promptId }, {
      onSuccess: () => toast({ title: "Removido dos favoritos" }),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lesson Favorites */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Aulas Favoritas ({lessonFavorites.length})
        </h3>
        
        {lessonFavorites.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {lessonFavorites.map((fav) => {
              const lesson = lessons?.find(l => l.id === fav.lesson_id);
              if (!lesson) return null;
              
              return (
                <Card key={fav.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{lesson.title}</h4>
                        {lesson.duration && (
                          <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                        )}
                        {fav.note && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{fav.note}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link to={`/aulas/${lesson.module_id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveFavorite(fav.lesson_id || undefined)}
                          disabled={isToggling}
                        >
                          <Heart className="h-4 w-4 fill-primary text-primary" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Nenhuma aula favorita</p>
          </Card>
        )}
      </div>

      {/* Prompt Favorites */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Star className="h-5 w-5" />
          Prompts Favoritos ({promptFavorites.length})
        </h3>
        
        {promptFavorites.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {promptFavorites.map((fav) => {
              const prompt = prompts?.find(p => p.id === fav.prompt_id);
              if (!prompt) return null;
              
              return (
                <Card key={fav.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{prompt.title}</h4>
                        <p className="text-sm text-muted-foreground">{prompt.category}</p>
                        {fav.note && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{fav.note}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link to="/prompts">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveFavorite(undefined, fav.prompt_id || undefined)}
                          disabled={isToggling}
                        >
                          <Heart className="h-4 w-4 fill-primary text-primary" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Nenhum prompt favorito</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function MeuCaderno() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Meu Caderno
          </h1>
          <p className="text-muted-foreground mt-1">
            Suas notas e favoritos em um só lugar
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notes" className="w-full">
          <TabsList>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="h-4 w-4" />
              Notas
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              Favoritos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes" className="mt-6">
            <NotesTab />
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-6">
            <FavoritesTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
