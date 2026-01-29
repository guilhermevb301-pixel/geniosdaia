// XP amounts for different actions
export const XP_REWARDS = {
  LESSON_COMPLETED: 10,
  MODULE_COMPLETED: 25,
  PROMPT_COPIED: 5,
  EVENT_ATTENDED: 50,
  CHALLENGE_COMPLETED: 100,
  STREAK_BONUS: 5,
} as const;

// Level definitions
export const LEVELS = [
  { level: 1, name: "Iniciante", minXP: 0, maxXP: 100 },
  { level: 2, name: "Aprendiz", minXP: 101, maxXP: 300 },
  { level: 3, name: "Praticante", minXP: 301, maxXP: 600 },
  { level: 4, name: "Automatizador", minXP: 601, maxXP: 1000 },
  { level: 5, name: "Especialista", minXP: 1001, maxXP: 2000 },
  { level: 6, name: "Mestre", minXP: 2001, maxXP: 5000 },
  { level: 7, name: "Gênio da IA", minXP: 5001, maxXP: Infinity },
] as const;

export function getLevelInfo(xp: number) {
  const level = LEVELS.find((l) => xp >= l.minXP && xp <= l.maxXP) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);
  
  const currentLevelXP = xp - level.minXP;
  const xpForNextLevel = nextLevel 
    ? nextLevel.minXP - level.minXP 
    : level.maxXP - level.minXP;
  
  const progress = nextLevel 
    ? Math.min((currentLevelXP / xpForNextLevel) * 100, 100)
    : 100;

  return {
    level: level.level,
    name: level.name,
    currentXP: xp,
    xpInLevel: currentLevelXP,
    xpForNextLevel,
    progress,
    nextLevel: nextLevel?.name || null,
  };
}

export function getLevelColor(level: number): string {
  switch (level) {
    case 1: return "text-muted-foreground";
    case 2: return "text-green-500";
    case 3: return "text-blue-500";
    case 4: return "text-purple-500";
    case 5: return "text-orange-500";
    case 6: return "text-red-500";
    case 7: return "text-amber-400";
    default: return "text-muted-foreground";
  }
}

export function getLevelBgColor(level: number): string {
  switch (level) {
    case 1: return "bg-muted";
    case 2: return "bg-green-500/20";
    case 3: return "bg-blue-500/20";
    case 4: return "bg-purple-500/20";
    case 5: return "bg-orange-500/20";
    case 6: return "bg-red-500/20";
    case 7: return "bg-amber-400/20";
    default: return "bg-muted";
  }
}
