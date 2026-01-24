import { CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface Todo {
  id: string;
  mentee_id: string;
  content: string;
  completed: boolean;
  order_index: number;
  created_at: string;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string, completed: boolean) => void;
}

export function TodoList({ todos, onToggle }: TodoListProps) {
  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  if (todos.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">To-do List</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{todos.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="space-y-1">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 py-1.5 px-1 rounded hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked) => onToggle(todo.id, checked as boolean)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span
              className={cn(
                "text-sm transition-all",
                todo.completed && "line-through text-muted-foreground"
              )}
            >
              {todo.content}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
