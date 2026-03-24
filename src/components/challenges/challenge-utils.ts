export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Há 1 dia";
  return `Há ${diffDays} dias`;
}

export function getWeekNumber(dateString: string): number {
  const date = new Date(dateString);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

export function getDifficultyLevel(difficulty: string): number {
  switch (difficulty) {
    case "iniciante": return 1;
    case "intermediario": return 2;
    case "avancado": return 3;
    default: return 2;
  }
}

export function getAvatarColor(userId: string): string {
  const colors = [
    "bg-pink-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-cyan-500",
  ];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
}
