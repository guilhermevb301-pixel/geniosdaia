import { Link } from "react-router-dom";
import { ArrowRight, Radio } from "lucide-react";
import { nextLiveEvent } from "@/data/liveEvents";

export function NextLiveCard() {
  const event = nextLiveEvent();
  if (!event) return null;

  return (
    <Link
      to="/eventos"
      className="interactive-surface focus-ring group/live flex min-h-[132px] flex-col justify-between p-5"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div className="surface-raised flex h-11 w-11 shrink-0 flex-col items-center justify-center text-center">
          <span className="text-sm font-semibold leading-none">{event.date.split(" ")[0]}</span>
          <span className="text-[10px] leading-none text-muted-foreground">
            {event.date.split(" ")[1]}
          </span>
        </div>
        <div className="min-w-0">
          <span className="micro-label flex items-center gap-1.5 text-muted-foreground">
            <Radio className="h-3 w-3" />
            Próxima live
          </span>
          <h2 className="mt-2 line-clamp-2 text-base text-foreground">{event.title}</h2>
        </div>
      </div>

      <span className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        {event.time}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/live:translate-x-1" />
      </span>
    </Link>
  );
}
