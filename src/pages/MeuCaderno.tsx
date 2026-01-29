import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserNotes } from "@/hooks/useUserNotes";
import { useUserFavorites } from "@/hooks/useUserFavorites";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Star, Search, FileText, Trash2, ExternalLink, Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

function NotesTab() {
  const { notes, isLoading, deleteNote, isDeleting } = useUserNotes();
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredNotes = notes.filter(note => 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (noteId: string) => {
    deleteNote(noteId, {
      onSuccess: () => toast({ title: "Nota excluída" }),
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
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar nas notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <div className="space-y-3">
          {filteredNotes.map((note) => {
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
      ) : (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma nota encontrada</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Tente uma busca diferente" : "Adicione notas nas aulas para vê-las aqui"}
          </p>
        </Card>
      )}
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
