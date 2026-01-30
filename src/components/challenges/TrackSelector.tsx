import { Button } from "@/components/ui/button";
import { Bot, Video, Image, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Track } from "@/hooks/useUserProfile";

const tracks: { value: Track; label: string; icon: React.ElementType; description: string }[] = [
  { value: "agentes", label: "Agentes", icon: Bot, description: "Automação com IA" },
  { value: "videos", label: "Vídeos", icon: Video, description: "Criação de vídeos" },
  { value: "fotos", label: "Imagens", icon: Image, description: "Geração de imagens" },
  { value: "crescimento", label: "Crescimento", icon: TrendingUp, description: "Marketing e vendas" },
];

interface TrackSelectorProps {
  value: Track;
  onChange: (track: Track) => void;
  disabled?: boolean;
}

export function TrackSelector({ value, onChange, disabled }: TrackSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {tracks.map((track) => {
        const Icon = track.icon;
        const isSelected = value === track.value;
        
        return (
          <Button
            key={track.value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-auto flex-col py-3 gap-1",
              isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            onClick={() => onChange(track.value)}
            disabled={disabled}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{track.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
