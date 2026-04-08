import { useEffect } from "react";
import { ShieldX, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const KIWIFY_URL = "https://pay.kiwify.com.br/seu-produto"; // TODO: substituir pela URL real

export default function AcessoNegado() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Acesso Restrito
        </h1>
        <p className="text-muted-foreground">
          Você ainda não tem acesso. Adquira o produto para continuar.
        </p>
        <Button asChild size="lg" className="w-full">
          <a href={KIWIFY_URL} target="_blank" rel="noopener noreferrer">
            Comprar agora
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
        <Button variant="ghost" asChild className="w-full">
          <a href="/login">Voltar ao login</a>
        </Button>
      </div>
    </div>
  );
}
