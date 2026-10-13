import type { Appointment, Patient, Settings } from "./types";
import { fillTemplate, firstName, fmtDate, whatsappLink } from "./utils";

export function confirmLink(p: Patient, a: Appointment, settings: Settings) {
  const text = fillTemplate(settings.messages.confirm, {
    nome: firstName(p.name),
    data: fmtDate(a.start, "EEEE, dd/MM"),
    hora: fmtDate(a.start, "HH:mm"),
    procedimento: a.procedure,
  });
  return whatsappLink(p.phone, text);
}

export function birthdayLink(p: Patient, settings: Settings) {
  return whatsappLink(p.phone, fillTemplate(settings.messages.birthday, { nome: firstName(p.name) }));
}

export function recallLink(p: Patient, settings: Settings) {
  return whatsappLink(p.phone, fillTemplate(settings.messages.recall, { nome: firstName(p.name) }));
}

export function openLink(url: string | null) {
  if (url) window.open(url, "_blank", "noopener");
}
