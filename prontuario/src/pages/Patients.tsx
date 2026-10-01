import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownAZ,
  CalendarClock,
  Cake,
  Columns3,
  Filter,
  LayoutGrid,
  List,
  Phone,
  Search,
  Star,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, type DragEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, WhatsAppIcon } from "@/components/ui/Button";
import { Avatar, EmptyState, Menu, ProgressRing, Segmented, TagChip } from "@/components/ui/misc";
import { STAGES, stageById } from "@/lib/constants";
import { birthdayIn, financialSituation, lastVisit, nextAppointment, patientAlerts, recallDue, treatmentTotals } from "@/lib/derive";
import type { Appointment, Patient, Stage } from "@/lib/types";
import { ageLabel, cn, digits, fmtDate, formatPhone, money, normalize, toDate, whatsappLink } from "@/lib/utils";
import { useStore } from "@/store/store";
import { useUI } from "@/store/ui";
import { PatientContactAlert } from "@/components/ContactAlerts";

type SortKey = "nome" | "nome_desc" | "ultima" | "proxima" | "cadastro" | "saldo" | "idade";
type View = "cards" | "lista" | "quadro";

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

function PatientCard({ r }: { r: Row }) {
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const stage = stageById(r.p.stage);
  const wa = whatsappLink(r.p.phone);
  const finance = financialSituation(r.p);
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card group relative flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-jade-300 hover:shadow-lift">
      <button
        onClick={() => toggleFavorite(r.p.id)}
        className={cn("absolute right-3 top-3 rounded-lg p-1.5 transition", r.p.favorite ? "text-amber-400" : "text-ink-3 opacity-0 hover:text-amber-400 group-hover:opacity-100")}
        title={r.p.favorite ? "Remover dos favoritos" : "Favoritar"}
      >
        <Star className="h-4 w-4" fill={r.p.favorite ? "currentColor" : "none"} />
      </button>
      <Link to={`/pacientes/${r.p.id}`} className="flex items-center gap-3 pr-6">
        <Avatar patient={r.p} size={48} />
        <div className="min-w-0">
          <p className="truncate font-bold text-ink" data-sensitive>
            {r.p.name}
          </p>
          <p className="text-xs text-ink-3">{[ageLabel(r.p.birthDate), r.p.insurance].filter(Boolean).join(" · ") || "—"}</p>
        </div>
      </Link>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="chip" style={{ background: `${stage.color}18`, color: stage.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: stage.color }} />
          {stage.label}
        </span>
        {r.p.tags.map((t) => (
          <TagChip key={t} name={t} small />
        ))}
      </div>
      {r.alerts.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{r.alerts.join(" · ")}</span>
        </p>
      )}
      <PatientContactAlert patient={r.p} />
      <div className="mt-auto grid grid-cols-2 gap-2 pt-4 text-xs">
        <div className="rounded-xl bg-surface-2 px-3 py-2">
          <p className="text-ink-3">Última visita</p>
          <p className="font-bold text-ink">{r.last ? fmtDate(r.last, "dd/MM/yy") : "—"}</p>
        </div>
        <div className="rounded-xl bg-surface-2 px-3 py-2">
          <p className="text-ink-3">Próxima</p>
          <p className={cn("font-bold", r.next ? "text-brand" : "text-ink")}>{r.next ? fmtDate(r.next.start, "dd/MM HH:mm") : "—"}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {r.p.treatments.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <ProgressRing value={r.progress} size={30} stroke={4} />
            <span>{Math.round(r.progress * 100)}% do plano</span>
          </div>
        )}
        <div className="ml-auto flex gap-1">
          <span className={cn("chip", finance.id === "paid" ? "bg-jade-100 text-jade-800" : finance.id === "receivable" || finance.id === "mixed" ? "bg-amber-100 text-amber-800" : finance.id === "proposal" ? "bg-sky-100 text-sky-800" : "bg-surface-2 text-ink-3")}>{finance.label}{finance.amount > 0 ? ` · ${money(finance.amount)}` : ""}{finance.id === "mixed" ? ` + ${money(finance.proposal)} não aprovados` : ""}</span>
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-[#25D366] transition hover:bg-[#25D366]/10" title="WhatsApp">
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ListView({ rows }: { rows: Row[] }) {
  const navigate = useNavigate();
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  return (
    <div className="card overflow-hidden">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2/70 text-left text-[11px] font-bold uppercase tracking-wider text-ink-3">
              <th className="w-10 px-4 py-3" />
              <th className="px-2 py-3">Paciente</th>
              <th className="px-3 py-3">Telefone</th>
              <th className="px-3 py-3">Etapa</th>
              <th className="px-3 py-3">Última visita</th>
              <th className="px-3 py-3">Próxima</th>
              <th className="px-3 py-3 text-right">Situação financeira</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const stage = stageById(r.p.stage);
              const finance = financialSituation(r.p);
              return (
                <tr key={r.p.id} onClick={() => navigate(`/pacientes/${r.p.id}`)} className="cursor-pointer border-b border-line/60 transition last:border-0 hover:bg-brand-soft/30">
                  <td className="px-4 py-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(r.p.id);
                      }}
                      className={r.p.favorite ? "text-amber-400" : "text-line hover:text-amber-400"}
                    >
                      <Star className="h-4 w-4" fill={r.p.favorite ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar patient={r.p} size={34} />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-semibold text-ink" data-sensitive>
                          {r.p.name}
                          {r.alerts.length > 0 && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500" />}
                        </p>
                        <p className="text-xs text-ink-3">{ageLabel(r.p.birthDate) || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-ink-2" data-sensitive>
                    {formatPhone(r.p.phone) || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="chip" style={{ background: `${stage.color}18`, color: stage.color }}>
                      {stage.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-ink-2">{r.last ? fmtDate(r.last) : "—"}</td>
                  <td className="px-3 py-2.5 font-semibold text-brand">{r.next ? fmtDate(r.next.start, "dd/MM HH:mm") : <span className="font-normal text-ink-3">—</span>}</td>
                  <td className={cn("px-3 py-2.5 text-right font-semibold", finance.id === "receivable" || finance.id === "mixed" ? "text-amber-600" : finance.id === "paid" ? "text-jade-600" : "text-ink-3")}>{finance.label}{finance.amount > 0 ? ` · ${money(finance.amount)}` : ""}{finance.id === "mixed" ? ` + ${money(finance.proposal)} não aprovados` : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BoardView({ rows }: { rows: Row[] }) {
  const setStage = useStore((s) => s.setStage);
  const [over, setOver] = useState<Stage | null>(null);
  const onDrop = (e: DragEvent, stage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/patient");
    if (id) setStage(id, stage);
    setOver(null);
  };
  return (
    <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-4 lg:-mx-8 lg:px-8">
      <div className="flex min-w-max gap-4">
        {STAGES.map((st) => {
          const items = rows.filter((r) => r.p.stage === st.id);
          return (
            <div
              key={st.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(st.id);
              }}
              onDragLeave={() => setOver((o) => (o === st.id ? null : o))}
              onDrop={(e) => onDrop(e, st.id)}
              className={cn(
                "flex w-[280px] flex-col rounded-2xl border bg-surface-2/60 p-3 transition",
                over === st.id ? "border-jade-400 bg-brand-soft/40 shadow-glow" : "border-line",
              )}
            >
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: st.color }} />
                <p className="flex-1 text-sm font-bold text-ink">{st.label}</p>
                <span className="rounded-md bg-surface px-1.5 py-0.5 text-xs font-bold text-ink-3">{items.length}</span>
              </div>
              <p className="-mt-2 mb-3 px-1 text-[11px] text-ink-3">{st.hint}</p>
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
                      <Link
                        to={`/pacientes/${r.p.id}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/patient", r.p.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="block cursor-grab rounded-xl border border-line bg-surface p-3 shadow-sm transition hover:border-jade-300 hover:shadow-card active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar patient={r.p} size={32} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink" data-sensitive>
                              {r.p.name}
                            </p>
                            <p className="truncate text-[11px] text-ink-3">{r.next ? `Próx.: ${fmtDate(r.next.start, "dd/MM HH:mm")}` : ageLabel(r.p.birthDate) || "—"}</p>
                          </div>
                          {r.alerts.length > 0 && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500" />}
                          {r.p.favorite && <Star className="h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor" />}
                        </div>
                        {(r.p.tags.length > 0 || r.p.treatments.length > 0) && (
                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            {r.p.tags.slice(0, 2).map((t) => (
                              <TagChip key={t} name={t} small />
                            ))}
                            {r.p.treatments.length > 0 && (
                              <div className="ml-auto h-1.5 w-16 overflow-hidden rounded-full bg-line">
                                <div className="h-full rounded-full bg-jade-500" style={{ width: `${r.progress * 100}%` }} />
                              </div>
                            )}
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-line p-4 text-center text-xs text-ink-3">Arraste pacientes para cá</div>
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
  const tagDefs = useStore((s) => s.settings.tags);
  const recallMonths = useStore((s) => s.settings.recallMonths);
  const openPatientModal = useUI((s) => s.openPatientModal);
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [view, setViewState] = useState<View>(() => lsGet("pront:view", "cards") as View);
  const [sort, setSortState] = useState<SortKey>(() => lsGet("pront:sort", "nome") as SortKey);
  const stageFilter = (params.get("etapa") as Stage | null) ?? null;
  const [tags, setTags] = useState<string[]>([]);
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
      .filter((p) => !nq || normalize(p.name).includes(nq) || (dq.length >= 3 && (digits(p.phone).includes(dq) || digits(p.cpf).includes(dq))) || p.tags.some((t) => normalize(t).includes(nq)))
      .filter((p) => view === "quadro" || !stageFilter || p.stage === stageFilter)
      .filter((p) => tags.every((t) => p.tags.includes(t)))
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
  }, [patients, appointments, q, stageFilter, tags, quick, sort, view, recallMonths]);

  const stageCounts = useMemo(() => {
    const c: Record<string, number> = {};
    patients.filter((p) => !p.archived).forEach((p) => (c[p.stage] = (c[p.stage] ?? 0) + 1));
    return c;
  }, [patients]);

  const activeCount = patients.filter((p) => !p.archived).length;
  const hasFilters = !!q || !!stageFilter || tags.length > 0 || !!quick;
  const bdays = patients.filter((p) => birthdayIn(p, 0) === 0).length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Pacientes</h1>
          <p className="mt-1 text-sm text-ink-3">
            {activeCount} pacientes ativos{bdays ? ` · ${bdays} aniversariante${bdays > 1 ? "s" : ""} hoje 🎂` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "cards", label: <span className="max-sm:hidden">Cartões</span>, icon: <LayoutGrid className="h-4 w-4" /> },
              { value: "lista", label: <span className="max-sm:hidden">Lista</span>, icon: <List className="h-4 w-4" /> },
              { value: "quadro", label: <span className="max-sm:hidden">Quadro</span>, icon: <Columns3 className="h-4 w-4" /> },
            ]}
          />
          <Button onClick={() => openPatientModal()} icon={<UserPlus className="h-4 w-4" />}>
            <span className="max-sm:hidden">Novo paciente</span>
          </Button>
        </div>
      </div>

      {/* Busca e filtros */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input className="input h-11 pl-10" placeholder="Buscar por nome, telefone, CPF ou etiqueta…" value={q} onChange={(e) => setQ(e.target.value)} />
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
              <Button variant={quick || tags.length ? "soft" : "secondary"} icon={<Filter className="h-4 w-4" />}>
                Filtros{quick || tags.length ? ` (${(quick ? 1 : 0) + tags.length})` : ""}
              </Button>
            )}
            items={[
              ...QUICK.map((f) => ({ label: f.label, icon: <f.icon className="h-4 w-4" />, onClick: () => setQuick(quick === f.id ? null : f.id), checked: quick === f.id })),
              "divider" as const,
              ...tagDefs.map((t) => ({
                label: t.name,
                icon: <span className="block h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />,
                onClick: () => setTags((cur) => (cur.includes(t.name) ? cur.filter((x) => x !== t.name) : [...cur, t.name])),
                checked: tags.includes(t.name),
              })),
            ]}
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

      {(quick || tags.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-ink-3">Filtrando:</span>
          {quick && (
            <button onClick={() => setQuick(null)} className="chip bg-brand-soft text-brand-ink">
              {QUICK.find((f) => f.id === quick)?.label} ×
            </button>
          )}
          {tags.map((t) => (
            <TagChip key={t} name={t} onRemove={() => setTags(tags.filter((x) => x !== t))} />
          ))}
        </div>
      )}

      <div className="mt-6">
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
                      setTags([]);
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
        ) : view === "cards" ? (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <AnimatePresence>
              {rows.map((r) => (
                <PatientCard key={r.p.id} r={r} />
              ))}
            </AnimatePresence>
          </motion.div>
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
