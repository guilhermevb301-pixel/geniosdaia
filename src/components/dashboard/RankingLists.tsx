import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
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

function RankingCard({
  title,
  viewAllHref,
  isLoading,
  items,
  emptyLabel,
  renderMeta,
}: {
  title: string;
  viewAllHref: string;
  isLoading: boolean;
  items: { id: string; title: string }[] | null | undefined;
  emptyLabel: string;
  renderMeta: (item: { id: string; title: string }) => React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-medium">{title}</h3>
        <Link
          to={viewAllHref}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver todos
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-0.5">
          {items.map((item, idx) => (
            <Link
              key={item.id}
              to={viewAllHref}
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
            >
              <span className="w-4 shrink-0 text-xs text-muted-foreground tabular-nums">
                {idx + 1}
              </span>
              <span className="flex-1 truncate">{item.title}</span>
              {renderMeta(item)}
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-xs text-muted-foreground">{emptyLabel}</p>
      )}
    </div>
  );
}

export function RankingLists() {
  const { data: topTemplates, isLoading: loadingTemplates } = useQuery({
    queryKey: ["topTemplates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("templates")
        .select("id, title, downloads_count")
        .order("downloads_count", { ascending: false })
        .limit(4);
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
        .limit(4);
      return data as Prompt[] | null;
    },
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <RankingCard
        title="Top templates"
        viewAllHref="/templates"
        isLoading={loadingTemplates}
        items={topTemplates}
        emptyLabel="Nenhum template disponível ainda"
        renderMeta={(item) => (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {(item as Template).downloads_count.toLocaleString("pt-BR")}
          </span>
        )}
      />
      <RankingCard
        title="Prompts recentes"
        viewAllHref="/prompts"
        isLoading={loadingPrompts}
        items={recentPrompts}
        emptyLabel="Nenhum prompt disponível ainda"
        renderMeta={(item) => (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {(item as Prompt).category}
          </span>
        )}
      />
    </div>
  );
}
