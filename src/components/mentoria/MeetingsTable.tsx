import React from "react";
import { ExternalLink, Video, Users2 } from "lucide-react";
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
  menteeName?: string;
}

function truncateUrl(url: string, maxLength: number = 25): string {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace("www.", "");
    const path = parsed.pathname + parsed.search;
    const truncatedPath = path.length > 10 ? path.slice(0, 10) + "..." : path;
    const result = `${domain}${truncatedPath}`;
    return result.length > maxLength ? result.slice(0, maxLength) + "..." : result;
  } catch {
    return url.length > maxLength ? url.slice(0, maxLength) + "..." : url;
  }
}

export const MeetingsTable = React.forwardRef<HTMLDivElement, MeetingsTableProps>(
  ({ meetings, menteeName }, ref) => {
    return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Video className="h-4 w-4 text-primary" />
          </div>
          <span>Encontros</span>
          {menteeName && (
            <span className="text-muted-foreground font-normal">
              • {menteeName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {meetings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
              <Video className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum encontro registrado ainda.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-medium">Tema</TableHead>
                <TableHead className="font-medium">Data</TableHead>
                <TableHead className="font-medium">Gravação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow 
                  key={meeting.id} 
                  className="border-border group transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-muted shrink-0">
                        <Users2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span>{meeting.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
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
                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline text-sm font-medium transition-colors"
                      >
                        <span className="opacity-70 group-hover:opacity-100">
                          {truncateUrl(meeting.video_url)}
                        </span>
                        <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
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
);

MeetingsTable.displayName = "MeetingsTable";
