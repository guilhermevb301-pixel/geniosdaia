import { differenceInYears, format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function uid(prefix = "") {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}${Date.now().toString(36)}${rnd}`;
}

export function nowISO() {
  return new Date().toISOString();
}

/** yyyy-MM-dd em horário local */
export function todayKey(d = new Date()) {
  return format(d, "yyyy-MM-dd");
}

export function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = value.length === 10 ? parseISO(`${value}T12:00:00`) : parseISO(value);
  return isValid(d) ? d : null;
}

export function fmtDate(value?: string | Date | null, pattern = "dd/MM/yyyy") {
  const d = toDate(value);
  return d ? format(d, pattern, { locale: ptBR }) : "—";
}

export function fmtDateLong(value?: string | Date | null) {
  return fmtDate(value, "d 'de' MMMM 'de' yyyy");
}

export function fmtTime(value?: string | Date | null) {
  return fmtDate(value, "HH:mm");
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function money(v: number) {
  return brl.format(Number.isFinite(v) ? v : 0);
}

export function moneyShort(v: number) {
  if (Math.abs(v) >= 1000) return `R$ ${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return money(v);
}

export function age(birthDate?: string) {
  const d = toDate(birthDate);
  if (!d) return null;
  return differenceInYears(new Date(), d);
}

export function ageLabel(birthDate?: string) {
  const a = age(birthDate);
  if (a === null) return "";
  return a === 1 ? "1 ano" : `${a} anos`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter((p) => p.length > 2 || /^[A-ZÁ-Ú]/.test(p));
  if (!parts.length) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function digits(s?: string) {
  return (s ?? "").replace(/\D/g, "");
}

export function formatPhone(s?: string) {
  const d = digits(s);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return s ?? "";
}

export function maskPhone(s: string) {
  const d = digits(s).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCPF(s: string) {
  const d = digits(s).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function whatsappLink(phone?: string, text?: string) {
  let d = digits(phone);
  if (!d) return null;
  if (d.length <= 11) d = `55${d}`;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${d}${q}`;
}

export function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return "Boa noite";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function parseMoney(s: string) {
  const clean = s.trim().replace(/^R\$\s*/, "").replace(/\s/g, "");
  if (/^-?(?:\d+|\d{1,3}(?:\.\d{3})+),\d{1,2}$/.test(clean)) return Number(clean.replace(/\./g, "").replace(",", "."));
  if (/^-?\d{1,3}(\.\d{3})+$/.test(clean)) return Number(clean.replace(/\./g, ""));
  if (/^-?\d+(?:\.\d{1,2})?$/.test(clean)) return Number(clean);
  return NaN;
}

/* ---------- Valor por extenso (recibos) ---------- */
const UNITS = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const TEENS = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const TENS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const HUNDREDS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function under1000(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(HUNDREDS[h]);
  if (rest) {
    if (rest < 10) parts.push(UNITS[rest]);
    else if (rest < 20) parts.push(TEENS[rest - 10]);
    else {
      const t = Math.floor(rest / 10);
      const u = rest % 10;
      parts.push(u ? `${TENS[t]} e ${UNITS[u]}` : TENS[t]);
    }
  }
  return parts.join(" e ");
}

function integerWords(n: number): string {
  if (n === 0) return "zero";
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (millions) parts.push(millions === 1 ? "um milhão" : `${under1000(millions)} milhões`);
  if (thousands) parts.push(thousands === 1 ? "mil" : `${under1000(thousands)} mil`);
  if (rest) parts.push(under1000(rest));
  if (parts.length > 1) {
    const last = parts.pop()!;
    const needsE = rest > 0 && (rest < 100 || rest % 100 === 0);
    return `${parts.join(" ")}${needsE ? " e " : " "}${last}`;
  }
  return parts[0];
}

export function moneyInWords(value: number) {
  const v = Math.round(Math.abs(value) * 100);
  const reais = Math.floor(v / 100);
  const cents = v % 100;
  const out: string[] = [];
  if (reais) {
    const w = integerWords(reais);
    const de = reais % 1_000_000 === 0 ? " de" : "";
    out.push(`${w}${de} ${reais === 1 ? "real" : "reais"}`);
  }
  if (cents) out.push(`${integerWords(cents)} ${cents === 1 ? "centavo" : "centavos"}`);
  if (!out.length) return "zero reais";
  return out.join(" e ");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function sha256(text: string) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    // Contextos sem crypto.subtle: hash simples (apenas bloqueio de tela, não é criptografia)
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = (h * 33) ^ text.charCodeAt(i);
    return `djb2-${(h >>> 0).toString(16)}`;
  }
}
