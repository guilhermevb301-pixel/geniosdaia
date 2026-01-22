import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CourseProgress } from "@/components/aulas/CourseProgress";
import { ModuleAccordion } from "@/components/aulas/ModuleAccordion";
import { VideoPlayer } from "@/components/aulas/VideoPlayer";

// Dados mockados - serão substituídos por dados reais do banco
const mockModules = [
  {
    id: "mod-1",
    title: "Módulo 1 - Introdução ao n8n",
    lessons: [
      { id: "les-1", title: "O que é n8n?", duration: "5:30", completed: false },
      { id: "les-2", title: "Instalando o n8n", duration: "8:15", completed: false },
      { id: "les-3", title: "Interface do n8n", duration: "12:00", completed: false },
      { id: "les-4", title: "Seu primeiro workflow", duration: "15:45", completed: false },
      { id: "les-5", title: "Nodes básicos", duration: "10:20", completed: false },
      { id: "les-6", title: "Conectando nodes", duration: "8:30", completed: false },
      { id: "les-7", title: "Testando workflows", duration: "6:45", completed: false },
      { id: "les-8", title: "Exercícios práticos", duration: "20:00", completed: false },
    ],
  },
  {
    id: "mod-2",
    title: "Módulo 2 - Integrações Avançadas",
    lessons: [
      { id: "les-9", title: "Webhooks", duration: "14:30", completed: false },
      { id: "les-10", title: "APIs REST", duration: "18:00", completed: false },
      { id: "les-11", title: "Autenticação OAuth", duration: "12:45", completed: false },
      { id: "les-12", title: "Tratamento de erros", duration: "10:15", completed: false },
      { id: "les-13", title: "Projeto prático", duration: "25:00", completed: false },
    ],
  },
  {
    id: "mod-3",
    title: "Módulo 3 - IA no n8n",
    lessons: [
      { id: "les-14", title: "Integrando ChatGPT", duration: "16:00", completed: false },
      { id: "les-15", title: "Claude e outros modelos", duration: "14:30", completed: false },
      { id: "les-16", title: "Automações inteligentes", duration: "20:00", completed: false },
    ],
  },
];

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
  description?: string;
}

export default function Aulas() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [modules, setModules] = useState(mockModules);

  const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, mod) => acc + mod.lessons.filter((l) => l.completed).length,
    0
  );

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleMarkComplete = () => {
    if (!selectedLesson) return;

    setModules((prevModules) =>
      prevModules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((les) =>
          les.id === selectedLesson.id ? { ...les, completed: true } : les
        ),
      }))
    );

    setSelectedLesson({ ...selectedLesson, completed: true });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Aulas</h1>
          <p className="text-sm text-muted-foreground">
            Seu curso de automação com n8n
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* Left Column - Progress & Modules */}
          <div className="space-y-4">
            <CourseProgress
              completedLessons={completedLessons}
              totalLessons={totalLessons}
            />
            <ModuleAccordion
              modules={modules}
              selectedLessonId={selectedLesson?.id || null}
              onSelectLesson={handleSelectLesson}
            />
          </div>

          {/* Right Column - Video Player */}
          <div>
            <VideoPlayer
              lesson={selectedLesson}
              onMarkComplete={handleMarkComplete}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
