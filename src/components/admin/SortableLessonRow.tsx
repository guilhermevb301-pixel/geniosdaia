import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  download_url: string | null;
  duration: string | null;
  order_index: number;
}

interface SortableLessonRowProps {
  lesson: Lesson;
  moduleName: string;
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
}

export function SortableLessonRow({ lesson, moduleName, onEdit, onDelete }: SortableLessonRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {moduleName}
      </TableCell>
      <TableCell className="font-medium">{lesson.title}</TableCell>
      <TableCell>{lesson.duration || "-"}</TableCell>
      <TableCell>
        {lesson.youtube_url ? (
          <a
            href={lesson.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-destructive hover:underline flex items-center gap-1"
          >
            <Youtube className="h-4 w-4" />
            Ver
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(lesson)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Tem certeza que deseja excluir esta aula?")) {
                onDelete(lesson.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
