import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const phrases = [
  "Quem automatiza, domina o tempo.",
  "A automação é o superpoder do século XXI.",
  "Menos cliques, mais resultados.",
  "Automatize o chato, foque no que importa.",
  "Transforme horas em segundos.",
];

export function HeroBanner() {
  const { user } = useAuth();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsAnimating(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getUserName = () => {
    if (!user?.email) return "";
    const name = user.email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl glass-purple p-8 md:p-10">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/4 left-1/2 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[60px] animate-float" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <p className="text-base md:text-lg text-muted-foreground mb-3">
            {getGreeting()}, <span className="text-foreground font-semibold">{getUserName()}</span> 👋
          </p>
          
          <h1 
            className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-tight transition-all duration-300 ${
              isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            <span className="text-gradient">
              {phrases[phraseIndex]}
            </span>
          </h1>

          {/* Phrase indicators */}
          <div className="flex gap-2 mt-6">
            {phrases.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setPhraseIndex(idx);
                    setIsAnimating(false);
                  }, 300);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === phraseIndex 
                    ? "w-10 bg-primary glow-sm" 
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Next Action Card */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 card-glow">
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/5 to-transparent animate-shimmer" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center shrink-0 animate-pulse-glow">
              <Zap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary-foreground mb-1">
                Sua Próxima Jogada
              </h2>
              <p className="text-primary-foreground/80 text-sm md:text-base">
                Continue de onde parou e avance no seu aprendizado de automação
              </p>
            </div>
          </div>
          <Button 
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold hover-scale shrink-0"
            asChild
          >
            <Link to="/aulas">
              Continuar Estudando
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
