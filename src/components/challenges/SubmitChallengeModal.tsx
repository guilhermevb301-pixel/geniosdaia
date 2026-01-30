import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Plus, X, Clock, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useChallenges } from "@/hooks/useChallenges";
import { TrackSelector } from "./TrackSelector";
import type { Track } from "@/hooks/useUserProfile";

interface SubmitChallengeModalProps {
  challengeId: string;
  defaultTrack?: Track;
  onSuccess: () => void;
}

export function SubmitChallengeModal({ challengeId, defaultTrack = "agentes", onSuccess }: SubmitChallengeModalProps) {
  const { submit, isSubmitting } = useChallenges();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [track, setTrack] = useState<Track>(defaultTrack);
  const [proofLinks, setProofLinks] = useState<string[]>([""]);
  const [timeSpent, setTimeSpent] = useState<string>("");

  const addProofLink = () => {
    if (proofLinks.length < 5) {
      setProofLinks([...proofLinks, ""]);
    }
  };

  const removeProofLink = (index: number) => {
    setProofLinks(proofLinks.filter((_, i) => i !== index));
  };

  const updateProofLink = (index: number, value: string) => {
    const newLinks = [...proofLinks];
    newLinks[index] = value;
    setProofLinks(newLinks);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Adicione um título para seu projeto");
      return;
    }

    const validLinks = proofLinks.filter(link => link.trim() !== "");
    if (validLinks.length === 0) {
      toast.error("Adicione pelo menos um link de prova");
      return;
    }

    submit({
      challengeId,
      title: title.trim(),
      description: description.trim(),
      linkUrl: validLinks[0], // Primary link for backward compatibility
      track,
      proofLinks: validLinks,
      timeSpentMinutes: timeSpent ? parseInt(timeSpent) : undefined,
    }, {
      onSuccess: () => {
        toast.success("Projeto submetido com sucesso! 🎉");
        setOpen(false);
        resetForm();
        onSuccess();
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    });
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTrack(defaultTrack);
    setProofLinks([""]);
    setTimeSpent("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" size="lg" className="gap-2 font-semibold">
          <Upload className="h-4 w-4" />
          Submeter Meu Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Submeter Projeto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Track Selection */}
          <div className="space-y-2">
            <Label>Trilha do Projeto</Label>
            <TrackSelector value={track} onChange={setTrack} />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Projeto *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Agente de Atendimento para Clínica"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva brevemente seu projeto, o que ele faz e como você construiu..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Proof Links */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Links de Prova *
            </Label>
            <p className="text-xs text-muted-foreground">
              Adicione links para demonstrar seu trabalho (vídeo, print, link do projeto, etc.)
            </p>
            <div className="space-y-2">
              {proofLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={link}
                    onChange={(e) => updateProofLink(index, e.target.value)}
                    placeholder="https://..."
                  />
                  {proofLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProofLink(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {proofLinks.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProofLink}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Adicionar link
              </Button>
            )}
          </div>

          {/* Time Spent */}
          <div className="space-y-2">
            <Label htmlFor="timeSpent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo gasto (opcional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="timeSpent"
                type="number"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                placeholder="30"
                className="w-24"
                min={1}
                max={999}
              />
              <span className="text-sm text-muted-foreground">minutos</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
            variant="accent"
          >
            {isSubmitting ? "Enviando..." : "Enviar Submissão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
