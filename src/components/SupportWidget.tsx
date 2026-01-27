import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SupportWidget() {
  const whatsappNumber = "5511999999999"; // Substituir pelo número real
  const whatsappMessage = encodeURIComponent("Olá! Preciso de ajuda com a plataforma Gênios da IA.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <Card className="fixed bottom-4 left-[calc(16rem+1rem)] z-50 w-64 bg-card border-border shadow-lg">
      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="font-medium text-sm text-foreground">Precisa de Ajuda?</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Entre em contato com nosso suporte
          </p>
        </div>
        <Button
          asChild
          className="w-full bg-success hover:bg-success/90 text-success-foreground"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" />
            Falar no WhatsApp
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
