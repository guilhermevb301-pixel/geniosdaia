import assert from "node:assert/strict";
import { build } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Bundle the actual TypeScript helpers; no browser, real patient, or cloud writes.
const result = await build({ stdin: { contents: 'export * from "./src/lib/finance"; export * from "./src/lib/reminders"; export * from "./src/lib/derive"; export * from "./src/lib/imageEdits"; export { buildDemoData } from "./src/lib/seed"; export { formatProfessionalCro, documentCity, renderDocumentBranding } from "./src/lib/print"; export { SessionGuard } from "./src/lib/sessionGuard"; export { freshAccountData, freshCloudSession, withDefaults } from "./src/store/store"; export { parseMoney } from "./src/lib/utils"; export { ATTACHMENT_CATEGORIES, DEFAULT_SETTINGS, STAGES } from "./src/lib/constants";', resolveDir: process.cwd(), loader: "ts" }, bundle: true, write: false, platform: "node", format: "esm" });
const { splitInstallments, buildPaymentAgreement, installmentBalance, buildPaymentRecord, reminderAttention, installmentAttention, treatmentTotals, financialSituation, automaticPatientStage, finishPendingReturns, appointmentToConfirm, patientAgeGroup, applyClinicalTreatmentStatus, toggleToothSelection, removeOdontogramMark, treatmentPriceTotal, sameTreatmentScope, appendOdontogramMark, appendProcedureDefinition, guessAttachmentCategory, patientCareSummary, patientContactAction, normalizePatientsView, patientBoardMinimumWidth, patientListMinimumWidth, emptyImageEdits, normalizeImageEdits, applyImageCommand, hasImageEdits, toNormalizedPoint, rotateNormalizedPoint, applyCropSelection, createImageEditHistory, pushImageEditHistory, undoImageEditHistory, redoImageEditHistory, formatProfessionalCro, documentCity, renderDocumentBranding, SessionGuard, freshAccountData, freshCloudSession, withDefaults, parseMoney, ATTACHMENT_CATEGORIES, DEFAULT_SETTINGS, STAGES, buildDemoData } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`✓ ${name}`); }

const identityResult = await build({ stdin: { contents: 'export { DoctorLoginIdentity } from "./src/components/DoctorLoginIdentity";', resolveDir: process.cwd(), loader: "tsx" }, bundle: true, write: false, platform: "node", format: "esm" });
const { DoctorLoginIdentity } = await import(`data:text/javascript;base64,${Buffer.from(identityResult.outputFiles[0].text).toString("base64")}`);

check("O login apresenta o retrato e a identidade profissional do Dr. Mizael", () => {
  const html = renderToStaticMarkup(createElement(DoctorLoginIdentity));
  assert.match(html, /<img[^>]+src="\/dr-mizael\.png"[^>]+alt="Dr\. Mizael Magalhães Cardoso"/);
  assert.match(html, /Cirurgia e Traumatologia Bucomaxilofacial/);
});

check("A lista antiga de cartões migra para o quadro sem deixar uma visualização inválida", () => {
  assert.equal(normalizePatientsView?.("cards"), "quadro");
  assert.equal(normalizePatientsView?.("lista"), "lista");
  assert.equal(normalizePatientsView?.("quadro"), "quadro");
  assert.equal(normalizePatientsView?.("desconhecida"), "quadro");
});

check("Quadro e lista cabem na largura útil de um Mac sem rolagem lateral", () => {
  assert.equal(patientBoardMinimumWidth?.(5), 952);
  assert.equal(patientListMinimumWidth?.(), 940);
  assert.ok(patientBoardMinimumWidth?.(5) <= 1012);
  assert.ok(patientListMinimumWidth?.() <= 1012);
});

check("O resumo separa o tratamento ativo do motivo real do acompanhamento", () => {
  const patient = {
    treatments: [
      { id: "feito", procedure: "Implante dentário", teeth: "46", status: "concluido", createdAt: "2026-08-01", completedAt: "2026-09-01" },
      { id: "ativo", procedure: "Extração de terceiro molar", teeth: "38", status: "andamento", createdAt: "2026-09-20" },
    ],
    reminders: [{ id: "ret", title: "Revisão do implante 46", dueAt: "2026-10-03", type: "retorno", done: false, createdAt: "2026-09-01" }],
  };
  assert.deepEqual(patientCareSummary?.(patient), {
    active: "Extração de terceiro molar · dente 38",
    proposed: null,
    followUp: "Revisão do implante 46",
    lastCompleted: "Implante dentário · dente 46",
  });
});

check("Procedimento concluído não inventa acompanhamento sem retorno explícito", () => {
  const patient = {
    treatments: [{ id: "feito", procedure: "Cirurgia de odontoma", status: "concluido", createdAt: "2026-08-01", completedAt: "2026-09-10" }],
    reminders: [],
  };
  assert.deepEqual(patientCareSummary?.(patient), { active: null, proposed: null, followUp: null, lastCompleted: "Cirurgia de odontoma" });
});

check("Proposta cadastrada aparece como proposta, não como tratamento indefinido", () => {
  const patient = {
    treatments: [{ id: "proposta", procedure: "Facetas em resina", teeth: "11, 12", status: "planejado", createdAt: "2026-10-01" }],
    reminders: [],
  };
  assert.deepEqual(patientCareSummary?.(patient), { active: null, proposed: "Facetas em resina · dentes 11, 12", followUp: null, lastCompleted: null });
});

check("Tratamento ativo e nova proposta permanecem separados no mesmo resumo", () => {
  const patient = {
    treatments: [
      { id: "ativo", procedure: "Implante", teeth: "46", status: "andamento", createdAt: "2026-09-01" },
      { id: "proposta", procedure: "Coroa", teeth: "46", status: "planejado", createdAt: "2026-10-01" },
    ],
    reminders: [],
  };
  const summary = patientCareSummary?.(patient);
  assert.equal(summary.active, "Implante · dente 46");
  assert.equal(summary.proposed, "Coroa · dente 46");
});

check("O contato aparece somente para lembrete, cobrança ou consulta realmente próximos", () => {
  const now = new Date("2026-10-01T12:00:00");
  const base = { name: "Ana Beatriz", treatments: [], reminders: [], paymentSchedule: [], payments: [] };
  assert.deepEqual(patientContactAction?.({ ...base, reminders: [{ title: "Enviar laudo", dueAt: "2026-10-01", done: false }] }, null, now), {
    kind: "reminder",
    label: "Entrar em contato",
    reason: "Lembrete para hoje: Enviar laudo",
    message: "Gostaríamos de conversar sobre seu atendimento. Podemos falar por aqui?",
  });
  assert.deepEqual(patientContactAction?.({ ...base, paymentSchedule: [{ id: "p1", label: "Parcela 1/2", amount: 500, dueDate: "2026-10-01" }] }, null, now), {
    kind: "payment",
    label: "Entrar em contato",
    reason: "Pagamento vence hoje: Parcela 1/2",
    message: "Gostaríamos de conversar sobre o pagamento da Parcela 1/2, que vence hoje. Podemos falar por aqui?",
  });
  assert.deepEqual(patientContactAction?.(base, { start: "2026-10-02T09:00:00", procedure: "Retorno", status: "agendado" }, now), {
    kind: "appointment",
    label: "Entrar em contato",
    reason: "Confirmar consulta de Retorno em 02/10 às 09:00",
    message: "Sua consulta de Retorno está marcada para 02/10 às 09:00. Podemos confirmar sua presença?",
  });
});

check("Contato não aparece só por existir tratamento, alta, retorno distante ou consulta já confirmada", () => {
  const now = new Date("2026-10-01T12:00:00");
  const base = { treatments: [], reminders: [], paymentSchedule: [], payments: [] };
  assert.equal(patientContactAction?.(base, null, now), null);
  assert.equal(patientContactAction?.({ ...base, treatments: [{ id: "t1", procedure: "Implante", status: "andamento", createdAt: "2026-09-01" }] }, null, now), null);
  assert.equal(patientContactAction?.({ ...base, treatments: [{ id: "t1", procedure: "Extração", status: "concluido", createdAt: "2026-09-01" }] }, null, now), null);
  assert.equal(patientContactAction?.(base, { start: "2026-10-05T09:00:00", procedure: "Retorno", status: "agendado" }, now), null);
  assert.equal(patientContactAction?.(base, { start: "2026-10-02T09:00:00", procedure: "Retorno", status: "confirmado" }, now), null);
});

check("Uma consulta confirmada não esconde outra consulta próxima que ainda exige confirmação", () => {
  const now = new Date("2026-10-01T08:00:00");
  const appointments = [
    { id: "a1", patientId: "p1", start: "2026-10-01T10:00:00", duration: 30, procedure: "Avaliação", status: "confirmado" },
    { id: "a2", patientId: "p1", start: "2026-10-02T09:00:00", duration: 30, procedure: "Retorno", status: "agendado" },
    { id: "a3", patientId: "p2", start: "2026-10-01T11:00:00", duration: 30, procedure: "Consulta", status: "agendado" },
  ];
  assert.equal(appointmentToConfirm?.("p1", appointments, now)?.id, "a2");
  assert.equal(appointmentToConfirm?.("p2", appointments, now)?.id, "a3");
  assert.equal(appointmentToConfirm?.("p3", appointments, now), null);
  assert.equal(appointmentToConfirm?.("p1", [{ ...appointments[1], start: "2026-10-01T07:00:00" }], now), null);
});

check("O motivo do contato descreve lembretes atrasados e futuros com português natural", () => {
  const now = new Date("2026-10-01T12:00:00");
  const base = { treatments: [], paymentSchedule: [], payments: [] };
  assert.equal(patientContactAction?.({ ...base, reminders: [{ title: "Pedir exame", dueAt: "2026-09-30", done: false }] }, null, now)?.reason, "Lembrete atrasado: Pedir exame");
  assert.equal(patientContactAction?.({ ...base, reminders: [{ title: "Confirmar retorno", dueAt: "2026-10-04", done: false }] }, null, now)?.reason, "Lembrete em 3 dias: Confirmar retorno");
});

check("Perfil especializado sem preços inventados e etapas compatíveis com dados anteriores", () => {
  assert.equal(DEFAULT_SETTINGS.doctorName, "Mizael Magalhães Cardoso");
  assert.equal(DEFAULT_SETTINGS.cro, "BA 3653");
  assert.equal(DEFAULT_SETTINGS.phone, "(71) 99961-3646");
  assert.equal(DEFAULT_SETTINGS.address, "Ed. Aero Empresarial, Sala 118 - Centro - Lauro de Freitas - BA");
  assert.match(DEFAULT_SETTINGS.documentFooter, /Cirurgia.*Implantes.*Próteses.*Odontologia Hospitalar.*Pacientes Especiais.*Atendimento Odontológico Domiciliar/);
  assert.equal(new Set(DEFAULT_SETTINGS.procedures.map(p => p.id)).size, DEFAULT_SETTINGS.procedures.length);
  assert.ok(DEFAULT_SETTINGS.procedures.every(p => p.pricePending && p.price === 0));
  assert.deepEqual(STAGES.map(s => s.id), ["avaliacao", "tratamento", "concluido"]);
  assert.equal(STAGES.find(s => s.id === "concluido").label, "Alta / Inativo");
});

check("Contas já existentes recebem os dados profissionais sem apagar personalizações", () => {
  const migrated = withDefaults?.({
    doctorName: "Mizael Cardoso",
    cro: "",
    specialty: "Cirurgia e Traumatologia Bucomaxilofacial",
    phone: "",
    address: "",
  });
  assert.equal(migrated.doctorName, DEFAULT_SETTINGS.doctorName);
  assert.equal(migrated.cro, DEFAULT_SETTINGS.cro);
  assert.equal(migrated.specialty, DEFAULT_SETTINGS.specialty);
  assert.equal(migrated.phone, DEFAULT_SETTINGS.phone);
  assert.equal(migrated.address, DEFAULT_SETTINGS.address);
  assert.equal(migrated.documentFooter, DEFAULT_SETTINGS.documentFooter);
  assert.equal(withDefaults?.({ cro: "BA 9999" }).cro, "BA 9999");
});

check("Uma conta nova começa totalmente vazia e separada da demonstração", () => {
  const account = freshAccountData?.();
  assert.deepEqual(account.patients, []);
  assert.deepEqual(account.appointments, []);
  assert.deepEqual(account.recent, []);
  assert.equal(account.onboarded, false);
  assert.equal(account.settings.doctorName, DEFAULT_SETTINGS.doctorName);
  assert.equal(account.settings.cro, DEFAULT_SETTINGS.cro);
  assert.notEqual(account.settings, DEFAULT_SETTINGS);
});

check("Trocar diretamente de usuário limpa os dados da conta anterior antes de carregar a próxima", () => {
  const next = freshCloudSession?.("usuario_b", "tio@example.com");
  assert.equal(next.userId, "usuario_b");
  assert.equal(next.userEmail, "tio@example.com");
  assert.equal(next.mode, "cloud");
  assert.equal(next.ready, false);
  assert.deepEqual(next.patients, []);
  assert.deepEqual(next.appointments, []);
  assert.deepEqual(next.recent, []);
  assert.equal(next.onboarded, false);
  assert.deepEqual(next.sync, { status: "idle", pending: 0 });
});

check("Operações assíncronas de uma sessão antiga são invalidadas na troca de conta", () => {
  const guard = SessionGuard ? new SessionGuard() : undefined;
  const accountA = guard.begin("usuario_a");
  assert.equal(guard.isCurrent(accountA), true);
  const accountB = guard.begin("usuario_b");
  assert.equal(guard.isCurrent(accountA), false);
  assert.equal(guard.isCurrent(accountB), true);
  assert.deepEqual(guard.current(), accountB);
  guard.clear();
  assert.equal(guard.isCurrent(accountB), false);
  assert.equal(guard.current(), null);
});

check("Todos os documentos recebem a identidade profissional completa e a cidade correta", () => {
  assert.equal(formatProfessionalCro?.("BA 3653"), "CRO-BA 3653");
  assert.equal(formatProfessionalCro?.("CRO BA 3653"), "CRO-BA 3653");
  assert.equal(documentCity?.(DEFAULT_SETTINGS.address), "Lauro de Freitas");
  const branding = renderDocumentBranding?.(DEFAULT_SETTINGS);
  assert.match(branding.header, /Dr\. Mizael Magalhães Cardoso/);
  assert.match(branding.header, /Cirurgia Bucomaxilofacial \/ PCD/);
  assert.match(branding.header, /CRO-BA 3653/);
  assert.match(branding.header, /\(71\) 99961-3646/);
  assert.match(branding.header, /Ed\. Aero Empresarial, Sala 118/);
  assert.match(branding.footer, /Cirurgia.*Implantes.*Próteses.*Odontologia Hospitalar.*Pacientes Especiais.*Atendimento Odontológico Domiciliar/);
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
  const base = { stage: "avaliacao", treatments: [], reminders: [], payments: [] };
  assert.equal(automaticPatientStage(base), "avaliacao");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "planejado" }] }), "avaliacao");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "aprovado" }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "andamento" }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "concluido" }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "concluido" }], reminders: [{ type: "retorno", done: false }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "concluido" }], reminders: [{ type: "retorno", done: true }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "planejado" }, { status: "aprovado" }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "concluido" }, { status: "planejado" }] }), "avaliacao");
  assert.equal(automaticPatientStage({ ...base, treatments: [{ status: "concluido" }, { status: "andamento" }] }), "tratamento");
  assert.equal(automaticPatientStage({ ...base, stage: "concluido", treatments: [{ status: "concluido" }] }), "concluido");
  assert.equal(automaticPatientStage({ ...base, stage: "concluido", treatments: [{ status: "concluido" }, { status: "planejado" }] }), "avaliacao");
  assert.equal(automaticPatientStage({ ...base, stage: "concluido", treatments: [{ status: "concluido" }, { status: "aprovado" }] }), "tratamento");
});

const demoData = await buildDemoData();
check("A demonstração usa apenas as três etapas e mantém o acompanhamento em tratamento", () => {
  const stages = Object.fromEntries(demoData.patients.map((patient) => [patient.name, patient.stage]));
  assert.equal(stages["Helena Duarte"], "tratamento");
  assert.equal(stages["Patrícia Gomes"], "tratamento");
  assert.equal(stages["Mariana Costa Ribeiro"], "concluido");
});

check("Dar alta conclui somente os retornos pendentes e preserva outros lembretes", () => {
  const reminders = [
    { id: "r1", type: "retorno", done: false },
    { id: "r2", type: "pagamento", done: false },
    { id: "r3", type: "retorno", done: true },
  ];
  assert.deepEqual(finishPendingReturns?.(reminders), [
    { id: "r1", type: "retorno", done: true },
    { id: "r2", type: "pagamento", done: false },
    { id: "r3", type: "retorno", done: true },
  ]);
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

check("Marcar um procedimento como realizado cria um único registro clínico vinculado", () => {
  const patient = {
    treatments: [{ id: "tr_1", procedure: "Implante dentário", teeth: "36", price: 2500, status: "andamento" }],
    evolutions: [],
  };
  const first = applyClinicalTreatmentStatus?.(patient, "tr_1", "concluido", {
    author: "Dr. Mizael",
    date: "2026-10-01",
    createdAt: "2026-10-01T12:00:00.000Z",
  });
  const repeated = applyClinicalTreatmentStatus?.({ ...patient, ...first }, "tr_1", "concluido", {
    author: "Dr. Mizael",
    date: "2026-10-01",
    createdAt: "2026-10-01T12:05:00.000Z",
  }) ?? { evolutions: [] };
  assert.equal(repeated.evolutions.length, 1);
  assert.equal(repeated.evolutions[0].treatmentId, "tr_1");
  assert.equal(repeated.evolutions[0].automatic, true);
});

check("Desfazer a realização remove apenas o registro clínico automático daquele procedimento", () => {
  const patient = {
    treatments: [{ id: "tr_1", procedure: "Implante dentário", price: 2500, status: "concluido" }],
    evolutions: [
      { id: "ev_auto", treatmentId: "tr_1", automatic: true, title: "Implante dentário realizado" },
      { id: "ev_manual", treatmentId: "tr_1", title: "Observação complementar" },
      { id: "ev_other", treatmentId: "tr_2", automatic: true, title: "Outro procedimento realizado" },
    ],
  };
  const result = applyClinicalTreatmentStatus?.(patient, "tr_1", "andamento", {
    author: "Dr. Mizael",
    date: "2026-10-01",
    createdAt: "2026-10-01T12:00:00.000Z",
  }) ?? { treatments: [], evolutions: [] };
  assert.equal(result.treatments[0].status, "andamento");
  assert.deepEqual(result.evolutions.map((item) => item.id), ["ev_manual", "ev_other"]);
});

check("A seleção do odontograma adiciona e remove vários dentes sem duplicar", () => {
  const first = toggleToothSelection?.([], 15) ?? [];
  const second = toggleToothSelection?.(first, 23) ?? [];
  const repeated = toggleToothSelection?.(second, 15) ?? [];
  assert.deepEqual(first, [15]);
  assert.deepEqual(second, [15, 23]);
  assert.deepEqual(repeated, [23]);
});

check("Clicar em uma marcação do dente remove somente aquela marcação", () => {
  const state = {
    whole: ["coroa", "canal", "custom:faceta"],
    faces: { O: "restauracao", V: "custom:desgaste" },
    note: "Sensibilidade ao frio",
  };
  assert.deepEqual(removeOdontogramMark?.(state, { scope: "tooth", value: "coroa" }), {
    whole: ["canal", "custom:faceta"],
    faces: { O: "restauracao", V: "custom:desgaste" },
    note: "Sensibilidade ao frio",
  });
  assert.deepEqual(removeOdontogramMark?.(state, { scope: "face", face: "O" }), {
    whole: ["coroa", "canal", "custom:faceta"],
    faces: { V: "custom:desgaste" },
    note: "Sensibilidade ao frio",
  });
});

check("Uma marcação personalizada válida é salva no catálogo do odontograma", () => {
  const marks = appendOdontogramMark?.([], { label: "  Faceta  ", color: "#8B5CF6", scope: "tooth" }, "custom:faceta");
  assert.deepEqual(marks, [{ id: "custom:faceta", label: "Faceta", color: "#8B5CF6", scope: "tooth" }]);
  assert.throws(() => appendOdontogramMark?.(marks, { label: "faceta", color: "#111111", scope: "face" }, "custom:outra"), /já existe/i);
  assert.throws(() => appendOdontogramMark?.([], { label: "Cárie", color: "#111111", scope: "face" }, "custom:carie"), /já existe/i);
  assert.throws(() => appendOdontogramMark?.([], { label: "", color: "vermelho", scope: "face" }, "custom:invalida"));
});

check("Um procedimento criado no plano fica disponível para os próximos pacientes", () => {
  const procedures = appendProcedureDefinition?.([], { name: "  Enxerto ósseo personalizado  ", category: " Cirurgia ", priceText: "1.250,00" }, "p_custom");
  assert.deepEqual(procedures, [{ id: "p_custom", name: "Enxerto ósseo personalizado", category: "Cirurgia", price: 1250, pricePending: false }]);
  const pending = appendProcedureDefinition?.(procedures, { name: "Sedação assistida", category: "Hospitalar", priceText: "" }, "p_pending");
  assert.equal(pending[1].pricePending, true);
  const withoutPriceField = appendProcedureDefinition?.(pending, { name: "Faceta personalizada", category: "Estética" }, "p_without_price");
  assert.deepEqual(withoutPriceField[2], { id: "p_without_price", name: "Faceta personalizada", category: "Estética", price: 0, pricePending: true });
  assert.throws(() => appendProcedureDefinition?.(pending, { name: "sedação assistida", category: "Outra", priceText: "100" }, "p_dup"), /já existe/i);
});

check("Modelos odontológicos têm categoria própria e são reconhecidos pelo nome", () => {
  assert.deepEqual(ATTACHMENT_CATEGORIES?.modelo, { label: "Modelo", color: "#A855F7" });
  assert.equal(guessAttachmentCategory?.("modelo-de-gesso-superior.jpg", "image/jpeg"), "modelo");
  assert.equal(guessAttachmentCategory?.("molde digital.jpg", "image/jpeg"), "modelo");
});

check("Edições de imagem são normalizadas sem alterar o original", () => {
  const base = emptyImageEdits?.();
  const rotated = applyImageCommand?.(base, { type: "rotate", degrees: 450 });
  assert.equal(rotated.rotation, 90);
  assert.equal(base.rotation, 0);

  const cropped = applyImageCommand?.(rotated, { type: "crop", crop: { x: -0.2, y: 0.1, width: 1.4, height: 0.8 } });
  assert.deepEqual(cropped.crop, { x: 0, y: 0.1, width: 1, height: 0.8 });
  const tiny = applyImageCommand?.(cropped, { type: "crop", crop: { x: 0.2, y: 0.2, width: 0.005, height: 0.5 } });
  assert.equal(tiny.crop, undefined);

  const annotations = [
    { id: "a1", kind: "freehand", color: "#FF0000", strokeWidth: 4, points: [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }] },
    { id: "a2", kind: "arrow", color: "#00FF00", strokeWidth: 3, start: { x: 0.2, y: 0.2 }, end: { x: 0.8, y: 0.8 } },
    { id: "a3", kind: "ellipse", color: "#0000FF", strokeWidth: 2, start: { x: 0.1, y: 0.1 }, end: { x: 0.4, y: 0.5 } },
    { id: "a4", kind: "rectangle", color: "#FFFFFF", strokeWidth: 2, start: { x: 0.4, y: 0.4 }, end: { x: 0.9, y: 0.9 } },
    { id: "a5", kind: "text", color: "#FFFF00", strokeWidth: 2, point: { x: 0.5, y: 0.5 }, text: "Lesão" },
  ];
  let marked = base;
  for (const annotation of annotations) marked = applyImageCommand?.(marked, { type: "add-annotation", annotation });
  assert.deepEqual(marked.annotations.map((item) => item.kind), ["freehand", "arrow", "ellipse", "rectangle", "text"]);
  assert.equal(base.annotations.length, 0);
  const noBlankText = applyImageCommand?.(marked, { type: "add-annotation", annotation: { id: "blank", kind: "text", color: "#FFF", strokeWidth: 2, point: { x: 0.1, y: 0.1 }, text: "   " } });
  assert.equal(noBlankText.annotations.length, 5);
  const removed = applyImageCommand?.(marked, { type: "remove-annotation", id: "a3" });
  assert.deepEqual(removed.annotations.map((item) => item.id), ["a1", "a2", "a4", "a5"]);
  assert.equal(hasImageEdits?.(applyImageCommand?.(marked, { type: "reset" })), false);
  assert.deepEqual(normalizeImageEdits?.(undefined), base);
  assert.equal("imageEdits" in { id: "old", mime: "image/jpeg" }, false);
});

check("Coordenadas e histórico do editor mantêm as marcações alinhadas", () => {
  assert.deepEqual(toNormalizedPoint?.({ x: 150, y: 100 }, { left: 50, top: 0, width: 200, height: 200 }), { x: 0.5, y: 0.5 });
  assert.deepEqual(rotateNormalizedPoint?.({ x: 0.2, y: 0.7 }, 90), { x: 0.3, y: 0.2 });
  assert.deepEqual(rotateNormalizedPoint?.({ x: 0.2, y: 0.7 }, 180), { x: 0.8, y: 0.3 });
  assert.deepEqual(rotateNormalizedPoint?.({ x: 0.2, y: 0.7 }, 270), { x: 0.7, y: 0.8 });

  const initial = emptyImageEdits?.();
  const rotated = applyImageCommand?.(initial, { type: "rotate", degrees: 90 });
  const cropped = applyCropSelection?.(rotated, { x: 0.25, y: 0.2, width: 0.5, height: 0.6 });
  assert.deepEqual(cropped.crop, { x: 0.2, y: 0.25, width: 0.6, height: 0.5 });

  const history = pushImageEditHistory?.(createImageEditHistory?.(initial), rotated);
  assert.equal(history.present.rotation, 90);
  const undone = undoImageEditHistory?.(history);
  assert.equal(undone.present.rotation, 0);
  assert.equal(undone.future[0].rotation, 90);
  const redone = redoImageEditHistory?.(undone);
  assert.equal(redone.present.rotation, 90);
  assert.equal(initial.rotation, 0);
});

check("O preço pode ser informado por dente ou como total do conjunto", () => {
  assert.equal(treatmentPriceTotal?.("per_tooth", 1000, 5), 5000);
  assert.equal(treatmentPriceTotal?.("total", 5000, 5), 5000);
  assert.ok(Number.isNaN(treatmentPriceTotal?.("per_tooth", -1, 5)));
  assert.ok(Number.isNaN(treatmentPriceTotal?.("per_tooth", 1000, 0)));
});

check("O plano detecta o mesmo procedimento nos mesmos dentes independentemente da ordem", () => {
  const item = { procedure: "Implante dentário", teeth: "15, 23, 25" };
  assert.equal(sameTreatmentScope?.(item, "Implante dentário", [25, 15, 23]), true);
  assert.equal(sameTreatmentScope?.(item, "Implante dentário", [15, 23]), false);
  assert.equal(sameTreatmentScope?.(item, "Coroa", [15, 23, 25]), false);
});

check("O recebimento mantém o vínculo com a parcela e o comprovante", () => {
  const payment = buildPaymentRecord?.({ id: "pg_1", amount: 300, maxAmount: 300, method: "pix", date: "2026-10-01", description: "Parcela 1/3", installmentId: "par_1", receiptAttachmentId: "arq_1" });
  assert.deepEqual(payment, { id: "pg_1", amount: 300, method: "pix", date: "2026-10-01", description: "Parcela 1/3", installmentId: "par_1", receiptAttachmentId: "arq_1" });
});

check("O recebimento rejeita zero, data inválida e valor maior que a parcela", () => {
  const base = { id: "pg_1", method: "pix", date: "2026-10-01" };
  assert.throws(() => buildPaymentRecord?.({ ...base, amount: 0 }));
  assert.throws(() => buildPaymentRecord?.({ ...base, amount: 301, maxAmount: 300 }));
  assert.throws(() => buildPaymentRecord?.({ ...base, amount: 100, date: "inválida" }));
});
console.log(`${checks} grupos de testes passaram.`);
