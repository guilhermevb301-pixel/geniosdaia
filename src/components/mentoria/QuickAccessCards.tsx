import { Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickAccessCardsProps {
  schedulingUrl: string | null;
  communityUrl: string | null;
}

export function QuickAccessCards({ schedulingUrl, communityUrl }: QuickAccessCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Marcar Mentoria */}
      <Card
        className="group cursor-pointer border-border bg-card hover:border-primary/50 transition-all"
        onClick={() => schedulingUrl && window.open(schedulingUrl, "_blank")}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Marcar Mentoria</h3>
            <p className="text-xs text-muted-foreground">Agendar mentorias individuais</p>
          </div>
        </CardContent>
      </Card>

      {/* Acessar Comunidade */}
      <Card
        className="group cursor-pointer border-border bg-card hover:border-primary/50 transition-all"
        onClick={() => communityUrl && window.open(communityUrl, "_blank")}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
            <Users className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-medium">Acessar Comunidade</h3>
            <p className="text-xs text-muted-foreground">Conecte-se com outros mentorados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
