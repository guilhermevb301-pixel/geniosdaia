import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { XPBar } from "@/components/gamification/XPBar";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { useUserXP } from "@/hooks/useUserXP";
import { useUserStreak } from "@/hooks/useUserStreak";

interface TopBarProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export function TopBar({ onMenuClick, showMenu }: TopBarProps) {
  const { levelInfo, isLoading: isLoadingXP } = useUserXP();
  const { currentStreak, isLoading: isLoadingStreak } = useUserStreak();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md sm:px-8 md:px-12 lg:px-14">
      {/* Mobile Menu Button + Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        {showMenu && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar aulas, templates..."
            className="surface-raised h-10 border-border bg-secondary/70 pl-9 text-[13px] focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Gamification Stats - Hidden on small screens */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Level Badge with XP Progress */}
          {!isLoadingXP && (
            <div className="flex items-center gap-2">
              <LevelBadge level={levelInfo.level} name={levelInfo.name} size="sm" />
              <div className="w-20">
                <XPBar 
                  currentXP={levelInfo.xpInLevel} 
                  xpForNextLevel={levelInfo.xpForNextLevel} 
                  progress={levelInfo.progress}
                  size="sm"
                  showLabel={false}
                />
              </div>
            </div>
          )}
          
          {/* Streak Counter */}
          {!isLoadingStreak && (
            <StreakCounter streak={currentStreak} size="sm" />
          )}
        </div>

        <Button variant="ghost" size="icon" className="focus-ring relative" aria-label="Notificações">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}
