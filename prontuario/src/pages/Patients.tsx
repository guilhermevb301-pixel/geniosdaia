import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownAZ,
  CalendarClock,
  Cake,
  Columns3,
  Filter,
  List,
  Phone,
  Search,
  Star,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, WhatsAppIcon } from "@/components/ui/Button";
import { Avatar, EmptyState, Menu, Segmented } from "@/components/ui/misc";
import { STAGES, stageById } from "@/lib/constants";
import { birthdayIn, financialSituation, lastVisit, nextAppointment, normalizePatientsView, patientAgeGroup, patientAlerts, patientBoardMinimumWidth, patientCareSummary, patientContactAction, patientListMinimumWidth, recallDue, treatmentTotals, type PatientsView } from "@/lib/derive";
import { reminderAttention } from "@/lib/reminders";
import type { Appointment, Patient, Stage } from "@/lib/types";
import { ageLabel, cn, digits, fmtDate, formatPhone, money, normalize, toDate, whatsappLink } from "@/lib/utils";
import { useStore } from "@/store/store";
import { useUI } from "@/store/ui";

type SortKey = "nome" | "nome_desc" | "ultima" | "proxima" | "cadastro" | "saldo" | "idade";
type View = PatientsView;

const SORTS: { id: SortKey; label: string }[] = [
  { id: "nome", label: "Nome (A–Z)" },
  { id: "nome_desc", label: "Nome (Z–A)" },
  { id: "ultima", label: "Última consulta" },
  { id: "proxima", label: "Próxima consulta" },
  { id: "cadastro", label: "Cadastrados recentemente" },
  { id: "saldo", label: "Maior saldo a receber" },
  { id: "idade", label: "Idade" },
];

const QUICK = [
  { id: "alertas", label: "Com alertas médicos", icon: AlertTriangle },
  { id: "aniversario", label: "Aniversariantes do mês", icon: Cake },
  { id: "retorno", label: "Retorno pendente", icon: CalendarClock },
  { id: "favoritos", label: "Favoritos", icon: Star },
  { id: "arquivados", label: "Arquivados", icon: X },
] as const;
type Quick = (typeof QUICK)[number]["id"];

interface Row {
  p: Patient;
  last: Date | null;
  next: Appointment | null;
  balance: number;
  progress: number;
  alerts: string[];
}

function lsGet(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* ignore */
  }
}

function urgentReminder(patient: Patient) {
  return patient.reminders
    .filter((item) => reminderAttention(item))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0] ?? null;
}

function CareSummary({ patient }: { patient: Patient }) {
  const care = patientCareSummary(patient);
  if (!care.active && !care.followUp) {
    return <p className="text-xs text-ink-3">{patient.stage === "manutencao" ? "Aguardando definir o próximo retorno" : "Tratamento ainda não definido"}</p>;
  }
  return (
    <div className="space-y-2 text-xs">
      {care.active && <p><span className="font-bold text-ink-3">Tratando agora</span><span className="mt-0.5 block break-words font-semibold text-ink">{care.active}</span></p>}
      {care.followUp && <p><span className="font-bold text-violet-600">Acompanhamento</span><span className="mt-0.5 block break-words text-ink-2">{care.followUp}</span></p>}
    </div>
  );
}

function PlanProgress({ row }: { row: Row }) {
  if (!row.p.treatments.length) return <span className="text-xs text-ink-3">Sem plano</span>;
  const done = row.p.treatments.filter((item) => item.status === "concluido").length;
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 text-xs"><b className="text-ink">{Math.round(row.progress * 100)}%</b><span className="text-ink-3">{done} de {row.p.treatments.length}</span></div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-jade-500" style={{ width: `${row.progress * 100}%` }} /></div>
    </div>
  );
}

function FinanceSummary({ patient }: { patient: Patient }) {
  const finance = financialSituation(patient);
  const mainLabel = finance.id === "mixed" ? "A receber" : finance.id === "proposal" ? "Proposta ainda não aceita" : finance.label;
  return (
    <div className="text-xs">
      <p className={cn("font-bold", finance.id === "paid" ? "text-jade-600" : finance.id === "receivable" || finance.id === "mixed" ? "text-amber-700" : finance.id === "proposal" ? "text-sky-700" : "text-ink-3")}>{mainLabel}{finance.amount > 0 ? ` · ${money(finance.amount)}` : ""}</p>
      {finance.id === "mixed" && <p className="mt-0.5 text-ink-3">Proposta ainda não aceita · {money(finance.proposal)}</p>}
    </div>
  );
}

function ContactButton({ row, compact = false }: { row: Row; compact?: boolean }) {
  const settings = useStore((s) => s.settings);
  const href = whatsappLink(row.p.phone);
  if (!href) return <span className="text-xs text-ink-3">Sem telefone</span>;
  const action = patientContactAction(row.p, row.next);
  const firstName = row.p.name.split(" ")[0];
  const message = `Olá, ${firstName}! Aqui é do consultório do ${settings.title} ${settings.doctorName}. Entramos em contato sobre ${action.reason}. Podemos conversar?`;
  return (
    <a
      href={whatsappLink(row.p.phone, message) || href}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => event.stopPropagation()}
      className={cn("inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-2 text-xs font-bold text-[#168a45] transition hover:-translate-y-0.5 hover:bg-[#25D366]/15", compact && "w-full")}
      title={`WhatsApp: ${action.reason}`}
    >
      <WhatsAppIcon className="h-4 w-4" /> {action.label}
    </a>
  );
}

function PatientDetails({ row }: { row: Row }) {
  const reminder = urgentReminder(row.p);
  return (
    <>
      <CareSummary patient={row.p} />
      {row.alerts.length > 0 && <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-rose-50 px-2 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"><AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" /><span className="line-clamp-2">{row.alerts.join(" · ")}</span></p>}
      {reminder && <Link onClick={(event) => event.stopPropagation()} to={`/pacientes/${row.p.id}?aba=lembretes`} className="mt-2 block rounded-lg border border-rose-100 bg-rose-50/60 px-2 py-1.5 text-xs hover:border-rose-300 dark:border-rose-900 dark:bg-rose-950/30"><b className="text-rose-600">{reminderAttention(reminder)}</b><span className="ml-1 text-ink-2">{reminder.title}</span></Link>}
    </>
  );
}

function ListView({ rows }: { rows: Row[] }) {
  const navigate = useNavigate();
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  return (
    <div className="card overflow-hidden">
      <div className="scrollbar-thin overflow-x-auto">
        <div style={{ minWidth: patientListMinimumWidth() }} role="table" aria-label="Lista operacional de pacientes">
          <div role="row" className="grid grid-cols-[156px_minmax(210px,1fr)_128px_82px_150px_150px] gap-3 border-b border-line bg-surface-2/70 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-3">
            <span role="columnheader">Paciente</span><span role="columnheader">Tratamento e acompanhamento</span><span role="columnheader">Consultas</span><span role="columnheader">Plano</span><span role="columnheader">Financeiro</span><span role="columnheader">Próxima ação</span>
          </div>
          {rows.map((r) => {
            const stage = stageById(r.p.stage);
            return (
              <div
                key={r.p.id}
                role="row"
                tabIndex={0}
                aria-label={`Abrir prontuário de ${r.p.name}`}
                onClick={() => navigate(`/pacientes/${r.p.id}`)}
                onKeyDown={(event) => {
                  if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    navigate(`/pacientes/${r.p.id}`);
                  }
                }}
                className="grid cursor-pointer grid-cols-[156px_minmax(210px,1fr)_128px_82px_150px_150px] items-center gap-3 border-b border-line/60 px-3 py-3 transition last:border-0 hover:bg-brand-soft/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-jade-500"
              >
                <div role="cell" className="flex min-w-0 items-start gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(r.p.id); }} className={cn("mt-2 shrink-0", r.p.favorite ? "text-amber-400" : "text-line hover:text-amber-400")} title="Favoritar"><Star className="h-4 w-4" fill={r.p.favorite ? "currentColor" : "none"} /></button>
                  <Avatar patient={r.p} size={32} />
                  <div className="min-w-0"><p className="line-clamp-2 text-sm font-semibold leading-tight text-ink" data-sensitive>{r.p.name}</p><p className="mt-0.5 truncate text-[11px] text-ink-3">{[ageLabel(r.p.birthDate), formatPhone(r.p.phone)].filter(Boolean).join(" · ") || "—"}</p><span className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${stage.color}18`, color: stage.color }}>{stage.label}</span></div>
                </div>
                <div role="cell"><PatientDetails row={r} /></div>
                <div role="cell" className="space-y-2 text-xs"><p><span className="block text-ink-3">Última visita</span><b className="text-ink">{r.last ? fmtDate(r.last) : "—"}</b></p><p><span className="block text-ink-3">Próxima consulta</span><b className={r.next ? "text-brand" : "text-ink-3"}>{r.next ? fmtDate(r.next.start, "dd/MM HH:mm") : "Não agendada"}</b></p></div>
                <div role="cell"><PlanProgress row={r} /></div>
                <div role="cell"><FinanceSummary patient={r.p} /></div>
                <div role="cell"><ContactButton row={r} compact /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BoardView({ rows }: { rows: Row[] }) {
  return (
    <div className="scrollbar-thin -mx-4 overflow-x-auto px-2 pb-4 lg:-mx-5 lg:px-2">
      <div className="grid grid-cols-5 gap-2" style={{ minWidth: patientBoardMinimumWidth(STAGES.length) }}>
        {STAGES.map((st) => {
          const items = rows.filter((r) => r.p.stage === st.id);
          return (
            <div key={st.id} className="flex min-w-0 flex-col rounded-xl border border-line bg-surface-2/60 p-2">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: st.color }} />
                <p className="min-w-0 flex-1 text-xs font-bold leading-tight text-ink">{st.label}</p>
                <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-bold text-ink-3">{items.length}</span>
              </div>
              <p className="mb-2 line-clamp-2 min-h-7 text-[10px] leading-snug text-ink-3">{st.hint}</p>
              <div className="flex min-h-[120px] flex-1 flex-col gap-2">
                <AnimatePresence>
                  {items.map((r) => (
                    <motion.div
                      layout
                      key={r.p.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                    >
                      <article className="rounded-xl border border-line bg-surface p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-jade-300 hover:shadow-card">
                        <Link to={`/pacientes/${r.p.id}`} className="block">
                        <div className="flex items-center gap-2">
                          <Avatar patient={r.p} size={28} />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 min-h-8 text-xs font-semibold leading-tight text-ink" data-sensitive>
                              {r.p.name}
                            </p>
                            <p className="truncate text-[11px] text-ink-3">{[ageLabel(r.p.birthDate), patientAgeGroup(r.p)].filter(Boolean).join(" · ") || "—"}</p>
                          </div>
                          {r.alerts.length > 0 && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500" />}
                          {r.p.favorite && <Star className="h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor" />}
                        </div>
                        </Link>
                        <div className="mt-2 border-t border-line pt-2"><PatientDetails row={r} /></div>
                        <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-2 text-[11px]">
                          <p><span className="block text-ink-3">Última</span><b className="text-ink">{r.last ? fmtDate(r.last, "dd/MM/yy") : "—"}</b></p>
                          <p><span className="block text-ink-3">Próxima</span><b className={r.next ? "text-brand" : "text-ink-3"}>{r.next ? fmtDate(r.next.start, "dd/MM HH:mm") : "Não agendada"}</b></p>
                        </div>
                        <div className="mt-2 space-y-2"><PlanProgress row={r} /><FinanceSummary patient={r.p} /></div>
                        <div className="mt-2 grid gap-1.5"><Link to={`/pacientes/${r.p.id}`} className="flex min-h-9 items-center justify-center rounded-xl border border-line px-2 py-1.5 text-xs font-bold text-ink-2 hover:bg-surface-2">Abrir prontuário</Link><ContactButton row={r} compact /></div>
                      </article>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-line p-4 text-center text-xs text-ink-3">Os pacientes aparecem aqui automaticamente</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Patients() {
  const patients = useStore((s) => s.patients);
  const appointments = useStore((s) => s.appointments);
  const recallMonths = useStore((s) => s.settings.recallMonths);
  const openPatientModal = useUI((s) => s.openPatientModal);
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [view, setViewState] = useState<View>(() => normalizePatientsView(lsGet("pront:view", "quadro")));
  const [sort, setSortState] = useState<SortKey>(() => lsGet("pront:sort", "nome") as SortKey);
  const stageFilter = (params.get("etapa") as Stage | null) ?? null;
  const [quick, setQuick] = useState<Quick | null>(null);

  const setView = (v: View) => {
    setViewState(v);
    lsSet("pront:view", v);
  };
  const setSort = (s: SortKey) => {
    setSortState(s);
    lsSet("pront:sort", s);
  };
  const setStageFilter = (s: Stage | null) => {
    const next = new URLSearchParams(params);
    if (s) next.set("etapa", s);
    else next.delete("etapa");
    setParams(next, { replace: true });
  };

  const rows = useMemo<Row[]>(() => {
    const nq = normalize(q);
    const dq = digits(q);
    const list = patients
      .filter((p) => (quick === "arquivados" ? p.archived : !p.archived))
      .filter((p) => !nq || normalize(p.name).includes(nq) || (dq.length >= 3 && (digits(p.phone).includes(dq) || digits(p.cpf).includes(dq))))
      .filter((p) => view === "quadro" || !stageFilter || p.stage === stageFilter)
      .map<Row>((p) => {
        const t = treatmentTotals(p);
        return { p, last: lastVisit(p, appointments), next: nextAppointment(p.id, appointments), balance: t.balance, progress: t.progress, alerts: patientAlerts(p) };
      })
      .filter((r) => {
        if (quick === "alertas") return r.alerts.length > 0;
        if (quick === "favoritos") return r.p.favorite;
        if (quick === "aniversario") {
          const b = toDate(r.p.birthDate);
          return !!b && b.getMonth() === new Date().getMonth();
        }
        if (quick === "retorno") return Boolean(recallDue(r.p, appointments, recallMonths));
        return true;
      });
    const cmpName = (a: Row, b: Row) => a.p.name.localeCompare(b.p.name, "pt-BR");
    const sorters: Record<SortKey, (a: Row, b: Row) => number> = {
      nome: cmpName,
      nome_desc: (a, b) => -cmpName(a, b),
      ultima: (a, b) => (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0),
      proxima: (a, b) => (a.next ? toDate(a.next.start)!.getTime() : Infinity) - (b.next ? toDate(b.next.start)!.getTime() : Infinity) || cmpName(a, b),
      cadastro: (a, b) => b.p.createdAt.localeCompare(a.p.createdAt),
      saldo: (a, b) => b.balance - a.balance || cmpName(a, b),
      idade: (a, b) => (a.p.birthDate ?? "9999").localeCompare(b.p.birthDate ?? "9999"),
    };
    return list.sort((a, b) => Number(b.p.favorite) - Number(a.p.favorite) || sorters[sort](a, b));
  }, [patients, appointments, q, stageFilter, quick, sort, view, recallMonths]);

  const stageCounts = useMemo(() => {
    const c: Record<string, number> = {};
    patients.filter((p) => !p.archived).forEach((p) => (c[p.stage] = (c[p.stage] ?? 0) + 1));
    return c;
  }, [patients]);

  const activeCount = patients.filter((p) => !p.archived).length;
  const hasFilters = !!q || !!stageFilter || !!quick;
  const bdays = patients.filter((p) => birthdayIn(p, 0) === 0).length;

  return (
    <div className="mx-auto max-w-none px-3 py-4 lg:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Pacientes</h1>
          <p className="mt-1 text-sm text-ink-3">
            {activeCount} pacientes ativos{bdays ? ` · ${bdays} aniversariante${bdays > 1 ? "s" : ""} hoje 🎂` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "quadro", label: <span className="max-sm:hidden">Quadro</span>, icon: <Columns3 className="h-4 w-4" /> },
              { value: "lista", label: <span className="max-sm:hidden">Lista</span>, icon: <List className="h-4 w-4" /> },
            ]}
          />
          <Button onClick={() => openPatientModal()} icon={<UserPlus className="h-4 w-4" />}>
            <span className="max-sm:hidden">Novo paciente</span>
          </Button>
        </div>
      </div>

      {/* Busca e filtros */}
      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input className="input h-11 pl-10" placeholder="Buscar por nome, telefone ou CPF…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-3 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Menu
            align="right"
            trigger={() => (
              <Button variant="secondary" icon={<ArrowDownAZ className="h-4 w-4" />}>
                {SORTS.find((s) => s.id === sort)?.label}
              </Button>
            )}
            items={SORTS.map((s) => ({ label: s.label, onClick: () => setSort(s.id), checked: s.id === sort }))}
          />
          <Menu
            align="right"
            trigger={() => (
              <Button variant={quick ? "soft" : "secondary"} icon={<Filter className="h-4 w-4" />}>
                Filtros{quick ? " (1)" : ""}
              </Button>
            )}
            items={QUICK.map((f) => ({ label: f.label, icon: <f.icon className="h-4 w-4" />, onClick: () => setQuick(quick === f.id ? null : f.id), checked: quick === f.id }))}
          />
        </div>
      </div>

      {view !== "quadro" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setStageFilter(null)}
            className={cn("chip shrink-0 border px-3 py-1.5 text-xs", !stageFilter ? "border-jade-600 bg-jade-600 text-white" : "border-line bg-surface text-ink-2 hover:border-jade-300")}
          >
            Todos · {activeCount}
          </button>
          {STAGES.map((s) => (
            <button
              key={s.id}
              title={s.hint}
              onClick={() => setStageFilter(stageFilter === s.id ? null : s.id)}
              className={cn("chip shrink-0 border px-3 py-1.5 text-xs", stageFilter === s.id ? "border-transparent text-white" : "border-line bg-surface text-ink-2 hover:border-jade-300")}
              style={stageFilter === s.id ? { background: s.color } : undefined}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: stageFilter === s.id ? "#fff" : s.color }} />
              {s.label} · {stageCounts[s.id] ?? 0}
            </button>
          ))}
        </div>
      )}

      {stageFilter && view !== "quadro" && <p className="mt-3 text-sm text-ink-2">{stageById(stageFilter).hint}</p>}

      {quick && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-ink-3">Filtrando:</span>
          {quick && (
            <button onClick={() => setQuick(null)} className="chip bg-brand-soft text-brand-ink">
              {QUICK.find((f) => f.id === quick)?.label} ×
            </button>
          )}
        </div>
      )}

      <div className="mt-4">
        {rows.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title={hasFilters ? "Nenhum paciente encontrado" : "Nenhum paciente ainda"}
              description={hasFilters ? "Tente outra busca ou limpe os filtros." : "Cadastre o primeiro paciente para começar."}
              action={
                hasFilters ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQ("");
                      setQuick(null);
                      setStageFilter(null);
                    }}
                  >
                    Limpar filtros
                  </Button>
                ) : (
                  <Button onClick={() => openPatientModal()} icon={<UserPlus className="h-4 w-4" />}>
                    Cadastrar paciente
                  </Button>
                )
              }
            />
          </div>
        ) : view === "lista" ? (
          <ListView rows={rows} />
        ) : (
          <BoardView rows={rows} />
        )}
      </div>
      {view !== "quadro" && rows.length > 0 && (
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-3">
          <Phone className="h-3.5 w-3.5" /> Dica: aperte <kbd className="rounded border border-line px-1">Ctrl</kbd> + <kbd className="rounded border border-line px-1">K</kbd> para
          buscar um paciente de qualquer tela.
        </p>
      )}
    </div>
  );
}
