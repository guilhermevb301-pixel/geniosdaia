import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/hooks/useMenteeData";

interface TaskCheckboxProps {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
}

export function TaskCheckbox({ task, onToggle }: TaskCheckboxProps) {
  return (
    <div className={`flex items-start gap-2 ${task.is_subtask ? "ml-4" : ""}`}>
      <Checkbox
        id={task.id}
        checked={task.completed}
        onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
        className="mt-0.5"
      />
      <label
        htmlFor={task.id}
        className={`text-sm cursor-pointer ${
          task.completed ? "line-through text-muted-foreground" : ""
        }`}
      >
        {task.content}
      </label>
    </div>
  );
}
