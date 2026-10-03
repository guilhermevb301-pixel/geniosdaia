import type { ToothFace } from "./types";

export const UPPER_PERMANENT = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_PERMANENT = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
export const UPPER_DECIDUOUS = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
export const LOWER_DECIDUOUS = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

export type ToothKind = "incisor" | "canine" | "premolar" | "molar";

export function toothKind(n: number): ToothKind {
  const q = Math.floor(n / 10);
  const p = n % 10;
  if (q >= 5) {
    if (p <= 2) return "incisor";
    if (p === 3) return "canine";
    return "molar";
  }
  if (p <= 2) return "incisor";
  if (p === 3) return "canine";
  if (p <= 5) return "premolar";
  return "molar";
}

export function isUpper(n: number) {
  const q = Math.floor(n / 10);
  return q === 1 || q === 2 || q === 5 || q === 6;
}

export function isDeciduous(n: number) {
  return Math.floor(n / 10) >= 5;
}

/** Mesial fica voltado para a linha média: quadrantes do lado direito do paciente (1,4,5,8) aparecem à esquerda da tela. */
export function mesialOnRight(n: number) {
  const q = Math.floor(n / 10);
  return q === 1 || q === 4 || q === 5 || q === 8;
}

const PERMANENT_NAMES: Record<number, string> = {
  1: "Incisivo central",
  2: "Incisivo lateral",
  3: "Canino",
  4: "Primeiro pré-molar",
  5: "Segundo pré-molar",
  6: "Primeiro molar",
  7: "Segundo molar",
  8: "Terceiro molar (siso)",
};

const DECIDUOUS_NAMES: Record<number, string> = {
  1: "Incisivo central decíduo",
  2: "Incisivo lateral decíduo",
  3: "Canino decíduo",
  4: "Primeiro molar decíduo",
  5: "Segundo molar decíduo",
};

const QUADRANT_NAMES: Record<number, string> = {
  1: "superior direito",
  2: "superior esquerdo",
  3: "inferior esquerdo",
  4: "inferior direito",
  5: "superior direito",
  6: "superior esquerdo",
  7: "inferior esquerdo",
  8: "inferior direito",
};

export function toothName(n: number) {
  const q = Math.floor(n / 10);
  const p = n % 10;
  const base = q >= 5 ? DECIDUOUS_NAMES[p] : PERMANENT_NAMES[p];
  return `${base} ${QUADRANT_NAMES[q]}`;
}

export function faceLabel(face: ToothFace, n: number) {
  const kind = toothKind(n);
  const upper = isUpper(n);
  switch (face) {
    case "M":
      return "Mesial";
    case "D":
      return "Distal";
    case "O":
      return kind === "incisor" || kind === "canine" ? "Incisal" : "Oclusal";
    case "V":
      return "Vestibular";
    case "L":
      return upper ? "Palatina" : "Lingual";
  }
}

export function faceShort(face: ToothFace, n: number) {
  if (face === "O") {
    const kind = toothKind(n);
    return kind === "incisor" || kind === "canine" ? "I" : "O";
  }
  if (face === "L") return isUpper(n) ? "P" : "L";
  return face;
}

/*
 * Silhuetas em orientação "superior" (raiz para cima, coroa para baixo), viewBox 0 0 40 76.
 * Para dentes inferiores o desenho é espelhado verticalmente.
 */
export const SILHOUETTES: Record<ToothKind, { crown: string; root: string; canal: string }> = {
  incisor: {
    crown: "M10 42 C8.5 52 9 64 11.5 71.5 Q20 75 28.5 71.5 C31 64 31.5 52 30 42 Z",
    root: "M11 44 C11.5 30 15 10 20 3 C25 10 28.5 30 29 44 Z",
    canal: "M20 8 L20 46",
  },
  canine: {
    crown: "M9.5 42 C8 53 11 65 20 74.5 C29 65 32 53 30.5 42 Z",
    root: "M11 44 C11 28 15 6 20 1 C25 6 29 28 29 44 Z",
    canal: "M20 6 L20 48",
  },
  premolar: {
    crown: "M7.5 42 C5.5 52 6.5 64 9.5 70.5 Q15 74.5 20 70.5 Q25 74.5 30.5 70.5 C33.5 64 34.5 52 32.5 42 Z",
    root: "M9.5 44 C10 30 13.5 10 17 4 Q20 2 23 4 C26.5 10 30 30 30.5 44 Z",
    canal: "M20 7 L20 46",
  },
  molar: {
    crown:
      "M4.5 42 C2.5 52 3 64 6 70.5 Q10.5 75 15 71 Q20 75 25 71 Q29.5 75 34 70.5 C37 64 37.5 52 35.5 42 Z",
    root: "M6.5 44 C6 30 7 14 10 6 Q13 3.5 15.5 9 C16.5 17 17.5 25 20 27 C22.5 25 23.5 17 24.5 9 Q27 3.5 30 6 C33 14 34 30 33.5 44 Z",
    canal: "M12 10 Q14 30 17 46 M28 10 Q26 30 23 46",
  },
};

/** Sugestão de procedimento com base nas condições marcadas */
export function suggestProcedure(conditions: string[]): string | null {
  if (conditions.includes("extracao")) return "Extração simples";
  if (conditions.includes("carie")) return "Restauração em resina";
  if (conditions.includes("fratura")) return "Restauração em resina";
  if (conditions.includes("provisoria")) return "Restauração em resina";
  if (conditions.includes("ausente")) return "Implante dentário";
  return null;
}
