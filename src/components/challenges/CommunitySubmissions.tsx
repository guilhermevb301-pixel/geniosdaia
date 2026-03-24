import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Bot } from "lucide-react";
import { ChallengeSubmission } from "@/hooks/useChallenges";
import { SubmissionCard } from "./SubmissionCard";

interface CommunitySubmissionsProps {
  submissions: ChallengeSubmission[];
  onVote: (id: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  userVotes: string[];
}

export function CommunitySubmissions({ submissions, onVote, sortBy, onSortChange, userVotes }: CommunitySubmissionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Submissões da Comunidade
        </h3>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">Mais Votados</SelectItem>
            <SelectItem value="recent">Mais Recentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {submissions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission, index) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              position={index + 1}
              onVote={onVote}
              hasVoted={userVotes.includes(submission.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhuma submissão ainda. Seja o primeiro!</p>
        </Card>
      )}
    </div>
  );
}
