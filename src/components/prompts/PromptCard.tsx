import { Copy, Video, Image, Bot } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Prompt {
  id: string;
  category: 'video' | 'image' | 'agent';
  title: string;
  content: string;
  description: string | null;
  tags: string[];
}

interface PromptCardProps {
  prompt: Prompt;
}

const categoryIcons = {
  video: Video,
  image: Image,
  agent: Bot,
};

const categoryColors = {
  video: "text-red-500",
  image: "text-green-500",
  agent: "text-blue-500",
};

export function PromptCard({ prompt }: PromptCardProps) {
  const Icon = categoryIcons[prompt.category];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast.success("Prompt copiado!");
    } catch {
      toast.error("Erro ao copiar prompt");
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-muted ${categoryColors[prompt.category]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2">{prompt.title}</CardTitle>
            {prompt.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {prompt.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <div className="bg-muted rounded-lg p-3 max-h-32 overflow-y-auto">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
            {prompt.content}
          </pre>
        </div>
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button onClick={handleCopy} className="w-full" variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          Copiar Prompt
        </Button>
      </CardFooter>
    </Card>
  );
}
