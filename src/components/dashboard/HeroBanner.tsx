import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-8 md:p-10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm md:text-base text-muted-foreground mb-2">
          {getGreeting()}, <span className="text-foreground font-medium">{getUserName()}</span> 👋
        </p>
        
        <h1 
          className={`text-2xl md:text-4xl lg:text-5xl font-bold leading-tight transition-all duration-300 ${
            isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            {phrases[phraseIndex]}
          </span>
        </h1>

        {/* Phrase indicators */}
        <div className="flex gap-1.5 mt-6">
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
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === phraseIndex 
                  ? "w-8 bg-primary" 
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
