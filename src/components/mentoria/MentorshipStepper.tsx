import { useState, type CSSProperties, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const WHATSAPP_NUMBER = "5571981939047";

const INTEREST_OPTIONS = [
  "Automatizações com IA",
  "Marketing Digital com IA",
  "Produto Digital / SaaS com IA",
  "Criação de Conteúdo com IA",
  "Renda Extra com IA",
  "Outro",
] as const;

const STEPS = ["name", "interest", "objective"] as const;

type StepKey = (typeof STEPS)[number];

export type MentorshipAnswers = {
  name: string;
  interest: string;
  objective: string;
};

type MentorshipStepperProps = {
  onComplete: (url: string) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export function buildMentorshipWhatsAppUrl(answers: MentorshipAnswers): string {
  const name = answers.name.trim();
  const interest = answers.interest.trim();
  const objective = answers.objective.trim();
  const message = `Olá, Gui! Meu nome é ${name}. Tenho interesse em ${interest}. Meu objetivo com a mentoria é ${objective}.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function MentorshipStepper({ onComplete }: MentorshipStepperProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<MentorshipAnswers>({
    name: "",
    interest: "",
    objective: "",
  });

  const stepNumber = stepIndex + 1;
  const currentStep = STEPS[stepIndex];
  const canContinue = answers[currentStep].trim().length > 0;

  const updateAnswer = (key: StepKey, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canContinue) return;

    if (stepIndex < STEPS.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    onComplete(buildMentorshipWhatsAppUrl(answers));
  };

  return (
    <section
      aria-labelledby="mentorship-stepper-title"
      className="surface relative overflow-hidden p-5 shadow-glow-sm sm:p-7"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-claude/70" />

      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <p id="mentorship-stepper-title" className="text-sm font-medium text-foreground">
            Qualificação rápida
          </p>
          <p aria-live="polite" className="micro-label text-muted-foreground">
            Etapa {stepNumber} de 3
          </p>
        </div>

        <div
          role="progressbar"
          aria-label="Progresso da aplicação"
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={stepNumber}
          aria-valuetext={`Etapa ${stepNumber} de 3`}
          className="mt-3 h-1 overflow-hidden rounded-full bg-secondary"
        >
          <div
            className="h-full origin-left scale-x-[var(--progress)] bg-[#34d399] transition-transform duration-300 motion-reduce:transition-none"
            style={{ "--progress": stepNumber / STEPS.length } as CSSProperties}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-[330px] flex-col">
        <div className="flex-1" key={currentStep}>
          {currentStep === "name" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="micro-label text-primary">Vamos começar</p>
                <Label htmlFor="mentorship-name" className="block text-xl text-foreground sm:text-2xl">
                  Qual é o seu nome?
                </Label>
                <p id="mentorship-name-help" className="max-w-[44ch] text-sm text-muted-foreground">
                  Quero saber com quem estou falando antes de entender o seu momento.
                </p>
              </div>
              <Input
                autoFocus
                id="mentorship-name"
                aria-describedby="mentorship-name-help"
                autoComplete="name"
                placeholder="Seu nome"
                value={answers.name}
                onChange={(event) => updateAnswer("name", event.target.value)}
                className="h-12 bg-background text-base"
                required
              />
            </div>
          )}

          {currentStep === "interest" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="micro-label text-primary">Seu foco</p>
                <Label htmlFor="mentorship-interest" className="block text-xl text-foreground sm:text-2xl">
                  Qual é a sua principal área de interesse?
                </Label>
                <p id="mentorship-interest-help" className="max-w-[44ch] text-sm text-muted-foreground">
                  Escolha o tema em que a orientação teria mais impacto agora.
                </p>
              </div>
              <div className="relative">
                <select
                  autoFocus
                  id="mentorship-interest"
                  aria-describedby="mentorship-interest-help"
                  value={answers.interest}
                  onChange={(event) => updateAnswer("interest", event.target.value)}
                  className="focus-ring h-12 w-full appearance-none rounded-md border border-input bg-background px-3 pr-10 text-base text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>
                    Selecione uma área
                  </option>
                  {INTEREST_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>
          )}

          {currentStep === "objective" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="micro-label text-primary">Resultado esperado</p>
                <Label htmlFor="mentorship-objective" className="block text-xl text-foreground sm:text-2xl">
                  Qual é o seu objetivo com a mentoria?
                </Label>
                <p id="mentorship-objective-help" className="max-w-[44ch] text-sm text-muted-foreground">
                  Conte onde você quer chegar e o que hoje está travando a execução.
                </p>
              </div>
              <Textarea
                autoFocus
                id="mentorship-objective"
                aria-describedby="mentorship-objective-help"
                placeholder="Ex.: quero criar meu primeiro agente de IA e vender para empresas locais."
                value={answers.objective}
                onChange={(event) => updateAnswer("objective", event.target.value)}
                className="min-h-[132px] resize-y bg-background text-base"
                required
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col-reverse items-stretch gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
          {stepIndex > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStepIndex((current) => current - 1)}
              className="h-11 w-full px-3 transition-[transform,opacity] motion-reduce:transition-none sm:w-auto"
            >
              <ArrowLeft aria-hidden="true" />
              Voltar
            </Button>
          )}

          <Button
            type="submit"
            disabled={!canContinue}
            className="h-11 w-full bg-[#34d399] px-5 text-[#052e27] transition-[transform,opacity] hover:bg-[#34d399] hover:opacity-90 motion-reduce:transition-none sm:ml-auto sm:w-auto"
          >
            {stepIndex === STEPS.length - 1 ? (
              <>
                <MessageCircle aria-hidden="true" />
                Conversar no WhatsApp
              </>
            ) : (
              <>
                Continuar
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
