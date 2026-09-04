import { Check, MessageCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MentorshipStepper } from "@/components/mentoria/MentorshipStepper";

const EXPECTATIONS = [
  "Direção prática para o seu momento",
  "Prioridades claras para sair do excesso de informação",
  "Próximos passos que você consegue executar",
];

export default function Mentoria() {
  const handleComplete = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AppLayout>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(440px,1.2fr)] lg:gap-14">
        <section
          data-testid="mentoria-value-column"
          className="order-2 relative max-w-xl border-l border-claude/60 pl-5 lg:order-1 lg:sticky lg:top-28 lg:pl-8"
          aria-labelledby="mentorship-page-title"
        >
          <p className="micro-label text-claude">Mentoria individual</p>
          <h1 id="mentorship-page-title" className="mt-4 max-w-[13ch] text-3xl text-foreground sm:text-4xl">
            Clareza para transformar intenção em execução.
          </h1>
          <p className="mt-5 max-w-[50ch] text-base leading-relaxed text-muted-foreground">
            Uma conversa direta para organizar seu cenário, escolher o que merece foco e definir um caminho possível.
          </p>

          <div className="mt-9 border-t border-border pt-6">
            <p className="text-sm font-medium text-foreground">O que esperar</p>
            <ul className="mt-4 space-y-4">
              {EXPECTATIONS.map((expectation) => (
                <li key={expectation} className="flex items-start gap-3 text-muted-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <span>{expectation}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex items-center gap-3 border-t border-border pt-5 text-muted-foreground">
            <MessageCircle aria-hidden="true" className="h-4 w-4 text-primary" />
            <p>Três respostas rápidas. A conversa continua no WhatsApp.</p>
          </div>
        </section>

        <div data-testid="mentoria-stepper-column" className="order-1 min-w-0 lg:order-2">
          <MentorshipStepper onComplete={handleComplete} />
        </div>
      </div>
    </AppLayout>
  );
}
