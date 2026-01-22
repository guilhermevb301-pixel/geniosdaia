-- 1. Tabela de Mentorados (perfis aprovados na mentoria)
CREATE TABLE public.mentees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mentor_id UUID,
  display_name TEXT NOT NULL,
  plan_tag TEXT DEFAULT 'Individual 2.0',
  community_url TEXT,
  scheduling_url TEXT,
  welcome_message TEXT DEFAULT 'Bem-vindo à sua jornada de mentoria! Aqui você encontrará todos os recursos e acompanhamento do seu progresso.',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Encontros/Reuniões
CREATE TABLE public.mentorship_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID REFERENCES public.mentees(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  video_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Etapas do Projeto de Mentoria
CREATE TABLE public.mentorship_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID REFERENCES public.mentees(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  objective TEXT,
  icon TEXT DEFAULT 'folder',
  icon_color TEXT DEFAULT '#F59E0B',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tarefas (Checkboxes)
CREATE TABLE public.mentorship_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.mentorship_stages(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  is_subtask BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Notas de Mentoria (bullet points)
CREATE TABLE public.mentorship_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.mentorship_stages(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.mentees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_notes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is a mentee
CREATE OR REPLACE FUNCTION public.is_mentee(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentees
    WHERE user_id = _user_id
      AND status = 'active'
  )
$$;

-- RLS Policies for mentees table
CREATE POLICY "Users can view their own mentee profile"
ON public.mentees FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Mentors can view their mentees"
ON public.mentees FOR SELECT
USING (auth.uid() = mentor_id OR has_role(auth.uid(), 'mentor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins and mentors can manage mentees"
ON public.mentees FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

-- RLS Policies for mentorship_meetings table
CREATE POLICY "Mentees can view their own meetings"
ON public.mentorship_meetings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mentees
    WHERE mentees.id = mentee_id AND mentees.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors and admins can manage meetings"
ON public.mentorship_meetings FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

-- RLS Policies for mentorship_stages table
CREATE POLICY "Mentees can view their own stages"
ON public.mentorship_stages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mentees
    WHERE mentees.id = mentee_id AND mentees.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors and admins can manage stages"
ON public.mentorship_stages FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

-- RLS Policies for mentorship_tasks table
CREATE POLICY "Mentees can view their own tasks"
ON public.mentorship_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mentorship_stages s
    JOIN public.mentees m ON m.id = s.mentee_id
    WHERE s.id = stage_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Mentees can update their own tasks"
ON public.mentorship_tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.mentorship_stages s
    JOIN public.mentees m ON m.id = s.mentee_id
    WHERE s.id = stage_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors and admins can manage tasks"
ON public.mentorship_tasks FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

-- RLS Policies for mentorship_notes table
CREATE POLICY "Mentees can view their own notes"
ON public.mentorship_notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mentorship_stages s
    JOIN public.mentees m ON m.id = s.mentee_id
    WHERE s.id = stage_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors and admins can manage notes"
ON public.mentorship_notes FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

-- Trigger for updated_at on mentees
CREATE TRIGGER update_mentees_updated_at
BEFORE UPDATE ON public.mentees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();