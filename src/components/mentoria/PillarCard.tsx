import React from "react";
import { 
  Folder, 
  Target, 
  Wrench, 
  Eye, 
  Heart, 
  Briefcase, 
  Star, 
  Lightbulb, 
  Rocket, 
  Code,
  Palette,
  Globe,
  Settings,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TaskCheckbox } from "./TaskCheckbox";
import type { Task } from "@/hooks/useMenteeData";

export interface Phase {
  id: string;
  title: string;
  objective: string | null;
  order_index: number;
  tasks: Task[];
}

export interface Pillar {
  id: string;
  mentee_id: string;
  title: string;
  icon: string;
  icon_color: string;
  order_index: number;
  created_at: string;
  phases: Phase[];
}

interface PillarCardProps {
  pillar: Pillar;
  onToggleTask: (taskId: string, completed: boolean) => void;
}

const iconMap: Record<string, typeof Folder> = {
  folder: Folder,
  wrench: Wrench,
  eye: Eye,
  heart: Heart,
  briefcase: Briefcase,
  star: Star,
  lightbulb: Lightbulb,
  rocket: Rocket,
  code: Code,
  palette: Palette,
  globe: Globe,
  settings: Settings,
  target: Target,
  zap: Zap,
};

function PillarCardComponent(
  { pillar, onToggleTask }: PillarCardProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const IconComponent = iconMap[pillar.icon || "folder"] || Folder;

  return (
    <Card 
      ref={ref} 
      className="bg-card border-border h-full overflow-hidden group hover:shadow-md transition-shadow flex flex-col"
    >
      {/* Pillar Header */}
      <CardHeader className="pb-3 bg-muted/30 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${pillar.icon_color}20` }}
          >
            <IconComponent
              className="h-5 w-5"
              style={{ color: pillar.icon_color }}
            />
          </div>
          <h3 className="font-semibold text-base text-foreground">
            {pillar.title}
          </h3>
        </div>
      </CardHeader>

      {/* Phases Content */}
      <CardContent className="flex-1 p-4 space-y-5 overflow-y-auto max-h-[500px]">
        {pillar.phases.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma fase cadastrada ainda.
            </p>
          </div>
        ) : (
          pillar.phases.map((phase, index) => (
            <div key={phase.id} className="space-y-2">
              {/* Phase Title */}
              <h4 className="font-semibold text-sm text-foreground">
                {phase.title}
              </h4>

              {/* Phase Objective */}
              {phase.objective && (
                <div className="flex items-start gap-1.5">
                  <Target 
                    className="h-3.5 w-3.5 mt-0.5 shrink-0" 
                    style={{ color: pillar.icon_color }} 
                  />
                  <p
                    className="text-xs font-medium leading-relaxed"
                    style={{ color: pillar.icon_color }}
                  >
                    {phase.objective}
                  </p>
                </div>
              )}

              {/* Tasks */}
              {phase.tasks.length > 0 && (
                <div className="space-y-0.5 mt-2">
                  {phase.tasks.map((task) => (
                    <TaskCheckbox
                      key={task.id}
                      task={task}
                      onToggle={onToggleTask}
                    />
                  ))}
                </div>
              )}

              {/* Separator between phases */}
              {index < pillar.phases.length - 1 && (
                <div className="pt-3 border-b border-border/30" />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export const PillarCard = React.forwardRef(PillarCardComponent);
PillarCard.displayName = "PillarCard";
