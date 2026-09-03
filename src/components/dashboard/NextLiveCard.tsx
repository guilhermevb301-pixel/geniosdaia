import { Link } from "react-router-dom";
import { ArrowRight, Radio } from "lucide-react";
import { nextLiveEvent } from "@/data/liveEvents";

export function NextLiveCard() {
  const event = nextLiveEvent();
  if (!event) return null;

  return (
    <Link
      to="/eventos"
      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-6 py-4 transition-colors hover:border-primary/40"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-center">
          <span className="text-sm font-semibold leading-none">{event.date.split(" ")[0]}</span>
          <span className="text-[10px] leading-none text-muted-foreground">
            {event.date.split(" ")[1]}
          </span>
        </div>
        <div className="min-w-0">
          <p className="eyebrow mb-1 flex items-center gap-1.5 text-primary">
            <Radio className="h-3 w-3" />
            Próxima live · {event.time}
          </p>
          <p className="truncate text-[15px] font-medium">{event.title}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
