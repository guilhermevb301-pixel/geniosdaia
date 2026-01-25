import { Layers } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MenteeHeader } from "@/components/mentoria/MenteeHeader";
import { QuickAccessCards } from "@/components/mentoria/QuickAccessCards";
import { MeetingsTable } from "@/components/mentoria/MeetingsTable";
import { PillarCard } from "@/components/mentoria/PillarCard";
import { TodoList } from "@/components/mentoria/TodoList";
import { useMenteeData } from "@/hooks/useMenteeData";
import { Skeleton } from "@/components/ui/skeleton";

export default function MinhaMentoria() {
  const { mentee, meetings, pillars, todos, isLoading, toggleTask, toggleTodo, createTodo, deleteTodo } = useMenteeData();

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

        {/* To-do List */}
        <TodoList 
          todos={todos} 
          onToggle={(id, completed) => toggleTodo.mutate({ todoId: id, completed })}
          onCreate={(content) => createTodo.mutate({ content })}
          onDelete={(id) => deleteTodo.mutate(id)}
        />

        {/* Meetings Table */}
        <MeetingsTable meetings={meetings} menteeName={mentee.display_name} />

        {/* Pillars Section (Notion-style) */}
        {pillars.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Etapas</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map((pillar) => (
                <PillarCard
                  key={pillar.id}
                  pillar={pillar}
                  onToggleTask={handleToggleTask}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
