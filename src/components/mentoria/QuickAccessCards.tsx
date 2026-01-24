import { Calendar, Users, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickAccessCardsProps {
  communityUrl: string | null;
}

const SCHEDULING_URL = "https://cal.com/guilherme-felice-kutk35/1-hora";
const SUPPORT_WHATSAPP = "5511999999999";

export function QuickAccessCards({ communityUrl }: QuickAccessCardsProps) {
  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Olá! Preciso de suporte.")}`;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Menu</h2>
      
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: Marcar Mentoria */}
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              As mentorias individuais podem ser agendadas por aqui:
            </p>
            <Button 
              variant="accent"
              className="w-full font-medium"
              onClick={() => window.open(SCHEDULING_URL, "_blank")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agenda Guilherme
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Comunidade */}
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Acesso a Comunidade:</p>
            <Button 
              variant="secondary"
              className="w-full"
              onClick={() => communityUrl && window.open(communityUrl, "_blank")}
              disabled={!communityUrl}
            >
              <Users className="h-4 w-4 mr-2" />
              ACESSAR COMUNIDADE
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Suporte */}
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Para suporte mais ágil, abra um chamado:
            </p>
            <Button 
              variant="secondary"
              className="w-full"
              onClick={() => window.open(whatsappUrl, "_blank")}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              ABRIR CHAMADO
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
