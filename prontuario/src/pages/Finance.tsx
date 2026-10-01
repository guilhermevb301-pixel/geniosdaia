import { format, isSameMonth, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Banknote, CircleDollarSign, HandCoins, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { WhatsAppIcon } from "@/components/ui/Button";
import { Avatar, Card, EmptyState, Segmented } from "@/components/ui/misc";
import { PAYMENT_METHODS } from "@/lib/constants";
import { treatmentTotals } from "@/lib/derive";
import { openLink } from "@/lib/messages";
import type { Patient, Payment, PaymentMethod } from "@/lib/types";
import { cn, firstName, fmtDate, money, moneyShort, toDate, whatsappLink } from "@/lib/utils";
import { useStore } from "@/store/store";

const METHOD_COLORS: Record<PaymentMethod, string> = {
  pix: "#25A56F",
  credito: "#0EA5E9",
  debito: "#6366F1",
  dinheiro: "#F59E0B",
  convenio: "#14B8A6",
  boleto: "#94A3B8",
};

function Stat({ icon, label, value, hint, tone }: { icon: ReactNode; label: string; value: string; hint?: string; tone: string }) {
  return (
    <div className="card p-5">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white", tone)}>{icon}</div>
      <p className="mt-4 text-[13px] font-semibold text-ink-3">{label}</p>
      <p className="font-display text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

export function Finance() {
  const patients = useStore((s) => s.patients);
  const settings = useStore((s) => s.settings);
  const [range, setRange] = useState<"6" | "12">("6");
  const now = new Date();

  const data = useMemo(() => {
    const all: { p: Patient; x: Payment }[] = patients.flatMap((p) => p.payments.map((x) => ({ p, x })));
    const n = Number(range);
    const months = Array.from({ length: n }, (_, i) => {
      const m = startOfMonth(subMonths(now, n - 1 - i));
      const value = all.filter(({ x }) => isSameMonth(toDate(x.date)!, m)).reduce((s, { x }) => s + x.amount, 0);
      return { m, label: format(m, "MMM", { locale: ptBR }).replace(".", ""), value, current: i === n - 1 };
    });
    const month = months[months.length - 1].value;
    const prev = months[months.length - 2]?.value ?? 0;
    const periodTotal = months.reduce((s, m) => s + m.value, 0);
    const since = months[0].m;
    const byMethod = (Object.keys(PAYMENT_METHODS) as PaymentMethod[])
      .map((k) => ({ k, value: all.filter(({ x }) => x.method === k && toDate(x.date)! >= since).reduce((s, { x }) => s + x.amount, 0) }))
      .filter((m) => m.value > 0)
      .sort((a, b) => b.value - a.value);
    const debtors = patients
      .filter((p) => !p.archived)
      .map((p) => ({ p, t: treatmentTotals(p) }))
      .filter((x) => x.t.balance > 0)
      .sort((a, b) => b.t.balance - a.t.balance);
    const receivable = debtors.reduce((s, d) => s + d.t.balance, 0);
    const pipeline = patients.filter((p) => !p.archived).reduce((s, p) => s + treatmentTotals(p).planned, 0);
    const recent = [...all].sort((a, b) => b.x.date.localeCompare(a.x.date)).slice(0, 12);
    const countMonth = all.filter(({ x }) => isSameMonth(toDate(x.date)!, now)).length;
    return { months, month, prev, periodTotal, byMethod, debtors, receivable, pipeline, recent, countMonth };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients, range]);

  const max = Math.max(1, ...data.months.map((m) => m.value));
  const growth = data.prev ? ((data.month - data.prev) / data.prev) * 100 : 0;
  const methodTotal = data.byMethod.reduce((s, m) => s + m.value, 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 lg:px-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Financeiro</h1>
        <p className="mt-1 text-sm text-ink-3">Dinheiro recebido, valores a receber e propostas que ainda não foram aprovadas.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat
          icon={<Banknote className="h-5 w-5" />}
          tone="bg-jade-600"
          label={`Recebido em ${format(now, "MMMM", { locale: ptBR })}`}
          value={moneyShort(data.month)}
          hint={data.prev ? `${growth >= 0 ? "▲" : "▼"} ${Math.abs(growth).toFixed(0)}% vs. mês anterior` : `${data.countMonth} pagamentos`}
        />
        <Stat icon={<HandCoins className="h-5 w-5" />} tone="bg-amber-500" label="A receber" value={moneyShort(data.receivable)} hint={`${data.debtors.length} pacientes com saldo`} />
        <Stat icon={<PiggyBank className="h-5 w-5" />} tone="bg-sky-500" label="Propostas não aprovadas" value={moneyShort(data.pipeline)} hint="não contam como dinheiro a receber" />
        <Stat icon={<TrendingUp className="h-5 w-5" />} tone="bg-violet-500" label={`Últimos ${range} meses`} value={moneyShort(data.periodTotal)} hint={`média ${moneyShort(data.periodTotal / Number(range))}/mês`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Faturamento mensal" icon={<CircleDollarSign className="h-5 w-5" />} action={<Segmented size="sm" value={range} onChange={setRange} options={[{ value: "6", label: "6 meses" }, { value: "12", label: "12 meses" }]} />}>
          <div className="flex h-64 items-end gap-2 px-5 pb-5 pt-4 sm:gap-3">
            {data.months.map((m, i) => (
              <div key={m.m.toISOString()} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-ink-2 opacity-0 transition group-hover:opacity-100 sm:opacity-100">{m.value ? moneyShort(m.value).replace("R$ ", "") : ""}</span>
                <div className="relative flex h-44 w-full items-end overflow-hidden rounded-xl bg-surface-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.value / max) * 100}%` }}
                    transition={{ delay: i * 0.04, type: "spring", damping: 20 }}
                    className={cn("w-full rounded-xl", m.current ? "bg-gradient-to-t from-jade-600 to-jade-400" : "bg-gradient-to-t from-jade-300 to-jade-200 dark:from-jade-800 dark:to-jade-700")}
                    title={money(m.value)}
                  />
                </div>
                <span className={cn("text-[11px] font-semibold capitalize", m.current ? "text-brand" : "text-ink-3")}>{m.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Formas de pagamento" icon={<Wallet className="h-5 w-5" />}>
          <div className="p-5 pt-3">
            {data.byMethod.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-3">Sem pagamentos no período.</p>
            ) : (
              <>
                <div className="flex h-4 overflow-hidden rounded-full">
                  {data.byMethod.map((m) => (
                    <div key={m.k} style={{ width: `${(m.value / methodTotal) * 100}%`, background: METHOD_COLORS[m.k] }} title={PAYMENT_METHODS[m.k]} />
                  ))}
                </div>
                <ul className="mt-5 space-y-3">
                  {data.byMethod.map((m) => (
                    <li key={m.k} className="flex items-center gap-3 text-sm">
                      <span className="h-3 w-3 rounded-full" style={{ background: METHOD_COLORS[m.k] }} />
                      <span className="flex-1 text-ink-2">{PAYMENT_METHODS[m.k]}</span>
                      <span className="text-xs text-ink-3">{((m.value / methodTotal) * 100).toFixed(0)}%</span>
                      <b className="w-28 text-right text-ink">{money(m.value)}</b>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Saldos a receber" icon={<HandCoins className="h-5 w-5" />}>
          <div className="space-y-1 p-3">
            {data.debtors.length === 0 && <EmptyState icon={<HandCoins className="h-7 w-7" />} title="Nenhum saldo em aberto" description="Todos os pacientes estão em dia. 🎉" />}
            {data.debtors.map(({ p, t }) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
                <Avatar patient={p} size={36} />
                <Link to={`/pacientes/${p.id}?aba=financeiro`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink" data-sensitive>
                    {p.name}
                  </p>
                  <div className="mt-1 h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-jade-500" style={{ width: `${Math.min(100, (t.paid / Math.max(1, t.total)) * 100)}%` }} />
                  </div>
                </Link>
                <b className="text-sm text-amber-600">{money(t.balance)}</b>
                {p.phone && (
                  <button
                    title="Lembrete de pagamento pelo WhatsApp"
                    onClick={() =>
                      openLink(
                        whatsappLink(
                          p.phone,
                          `Olá, ${firstName(p.name)}! Tudo bem? Aqui é do consultório do ${settings.title} ${settings.doctorName}. Passando para lembrar do saldo de ${money(t.balance)} referente ao seu tratamento. Qualquer dúvida estamos à disposição! 😊`,
                        ),
                      )
                    }
                    className="rounded-lg p-1.5 text-[#25D366] hover:bg-[#25D366]/10"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Últimos recebimentos" icon={<Banknote className="h-5 w-5" />}>
          <div className="space-y-1 p-3">
            {data.recent.length === 0 && <p className="py-8 text-center text-sm text-ink-3">Nenhum pagamento registrado.</p>}
            {data.recent.map(({ p, x }) => (
              <Link key={x.id} to={`/pacientes/${p.id}?aba=financeiro`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: METHOD_COLORS[x.method] }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink" data-sensitive>
                    {p.name}
                  </p>
                  <p className="truncate text-xs text-ink-3">
                    {fmtDate(x.date)} · {PAYMENT_METHODS[x.method]}
                    {x.description ? ` · ${x.description}` : ""}
                  </p>
                </div>
                <b className="text-sm text-jade-600">{money(x.amount)}</b>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
