import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserNotes } from "@/hooks/useUserNotes";
import { useUserFavorites } from "@/hooks/useUserFavorites";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen,
  Search,
  FileText,
  Trash2,
  ExternalLink,
  Heart,
  Plus,
  Video,
  ClipboardList,
  CheckSquare,
  Square,
  Calendar,
  Lightbulb,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { CreateNoteModal } from "@/components/notes/CreateNoteModal";

// ─── Todo Types & Helpers ──────────────────────────────────────────────────

interface Todo {
  id: string;
  title: string;
  trick?: string;
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
}

const TODOS_KEY = "genios_todos_v1";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function weekEndStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

function formatDueDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

// ─── Todo Tab ─────────────────────────────────────────────────────────────

function TodoTab() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTrick, setNewTrick] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TODOS_KEY);
    if (stored) {
      try {
        setTodos(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const save = (updated: Todo[]) => {
    setTodos(updated);
    localStorage.setItem(TODOS_KEY, JSON.stringify(updated));
  };

  const addTodo = () => {
    if (!newTitle.trim()) return;
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      trick: newTrick.trim() || undefined,
      dueDate: newDate || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    save([todo, ...todos]);
    setNewTitle("");
    setNewDate("");
    setNewTrick("");
    setShowForm(false);
    toast({ title: "Tarefa adicionada!" });
  };

  const toggleTodo = (id: string) => {
    save(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    save(todos.filter((t) => t.id !== id));
    toast({ title: "Tarefa removida" });
  };

  const today = todayStr();
  const tomorrow = tomorrowStr();
  const weekEnd = weekEndStr();

  const pending = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  const overdue = pending.filter((t) => t.dueDate && t.dueDate < today);
  const todayItems = pending.filter((t) => t.dueDate === today);
  const tomorrowItems = pending.filter((t) => t.dueDate === tomorrow);
  const weekItems = pending.filter(
    (t) => t.dueDate && t.dueDate > tomorrow && t.dueDate <= weekEnd
  );
  const noDates = pending.filter((t) => !t.dueDate);

  const renderTodo = (todo: Todo) => (
    <div
      key={todo.id}
      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 group transition-colors"
    >
      <button
        onClick={() => toggleTodo(todo.id)}
        className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {todo.completed ? (
          <CheckSquare className="h-5 w-5 text-primary" />
        ) : (
          <Square className="h-5 w-5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${
            todo.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {todo.title}
        </p>
        {todo.trick && (
          <div className="flex items-start gap-1.5 mt-1.5 p-2 rounded bg-amber-500/10 border border-amber-500/20">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">{todo.trick}</p>
          </div>
        )}
        {todo.dueDate && (
          <div className="flex items-center gap-1 mt-1.5">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDueDate(todo.dueDate)}
            </span>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 flex-shrink-0"
        onClick={() => deleteTodo(todo.id)}
      >
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );

  const renderSection = (label: string, items: Todo[], destructive = false) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3
            className={`text-xs font-semibold uppercase tracking-wider ${
              destructive ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {label}
          </h3>
          <Badge
            variant={destructive ? "destructive" : "secondary"}
            className="text-xs px-1.5 py-0"
          >
            {items.length}
          </Badge>
        </div>
        <div className="space-y-2">{items.map(renderTodo)}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Task Button / Inline Form */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      ) : (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Nome da tarefa..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              autoFocus
            />
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Vencimento (opcional)
              </label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={today}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-amber-500" /> Trick / Dica (opcional)
              </label>
              <Textarea
                placeholder="Alguma dica ou truque para essa tarefa..."
                value={newTrick}
                onChange={(e) => setNewTrick(e.target.value)}
                className="min-h-[64px] text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addTodo} disabled={!newTitle.trim()} size="sm">
                Adicionar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setNewTitle("");
                  setNewDate("");
                  setNewTrick("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {pending.length === 0 && completed.length === 0 && (
        <Card className="p-8 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma tarefa ainda</h3>
          <p className="text-muted-foreground text-sm">
            Adicione tarefas do dia e agende com datas de vencimento
          </p>
        </Card>
      )}

      {/* Grouped Sections */}
      {renderSection("Atrasadas", overdue, true)}
      {renderSection("Hoje", todayItems)}
      {renderSection("Amanhã", tomorrowItems)}
      {renderSection("Esta semana", weekItems)}
      {renderSection("Sem prazo", noDates)}

      {/* Completed (collapsible) */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCompleted ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            Concluídas ({completed.length})
          </button>
          {showCompleted && (
            <div className="space-y-2">{completed.map(renderTodo)}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Notes Tab ────────────────────────────────────────────────────────────

function NotesTab() {
  const { notes, isLoading, deleteNote, isDeleting } = useUserNotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: lessons } = useQuery({
    queryKey: ["lessonsForNotes"],
    queryFn: async () => {
      const lessonIds = notes.filter((n) => n.lesson_id).map((n) => n.lesson_id);
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

  const filteredNotes = notes.filter((note) => {
    const s = searchQuery.toLowerCase();
    return (
      note.content.toLowerCase().includes(s) ||
      (note.title && note.title.toLowerCase().includes(s))
    );
  });

  const freeNotes = filteredNotes.filter((n) => !n.lesson_id && !n.prompt_id);
  const lessonNotes = filteredNotes.filter((n) => n.lesson_id || n.prompt_id);

  const handleDelete = (noteId: string) => {
    deleteNote(noteId, { onSuccess: () => toast({ title: "Nota excluída" }) });
  };

  const isMediaImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

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

      {freeNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Notas Livres</h3>
          {freeNotes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {note.title && <h4 className="font-medium mb-1">{note.title}</h4>}
                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                      {note.content}
                    </p>
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

      {lessonNotes.length > 0 && (
        <div className="space-y-3">
          {freeNotes.length > 0 && (
            <h3 className="text-sm font-medium text-muted-foreground">Notas de Aulas</h3>
          )}
          {lessonNotes.map((note) => {
            const lesson = lessons?.find((l) => l.id === note.lesson_id);
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

      {filteredNotes.length === 0 && (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma nota encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Tente uma busca diferente"
              : "Crie sua primeira nota livre ou adicione notas nas aulas"}
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
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["userNotes"] })}
      />
    </div>
  );
}

// ─── Favorites Tab ────────────────────────────────────────────────────────

function FavoritesTab() {
  const { lessonFavorites, promptFavorites, isLoading, toggleFavorite, isToggling } =
    useUserFavorites();

  const { data: lessons } = useQuery({
    queryKey: ["favoriteLessons", lessonFavorites.map((f) => f.lesson_id)],
    queryFn: async () => {
      const ids = lessonFavorites.map((f) => f.lesson_id).filter(Boolean);
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, module_id, duration")
        .in("id", ids);
      if (error) throw error;
      return data;
    },
    enabled: lessonFavorites.length > 0,
  });

  const { data: prompts } = useQuery({
    queryKey: ["favoritePrompts", promptFavorites.map((f) => f.prompt_id)],
    queryFn: async () => {
      const ids = promptFavorites.map((f) => f.prompt_id).filter(Boolean);
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from("prompts")
        .select("id, title, category")
        .in("id", ids);
      if (error) throw error;
      return data;
    },
    enabled: promptFavorites.length > 0,
  });

  const removeFavorite = (lessonId?: string, promptId?: string) => {
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
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Aulas Favoritas ({lessonFavorites.length})
        </h3>
        {lessonFavorites.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {lessonFavorites.map((fav) => {
              const lesson = lessons?.find((l) => l.id === fav.lesson_id);
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
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {fav.note}
                          </p>
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
                          onClick={() => removeFavorite(fav.lesson_id || undefined)}
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

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Prompts Favoritos ({promptFavorites.length})
        </h3>
        {promptFavorites.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {promptFavorites.map((fav) => {
              const prompt = prompts?.find((p) => p.id === fav.prompt_id);
              if (!prompt) return null;
              return (
                <Card key={fav.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{prompt.title}</h4>
                        <p className="text-sm text-muted-foreground">{prompt.category}</p>
                        {fav.note && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {fav.note}
                          </p>
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
                          onClick={() => removeFavorite(undefined, fav.prompt_id || undefined)}
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

// ─── Page ─────────────────────────────────────────────────────────────────

export default function MeuCaderno() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Meu Caderno
          </h1>
          <p className="text-muted-foreground mt-1">
            Tarefas, notas e favoritos em um só lugar
          </p>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="tasks" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="h-4 w-4" />
              Notas
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              Favoritos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            <TodoTab />
          </TabsContent>

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
