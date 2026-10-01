import { ANAMNESIS_CONDITIONS, ANAMNESIS_HABITS, FACE_CONDITIONS, PAYMENT_METHODS, TOOTH_CONDITIONS, TREATMENT_STATUS } from "./constants";
import { patientAlerts, treatmentTotals } from "./derive";
import { faceLabel, toothName } from "./teeth";
import type { Appointment, Patient, Payment, Settings, ToothFace } from "./types";
import { ageLabel, fmtDate, fmtDateLong, formatPhone, money, moneyInWords } from "./utils";

const TOOTH =
  "M20 14c-6 0-9 5-9 11 0 7 3 11 5 17 2 7 3 12 6 12 4 0 3-10 10-10s6 10 10 10c3 0 4-5 6-12 2-6 5-10 5-17 0-6-3-11-9-11-5 0-7 3-12 3s-7-3-12-3z";

const esc = (s?: string) =>
  (s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const STYLE = `
<style>
  .pp { font-size: 12.5px; line-height: 1.55; color: #0c1f18; }
  .pp h1, .pp h2, .pp h3 { font-family: Fraunces, Georgia, serif; font-weight: 600; margin: 0; }
  .pp .lh { display: flex; align-items: center; gap: 14px; padding-bottom: 12px; border-bottom: 2px solid #178559; }
  .pp .lh .name { font-family: Fraunces, Georgia, serif; font-size: 22px; font-weight: 600; color: #114534; }
  .pp .lh .sub { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #178559; font-weight: 700; }
  .pp .lh .contact { margin-left: auto; text-align: right; font-size: 10.5px; color: #465c53; }
  .pp .title { text-align: center; margin: 26px 0 18px; font-size: 20px; letter-spacing: .02em; color: #114534; }
  .pp .box { border: 1px solid #dfeae4; border-radius: 10px; padding: 10px 14px; margin: 10px 0; }
  .pp .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 18px; }
  .pp .k { font-size: 9.5px; text-transform: uppercase; letter-spacing: .08em; color: #7d9189; font-weight: 700; }
  .pp .v { font-weight: 600; }
  .pp table { width: 100%; border-collapse: collapse; margin: 6px 0; }
  .pp th { text-align: left; font-size: 9.5px; text-transform: uppercase; letter-spacing: .08em; color: #465c53; border-bottom: 1.5px solid #178559; padding: 6px 6px; }
  .pp td { border-bottom: 1px solid #e6efea; padding: 6px 6px; vertical-align: top; }
  .pp .r { text-align: right; }
  .pp .alert { background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; border-radius: 10px; padding: 8px 12px; font-weight: 700; margin: 10px 0; }
  .pp .sec { margin-top: 18px; font-size: 14px; color: #114534; border-left: 4px solid #25A56F; padding-left: 8px; }
  .pp .body { font-size: 14px; line-height: 1.9; margin: 16px 0; white-space: pre-wrap; }
  .pp .rx { margin: 12px 0 12px 0; }
  .pp .rx b { font-size: 14px; }
  .pp .sign { margin-top: 60px; text-align: center; }
  .pp .sign img { max-height: 70px; display: block; margin: 0 auto -6px; }
  .pp .sign .line { width: 300px; margin: 0 auto; border-top: 1px solid #0c1f18; padding-top: 4px; font-weight: 700; }
  .pp .muted { color: #7d9189; font-size: 10.5px; }
  .pp .foot { margin-top: 30px; padding-top: 8px; border-top: 1px solid #dfeae4; text-align: center; font-size: 9.5px; color: #7d9189; }
  .pp .chk { display: inline-block; width: 11px; height: 11px; border: 1.3px solid #465c53; border-radius: 3px; margin-right: 6px; vertical-align: -1px; text-align: center; font-size: 9px; line-height: 10px; }
  .pp .chk.on { background: #178559; border-color: #178559; color: #fff; }
  .pp .cols2 { columns: 2; column-gap: 24px; }
  .pp .total { font-size: 16px; font-weight: 800; color: #114534; }
</style>`;

function letterhead(s: Settings) {
  const contact = [s.phone && `☎ ${esc(s.phone)}`, s.email && esc(s.email), s.address && esc(s.address)].filter(Boolean).join("<br/>");
  return `
  <div class="lh">
    <svg width="46" height="46" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#178559"/><path d="${TOOTH}" fill="#fff" transform="translate(4 3) scale(0.875)"/></svg>
    <div>
      <div class="name">${esc(s.title)} ${esc(s.doctorName)}</div>
      <div class="sub">${esc(s.specialty)}${s.cro ? ` · CRO ${esc(s.cro)}` : ""}</div>
    </div>
    <div class="contact">${contact}</div>
  </div>`;
}

function signature(s: Settings, cityDate = true) {
  return `
  ${cityDate ? `<p style="text-align:right;margin-top:26px">${esc(s.address?.split("-").pop()?.trim() || "")}${s.address ? ", " : ""}${fmtDateLong(new Date())}.</p>` : ""}
  <div class="sign">
    ${s.signature ? `<img src="${s.signature}" alt=""/>` : ""}
    <div class="line">${esc(s.title)} ${esc(s.doctorName)}</div>
    <div class="muted">${esc(s.specialty)}${s.cro ? ` · CRO ${esc(s.cro)}` : ""}</div>
  </div>`;
}

function patientBox(p: Patient) {
  return `
  <div class="box grid">
    <div><div class="k">Paciente</div><div class="v">${esc(p.name)}</div></div>
    <div><div class="k">Nascimento</div><div class="v">${p.birthDate ? `${fmtDate(p.birthDate)} (${ageLabel(p.birthDate)})` : "—"}</div></div>
    <div><div class="k">CPF</div><div class="v">${esc(p.cpf) || "—"}</div></div>
    <div><div class="k">Telefone</div><div class="v">${esc(formatPhone(p.phone)) || "—"}</div></div>
    <div><div class="k">Convênio</div><div class="v">${esc(p.insurance) || "Particular"}</div></div>
    <div><div class="k">Data</div><div class="v">${fmtDate(new Date())}</div></div>
  </div>`;
}

export function printHTML(inner: string, title: string) {
  const root = document.getElementById("print-root");
  if (!root) return;
  root.innerHTML = `${STYLE}<div class="pp">${inner}</div>`;
  const prevTitle = document.title;
  document.title = title;
  const cleanup = () => {
    root.innerHTML = "";
    document.title = prevTitle;
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  setTimeout(() => window.print(), 80);
}

/* ---------------- Documentos ---------------- */

export function printBudget(p: Patient, s: Settings) {
  const items = p.treatments.filter((t) => t.status !== "concluido");
  const list = items.length ? items : p.treatments;
  const gross = list.reduce((a, t) => a + t.price, 0);
  const discount = (gross * (p.planDiscount ?? 0)) / 100;
  printHTML(
    `${letterhead(s)}
    <h1 class="title">Orçamento odontológico</h1>
    ${patientBox(p)}
    <table>
      <thead><tr><th>#</th><th>Procedimento</th><th>Dente(s)</th><th>Situação</th><th class="r">Valor</th></tr></thead>
      <tbody>${list
        .map(
          (t, i) =>
            `<tr><td>${i + 1}</td><td><b>${esc(t.procedure)}</b></td><td>${esc(t.teeth) || "—"}</td><td>${TREATMENT_STATUS[t.status].label}</td><td class="r">${money(t.price)}</td></tr>`,
        )
        .join("")}</tbody>
    </table>
    <table style="width:280px;margin-left:auto">
      <tr><td>Subtotal</td><td class="r">${money(gross)}</td></tr>
      ${discount ? `<tr><td>Desconto (${p.planDiscount}%)</td><td class="r">− ${money(discount)}</td></tr>` : ""}
      <tr><td class="total">Total</td><td class="r total">${money(gross - discount)}</td></tr>
    </table>
    <div class="box"><b>Formas de pagamento:</b> Pix, dinheiro, cartão de débito ou crédito (consulte parcelamento).<br/>
    <span class="muted">Orçamento válido por 30 dias. Valores sujeitos a alteração caso haja mudança no plano de tratamento.</span></div>
    ${signature(s)}
    <div class="sign" style="margin-top:40px"><div class="line">${esc(p.name)}</div><div class="muted">De acordo — paciente ou responsável</div></div>`,
    `Orçamento - ${p.name}`,
  );
}

export interface RxItem {
  name: string;
  posology: string;
  qty?: string;
}

export function printPrescription(p: Patient, s: Settings, items: RxItem[], use: string, notes?: string) {
  printHTML(
    `${letterhead(s)}
    <h1 class="title">Receituário</h1>
    <p><b>Paciente:</b> ${esc(p.name)}${p.birthDate ? ` &nbsp;·&nbsp; ${ageLabel(p.birthDate)}` : ""}</p>
    <p style="margin-top:14px"><b>${esc(use)}</b></p>
    ${items
      .map(
        (it, i) =>
          `<div class="rx"><b>${i + 1}. ${esc(it.name)}</b>${it.qty ? ` <span style="float:right">${esc(it.qty)}</span>` : ""}<div style="margin-left:18px">${esc(it.posology)}</div></div>`,
      )
      .join("")}
    ${notes ? `<p class="body" style="font-size:12.5px">${esc(notes)}</p>` : ""}
    ${signature(s)}`,
    `Receita - ${p.name}`,
  );
}

export function printFreeText(p: Patient, s: Settings, title: string, text: string) {
  printHTML(`${letterhead(s)}<h1 class="title">${esc(title)}</h1><div class="body">${esc(text)}</div>${signature(s)}`, `${title} - ${p.name}`);
}

export function printReceipt(p: Patient, s: Settings, pay: Payment) {
  printHTML(
    `${letterhead(s)}
    <h1 class="title">Recibo</h1>
    <div class="box" style="text-align:right"><span class="k">Valor</span><div class="total" style="font-size:22px">${money(pay.amount)}</div></div>
    <div class="body">Recebi de <b>${esc(p.name)}</b>${p.cpf ? `, CPF ${esc(p.cpf)},` : ""} a importância de <b>${money(pay.amount)}</b> (${esc(moneyInWords(pay.amount))}), referente a ${esc(
      pay.description || "tratamento odontológico",
    )}, paga via ${PAYMENT_METHODS[pay.method].toLowerCase()} em ${fmtDate(pay.date)}.

Para clareza, firmo o presente recibo.</div>
    ${signature(s)}`,
    `Recibo - ${p.name}`,
  );
}

export function printAnamnesis(p: Patient, s: Settings) {
  const a = p.anamnesis;
  printHTML(
    `${letterhead(s)}
    <h1 class="title">Ficha de anamnese</h1>
    ${patientBox(p)}
    <h3 class="sec">Queixa principal</h3>
    <p>${esc(a.complaint) || "&nbsp;"}</p>
    <h3 class="sec">Histórico de saúde</h3>
    <div class="cols2">${ANAMNESIS_CONDITIONS.map(
      (c) => `<div><span class="chk ${a.conditions[c.key] ? "on" : ""}">${a.conditions[c.key] ? "✓" : ""}</span>${esc(c.label)}</div>`,
    ).join("")}${(a.customConditions ?? []).map((c) => `<div><span class="chk ${a.conditions[c.id] ? "on" : ""}">${a.conditions[c.id] ? "✓" : ""}</span>${esc(c.label)}</div>`).join("")}</div>
    <div class="box grid" style="grid-template-columns:1fr 1fr">
      <div><div class="k">Alergias</div><div class="v">${esc(a.allergies) || "Nenhuma informada"}</div></div>
      <div><div class="k">Medicamentos em uso</div><div class="v">${esc(a.medications) || "—"}</div></div>
      <div><div class="k">Cirurgias / internações</div><div class="v">${esc(a.surgeries) || "—"}</div></div>
      <div><div class="k">Pressão arterial</div><div class="v">${esc(a.bloodPressure) || "—"}</div></div>
    </div>
    <h3 class="sec">Hábitos</h3>
    <div class="cols2">${ANAMNESIS_HABITS.map((h) => `<div><span class="chk ${a.habits[h.key] ? "on" : ""}">${a.habits[h.key] ? "✓" : ""}</span>${esc(h.label)}</div>`).join("")}${(a.customHabits ?? []).map((h) => `<div><span class="chk ${a.habits[h.id] ? "on" : ""}">${a.habits[h.id] ? "✓" : ""}</span>${esc(h.label)}</div>`).join("")}</div>
    ${a.notes ? `<h3 class="sec">Observações</h3><p>${esc(a.notes)}</p>` : ""}
    <p style="margin-top:24px">Declaro que as informações acima são verdadeiras e que informarei qualquer alteração no meu estado de saúde.</p>
    <div class="sign"><div class="line">${esc(p.name)}</div><div class="muted">Assinatura do paciente ou responsável · ${fmtDate(new Date())}</div></div>`,
    `Anamnese - ${p.name}`,
  );
}

export function printPatientRecord(p: Patient, s: Settings, appts: Appointment[]) {
  const alerts = patientAlerts(p);
  const totals = treatmentTotals(p);
  const teeth = Object.entries(p.odontogram.teeth).sort(([a], [b]) => Number(a) - Number(b));
  const evos = [...p.evolutions].sort((a, b) => b.date.localeCompare(a.date));
  const visits = appts.filter((a) => a.patientId === p.id && a.status === "atendido").length;
  printHTML(
    `${letterhead(s)}
    <h1 class="title">Prontuário odontológico</h1>
    ${patientBox(p)}
    <div class="box grid">
      <div><div class="k">E-mail</div><div class="v">${esc(p.email) || "—"}</div></div>
      <div><div class="k">Endereço</div><div class="v">${esc([p.address, p.city].filter(Boolean).join(" — ")) || "—"}</div></div>
      <div><div class="k">Profissão</div><div class="v">${esc(p.profession) || "—"}</div></div>
      <div><div class="k">Contato de emergência</div><div class="v">${esc(p.emergencyContact) || "—"}</div></div>
      <div><div class="k">Paciente desde</div><div class="v">${fmtDate(p.createdAt)}</div></div>
      <div><div class="k">Atendimentos</div><div class="v">${visits}</div></div>
    </div>
    ${alerts.length ? `<div class="alert">⚠ Alertas: ${alerts.map(esc).join(" · ")}</div>` : ""}
    <h3 class="sec">Anamnese</h3>
    <p><b>Queixa:</b> ${esc(p.anamnesis.complaint) || "—"}<br/>
    <b>Condições:</b> ${[...ANAMNESIS_CONDITIONS.filter((c) => p.anamnesis.conditions[c.key]).map((c) => esc(c.label)), ...(p.anamnesis.customConditions ?? []).filter((c) => p.anamnesis.conditions[c.id]).map((c) => esc(c.label))].join(", ") || "Nenhuma"}<br/>
    <b>Medicamentos:</b> ${esc(p.anamnesis.medications) || "—"} &nbsp; <b>Alergias:</b> ${esc(p.anamnesis.allergies) || "—"}</p>
    <h3 class="sec">Odontograma</h3>
    ${
      teeth.length
        ? `<table><thead><tr><th>Dente</th><th>Condições</th><th>Anotação</th></tr></thead><tbody>${teeth
            .map(([n, t]) => {
              const conds = [
                ...(t.whole ?? []).map((w) => TOOTH_CONDITIONS[w].label),
                ...Object.entries(t.faces ?? {}).map(([f, c]) => `${FACE_CONDITIONS[c!].label} (${faceLabel(f as ToothFace, Number(n))})`),
              ];
              return `<tr><td><b>${n}</b><div class="muted">${esc(toothName(Number(n)))}</div></td><td>${conds.map(esc).join("<br/>") || "—"}</td><td>${esc(t.note) || ""}</td></tr>`;
            })
            .join("")}</tbody></table>`
        : "<p>Sem marcações.</p>"
    }
    <h3 class="sec">Plano de tratamento</h3>
    ${
      p.treatments.length
        ? `<table><thead><tr><th>Procedimento</th><th>Dente</th><th>Situação</th><th class="r">Valor</th></tr></thead><tbody>${p.treatments
            .map((t) => `<tr><td>${esc(t.procedure)}</td><td>${esc(t.teeth) || "—"}</td><td>${TREATMENT_STATUS[t.status].label}</td><td class="r">${money(t.price)}</td></tr>`)
            .join("")}</tbody></table>
          <p class="r"><b>Total contratado:</b> ${money(totals.total)} · <b>Pago:</b> ${money(totals.paid)} · <b>Saldo:</b> ${money(totals.balance)}</p>`
        : "<p>Nenhum procedimento.</p>"
    }
    <h3 class="sec">Evolução clínica</h3>
    ${
      evos.length
        ? evos
            .map(
              (e) =>
                `<div class="print-avoid-break" style="margin:8px 0;padding-bottom:8px;border-bottom:1px solid #e6efea"><b>${fmtDate(e.date)} — ${esc(e.title)}</b>${e.teeth ? ` <span class="muted">(dente ${esc(e.teeth)})</span>` : ""}<div>${esc(e.description)}</div><div class="muted">${esc(e.author)}</div></div>`,
            )
            .join("")
        : "<p>Sem registros.</p>"
    }
    ${signature(s)}
    <div class="foot">Documento gerado pelo prontuário digital em ${fmtDate(new Date(), "dd/MM/yyyy 'às' HH:mm")}</div>`,
    `Prontuário - ${p.name}`,
  );
}
