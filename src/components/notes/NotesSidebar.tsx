import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserNotes } from "@/hooks/useUserNotes";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NotesSidebarProps {
  lessonId: string;
  lessonTitle: string;
}

// Simple debounce hook
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function NotesSidebar({ lessonId, lessonTitle }: NotesSidebarProps) {
  const { getNoteForLesson, saveNote, isSaving } = useUserNotes();
  const existingNote = getNoteForLesson(lessonId);
  const [content, setContent] = useState(existingNote?.content || "");
  const [open, setOpen] = useState(false);
  
  const debouncedContent = useDebounceValue(content, 1000);

  // Update local state when note data changes
  useEffect(() => {
    if (existingNote?.content && !content) {
      setContent(existingNote.content);
    }
  }, [existingNote?.content]);

  // Auto-save when content changes (debounced)
  useEffect(() => {
    if (debouncedContent && debouncedContent !== existingNote?.content) {
      saveNote({ lessonId, content: debouncedContent }, {
        onSuccess: () => {
          // Silent save, no toast
        },
        onError: () => {
          toast({ title: "Erro ao salvar nota", variant: "destructive" });
        }
      });
    }
  }, [debouncedContent, lessonId]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Minhas Notas
          {existingNote && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Notas da Aula
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{lessonTitle}</p>
        </SheetHeader>
        
        <div className="mt-6">
          <Textarea
            placeholder="Digite suas anotações aqui... (salvamento automático)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] resize-none"
          />
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Salvando...
                </span>
              ) : content !== existingNote?.content ? (
                "Alterações não salvas"
              ) : (
                "Salvo automaticamente"
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {content.length} caracteres
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
