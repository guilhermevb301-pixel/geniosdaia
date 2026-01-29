import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, PartyPopper, Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  moduleName: string;
  certificateCode: string;
}

export function CelebrationModal({ 
  open, 
  onClose, 
  moduleName,
  certificateCode 
}: CelebrationModalProps) {
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (open) {
      // Generate confetti particles
      const colors = ["#8B5CF6", "#FFD93D", "#10B981", "#EC4899", "#3B82F6"];
      const particles = Array.from({ length: 50 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
      }));
      setConfetti(particles);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center overflow-hidden">
        {/* Confetti Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${particle.x}%`,
                top: `-10%`,
                backgroundColor: particle.color,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative py-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <PartyPopper className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-bounce" />
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold mb-2">Parabéns! 🎉</h2>
          <p className="text-muted-foreground mb-1">Você concluiu o módulo</p>
          <p className="text-lg font-semibold text-primary mb-4">"{moduleName}"</p>
          
          <p className="text-sm text-muted-foreground mb-6">
            Seu certificado foi gerado com sucesso!
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => window.open(`/certificado/${certificateCode}`, '_blank')}
              className="gap-2"
            >
              <Award className="h-4 w-4" />
              Ver Certificado
            </Button>
            <Button variant="outline" onClick={onClose}>
              Continuar Estudando
            </Button>
          </div>

          {/* XP Badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-sm font-medium text-primary">+25 XP Bônus</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
