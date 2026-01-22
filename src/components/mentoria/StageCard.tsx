import { Folder, Target, CheckSquare, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TaskCheckbox } from "./TaskCheckbox";
import type { Stage } from "@/hooks/useMenteeData";

interface StageCardProps {
  stage: Stage;
  onToggleTask: (taskId: string, completed: boolean) => void;
}

export function StageCard({ stage, onToggleTask }: StageCardProps) {
  const IconComponent = Folder;

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
            style={{ backgroundColor: `${stage.icon_color}20` }}
          >
            <IconComponent
              className="h-4 w-4"
              style={{ color: stage.icon_color }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium leading-tight">{stage.title}</h3>
            {stage.objective && (
              <p
                className="text-xs mt-1 font-medium"
                style={{ color: stage.icon_color }}
              >
                <Target className="h-3 w-3 inline mr-1" />
                {stage.objective}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tasks */}
        {stage.tasks && stage.tasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <CheckSquare className="h-3 w-3" />
              Tarefas
            </div>
            <div className="space-y-1.5">
              {stage.tasks.map((task) => (
                <TaskCheckbox
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {stage.notes && stage.notes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <MessageCircle className="h-3 w-3" />
              Mentoria
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {stage.notes.map((note) => (
                <li key={note.id} className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>{note.content}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {(!stage.tasks || stage.tasks.length === 0) &&
          (!stage.notes || stage.notes.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma tarefa ou nota ainda.
            </p>
          )}
      </CardContent>
    </Card>
  );
}
