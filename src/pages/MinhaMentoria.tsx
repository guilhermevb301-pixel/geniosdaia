import { Layers } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MenteeHeader } from "@/components/mentoria/MenteeHeader";
import { QuickAccessCards } from "@/components/mentoria/QuickAccessCards";
import { MeetingsTable } from "@/components/mentoria/MeetingsTable";
import { StageCard } from "@/components/mentoria/StageCard";
import { useMenteeData } from "@/hooks/useMenteeData";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function MinhaMentoria() {
  const { mentee, meetings, stages, pillars, isLoading, toggleTask } = useMenteeData();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </AppLayout>
    );
  }

  if (!mentee) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Layers className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Acesso não disponível</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Você ainda não tem acesso à área de mentoria. Se você já aplicou,
            aguarde a aprovação do seu mentor.
          </p>
        </div>
      </AppLayout>
    );
  }

  const handleToggleTask = (taskId: string, completed: boolean) => {
    toggleTask.mutate({ taskId, completed });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <MenteeHeader mentee={mentee} />

        {/* Quick Access Cards */}
        <QuickAccessCards communityUrl={mentee.community_url} />

        {/* Etapas Section - Stages (Fases) with Tasks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Etapas</h2>
          </div>
          {stages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {stages.map((stage) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  onToggleTask={handleToggleTask}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 border-border p-6 text-center">
              <p className="text-muted-foreground">
                Nenhuma etapa foi configurada ainda pelo seu mentor.
              </p>
            </Card>
          )}
        </div>

        {/* Meetings Table */}
        <MeetingsTable meetings={meetings} menteeName={mentee.display_name} />
      </div>
    </AppLayout>
  );
}
