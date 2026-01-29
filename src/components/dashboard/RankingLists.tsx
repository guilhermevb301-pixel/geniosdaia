import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Template {
  id: string;
  title: string;
  downloads_count: number;
}

interface Prompt {
  id: string;
  title: string;
  category: string;
}

function getMedalIcon(position: number) {
  switch (position) {
    case 0:
      return <Trophy className="h-4 w-4 text-warning" />;
    case 1:
      return <Medal className="h-4 w-4 text-muted-foreground" />;
    case 2:
      return <Medal className="h-4 w-4 text-chart-4" />;
    default:
      return (
        <span className="h-4 w-4 flex items-center justify-center text-xs text-muted-foreground font-medium">
          {position + 1}
        </span>
      );
  }
}

function getMedalBg(position: number) {
  switch (position) {
    case 0:
      return "bg-warning/10 border-warning/20 hover:border-warning/40";
    case 1:
      return "bg-muted/50 border-border hover:border-muted-foreground/30";
    case 2:
      return "bg-chart-4/10 border-chart-4/20 hover:border-chart-4/40";
    default:
      return "bg-secondary border-border hover:border-primary/30";
  }
}

export function RankingLists() {
  const { data: topTemplates, isLoading: loadingTemplates } = useQuery({
    queryKey: ["topTemplates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("templates")
        .select("id, title, downloads_count")
        .order("downloads_count", { ascending: false })
        .limit(5);
      return data as Template[] | null;
    },
  });

  const { data: recentPrompts, isLoading: loadingPrompts } = useQuery({
    queryKey: ["recentPrompts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("prompts")
        .select("id, title, category")
        .order("created_at", { ascending: false })
        .limit(5);
      return data as Prompt[] | null;
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top Templates */}
      <Card className="bg-card border-border card-glow">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            Top Templates
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
            <Link to="/templates">
              Ver todos
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingTemplates ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))
          ) : topTemplates && topTemplates.length > 0 ? (
            topTemplates.map((template, idx) => (
              <Link
                key={template.id}
                to="/templates"
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 hover-scale ${getMedalBg(idx)}`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/50">
                  {getMedalIcon(idx)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{template.title}</p>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums bg-background/50 px-2 py-1 rounded-md">
                  {template.downloads_count.toLocaleString("pt-BR")}
                </span>
              </Link>
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum template disponível ainda
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Prompts */}
      <Card className="bg-card border-border card-glow">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            Prompts Recentes
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
            <Link to="/prompts">
              Ver todos
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingPrompts ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))
          ) : recentPrompts && recentPrompts.length > 0 ? (
            recentPrompts.map((prompt, idx) => (
              <Link
                key={prompt.id}
                to="/prompts"
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 hover-scale ${getMedalBg(idx)}`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/50">
                  {getMedalIcon(idx)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{prompt.title}</p>
                </div>
                <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium">
                  {prompt.category}
                </span>
              </Link>
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum prompt disponível ainda
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
