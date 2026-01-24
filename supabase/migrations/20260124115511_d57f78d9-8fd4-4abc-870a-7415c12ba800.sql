-- Create table for mentee to-do items (general tasks not linked to stages)
CREATE TABLE public.mentee_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL REFERENCES public.mentees(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentee_todos ENABLE ROW LEVEL SECURITY;

-- Mentees can view their own todos
CREATE POLICY "Mentees can view own todos" ON public.mentee_todos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentees 
      WHERE mentees.id = mentee_todos.mentee_id 
      AND mentees.user_id = auth.uid()
    )
  );

-- Mentees can update their own todos (toggle completed)
CREATE POLICY "Mentees can update own todos" ON public.mentee_todos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM mentees 
      WHERE mentees.id = mentee_todos.mentee_id 
      AND mentees.user_id = auth.uid()
    )
  );

-- Mentors and admins can manage all todos
CREATE POLICY "Mentors and admins can manage todos" ON public.mentee_todos
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role)
  );