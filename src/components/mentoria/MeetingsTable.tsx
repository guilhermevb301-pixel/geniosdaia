import { ExternalLink, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Meeting } from "@/hooks/useMenteeData";

interface MeetingsTableProps {
  meetings: Meeting[];
}

export function MeetingsTable({ meetings }: MeetingsTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          Encontros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {meetings.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Nenhum encontro registrado ainda.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Tema</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>URL do Vídeo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id} className="border-border">
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell>
                    {format(new Date(meeting.meeting_date), "dd MMM yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {meeting.video_url ? (
                      <a
                        href={meeting.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        Assistir
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
