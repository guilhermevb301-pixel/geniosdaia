import { AlertTriangle, CheckCircle2, HeartPulse, Pill, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Field } from "@/components/ui/misc";
import { ANAMNESIS_CONDITIONS, ANAMNESIS_HABITS } from "@/lib/constants";
import { printAnamnesis } from "@/lib/print";
import type { Anamnesis, Patient } from "@/lib/types";
import { cn, fmtDate, nowISO } from "@/lib/utils";
import { useStore } from "@/store/store";

export function AnamnesisTab({ patient }: { patient: Patient }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const settings = useStore((s) => s.settings);
  const a = patient.anamnesis;
  const set = (patch: Partial<Anamnesis>) => updatePatient(patient.id, (p) => ({ anamnesis: { ...p.anamnesis, ...patch, updatedAt: nowISO() } }));
  const toggleCondition = (k: string) => set({ conditions: { ...a.conditions, [k]: !a.conditions[k] } });
  const toggleHabit = (k: string) => set({ habits: { ...a.habits, [k]: !a.habits[k] } });
  const yesCount = ANAMNESIS_CONDITIONS.filter((c) => a.conditions[c.key]).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <Card
        title="Histórico de saúde"
        icon={<HeartPulse className="h-5 w-5" />}
        action={
          <span className="flex items-center gap-1.5 text-xs text-ink-3">
            <CheckCircle2 className="h-3.5 w-3.5 text-jade-500" />
            {a.updatedAt ? `Atualizada em ${fmtDate(a.updatedAt)}` : "Salva automaticamente"}
          </span>
        }
      >
        <div className="p-5 pt-3">
          <p className="mb-3 text-sm text-ink-3">
            Toque para marcar. Itens em <b className="text-rose-600">vermelho</b> geram alerta em destaque no prontuário e na agenda.
            {yesCount > 0 && ` · ${yesCount} marcado${yesCount > 1 ? "s" : ""}`}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ANAMNESIS_CONDITIONS.map((c) => {
              const on = !!a.conditions[c.key];
              return (
                <button
                  key={c.key}
                  onClick={() => toggleCondition(c.key)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                    on
                      ? c.alert
                        ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                        : "border-jade-300 bg-jade-50 text-jade-800 dark:border-jade-700 dark:bg-jade-900/40 dark:text-jade-100"
                      : "border-line bg-surface text-ink-2 hover:border-jade-300",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition",
                      on ? (c.alert ? "border-rose-500 bg-rose-500" : "border-jade-500 bg-jade-500") : "border-line",
                    )}
                  >
                    {on && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </span>
                  <span className="flex-1 font-medium">{c.label}</span>
                  {c.alert && on && <AlertTriangle className="h-4 w-4 text-rose-500" />}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Alergias (descreva)" className="sm:col-span-2">
              <input
                className={cn("input", a.allergies && "border-rose-300 bg-rose-50/50 font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200")}
                value={a.allergies ?? ""}
                onChange={(e) => set({ allergies: e.target.value })}
                placeholder="Ex.: Penicilina, látex, dipirona…"
              />
            </Field>
            <Field label="Medicamentos em uso" className="sm:col-span-2">
              <textarea className="input" rows={2} value={a.medications ?? ""} onChange={(e) => set({ medications: e.target.value })} placeholder="Nome, dose e frequência" />
            </Field>
            <Field label="Cirurgias / internações">
              <input className="input" value={a.surgeries ?? ""} onChange={(e) => set({ surgeries: e.target.value })} />
            </Field>
            <Field label="Pressão arterial">
              <input className="input" value={a.bloodPressure ?? ""} onChange={(e) => set({ bloodPressure: e.target.value })} placeholder="12/8" />
            </Field>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card title="Queixa principal" icon={<Sparkles className="h-5 w-5" />}>
          <div className="space-y-4 p-5 pt-3">
            <textarea className="input" rows={3} value={a.complaint ?? ""} onChange={(e) => set({ complaint: e.target.value })} placeholder="O que trouxe o paciente ao consultório?" />
            <Field label="Última ida ao dentista">
              <input className="input" value={a.lastDentalVisit ?? ""} onChange={(e) => set({ lastDentalVisit: e.target.value })} placeholder="Ex.: há 2 anos" />
            </Field>
          </div>
        </Card>
        <Card title="Hábitos" icon={<Pill className="h-5 w-5" />}>
          <div className="flex flex-wrap gap-2 p-5 pt-3">
            {ANAMNESIS_HABITS.map((h) => {
              const on = !!a.habits[h.key];
              return (
                <button
                  key={h.key}
                  onClick={() => toggleHabit(h.key)}
                  className={cn("chip border px-3 py-1.5 text-xs transition", on ? "border-jade-500 bg-jade-600 text-white" : "border-line bg-surface text-ink-2 hover:border-jade-300")}
                >
                  {on && "✓ "}
                  {h.label}
                </button>
              );
            })}
          </div>
        </Card>
        <Card title="Observações" icon={<HeartPulse className="h-5 w-5" />}>
          <div className="p-5 pt-3">
            <textarea className="input" rows={4} value={a.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} placeholder="Outras informações relevantes" />
          </div>
        </Card>
        <Button variant="secondary" className="w-full" icon={<Printer className="h-4 w-4" />} onClick={() => printAnamnesis(patient, settings)}>
          Imprimir ficha de anamnese para assinatura
        </Button>
      </div>
    </div>
  );
}
