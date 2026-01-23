import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Task } from "@/hooks/useMenteeData";

interface TaskCheckboxProps {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
}

export function TaskCheckbox({ task, onToggle }: TaskCheckboxProps) {
  return (
    <div 
      className={cn(
        "flex items-start gap-2.5 py-1.5 px-2 rounded-md transition-colors hover:bg-muted/50",
        task.is_subtask && "ml-5"
      )}
    >
      <Checkbox
        id={task.id}
        checked={task.completed}
        onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
        className={cn(
          "mt-0.5 transition-all",
          task.completed && "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        )}
      />
      <label
        htmlFor={task.id}
        className={cn(
          "text-sm cursor-pointer transition-all duration-200 leading-relaxed",
          task.completed 
            ? "line-through text-muted-foreground/60" 
            : "text-foreground"
        )}
      >
        {task.content}
      </label>
    </div>
  );
}
