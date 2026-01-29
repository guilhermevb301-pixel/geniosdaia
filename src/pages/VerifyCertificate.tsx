import { useParams, Link } from "react-router-dom";
import { useCertificates } from "@/hooks/useCertificates";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function VerifyCertificate() {
  const { code } = useParams<{ code: string }>();
  const { verifyCertificate } = useCertificates();

  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ["verifyCertificate", code],
    queryFn: () => verifyCertificate(code || ""),
    enabled: !!code,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Award className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gênios da IA
            </span>
          </div>

          {certificate ? (
            <>
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              
              <h1 className="text-2xl font-bold text-green-500 mb-2">
                Certificado Válido
              </h1>
              
              <p className="text-muted-foreground mb-6">
                Este certificado é autêntico e foi emitido pela plataforma Gênios da IA.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Aluno(a)</p>
                  <p className="font-medium">{certificate.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Módulo Concluído</p>
                  <p className="font-medium">{certificate.module_title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Conclusão</p>
                  <p className="font-medium">
                    {new Date(certificate.issued_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-mono text-primary">{certificate.certificate_code}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              
              <h1 className="text-2xl font-bold text-destructive mb-2">
                Certificado Não Encontrado
              </h1>
              
              <p className="text-muted-foreground mb-6">
                Não foi possível encontrar um certificado com o código informado. 
                Verifique se o código está correto.
              </p>

              <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                {code}
              </p>
            </>
          )}

          <Button asChild variant="outline" className="mt-6">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a Plataforma
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
