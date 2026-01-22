import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Mentee } from "@/hooks/useMenteeData";

interface MenteeHeaderProps {
  mentee: Mentee;
}

export function MenteeHeader({ mentee }: MenteeHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Name and Tag */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{mentee.display_name}</h1>
        <Badge variant="secondary" className="text-xs">
          {mentee.plan_tag}
        </Badge>
      </div>

      {/* Welcome Banner */}
      {mentee.welcome_message && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 p-4">
          <p className="text-sm text-muted-foreground">{mentee.welcome_message}</p>
        </Card>
      )}
    </div>
  );
}
