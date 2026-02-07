import { MentorRoute } from "@/components/admin/MentorRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSidebarSettings } from "@/hooks/useSidebarSettings";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const colorOptions = [
  { value: "amber-400", label: "Dourado", class: "bg-amber-400" },
  { value: "primary", label: "Roxo", class: "bg-primary" },
  { value: "emerald-400", label: "Verde", class: "bg-emerald-400" },
  { value: "rose-400", label: "Rosa", class: "bg-rose-400" },
  { value: "sky-400", label: "Azul", class: "bg-sky-400" },
  { value: "orange-400", label: "Laranja", class: "bg-orange-400" },
];

export default function AdminAppearance() {
  const { iconColor, updateIconColor, isUpdating } = useSidebarSettings();

  return (
    <MentorRoute>
      <AppLayout>
        <div className="container py-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Aparência</h1>
              <p className="text-muted-foreground">
                Personalize a aparência da plataforma
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cor dos Ícones da Sidebar</CardTitle>
              <CardDescription>
                Escolha a cor que será aplicada aos ícones do menu lateral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {colorOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    disabled={isUpdating}
                    className={cn(
                      "h-auto flex-col gap-3 py-4 relative",
                      iconColor === option.value && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                    onClick={() => updateIconColor(option.value)}
                  >
                    <div className={cn("w-10 h-10 rounded-full", option.class)} />
                    <span className="text-sm font-medium">{option.label}</span>
                    {iconColor === option.value && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </MentorRoute>
  );
}
