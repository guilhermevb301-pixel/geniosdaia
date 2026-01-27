import { 
  Folder, 
  Target, 
  CheckSquare, 
  MessageCircle, 
  Camera, 
  Briefcase, 
  FileText, 
  Star, 
  Lightbulb, 
  Rocket, 
  Code,
  Palette,
  Globe,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TaskCheckbox } from "./TaskCheckbox";
import type { Stage, Pillar } from "@/hooks/useMenteeData";

interface StageCardProps {
  stage: Stage & { pillar?: Pillar | null };
  onToggleTask: (taskId: string, completed: boolean) => void;
}

const iconMap: Record<string, typeof Folder> = {
  folder: Folder,
  camera: Camera,
  briefcase: Briefcase,
  file: FileText,
  star: Star,
  lightbulb: Lightbulb,
  rocket: Rocket,
  code: Code,
  palette: Palette,
  globe: Globe,
  settings: Settings,
  target: Target,
};

export function StageCard({ stage, onToggleTask }: StageCardProps) {
  const StageIcon = iconMap[stage.icon || "folder"] || Folder;
  const PillarIcon = stage.pillar ? (iconMap[stage.pillar.icon || "folder"] || Folder) : null;

  const hasTasks = stage.tasks && stage.tasks.length > 0;
  const hasNotes = stage.notes && stage.notes.length > 0;
  const completedTasks = stage.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = stage.tasks?.length || 0;

  return (
    <Card className="bg-card border-border h-full overflow-hidden group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 bg-muted/20">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${stage.icon_color}15` }}
          >
            <StageIcon
              className="h-5 w-5"
              style={{ color: stage.icon_color }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold leading-tight text-foreground text-base">
              {stage.title}
            </h3>
            
            {/* Pillar Badge */}
            {stage.pillar && PillarIcon && (
              <Badge 
                variant="outline" 
                className="mt-1.5 gap-1.5 text-xs font-medium border-border/60"
                style={{ 
                  backgroundColor: `${stage.pillar.icon_color}10`,
                  borderColor: `${stage.pillar.icon_color}30`
                }}
              >
                <PillarIcon 
                  className="h-3 w-3" 
                  style={{ color: stage.pillar.icon_color }} 
                />
                <span style={{ color: stage.pillar.icon_color }}>
                  {stage.pillar.title}
                </span>
              </Badge>
            )}
            
            {/* Objective */}
            {stage.objective && (
              <div className="flex items-start gap-1.5 mt-2">
                <Target 
                  className="h-3.5 w-3.5 shrink-0 mt-0.5" 
                  style={{ color: stage.icon_color }} 
                />
                <p
                  className="text-xs font-medium leading-relaxed"
                  style={{ color: stage.icon_color }}
                >
                  {stage.objective}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {/* Tasks */}
        {hasTasks && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Tarefas
              </span>
              <span className="text-xs text-muted-foreground/60 ml-auto">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <div className="space-y-1">
              {stage.tasks?.map((task) => (
                <TaskCheckbox
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Separator */}
        {hasTasks && hasNotes && (
          <Separator className="bg-border/50" />
        )}

        {/* Notes */}
        {hasNotes && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Mentoria
              </span>
            </div>
            <ul className="space-y-2">
              {stage.notes?.map((note) => (
                <li key={note.id} className="flex items-start gap-2 text-sm">
                  <span 
                    className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: stage.icon_color }}
                  />
                  <span className="text-muted-foreground leading-relaxed">
                    {note.content}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {!hasTasks && !hasNotes && (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa ou nota ainda.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
