import { SILHOUETTES, toothKind, UPPER_PERMANENT, LOWER_PERMANENT } from "./teeth";
import type { Odontogram } from "./types";

/*
 * Gera radiografias ilustrativas (SVG) para os pacientes de exemplo,
 * desenhadas a partir do odontograma de cada um.
 */

const NOISE = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="table" tableValues="0 0.22"/></feComponentTransfer>
  </filter>
  <filter id="soft"><feGaussianBlur stdDeviation="1.6"/></filter>
  <filter id="softer"><feGaussianBlur stdDeviation="5"/></filter>
`;

function toothGroup(n: number, x: number, y: number, scale: number, flip: boolean, state: Odontogram["teeth"][string] | undefined) {
  const whole = state?.whole ?? [];
  if (whole.includes("ausente") && !whole.includes("implante")) return "";
  const s = SILHOUETTES[toothKind(n)];
  const t = `translate(${x} ${y}) scale(${scale} ${flip ? -scale : scale})${flip ? " translate(0 -76)" : ""}`;
  if (whole.includes("implante")) {
    const threads = Array.from({ length: 7 }, (_, i) => `<rect x="13" y="${10 + i * 4.6}" width="14" height="2.2" rx="1" fill="#f4f4f4"/>`).join("");
    return `<g transform="${t}" filter="url(#soft)">
      <path d="M14 8 L26 8 L25 42 L15 42 Z" fill="#e9e9e9"/>${threads}
      <path d="${s.crown}" fill="#d9d9d9" opacity="0.95"/>
    </g>`;
  }
  const faces = Object.values(state?.faces ?? {});
  const restored = faces.includes("restauracao") || whole.includes("coroa");
  const decay = faces.includes("carie");
  return `<g transform="${t}" filter="url(#soft)">
    <path d="${s.root}" fill="#8f8f8f" opacity="0.9"/>
    <path d="${s.crown}" fill="#b9b9b9"/>
    <path d="${s.crown}" fill="none" stroke="#d6d6d6" stroke-width="2.4" opacity="0.8"/>
    ${whole.includes("canal") ? `<path d="${s.canal}" stroke="#fbfbfb" stroke-width="3.2" fill="none" stroke-linecap="round"/>` : `<path d="${s.canal}" stroke="#5e5e5e" stroke-width="1.6" fill="none" opacity="0.7"/>`}
    ${restored ? `<ellipse cx="20" cy="${whole.includes("coroa") ? 58 : 66}" rx="${whole.includes("coroa") ? 15 : 9}" ry="${whole.includes("coroa") ? 15 : 5}" fill="#fdfdfd"/>` : ""}
    ${decay ? `<ellipse cx="14" cy="64" rx="5" ry="4" fill="#3a3a3a" opacity="0.85"/>` : ""}
  </g>`;
}

export function panoramicSVG(odo: Odontogram) {
  const W = 1400;
  const H = 640;
  const cx = W / 2;
  const teethUpper = UPPER_PERMANENT.map((n, i) => {
    const t = (i - 7.5) / 7.5;
    const x = cx + t * 560 - 22;
    const y = 176 + (1 - t * t) * 40;
    return toothGroup(n, x, y, 1.45, false, odo.teeth[String(n)]);
  }).join("");
  const teethLower = LOWER_PERMANENT.map((n, i) => {
    const t = (i - 7.5) / 7.5;
    const x = cx + t * 540 - 22;
    const y = 294 + (1 - t * t) * 40;
    return toothGroup(n, x, y, 1.45, true, odo.teeth[String(n)]);
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>${NOISE}
    <radialGradient id="bg" cx="50%" cy="48%" r="65%"><stop offset="0" stop-color="#3b3b3b"/><stop offset="0.55" stop-color="#1c1c1c"/><stop offset="1" stop-color="#050505"/></radialGradient>
    <radialGradient id="bone" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#6d6d6d" stop-opacity="0.7"/><stop offset="1" stop-color="#6d6d6d" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <ellipse cx="${cx}" cy="200" rx="640" ry="150" fill="url(#bone)" filter="url(#softer)"/>
  <ellipse cx="${cx}" cy="420" rx="620" ry="170" fill="url(#bone)" filter="url(#softer)"/>
  <path d="M60 520 Q ${cx} 700 ${W - 60} 520" stroke="#7a7a7a" stroke-width="26" fill="none" opacity="0.35" filter="url(#softer)"/>
  <path d="M120 70 Q 90 300 150 560 M${W - 120} 70 Q ${W - 90} 300 ${W - 150} 560" stroke="#8a8a8a" stroke-width="40" fill="none" opacity="0.22" filter="url(#softer)"/>
  ${teethUpper}${teethLower}
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.9"/>
  <text x="28" y="${H - 26}" fill="#bdbdbd" font-family="monospace" font-size="18" opacity="0.8">R</text>
  <text x="${W - 44}" y="${H - 26}" fill="#bdbdbd" font-family="monospace" font-size="18" opacity="0.8">L</text>
</svg>`;
}

export function periapicalSVG(teeth: number[], odo: Odontogram) {
  const W = 620;
  const H = 820;
  const upper = teeth[0] < 30 || (teeth[0] >= 50 && teeth[0] < 70);
  const g = teeth
    .map((n, i) => toothGroup(n, 60 + i * 175, upper ? 70 : 750 - 76 * 4.2, 4.2, !upper, odo.teeth[String(n)]))
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>${NOISE}
    <radialGradient id="bg" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#474747"/><stop offset="1" stop-color="#101010"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" rx="26" fill="url(#bg)"/>
  ${g}
  <rect width="100%" height="100%" rx="26" filter="url(#grain)"/>
  <circle cx="${W - 40}" cy="40" r="10" fill="#d8d8d8" opacity="0.7"/>
</svg>`;
}
