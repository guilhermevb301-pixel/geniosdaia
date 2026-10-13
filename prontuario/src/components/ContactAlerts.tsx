import { BellRing, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "@/store/store";
import { reminderAttention } from "@/lib/reminders";
import type { Patient } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";
import { useClock } from "@/lib/useClock";

export function PatientContactAlert({ patient }: { patient: Patient }) {
  useClock();
  const urgent = patient.reminders.filter(r => reminderAttention(r)).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  if (!urgent.length) return null;
  return <Link to={`/pacientes/${patient.id}?aba=lembretes`} className="mt-3 block rounded-xl border border-line bg-surface p-3 text-sm hover:border-jade-300"><span className="flex items-center gap-2 font-semibold text-rose-600"><BellRing className="h-4 w-4 shrink-0" />{reminderAttention(urgent[0])}{urgent.length > 1 ? ` · +${urgent.length - 1} lembretes` : ""}</span><span className="mt-1 block break-words text-ink">{urgent[0].title}</span><span className="mt-1 block text-brand font-semibold">Ver lembrete e entrar em contato</span></Link>;
}

export function ContactAlerts() {
  useClock();
  const patients = useStore(s => s.patients);
  const settings = useStore(s => s.settings);
  const urgent = patients.filter(p => !p.archived).flatMap(p => p.reminders.filter(r => reminderAttention(r)).map(r => ({ p, r }))).sort((a, b) => a.r.dueAt.localeCompare(b.r.dueAt));
  if (!urgent.length) return null;
  return <aside className="mx-4 mt-4 rounded-2xl border border-line bg-surface px-4 py-3 shadow-sm lg:mx-8" aria-label="Lembretes próximos e atrasados">
    <details className="group"><summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 text-sm [&::-webkit-details-marker]:hidden"><BellRing className="h-4 w-4 text-rose-600" /><b className="text-ink">Lembretes para acompanhar</b><span className="rounded-full bg-rose-50 px-2 py-0.5 font-bold text-rose-600 dark:bg-rose-950">{urgent.length}</span><span className="ml-auto flex items-center gap-2 font-semibold text-brand">Ver avisos<ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></span></summary>
      <p className="mt-3 text-sm text-ink-2">Atrasados, hoje e próximos 3 dias. Marque como concluído depois de resolver.</p>
      <div className="mt-3 space-y-3">{urgent.map(({ p, r }) => <div key={`${p.id}-${r.id}`} className="flex flex-wrap gap-3 items-center border-t border-line pt-3"><Link className="min-w-[180px] flex-1 break-words" to={`/pacientes/${p.id}?aba=lembretes`}><b data-sensitive>{p.name}</b><span className="block text-sm text-ink-2">{r.title}</span><span className="text-sm font-semibold text-rose-600">{reminderAttention(r)}</span></Link>{whatsappLink(p.phone) && <a className="rounded-xl border border-line px-3 py-2 font-semibold text-sm text-brand hover:bg-surface-2" target="_blank" rel="noreferrer" href={whatsappLink(p.phone, `Olá, ${p.name.split(" ")[0]}! Aqui é do consultório do ${settings.title} ${settings.doctorName}. Podemos conversar sobre seu acompanhamento?`) || undefined}>Entrar em contato</a>}</div>)}</div>
    </details>
  </aside>;
}
