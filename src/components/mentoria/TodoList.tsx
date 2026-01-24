import React, { useState } from "react";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  onCreate: (content: string) => void;
  onDelete: (id: string) => void;
}

function TodoListComponent(
  { todos, onToggle, onCreate, onDelete }: TodoListProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [newTodo, setNewTodo] = useState("");
  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onCreate(newTodo.trim());
      setNewTodo("");
    }
  };

  return (
    <Card ref={ref} className="bg-card/50 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">To-do List</CardTitle>
          </div>
          {todos.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {completedCount}/{todos.length}
            </span>
          )}
        </div>
        {todos.length > 0 && <Progress value={progress} className="h-1.5 mt-2" />}
      </CardHeader>
      <CardContent className="space-y-3">
        {todos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Nenhuma tarefa ainda. Adicione sua primeira tarefa abaixo!
          </p>
        ) : (
          <div className="space-y-1">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 py-1.5 px-1 rounded hover:bg-muted/50 transition-colors group"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) => onToggle(todo.id, checked as boolean)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span
                  className={cn(
                    "text-sm flex-1 transition-all",
                    todo.completed && "line-through text-muted-foreground"
                  )}
                >
                  {todo.content}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDelete(todo.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-border">
          <Input
            placeholder="Adicionar nova tarefa..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="h-9"
          />
          <Button type="submit" size="sm" disabled={!newTodo.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export const TodoList = React.forwardRef(TodoListComponent);
TodoList.displayName = "TodoList";
