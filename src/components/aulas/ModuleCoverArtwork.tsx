import type { CSSProperties } from "react";
import {
  BadgeDollarSign,
  Banana,
  Bot,
  BotMessageSquare,
  Braces,
  Camera,
  ChartNoAxesCombined,
  CirclePlay,
  CircleUserRound,
  Clapperboard,
  DoorOpen,
  Film,
  Flame,
  Gift,
  Layers3,
  Megaphone,
  Mic2,
  Orbit,
  PanelsTopLeft,
  Radar,
  ShieldCheck,
  Sparkles,
  SwitchCamera,
  TrendingUp,
  Video,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type {
  ModuleCoverAccent,
  ModuleCoverIconName,
  ModuleCoverLayout,
  ModuleCoverMetadata,
  ModuleCoverSignature,
} from "@/lib/moduleCoverCatalog";

const ICONS: Record<ModuleCoverIconName, LucideIcon> = {
  sparkles: Sparkles,
  wrench: Wrench,
  "bot-message": BotMessageSquare,
  sale: BadgeDollarSign,
  braces: Braces,
  orbit: Orbit,
  shield: ShieldCheck,
  gift: Gift,
  megaphone: Megaphone,
  zap: Zap,
  radar: Radar,
  play: CirclePlay,
  persona: CircleUserRound,
  panels: PanelsTopLeft,
  video: Video,
  door: DoorOpen,
  bot: Bot,
  layers: Layers3,
  "switch-camera": SwitchCamera,
  chart: ChartNoAxesCombined,
  banana: Banana,
  camera: Camera,
  clapperboard: Clapperboard,
  film: Film,
  mic: Mic2,
  trending: TrendingUp,
  flame: Flame,
  browser: PanelsTopLeft,
};

const ACCENTS: Record<
  ModuleCoverAccent,
  { text: string; border: string; fill: string; soft: string }
> = {
  emerald: {
    text: "text-primary",
    border: "border-primary/40",
    fill: "bg-primary",
    soft: "bg-primary/10",
  },
  codex: {
    text: "text-codex",
    border: "border-codex/40",
    fill: "bg-codex",
    soft: "bg-codex/10",
  },
  claude: {
    text: "text-claude",
    border: "border-claude/40",
    fill: "bg-claude",
    soft: "bg-claude/10",
  },
};

interface MotifProps {
  layout: ModuleCoverLayout;
  accent: (typeof ACCENTS)[ModuleCoverAccent];
}

function Motif({ layout, accent }: MotifProps) {
  switch (layout) {
    case "portal":
      return (
        <>
          <span className={`absolute left-[16%] top-[15%] h-[70%] w-[68%] rounded-full border ${accent.border}`} />
          <span className="absolute left-[24%] top-[23%] h-[54%] w-[52%] rounded-full border border-white/10" />
        </>
      );
    case "workbench":
      return (
        <>
          <span className="absolute bottom-[20%] left-[12%] h-px w-[76%] bg-white/20" />
          {[18, 38, 58, 78].map((left, index) => (
            <span
              key={left}
              className={`absolute bottom-[21%] h-2 border ${index === 2 ? accent.border : "border-white/10"}`}
              style={{ left: `${left}%`, width: index === 2 ? "14%" : "8%" }}
            />
          ))}
        </>
      );
    case "network":
      return (
        <>
          <span className="absolute left-[18%] top-1/2 h-px w-[64%] -rotate-12 bg-white/20" />
          <span className="absolute left-1/2 top-[18%] h-[64%] w-px rotate-[24deg] bg-white/10" />
          {[
            ["18%", "60%"],
            ["33%", "24%"],
            ["72%", "30%"],
            ["78%", "70%"],
          ].map(([left, top], index) => (
            <span
              key={`${left}-${top}`}
              className={`absolute h-3 w-3 rounded-full border ${index === 2 ? accent.border : "border-white/20"} bg-[#11161b]`}
              style={{ left, top }}
            />
          ))}
        </>
      );
    case "funnel":
      return (
        <>
          <span
            className={`absolute left-[18%] top-[18%] h-[20%] w-[64%] border ${accent.border}`}
            style={{ clipPath: "polygon(0 0, 100% 0, 82% 100%, 18% 100%)" }}
          />
          <span
            className="absolute left-[30%] top-[41%] h-[18%] w-[40%] border border-white/20"
            style={{ clipPath: "polygon(0 0, 100% 0, 68% 100%, 32% 100%)" }}
          />
          <span className={`absolute bottom-[18%] left-[46%] h-[16%] w-[8%] ${accent.fill} opacity-50`} />
        </>
      );
    case "orbit":
      return (
        <>
          <span className={`absolute left-[12%] top-[31%] h-[38%] w-[76%] rotate-[-12deg] rounded-full border ${accent.border}`} />
          <span className="absolute left-[24%] top-[17%] h-[66%] w-[52%] rotate-[28deg] rounded-full border border-white/10" />
          <span className={`absolute right-[15%] top-[30%] h-3 w-3 rounded-full ${accent.fill}`} />
        </>
      );
    case "vault":
      return (
        <>
          <span className={`absolute left-[20%] top-[17%] h-[66%] w-[60%] rounded-md border-2 ${accent.border}`} />
          <span className="absolute left-[27%] top-[26%] h-[48%] w-[46%] rounded-full border border-white/20" />
          <span className={`absolute left-[28%] top-1/2 h-px w-[44%] ${accent.fill} opacity-40`} />
        </>
      );
    case "burst":
      return (
        <>
          <span className={`absolute left-[31%] top-[24%] h-[52%] w-[38%] rotate-45 border ${accent.border}`} />
          <span className="absolute left-[38%] top-[33%] h-[34%] w-[24%] rotate-45 border border-white/10" />
          {[0, 45, 90, 135].map((rotation) => (
            <span
              key={rotation}
              className="absolute left-[17%] top-1/2 h-px w-[66%] bg-white/20"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          ))}
        </>
      );
    case "broadcast":
      return (
        <>
          {[28, 46, 64].map((size, index) => (
            <span
              key={size}
              className={`absolute left-1/2 top-1/2 rounded-full border ${index === 1 ? accent.border : "border-white/10"}`}
              style={{
                height: `${size}%`,
                width: `${size}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </>
      );
    case "signal":
      return (
        <div className="absolute inset-x-[15%] bottom-[16%] flex h-[54%] items-end justify-between gap-2">
          {[26, 48, 34, 76, 58, 92].map((height, index) => (
            <span
              key={`${height}-${index}`}
              className={index === 3 ? accent.fill : "bg-white/10"}
              style={{ height: `${height}%`, width: "10%" }}
            />
          ))}
        </div>
      );
    case "radar":
      return (
        <>
          {[28, 48, 68].map((size) => (
            <span
              key={size}
              className="absolute left-1/2 top-1/2 rounded-full border border-white/10"
              style={{
                height: `${size}%`,
                width: `${size}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
          <span className={`absolute left-1/2 top-1/2 h-px w-[32%] origin-left -rotate-[32deg] ${accent.fill} opacity-60`} />
        </>
      );
    case "stage":
      return (
        <>
          <span
            className={`absolute left-[28%] top-[-8%] h-[82%] w-[44%] ${accent.soft} blur-xl`}
            style={{ clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)" }}
          />
          <span className="absolute bottom-[15%] left-[12%] h-px w-[76%] bg-white/20" />
          <span className="absolute bottom-[10%] left-[35%] h-[9%] w-[30%] rounded-full bg-black/40 blur-sm" />
        </>
      );
    case "portrait":
      return (
        <>
          <span className={`absolute left-[29%] top-[12%] h-[76%] w-[42%] rounded-[45%] border ${accent.border}`} />
          <span className="absolute left-[23%] top-[20%] h-[60%] w-[54%] rounded-[42%] border border-white/10" />
          <span className={`absolute bottom-[12%] left-[42%] h-1 w-[16%] rounded-full ${accent.fill} opacity-50`} />
        </>
      );
    case "stack":
      return (
        <>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`absolute h-[48%] w-[48%] rounded-md border ${index === 2 ? accent.border : "border-white/10"} bg-[#11161b]/80`}
              style={{ left: `${20 + index * 10}%`, top: `${17 + index * 9}%` }}
            />
          ))}
        </>
      );
    case "frame":
      return (
        <>
          <span className={`absolute left-[15%] top-[15%] h-[70%] w-[70%] rounded-md border ${accent.border}`} />
          <span className="absolute left-[22%] top-[23%] h-[54%] w-[56%] border border-dashed border-white/20" />
          <span className={`absolute right-[11%] top-[11%] h-2 w-2 rounded-full ${accent.fill}`} />
        </>
      );
    case "split":
      return (
        <>
          <span
            className="absolute inset-y-0 left-0 w-[56%] bg-codex/10"
            style={{ clipPath: "polygon(0 0, 100% 0, 76% 100%, 0 100%)" }}
          />
          <span
            className="absolute inset-y-0 right-0 w-[56%] bg-claude/10"
            style={{ clipPath: "polygon(24% 0, 100% 0, 100% 100%, 0 100%)" }}
          />
          <span className="absolute left-1/2 top-[12%] h-[76%] w-px rotate-[14deg] bg-white/20" />
        </>
      );
    case "market":
      return (
        <>
          <div className="absolute inset-x-[17%] bottom-[18%] flex h-[48%] items-end gap-[8%]">
            {[36, 54, 72, 92].map((height, index) => (
              <span
                key={height}
                className={index === 3 ? accent.fill : "bg-white/10"}
                style={{ height: `${height}%`, width: "16%" }}
              />
            ))}
          </div>
          <span className={`absolute left-[17%] top-[30%] h-px w-[68%] -rotate-[18deg] ${accent.fill} opacity-40`} />
        </>
      );
    case "studio":
      return (
        <>
          {[32, 48, 64].map((size, index) => (
            <span
              key={size}
              className={`absolute left-1/2 top-1/2 rounded-full border ${index === 0 ? accent.border : "border-white/10"}`}
              style={{
                height: `${size}%`,
                width: `${size}%`,
                transform: `translate(-50%, -50%) rotate(${index * 24}deg)`,
                clipPath: "polygon(0 0, 100% 14%, 84% 100%, 12% 86%)",
              }}
            />
          ))}
        </>
      );
    case "waveform":
      return (
        <div className="absolute inset-x-[12%] top-1/2 flex h-[46%] -translate-y-1/2 items-center justify-between gap-1.5">
          {[18, 42, 76, 48, 92, 62, 32, 54, 22].map((height, index) => (
            <span
              key={`${height}-${index}`}
              className={index === 4 ? accent.fill : "bg-white/20"}
              style={{ height: `${height}%`, width: "5%" }}
            />
          ))}
        </div>
      );
    case "growth":
      return (
        <>
          <div className="absolute inset-x-[18%] bottom-[18%] flex h-[50%] items-end justify-between">
            {[24, 39, 56, 78].map((height, index) => (
              <span
                key={height}
                className={index === 3 ? accent.fill : "bg-white/10"}
                style={{ height: `${height}%`, width: "14%" }}
              />
            ))}
          </div>
          <span className={`absolute left-[20%] top-[44%] h-px w-[60%] -rotate-[24deg] ${accent.fill} opacity-50`} />
        </>
      );
    case "browser":
      return (
        <>
          <span className={`absolute left-[12%] top-[16%] h-[68%] w-[76%] rounded-md border ${accent.border}`} />
          <span className="absolute left-[12%] top-[28%] h-px w-[76%] bg-white/20" />
          <span className="absolute left-[17%] top-[21%] h-1.5 w-1.5 rounded-full bg-claude/70" />
          <span className="absolute left-[22%] top-[21%] h-1.5 w-1.5 rounded-full bg-codex/70" />
          <span className="absolute left-[27%] top-[21%] h-1.5 w-1.5 rounded-full bg-primary/70" />
        </>
      );
  }
}

function MascotSignature({ signature }: { signature: ModuleCoverSignature }) {
  const mascots = signature === "pair" ? ["codex", "claude"] : [signature];

  return (
    <div className="absolute bottom-[10%] right-[8%] flex items-end gap-1.5 opacity-80">
      {mascots.map((mascot, index) => (
        <span
          key={mascot}
          className={`flex items-center justify-center rounded-[5px] border bg-[#10151b] ${
            mascot === "codex"
              ? "h-7 w-7 border-codex/40 text-codex"
              : "h-6 w-6 border-claude/40 text-claude"
          }`}
          style={{ transform: `translateY(${index * 3}px)` }}
        >
          <Bot className="h-3.5 w-3.5" strokeWidth={1.8} />
        </span>
      ))}
    </div>
  );
}

interface ModuleCoverArtworkProps {
  metadata: ModuleCoverMetadata;
  locked?: boolean;
}

export function ModuleCoverArtwork({
  metadata,
  locked = false,
}: ModuleCoverArtworkProps) {
  const Icon = ICONS[metadata.icon];
  const accent = ACCENTS[metadata.accent];
  const seed = [...metadata.topic].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const markerStyle = (index: number): CSSProperties => ({
    left: `${10 + ((seed + index * 23) % 76)}%`,
    top: `${10 + ((seed * (index + 2)) % 72)}%`,
  });

  return (
    <div
      aria-hidden="true"
      data-cover-topic={metadata.topic}
      className={`relative isolate h-full w-full overflow-hidden bg-[#0b0d10] motion-safe:transition-transform motion-safe:duration-300 group-hover/card:scale-[1.025] ${
        locked ? "grayscale opacity-60" : ""
      }`}
      style={{
        backgroundImage:
          "linear-gradient(118deg, hsl(var(--codex) / 0.08) 0%, transparent 24%), linear-gradient(242deg, hsl(var(--claude) / 0.08) 0%, transparent 26%), linear-gradient(145deg, #151a20 0%, #090b0e 72%)",
      }}
    >
      <span className="absolute left-[8%] top-0 h-px w-[58%] rotate-[18deg] bg-codex/20" />
      <span className="absolute bottom-[6%] right-[5%] h-px w-[48%] -rotate-[20deg] bg-claude/20" />
      <span className="absolute inset-[7%] rounded-[6px] border border-white/[0.06]" />

      <Motif layout={metadata.layout} accent={accent} />

      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`absolute h-1.5 w-1.5 rounded-full ${index === 1 ? accent.fill : "bg-white/20"}`}
          style={markerStyle(index)}
        />
      ))}

      <span
        className={`absolute left-1/2 top-1/2 flex h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[8px] border bg-[#11161b]/90 ${accent.border} ${accent.text}`}
        style={{ boxShadow: "0 18px 50px rgb(0 0 0 / 0.45)" }}
      >
        <Icon className="h-[48%] w-[48%]" strokeWidth={1.55} />
      </span>

      {metadata.signature && <MascotSignature signature={metadata.signature} />}
    </div>
  );
}
