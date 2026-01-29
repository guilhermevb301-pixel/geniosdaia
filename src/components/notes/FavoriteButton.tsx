import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserFavorites } from "@/hooks/useUserFavorites";

interface FavoriteButtonProps {
  lessonId?: string;
  promptId?: string;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({ 
  lessonId, 
  promptId, 
  size = "md",
  className 
}: FavoriteButtonProps) {
  const { isLessonFavorited, isPromptFavorited, toggleFavorite, isToggling } = useUserFavorites();
  
  const isFavorited = lessonId 
    ? isLessonFavorited(lessonId) 
    : promptId 
      ? isPromptFavorited(promptId) 
      : false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({ lessonId, promptId });
  };

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "icon" : "default"}
      onClick={handleClick}
      disabled={isToggling}
      className={cn(
        "transition-colors",
        size === "sm" ? "h-8 w-8" : "",
        className
      )}
    >
      <Heart 
        className={cn(
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          isFavorited && "fill-primary text-primary"
        )} 
      />
      {size === "md" && (
        <span className="ml-2">{isFavorited ? "Favoritado" : "Favoritar"}</span>
      )}
    </Button>
  );
}
