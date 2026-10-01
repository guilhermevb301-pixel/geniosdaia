import { Link } from "react-router-dom";
import { useStore } from "@/store/store";
import { reminderAttention } from "@/lib/reminders";
import type { Patient } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";
import { useClock } from "@/lib/useClock";

export function PatientContactAlert({ patient }: { patient: Patient }) {
  useClock();
  const urgent = patient.reminders.filter(r => reminderAttention(r));
  if (!urgent.length) return null;
  return <Link to={`/pacientes/${patient.id}?aba=lembretes`} className="mt-3 block rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">⚠ {reminderAttention(urgent[0])}: {urgent[0].title}{urgent.length > 1 ? ` (+${urgent.length - 1})` : ""}<span className="block underline mt-1">Ver lembrete e entrar em contato →</span></Link>;
}

export function ContactAlerts() {
  useClock();
  const patients = useStore(s => s.patients);
  const urgent = patients.filter(p => !p.archived).flatMap(p => p.reminders.filter(r => reminderAttention(r)).map(r => ({ p, r }))).sort((a, b) => a.r.dueAt.localeCompare(b.r.dueAt));
  if (!urgent.length) return null;
  return <div className="mx-4 mt-4 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100 lg:mx-8">
    <details><summary className="cursor-pointer font-bold">⚠ {urgent.length} lembrete(s) pedindo atenção — hoje, próximos 3 dias ou atrasados</summary>
      <div className="mt-3 space-y-3">{urgent.map(({ p, r }) => <div key={`${p.id}-${r.id}`} className="flex flex-wrap gap-3 items-center border-t border-rose-200 pt-3"><Link className="flex-1" to={`/pacientes/${p.id}?aba=lembretes`}><b data-sensitive>{p.name}</b><span className="block text-sm">{reminderAttention(r)} · {r.title}</span><span className="underline text-sm">Abrir lembrete</span></Link>{whatsappLink(p.phone) && <a className="rounded-xl border border-rose-300 px-3 py-2 font-semibold text-sm" target="_blank" rel="noreferrer" href={whatsappLink(p.phone, `Olá, ${p.name.split(" ")[0]}! Aqui é do consultório do Dr. Mizael. Podemos conversar sobre seu acompanhamento?`) || undefined}>Entrar em contato</a>}</div>)}</div>
    </details>
  </div>;
}
