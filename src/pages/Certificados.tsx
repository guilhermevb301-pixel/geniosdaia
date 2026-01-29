import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCertificates, Certificate } from "@/hooks/useCertificates";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, Download, Share2, Lock, ExternalLink, QrCode } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

function CertificatePreview({ certificate }: { certificate: Certificate }) {
  return (
    <div className="relative bg-gradient-to-br from-background via-muted/50 to-background border-2 border-primary/20 rounded-xl p-8 aspect-[1.4/1]">
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />

      <div className="text-center space-y-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <Award className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gênios da IA
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Certificado de Conclusão</p>
          <p className="text-lg">Este certificado é concedido a</p>
        </div>

        <h2 className="text-2xl font-bold text-primary">{certificate.user_name}</h2>

        <p className="text-muted-foreground">por ter concluído com sucesso o módulo</p>

        <h3 className="text-xl font-semibold">{certificate.module_title}</h3>

        {certificate.module_duration && (
          <p className="text-sm text-muted-foreground">
            Carga horária: {certificate.module_duration}
          </p>
        )}

        <div className="flex items-center justify-center gap-8 pt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Data de Conclusão</p>
            <p className="font-medium">{new Date(certificate.issued_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Código</p>
            <p className="font-mono font-medium text-primary">{certificate.certificate_code}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertificateModal({ 
  certificate, 
  open, 
  onClose 
}: { 
  certificate: Certificate | null; 
  open: boolean; 
  onClose: () => void;
}) {
  if (!certificate) return null;

  const verificationUrl = `${window.location.origin}/certificado/${certificate.certificate_code}`;

  const handleShare = async () => {
    const text = `Acabei de concluir o módulo "${certificate.module_title}" na plataforma Gênios da IA! 🎉\n\nVerifique meu certificado: ${verificationUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text, url: verificationUrl });
      } catch {
        await navigator.clipboard.writeText(text);
        toast({ title: "Link copiado!", description: "O texto foi copiado para a área de transferência" });
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Link copiado!", description: "O texto foi copiado para a área de transferência" });
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(verificationUrl);
    toast({ title: "Link copiado!", description: "Link de verificação copiado" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Certificado de Conclusão
          </DialogTitle>
        </DialogHeader>

        <CertificatePreview certificate={certificate} />

        <div className="flex flex-wrap gap-2 justify-center pt-4">
          <Button variant="outline" onClick={handleCopyLink} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Copiar Link de Verificação
          </Button>
          <Button onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CertificateCard({ 
  certificate, 
  onClick 
}: { 
  certificate: Certificate; 
  onClick: () => void;
}) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{certificate.module_title}</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(certificate.issued_at).toLocaleDateString("pt-BR")}
            </p>
            <p className="text-xs text-primary font-mono mt-1">{certificate.certificate_code}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LockedCertificateCard({ moduleTitle }: { moduleTitle: string }) {
  return (
    <Card className="opacity-60">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate text-muted-foreground">{moduleTitle}</h4>
            <p className="text-sm text-muted-foreground">
              Complete o módulo para desbloquear
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Certificados() {
  const { certificates, isLoading } = useCertificates();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Fetch all modules
  const { data: modules } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id, title")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  // Get modules without certificates
  const unlockedModuleIds = certificates.map((c) => c.module_id);
  const lockedModules = modules?.filter((m) => !unlockedModuleIds.includes(m.id)) || [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              Meus Certificados
            </h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            Meus Certificados
          </h1>
          <p className="text-muted-foreground mt-1">
            Certificados conquistados ao concluir módulos
          </p>
        </div>

        {/* Earned Certificates */}
        {certificates.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Conquistados ({certificates.length})</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert) => (
                <CertificateCard 
                  key={cert.id} 
                  certificate={cert}
                  onClick={() => setSelectedCertificate(cert)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locked Certificates */}
        {lockedModules.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">A Desbloquear ({lockedModules.length})</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lockedModules.map((module) => (
                <LockedCertificateCard key={module.id} moduleTitle={module.title} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {certificates.length === 0 && lockedModules.length === 0 && (
          <Card className="p-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Nenhum certificado ainda</h3>
            <p className="text-muted-foreground">Complete módulos para ganhar certificados!</p>
          </Card>
        )}

        {/* Certificate Modal */}
        <CertificateModal 
          certificate={selectedCertificate}
          open={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      </div>
    </AppLayout>
  );
}
