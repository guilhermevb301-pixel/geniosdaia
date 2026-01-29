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
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 1:
      return <Medal className="h-4 w-4 text-gray-400" />;
    case 2:
      return <Medal className="h-4 w-4 text-amber-700" />;
    default:
      return (
        <span className="h-4 w-4 flex items-center justify-center text-xs text-muted-foreground">
          {position + 1}
        </span>
      );
  }
}

function getMedalBg(position: number) {
  switch (position) {
    case 0:
      return "bg-yellow-500/10 border-yellow-500/20";
    case 1:
      return "bg-gray-400/10 border-gray-400/20";
    case 2:
      return "bg-amber-700/10 border-amber-700/20";
    default:
      return "bg-muted border-border";
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
    <div className="grid gap-4 md:grid-cols-2">
      {/* Top Templates */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Top Templates
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/templates" className="text-xs">
              Ver todos
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingTemplates ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))
          ) : topTemplates && topTemplates.length > 0 ? (
            topTemplates.map((template, idx) => (
              <Link
                key={template.id}
                to="/templates"
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.01] ${getMedalBg(idx)}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/50">
                  {getMedalIcon(idx)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{template.title}</p>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {template.downloads_count.toLocaleString("pt-BR")} downloads
                </span>
              </Link>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum template disponível ainda
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Prompts */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Prompts Recentes
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/prompts" className="text-xs">
              Ver todos
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingPrompts ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))
          ) : recentPrompts && recentPrompts.length > 0 ? (
            recentPrompts.map((prompt, idx) => (
              <Link
                key={prompt.id}
                to="/prompts"
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.01] ${getMedalBg(idx)}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/50">
                  {getMedalIcon(idx)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{prompt.title}</p>
                </div>
                <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {prompt.category}
                </span>
              </Link>
            ))
          ) : (
            <div className="py-8 text-center">
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
