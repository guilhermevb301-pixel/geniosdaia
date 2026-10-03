import { addDays, setHours, setMinutes, startOfDay, subDays, subMonths, subYears, format } from "date-fns";
import { emptyPatient } from "@/store/store";
import { automaticPatientStage } from "./derive";
import { putFile } from "./storage";
import type {
  Appointment,
  Attachment,
  Evolution,
  Odontogram,
  Patient,
  Payment,
  Reminder,
  StickyNote,
  ToothState,
  TreatmentItem,
} from "./types";
import { uid } from "./utils";
import { panoramicSVG, periapicalSVG } from "./xray";

/* Pacientes fictícios para demonstração — todos os nomes e dados são inventados. */

const AUTHOR = "Dr. Mizael Magalhães Cardoso";

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function workday(offset: number) {
  let d = addDays(startOfDay(new Date()), offset);
  if (d.getDay() === 0) d = addDays(d, offset >= 0 ? 1 : -1);
  return d;
}

function at(day: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return setMinutes(setHours(day, h), m).toISOString();
}

function birth(years: number, monthOffsetDays = 40) {
  return format(subDays(subYears(new Date(), years), monthOffsetDays), "yyyy-MM-dd");
}

function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function tr(procedure: string, price: number, status: TreatmentItem["status"], teeth?: string, daysAgo = 20): TreatmentItem {
  const created = subDays(new Date(), daysAgo).toISOString();
  return {
    id: uid("tr_"),
    procedure,
    price,
    status,
    teeth,
    createdAt: created,
    completedAt: status === "concluido" ? subDays(new Date(), Math.max(1, daysAgo - 5)).toISOString() : undefined,
  };
}

function ev(daysAgo: number, title: string, description: string, teeth?: string): Evolution {
  const d = workday(-daysAgo);
  return { id: uid("ev_"), date: dayKey(d), title, description, teeth, author: AUTHOR, createdAt: d.toISOString() };
}

function rem(title: string, dueDaysFromNow: number, type: Reminder["type"], hhmm = "09:00", done = false): Reminder {
  return {
    id: uid("rm_"),
    title,
    dueAt: at(addDays(startOfDay(new Date()), dueDaysFromNow), hhmm),
    type,
    done,
    createdAt: new Date().toISOString(),
  };
}

function note(text: string, color: StickyNote["color"]): StickyNote {
  return { id: uid("nt_"), text, color, createdAt: new Date().toISOString() };
}

function pay(daysAgo: number, amount: number, method: Payment["method"], description?: string): Payment {
  return { id: uid("pg_"), date: dayKey(subDays(new Date(), daysAgo)), amount, method, description };
}

function teeth(map: Record<string, ToothState>, dentition: Odontogram["dentition"] = "permanente"): Odontogram {
  return { dentition, teeth: map, updatedAt: new Date().toISOString() };
}

export async function buildDemoData(): Promise<{ patients: Patient[]; appointments: Appointment[] }> {
  const now = new Date();

  const ana = emptyPatient({
    name: "Ana Beatriz Moreira",
    birthDate: birth(34, 120),
    gender: "F",
    cpf: "123.456.789-09",
    phone: "(11) 98765-4321",
    email: "ana.moreira@email.com",
    city: "São Paulo - SP",
    address: "Rua das Palmeiras, 210 - Jardim Paulista",
    profession: "Arquiteta",
    referredBy: "Instagram",
    color: "#178559",
    tags: ["Estética"],
    stage: "tratamento",
    favorite: true,
    anamnesis: {
      conditions: {},
      habits: { bruxismo: true, fio_dental: true, sensibilidade: true },
      complaint: "Deseja clarear os dentes e relata dor ao mastigar do lado esquerdo.",
      medications: "Nenhum",
      bloodPressure: "12/8",
      updatedAt: subDays(now, 40).toISOString(),
    },
    odontogram: teeth({
      "16": { faces: { O: "restauracao" } },
      "26": { faces: { O: "carie", D: "carie" } },
      "36": { whole: ["canal", "coroa"] },
      "46": { faces: { O: "restauracao", V: "restauracao" } },
      "18": { whole: ["ausente"] },
      "28": { whole: ["ausente"] },
    }),
    treatments: [
      tr("Clareamento dental", 1200, "aprovado", undefined, 30),
      tr("Restauração em resina", 280, "andamento", "26", 30),
      tr("Placa de bruxismo", 750, "planejado", undefined, 30),
      tr("Limpeza (profilaxia)", 220, "concluido", undefined, 40),
    ],
    evolutions: [
      ev(40, "Avaliação inicial + limpeza", "Paciente relata sensibilidade e dor ao mastigar no 26. Realizada profilaxia completa. Identificada cárie oclusal/distal no 26. Sinais de desgaste compatíveis com bruxismo.", "26"),
      ev(12, "Início da restauração do 26", "Remoção do tecido cariado, proteção do complexo dentino-pulpar com ionômero de vidro. Restauração provisória. Retorno em 2 semanas para resina definitiva.", "26"),
    ],
    reminders: [rem("Moldagem para placa de bruxismo", 3, "outro", "13:30")],
    notes: [note("Prefere horários no fim da tarde, depois das 17h.", "jade")],
    payments: [pay(40, 220, "pix", "Limpeza"), pay(12, 600, "credito", "Entrada clareamento")],
  });

  const sebastiao = emptyPatient({
    name: "Sebastião Pereira Lima",
    birthDate: birth(72, 200),
    gender: "M",
    cpf: "987.654.321-00",
    phone: "(11) 97654-3210",
    city: "São Paulo - SP",
    profession: "Aposentado",
    emergencyContact: "Maria (filha) · (11) 96543-2109",
    color: "#0369A1",
    tags: ["Idoso", "Implante"],
    stage: "tratamento",
    favorite: true,
    anamnesis: {
      conditions: { hipertensao: true, anticoagulante: true, diabetes: true, cardiopatia: true },
      habits: {},
      complaint: "Dificuldade para mastigar, deseja repor dentes perdidos.",
      medications: "Losartana 50 mg, AAS 100 mg, Metformina 850 mg",
      bloodPressure: "14/9",
      surgeries: "Angioplastia (2019)",
      updatedAt: subDays(now, 60).toISOString(),
    },
    odontogram: teeth({
      "18": { whole: ["ausente"] },
      "17": { whole: ["ausente"] },
      "28": { whole: ["ausente"] },
      "38": { whole: ["ausente"] },
      "48": { whole: ["ausente"] },
      "46": { whole: ["ausente", "implante"] },
      "36": { whole: ["ausente"] },
      "14": { whole: ["coroa"] },
      "25": { whole: ["extracao"], faces: { O: "fratura" } },
      "15": { faces: { M: "restauracao", O: "restauracao" } },
      "24": { faces: { O: "restauracao" } },
      "44": { faces: { O: "carie" } },
    }),
    treatments: [
      tr("Implante dentário", 3800, "andamento", "46", 90),
      tr("Extração simples", 300, "aprovado", "25", 30),
      tr("Coroa em porcelana", 1900, "planejado", "46", 30),
      tr("Restauração em resina", 280, "planejado", "44", 30),
    ],
    evolutions: [
      ev(90, "Instalação de implante 46", "Paciente com liberação do cardiologista. Aferida PA 13/8 antes do procedimento. Instalado implante cone morse 4.0 x 10 mm na região do 46. Sutura com fio de nylon 5-0.", "46"),
      ev(80, "Remoção de sutura", "Cicatrização dentro do esperado. Paciente sem queixas.", "46"),
      ev(20, "Reavaliação", "Osseointegração em andamento. Indicada extração do 25 (fratura radicular). Solicitado laudo atualizado do cardiologista.", "25"),
    ],
    reminders: [
      rem("Solicitar laudo do cardiologista", -2, "outro"),
      rem("Aferir pressão antes do procedimento", 0, "medicacao", "10:15"),
    ],
    notes: [
      note("Usa AAS — suspender somente com liberação do cardiologista.", "rose"),
      note("Aferir pressão arterial antes de qualquer procedimento.", "amber"),
    ],
    payments: [pay(90, 1900, "pix", "Entrada implante"), pay(60, 950, "pix", "Parcela implante")],
  });

  const fernanda = emptyPatient({
    name: "Fernanda Rocha Alves",
    birthDate: birth(29, -3),
    gender: "F",
    phone: "(11) 99876-5432",
    email: "fe.rocha@email.com",
    profession: "Advogada",
    referredBy: "Indicação — Ana Beatriz",
    color: "#BE185D",
    tags: ["Estética", "VIP"],
    stage: "avaliacao",
    anamnesis: {
      conditions: { alergia_medicamento: true },
      habits: { fio_dental: true },
      allergies: "Penicilina",
      complaint: "Quer melhorar a estética do sorriso (formato e cor dos dentes da frente).",
      updatedAt: subDays(now, 5).toISOString(),
    },
    odontogram: teeth({
      "11": { faces: { M: "restauracao" } },
      "21": { faces: { M: "restauracao", D: "restauracao" } },
      "12": { faces: { V: "fratura" } },
    }),
    treatments: [
      tr("Faceta em porcelana", 2200, "planejado", "12", 5),
      tr("Faceta em porcelana", 2200, "planejado", "11", 5),
      tr("Faceta em porcelana", 2200, "planejado", "21", 5),
      tr("Faceta em porcelana", 2200, "planejado", "22", 5),
      tr("Clareamento dental", 1200, "planejado", undefined, 5),
    ],
    evolutions: [ev(5, "Avaliação estética", "Planejamento digital do sorriso. Fotos e moldagem realizadas. Orçamento de 4 facetas + clareamento será apresentado.")],
    reminders: [rem("Enviar orçamento das facetas", 0, "pagamento", "18:00")],
    notes: [note("Alergia a penicilina — revisar medicamentos e conduta antes de prescrever.", "rose")],
    planDiscount: 5,
  });

  const joao = emptyPatient({
    name: "João Pedro Santana",
    birthDate: birth(16, 70),
    gender: "M",
    phone: "(11) 95432-1098",
    emergencyContact: "Cláudia (mãe) · (11) 95432-0000",
    color: "#7C3AED",
    tags: ["Ortodontia"],
    stage: "tratamento",
    anamnesis: { conditions: {}, habits: { respirador_bucal: true }, complaint: "Dentes tortos." },
    odontogram: teeth({ "16": { faces: { O: "selante" } }, "26": { faces: { O: "selante" } }, "36": { faces: { O: "selante" } }, "46": { faces: { O: "selante" } } }),
    treatments: [
      tr("Aparelho ortodôntico fixo", 2400, "andamento", undefined, 200),
      tr("Manutenção ortodôntica", 180, "concluido", undefined, 60),
      tr("Manutenção ortodôntica", 180, "concluido", undefined, 30),
    ],
    evolutions: [
      ev(200, "Instalação do aparelho fixo", "Colagem de braquetes superior e inferior. Fio NiTi 0.014. Orientações de higiene passadas ao paciente e responsável."),
      ev(60, "Manutenção ortodôntica", "Troca para fio 0.016. Boa higiene."),
      ev(30, "Manutenção ortodôntica", "Troca de ligaduras. Leve inflamação gengival — reforçada escovação."),
    ],
    payments: [pay(200, 1200, "credito", "Aparelho (entrada)"), pay(60, 180, "pix"), pay(30, 180, "pix")],
  });

  const mariana = emptyPatient({
    name: "Mariana Costa Ribeiro",
    birthDate: birth(41, 150),
    gender: "F",
    phone: "(11) 94321-0987",
    email: "mariana.ribeiro@email.com",
    profession: "Empresária",
    color: "#CA8A04",
    tags: ["VIP"],
    stage: "concluido",
    anamnesis: { conditions: {}, habits: { fio_dental: true } },
    odontogram: teeth({ "15": { faces: { O: "restauracao" } }, "25": { faces: { O: "restauracao" } }, "37": { faces: { O: "restauracao", M: "restauracao" } } }),
    treatments: [tr("Limpeza (profilaxia)", 220, "concluido", undefined, 215)],
    evolutions: [ev(215, "Limpeza semestral", "Profilaxia e aplicação de flúor. Sem novas lesões. Retorno em 6 meses.")],
    payments: [pay(215, 220, "debito")],
  });

  const roberto = emptyPatient({
    name: "Roberto Nogueira",
    birthDate: birth(55, 300),
    gender: "M",
    phone: "(11) 93210-9876",
    insurance: "OdontoPrev",
    profession: "Engenheiro",
    color: "#4D7C0F",
    tags: ["Convênio"],
    stage: "tratamento",
    anamnesis: {
      conditions: { hipertensao: true },
      habits: { fumante: true, sangramento_gengival: true },
      medications: "Enalapril 10 mg",
      complaint: "Dor forte e latejante no dente de baixo do lado esquerdo.",
      bloodPressure: "13/8",
    },
    odontogram: teeth({
      "36": { whole: ["canal"], faces: { O: "provisoria" } },
      "37": { faces: { O: "restauracao" } },
      "26": { faces: { M: "carie" } },
      "47": { faces: { O: "restauracao" } },
    }),
    treatments: [
      tr("Tratamento de canal", 950, "andamento", "36", 14),
      tr("Coroa em porcelana", 1900, "aprovado", "36", 14),
      tr("Raspagem periodontal", 380, "aprovado", undefined, 14),
      tr("Restauração em resina", 280, "planejado", "26", 14),
    ],
    evolutions: [
      ev(14, "Urgência — pulpite irreversível no 36", "Anestesia (articaína 4% 1 tubete). Abertura coronária, pulpectomia, medicação intracanal com hidróxido de cálcio. Restauração provisória.", "36"),
      ev(6, "Canal 36 — sessão 1", "Odontometria e instrumentação mecanizada dos 3 canais. Nova medicação intracanal.", "36"),
    ],
    reminders: [rem("Enviar guia de autorização ao convênio", 1, "pagamento")],
    payments: [pay(14, 475, "convenio", "Canal — parte convênio")],
  });

  const luciana = emptyPatient({
    name: "Luciana Fernandes Prado",
    birthDate: birth(32, 250),
    gender: "F",
    phone: "(11) 92109-8765",
    email: "lu.prado@email.com",
    color: "#0F766E",
    tags: [],
    stage: "avaliacao",
    anamnesis: {
      conditions: { gestante: true },
      habits: { sangramento_gengival: true },
      complaint: "Gengiva sangrando ao escovar. Está grávida de 5 meses.",
    },
    notes: [note("Gestante (5 meses) — evitar radiografias, preferir 2º trimestre para procedimentos.", "amber")],
  });

  const thiago = emptyPatient({
    name: "Thiago Martins",
    birthDate: birth(27, 90),
    gender: "M",
    phone: "(11) 91098-7654",
    color: "#1D4ED8",
    tags: [],
    stage: "concluido",
    anamnesis: { conditions: {}, habits: {} },
    odontogram: teeth({ "38": { whole: ["ausente"] }, "48": { whole: ["ausente"] } }),
    treatments: [tr("Extração de siso", 650, "concluido", "38", 70), tr("Extração de siso", 650, "concluido", "48", 50)],
    evolutions: [
      ev(70, "Exodontia do 38", "Extração do terceiro molar inferior esquerdo incluso. Sutura. Prescrito ibuprofeno e amoxicilina.", "38"),
      ev(50, "Exodontia do 48", "Extração sem intercorrências. Paciente orientado sobre cuidados pós-operatórios.", "48"),
      ev(43, "Alta", "Cicatrização completa. Alta do tratamento."),
    ],
    payments: [pay(70, 650, "pix"), pay(50, 650, "pix")],
  });

  const helena = emptyPatient({
    name: "Helena Duarte",
    birthDate: format(subYears(new Date(), 63), "yyyy-MM-dd"),
    gender: "F",
    phone: "(11) 90987-6543",
    color: "#9333EA",
    tags: ["VIP", "Idoso"],
    stage: "tratamento",
    favorite: true,
    anamnesis: { conditions: { tireoide: true }, habits: { fio_dental: true }, medications: "Levotiroxina 50 mcg" },
    odontogram: teeth({
      "16": { whole: ["protese", "coroa"] },
      "15": { whole: ["ausente", "protese"] },
      "14": { whole: ["protese", "coroa"] },
      "27": { whole: ["canal", "coroa"] },
      "47": { faces: { O: "restauracao", D: "restauracao" } },
    }),
    treatments: [tr("Ponte fixa (por elemento)", 1700, "concluido", "14-16", 150), tr("Limpeza (profilaxia)", 220, "concluido", undefined, 35)],
    evolutions: [
      ev(150, "Cimentação da ponte fixa 14-16", "Prova e cimentação definitiva da prótese fixa de 3 elementos. Ajuste oclusal."),
      ev(35, "Manutenção", "Profilaxia e controle da prótese. Tudo em ordem."),
    ],
    payments: [pay(150, 5100, "credito", "Ponte fixa (3x)"), pay(35, 220, "pix")],
  });

  const isabela = emptyPatient({
    name: "Isabela Carvalho",
    birthDate: birth(7, 30),
    gender: "F",
    phone: "(11) 98888-1234",
    emergencyContact: "Rafael (pai) · (11) 98888-1234",
    color: "#C2410C",
    tags: ["Criança"],
    stage: "tratamento",
    anamnesis: { conditions: { ansiedade: true }, habits: { roer_unhas: true } },
    odontogram: teeth(
      {
        "54": { faces: { O: "carie" } },
        "64": { faces: { O: "selante" } },
        "85": { faces: { O: "carie", D: "carie" } },
        "75": { faces: { O: "restauracao" } },
        "16": { faces: { O: "selante" } },
        "26": { faces: { O: "selante" } },
      },
      "mista",
    ),
    treatments: [
      tr("Restauração em resina", 280, "andamento", "85", 10),
      tr("Restauração em resina", 280, "aprovado", "54", 10),
      tr("Aplicação de flúor", 90, "concluido", undefined, 10),
    ],
    evolutions: [ev(10, "Primeira consulta", "Condicionamento da criança (muito ansiosa). Aplicação de flúor. Cáries nos dentes 54 e 85.")],
    notes: [note("Muito ansiosa: explicar cada passo e usar a técnica falar-mostrar-fazer. Adora adesivos de dinossauro 🦖", "sky")],
    payments: [pay(10, 90, "dinheiro")],
  });

  const paulo = emptyPatient({
    name: "Paulo Henrique Souza",
    birthDate: birth(47, 180),
    gender: "M",
    phone: "(11) 97777-4321",
    color: "#0369A1",
    tags: ["Implante"],
    stage: "avaliacao",
    anamnesis: { conditions: {}, habits: { fumante: true } },
    odontogram: teeth({ "36": { whole: ["ausente"] }, "37": { whole: ["ausente"] }, "45": { whole: ["extracao"] } }),
    treatments: [
      tr("Implante dentário", 3800, "planejado", "36", 8),
      tr("Implante dentário", 3800, "planejado", "37", 8),
      tr("Extração simples", 300, "aprovado", "45", 8),
    ],
    evolutions: [ev(8, "Avaliação para implantes", "Ausência dos 36 e 37. Solicitada tomografia. Orientado a reduzir o tabagismo antes da cirurgia.")],
    reminders: [rem("Cobrar retorno sobre o orçamento dos implantes", 2, "pagamento")],
  });

  const patricia = emptyPatient({
    name: "Patrícia Gomes",
    birthDate: birth(52, -5),
    gender: "F",
    phone: "(11) 96666-5432",
    insurance: "Amil Dental",
    color: "#B45309",
    tags: ["Convênio"],
    stage: "tratamento",
    anamnesis: { conditions: { hipertensao: true }, habits: {}, medications: "Hidroclorotiazida 25 mg" },
    odontogram: teeth({ "46": { faces: { O: "restauracao" } }, "36": { faces: { O: "restauracao" } } }),
    treatments: [tr("Limpeza (profilaxia)", 220, "concluido", undefined, 190)],
    evolutions: [ev(190, "Manutenção periodontal", "Raspagem supragengival e polimento.")],
    payments: [pay(190, 220, "convenio")],
  });

  const gabriel = emptyPatient({
    name: "Gabriel Almeida",
    birthDate: birth(31, 60),
    gender: "M",
    phone: "(11) 95555-6789",
    color: "#BE185D",
    tags: ["Urgência"],
    stage: "tratamento",
    anamnesis: { conditions: {}, habits: { bruxismo: true } },
    odontogram: teeth({ "21": { faces: { M: "fratura", O: "fratura" } }, "11": { faces: { D: "provisoria" } } }),
    treatments: [tr("Restauração em resina", 280, "aprovado", "21", 3), tr("Restauração em resina", 280, "andamento", "11", 3)],
    evolutions: [ev(3, "Urgência — trauma dental", "Queda de bicicleta. Fratura de esmalte/dentina no 21 e 11. Vitalidade positiva. Restauração provisória no 11.", "11, 21")],
    reminders: [rem("Teste de vitalidade pulpar do 21", 25, "retorno")],
    payments: [pay(3, 150, "pix", "Consulta de urgência")],
  });

  const camila = emptyPatient({
    name: "Camila Nunes Barbosa",
    birthDate: birth(25, 330),
    gender: "F",
    phone: "(11) 94444-8765",
    email: "camila.nb@email.com",
    referredBy: "Google",
    color: "#0F766E",
    tags: ["Estética"],
    stage: "avaliacao",
    anamnesis: { conditions: {}, habits: {} },
  });

  const patients = [ana, sebastiao, fernanda, joao, mariana, roberto, luciana, thiago, helena, isabela, paulo, patricia, gabriel, camila];
  patients.forEach((p) => (p.demo = true));

  /* ---------- Agenda ---------- */
  const appointments: Appointment[] = [];
  const A = (p: Patient, day: Date, time: string, duration: number, procedure: string, status: Appointment["status"], notes?: string) =>
    appointments.push({ id: uid("ag_"), patientId: p.id, start: at(day, time), duration, procedure, status, notes });

  const d0 = workday(0);
  A(roberto, d0, "08:30", 60, "Tratamento de canal", "confirmado", "Sessão 2 — obturação");
  A(luciana, d0, "09:30", 45, "Consulta / avaliação", "agendado", "Primeira consulta (gestante)");
  A(sebastiao, d0, "10:30", 60, "Extração simples", "confirmado", "Extração do 25 — conferir laudo");
  A(ana, d0, "13:30", 60, "Restauração em resina", "agendado", "Resina definitiva 26");
  A(isabela, d0, "14:30", 45, "Restauração em resina", "confirmado");
  A(joao, d0, "16:00", 30, "Manutenção ortodôntica", "agendado");
  A(gabriel, d0, "17:00", 45, "Restauração em resina", "agendado");

  const d1 = workday(1);
  A(fernanda, d1, "09:00", 60, "Consulta / avaliação", "agendado", "Apresentar planejamento das facetas");
  A(paulo, d1, "11:00", 45, "Extração simples", "agendado");
  A(patricia, d1, "15:00", 45, "Limpeza (profilaxia)", "agendado");
  A(camila, d1, "16:30", 45, "Consulta / avaliação", "agendado", "Interesse em clareamento");

  A(roberto, workday(3), "08:30", 90, "Tratamento de canal", "agendado", "Obturação e coroa provisória");
  A(ana, workday(4), "17:30", 45, "Placa de bruxismo", "agendado", "Moldagem");
  A(helena, workday(6), "10:00", 45, "Limpeza (profilaxia)", "agendado");
  A(isabela, workday(7), "14:30", 45, "Restauração em resina", "agendado", "Dente 54");

  // Histórico: consultas atendidas nos últimos 6 meses para os gráficos
  const r = rng(42);
  const pool = [ana, sebastiao, joao, roberto, thiago, helena, isabela, gabriel];
  const procs = ["Limpeza (profilaxia)", "Restauração em resina", "Consulta / avaliação", "Manutenção ortodôntica", "Tratamento de canal", "Aplicação de flúor", "Extração simples", "Raspagem periodontal"];
  const times = ["08:00", "09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:30", "17:30"];
  for (let back = 1; back <= 175; back++) {
    const day = subDays(startOfDay(now), back);
    if (day.getDay() === 0) continue;
    const n = day.getDay() === 6 ? 1 : 1 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const p = pool[Math.floor(r() * pool.length)];
      const status = r() < 0.08 ? "faltou" : "atendido";
      A(p, day, times[Math.floor(r() * times.length)], 45, procs[Math.floor(r() * procs.length)], status);
    }
  }

  // Procedimentos já concluídos e pagos nos meses anteriores (alimentam o gráfico de faturamento)
  const extraPayers = [joao, helena, thiago, ana, gabriel];
  const done: [string, number][] = [
    ["Limpeza (profilaxia)", 220],
    ["Restauração em resina", 280],
    ["Aplicação de flúor", 90],
    ["Radiografia periapical", 60],
    ["Consulta / avaliação", 150],
    ["Manutenção ortodôntica", 180],
  ];
  for (let m = 1; m <= 5; m++) {
    const count = 3 + Math.floor(r() * 4);
    for (let i = 0; i < count; i++) {
      const p = extraPayers[Math.floor(r() * extraPayers.length)];
      const date = subDays(subMonths(now, m), Math.floor(r() * 25));
      const [procedure, price] = done[Math.floor(r() * done.length)];
      p.payments.push({
        id: uid("pg_"),
        date: dayKey(date),
        amount: price,
        method: (["pix", "credito", "debito", "dinheiro"] as const)[Math.floor(r() * 4)],
        description: procedure,
      });
      p.treatments.push({ id: uid("tr_"), procedure, price, status: "concluido", createdAt: date.toISOString(), completedAt: date.toISOString() });
    }
  }

  /* ---------- Radiografias ilustrativas ---------- */
  const svgBlob = (svg: string) => new Blob([svg], { type: "image/svg+xml" });
  const attach = async (p: Patient, name: string, category: Attachment["category"], svg: string, daysAgo: number, noteText?: string, tooth?: string) => {
    const blob = svgBlob(svg);
    const a: Attachment = {
      id: uid("arq_"),
      name,
      category,
      mime: "image/svg+xml",
      size: blob.size,
      createdAt: subDays(now, daysAgo).toISOString(),
      takenAt: dayKey(subDays(now, daysAgo)),
      note: noteText,
      tooth,
    };
    await putFile(a.id, blob);
    p.attachments.push(a);
  };

  try {
    await attach(sebastiao, "Panorâmica inicial (exemplo)", "panoramica", panoramicSVG(sebastiao.odontogram), 95, "Planejamento do implante 46");
    await attach(sebastiao, "Periapical 46 pós-implante (exemplo)", "radiografia", periapicalSVG([47, 46, 45], sebastiao.odontogram), 88, "Controle pós-operatório", "46");
    await attach(roberto, "Periapical 36 inicial (exemplo)", "radiografia", periapicalSVG([37, 36, 35], { ...roberto.odontogram, teeth: { ...roberto.odontogram.teeth, "36": { faces: { O: "carie" } } } }), 14, "Lesão profunda — pulpite", "36");
    await attach(roberto, "Periapical 36 odontometria (exemplo)", "radiografia", periapicalSVG([37, 36, 35], roberto.odontogram), 6, "Canais instrumentados", "36");
    await attach(ana, "Panorâmica (exemplo)", "panoramica", panoramicSVG(ana.odontogram), 40);
    await attach(helena, "Panorâmica de controle (exemplo)", "panoramica", panoramicSVG(helena.odontogram), 150);
    await attach(paulo, "Panorâmica — planejamento implantes (exemplo)", "panoramica", panoramicSVG(paulo.odontogram), 8, "Avaliar altura óssea na região 36/37");
  } catch {
    /* sem armazenamento de arquivos — segue sem imagens */
  }

  // Cadastro com datas variadas
  patients.forEach((p, i) => {
    const created = subMonths(now, (i * 7) % 20).toISOString();
    p.createdAt = created;
    p.updatedAt = subDays(now, i).toISOString();
  });
  camila.createdAt = subDays(now, 2).toISOString();
  luciana.createdAt = subDays(now, 4).toISOString();

  // Lembrete de retorno automático em um paciente de manutenção
  helena.reminders.push(rem("Retorno semestral — controle da prótese", 150, "retorno"));
  patricia.reminders.push(rem("Ligar para agendar retorno semestral", -1, "retorno"));
  patients.forEach((patient) => {
    patient.stage = automaticPatientStage(patient);
  });

  return { patients, appointments };
}
