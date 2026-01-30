import { Bot, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface GptCardProps {
  gpt: {
    id: string;
    title: string;
    description: string | null;
    gpt_url: string;
    icon_url: string | null;
  };
}

export function GptCard({ gpt }: GptCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="p-6 space-y-4">
        {/* Icon */}
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
          {gpt.icon_url ? (
            <ImageWithSkeleton
              src={gpt.icon_url}
              alt={gpt.title}
              className="h-8 w-8 rounded-lg"
              containerClassName="h-8 w-8"
            />
          ) : (
            <Bot className="h-6 w-6 text-primary" />
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="font-semibold text-foreground">{gpt.title}</h3>
          {gpt.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {gpt.description}
            </p>
          )}
        </div>

        {/* Button */}
        <a
          href={gpt.gpt_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Acessar GPT
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  );
}
