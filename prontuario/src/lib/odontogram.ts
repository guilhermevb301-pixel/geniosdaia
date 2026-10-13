import { FACE_CONDITIONS, TOOTH_CONDITIONS } from "./constants";
import type { OdontogramMarkDef } from "./types";

export function odontogramMark(id: string, custom: OdontogramMarkDef[]) {
  if (id in FACE_CONDITIONS) return { ...FACE_CONDITIONS[id as keyof typeof FACE_CONDITIONS], scope: "face" as const };
  if (id in TOOTH_CONDITIONS) return { ...TOOTH_CONDITIONS[id as keyof typeof TOOTH_CONDITIONS], scope: "tooth" as const };
  return custom.find((item) => item.id === id) ?? { label: "Marcação personalizada", color: "#64748B", scope: "tooth" as const };
}
