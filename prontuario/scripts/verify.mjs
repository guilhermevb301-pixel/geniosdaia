import assert from "node:assert/strict";
import { build } from "esbuild";

// Bundle the actual TypeScript helpers; no browser, real patient, or cloud writes.
const result = await build({ stdin: { contents: 'export * from "./src/lib/finance"; export * from "./src/lib/reminders"; export { treatmentTotals, financialSituation, automaticPatientStage, patientAgeGroup } from "./src/lib/derive"; export { parseMoney } from "./src/lib/utils"; export { DEFAULT_SETTINGS, STAGES } from "./src/lib/constants";', resolveDir: process.cwd(), loader: "ts" }, bundle: true, write: false, platform: "node", format: "esm" });
const { splitInstallments, buildPaymentAgreement, installmentBalance, reminderAttention, installmentAttention, treatmentTotals, financialSituation, automaticPatientStage, patientAgeGroup, parseMoney, DEFAULT_SETTINGS, STAGES } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`✓ ${name}`); }

check("Perfil especializado sem preços inventados e etapas compatíveis com dados anteriores", () => {
  assert.equal(DEFAULT_SETTINGS.doctorName, "Mizael Magalhães Cardoso");
  assert.equal(new Set(DEFAULT_SETTINGS.procedures.map(p => p.id)).size, DEFAULT_SETTINGS.procedures.length);
  assert.ok(DEFAULT_SETTINGS.procedures.every(p => p.pricePending && p.price === 0));
  assert.equal(STAGES.find(s => s.id === "manutencao").label, "Em acompanhamento");
});

check("Valores brasileiros com ponto de milhar não viram um real", () => {
  for (const [input, expected] of [["1.000", 1000], ["1.250,50", 1250.5], ["R$ 2.500,00", 2500], ["150.50", 150.5], ["200,00", 200], ["0", 0]]) assert.equal(parseMoney(input), expected);
});

check("Texto inválido nunca vira cortesia ou apaga um valor", () => {
  for (const input of ["", "abc", "1,2,3", "R$", "2 reais", "1..000"]) assert.ok(Number.isNaN(parseMoney(input)), input);
});

check("Parcelas distribuem todos os centavos", () => {
  assert.deepEqual(splitInstallments(100, 3, "2026-01-31").map(i => i.amount), [33.34, 33.33, 33.33]);
  for (let count = 1; count <= 60; count++) {
    const parts = splitInstallments(9876.53, count, "2026-01-31");
    assert.equal(parts.reduce((sum, i) => sum + Math.round(i.amount * 100), 0), 987653);
  }
});
check("Vencimentos no dia 31 respeitam meses curtos sem mudar os seguintes", () => {
  assert.deepEqual(splitInstallments(100, 3, "2026-01-31").map(i => i.dueDate), ["2026-01-31", "2026-02-28", "2026-03-31"]);
  assert.equal(splitInstallments(100, 2, "2028-01-31")[1].dueDate, "2028-02-29");
});
check("Valores, datas e quantidades inválidos são rejeitados", () => {
  for (const args of [[0, 2, "2026-01-01"], [-1, 1, "2026-01-01"], [100, 0, "2026-01-01"], [100, 61, "2026-01-01"], [100, 1.5, "2026-01-01"], [0.01, 2, "2026-01-01"], [100, 2, "invalid"], [Infinity, 2, "2026-01-01"]]) assert.throws(() => splitInstallments(...args));
});
check("Pagamento parcial, quitação e exclusão recalculam a parcela", () => {
  const item = { id: "a", amount: 100 };
  const partial = [{ installmentId: "a", amount: 25 }, { installmentId: "other", amount: 500 }];
  assert.equal(installmentBalance(item, partial), 75);
  assert.equal(installmentBalance(item, [...partial, { installmentId: "a", amount: 75 }]), 0);
  assert.equal(installmentBalance(item, []), 100);
  assert.equal(installmentBalance(item, [{ installmentId: "a", amount: 101 }]), 0);
});
check("Acordo à vista ou parcelado cria somente vencimentos, nunca pagamentos", () => {
  assert.deepEqual(buildPaymentAgreement({ amount: 1000, mode: "avista", firstDueDate: "2026-10-10", today: "2026-10-01" }), [
    { label: "Pagamento à vista", amount: 1000, dueDate: "2026-10-10" },
  ]);
  assert.deepEqual(buildPaymentAgreement({ amount: 1000, mode: "parcelado", entry: 100, installments: 3, firstDueDate: "2026-11-10", today: "2026-10-01" }).map(i => [i.label, i.amount, i.dueDate]), [
    ["Entrada", 100, "2026-10-01"],
    ["Parcela 1/3", 300, "2026-11-10"],
    ["Parcela 2/3", 300, "2026-12-10"],
    ["Parcela 3/3", 300, "2027-01-10"],
  ]);
  assert.deepEqual(buildPaymentAgreement({ amount: 1000, mode: "depois", firstDueDate: "2026-10-10", today: "2026-10-01" }), []);
});
check("Acordo rejeita entrada maior que o valor e parcelamento sem saldo", () => {
  assert.throws(() => buildPaymentAgreement({ amount: 100, mode: "parcelado", entry: 101, installments: 1, firstDueDate: "2026-10-10", today: "2026-10-01" }));
  assert.throws(() => buildPaymentAgreement({ amount: 100, mode: "parcelado", entry: 100, installments: 1, firstDueDate: "2026-10-10", today: "2026-10-01" }));
});
check("Alertas: atrasado, hoje, amanhã, 3 dias; nunca concluídos ou além de 3 dias", () => {
  const now = new Date("2026-10-01T12:00:00");
  for (const [dueAt, expected] of [["2026-09-30", "Atrasado"], ["2026-10-01", "Hoje"], ["2026-10-02", "Amanhã"], ["2026-10-04", "Em 3 dias"], ["2026-10-05", null], ["invalid", null]]) {
    assert.equal(reminderAttention({ dueAt, done: false }, now), expected);
    assert.equal(reminderAttention({ dueAt, done: true }, now), null);
  }
});
check("Cobrança automática aparece um dia antes, no dia e depois do vencimento", () => {
  const installment = { id: "par_1", amount: 300, dueDate: "2026-10-02" };
  assert.deepEqual(installmentAttention(installment, [], new Date("2026-10-01T12:00:00")), { label: "Cobrar amanhã", severity: "warn" });
  assert.deepEqual(installmentAttention(installment, [], new Date("2026-10-02T12:00:00")), { label: "Vence hoje — cobrar", severity: "danger" });
  assert.deepEqual(installmentAttention(installment, [], new Date("2026-10-03T12:00:00")), { label: "Pagamento atrasado — cobrar", severity: "danger" });
  assert.equal(installmentAttention(installment, [], new Date("2026-09-30T12:00:00")), null);
  assert.equal(installmentAttention(installment, [{ installmentId: "par_1", amount: 300 }], new Date("2026-10-01T12:00:00")), null);
});
check("Criar parcelas não equivale a receber dinheiro; orçamento não aprovado não é cobrado", () => {
  const patient = { treatments: [{ status: "aprovado", price: 1000 }, { status: "planejado", price: 500 }], planDiscount: 10, payments: [], paymentSchedule: splitInstallments(900, 3, "2026-10-01") };
  assert.equal(treatmentTotals(patient).total, 900);
  assert.equal(treatmentTotals(patient).balance, 900);
  assert.equal(treatmentTotals(patient).paid, 0);
  assert.equal(treatmentTotals(patient).planned, 500);
  assert.equal(treatmentTotals({ ...patient, payments: [{ amount: 200 }] }).balance, 700);
});

check("Situação financeira nunca presume pagamento", () => {
  const base = { treatments: [], payments: [], planDiscount: 0 };
  assert.deepEqual(financialSituation(base), { id: "none", label: "Sem cobrança", amount: 0 });
  assert.deepEqual(financialSituation({ ...base, treatments: [{ status: "planejado", price: 500 }] }), { id: "proposal", label: "Ainda não aceito", amount: 500 });
  assert.deepEqual(financialSituation({ ...base, treatments: [{ status: "aprovado", price: 500 }] }), { id: "receivable", label: "A receber", amount: 500 });
  assert.deepEqual(financialSituation({ ...base, treatments: [{ status: "aprovado", price: 500 }, { status: "planejado", price: 900 }] }), { id: "mixed", label: "A receber + proposta", amount: 500, proposal: 900 });
  assert.deepEqual(financialSituation({ ...base, treatments: [{ status: "aprovado", price: 500 }], payments: [{ amount: 500 }] }), { id: "paid", label: "Pago", amount: 500 });
});

check("Etapa acompanha automaticamente o trabalho clínico sem confundir aprovação com pagamento", () => {
  const base = { stage: "avaliacao", treatments: [], payments: [] };
  assert.equal(automaticPatientStage(base), "avaliacao");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "planejado" }] }), "orcamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "aprovado" }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "andamento" }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "concluido" }] }), "manutencao");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "planejado" }, { status: "aprovado" }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "concluido" }, { status: "planejado" }] }), "orcamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "concluido" }, { status: "andamento" }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, stage: "concluido", treatments: [{ status: "concluido" }] }), "concluido");
  assert.equal(automaticPatientStage({ ...base, stage: "concluido", treatments: [{ status: "concluido" }, { status: "planejado" }] }), "orcamento");
  assert.equal(automaticPatientStage({ ...base, stage: "concluido", treatments: [{ status: "concluido" }, { status: "aprovado" }] }), "tratamento");
});

check("Faixa etária é calculada pela data de nascimento e não por etiqueta manual", () => {
  const today = new Date("2026-10-01T12:00:00");
  assert.equal(patientAgeGroup({ birthDate: "2010-10-02" }, today), "Criança");
  assert.equal(patientAgeGroup({ birthDate: "2008-10-01" }, today), "Adulto");
  assert.equal(patientAgeGroup({ birthDate: "1966-10-02" }, today), "Adulto");
  assert.equal(patientAgeGroup({ birthDate: "1966-10-01" }, today), "Idoso");
  assert.equal(patientAgeGroup({}, today), null);
  assert.equal(patientAgeGroup({ birthDate: "inválida" }, today), null);
});
console.log(`${checks} grupos de testes passaram.`);
