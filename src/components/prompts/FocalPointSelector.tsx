import { useState, useRef, useCallback, useEffect } from "react";
import { Move } from "lucide-react";

interface FocalPointSelectorProps {
  imageUrl: string;
  value: string;
  onChange: (value: string) => void;
}

// Convert preset values to percentages for backward compatibility
const normalizePosition = (value: string): string => {
  const presets: Record<string, string> = {
    'top left': '0% 0%',
    'top center': '50% 0%',
    'top right': '100% 0%',
    'center left': '0% 50%',
    'center': '50% 50%',
    'center right': '100% 50%',
    'bottom left': '0% 100%',
    'bottom center': '50% 100%',
    'bottom right': '100% 100%',
  };
  return presets[value] || value;
};

const parsePosition = (value: string): { x: number; y: number } => {
  const normalized = normalizePosition(value);
  const parts = normalized.split(' ').map(v => parseFloat(v.replace('%', '')));
  return { 
    x: isNaN(parts[0]) ? 50 : parts[0], 
    y: isNaN(parts[1]) ? 50 : parts[1] 
  };
};

export function FocalPointSelector({ imageUrl, value, onChange }: FocalPointSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const position = parsePosition(value);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    
    onChange(`${Math.round(x)}% ${Math.round(y)}%`);
  }, [onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX, e.clientY);
  }, [isDragging, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [isDragging, updatePosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className="space-y-3">
      {/* Main selector */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-video rounded-lg overflow-hidden select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <img
          src={imageUrl}
          alt="Ajustar ponto focal"
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        
        {/* Focal point marker */}
        <div 
          className={`absolute w-8 h-8 pointer-events-none transition-transform ${
            isDragging ? 'scale-110' : 'scale-100'
          }`}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Outer ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-white"
            style={{
              boxShadow: '0 0 0 2px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)'
            }}
          />
          {/* Inner dot */}
          <div className="absolute inset-2 bg-white/80 rounded-full" />
          {/* Crosshair lines */}
          <div 
            className="absolute left-1/2 top-0 w-px h-full bg-white/70 -translate-x-1/2"
            style={{ boxShadow: '0 0 2px rgba(0,0,0,0.5)' }}
          />
          <div 
            className="absolute top-1/2 left-0 w-full h-px bg-white/70 -translate-y-1/2"
            style={{ boxShadow: '0 0 2px rgba(0,0,0,0.5)' }}
          />
        </div>

        {/* Instruction overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center">
          <div className="bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
            <Move className="h-3 w-3" />
            Clique e arraste para ajustar
          </div>
        </div>
      </div>

      {/* Mini card preview */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Preview no card:</p>
        <div className="w-32 aspect-video rounded-md overflow-hidden border bg-muted">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            style={{ objectPosition: `${position.x}% ${position.y}%` }}
          />
        </div>
      </div>
    </div>
  );
}
