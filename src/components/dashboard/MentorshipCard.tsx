import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export function MentorshipCard() {
  return (
    <Link
      to="/mentoria"
      aria-label="Aplicar para mentoria"
      className="interactive-surface focus-ring group relative flex min-h-[132px] flex-col justify-between overflow-hidden p-5"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-5 left-0 w-px bg-claude/70"
      />

      <div>
        <span className="micro-label text-claude">Mentoria individual</span>
        <h2 className="mt-2 max-w-[20ch] text-lg text-foreground">
          Transforme o plano em execução
        </h2>
      </div>

      <span className="mt-5 inline-flex items-center gap-1.5 font-medium text-primary">
        Aplicar agora
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}
