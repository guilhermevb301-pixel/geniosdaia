-- Permitir mentees criar seus proprios todos
CREATE POLICY "Mentees can insert own todos" ON public.mentee_todos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mentees 
      WHERE mentees.id = mentee_todos.mentee_id 
      AND mentees.user_id = auth.uid()
    )
  );

-- Permitir mentees excluir seus proprios todos
CREATE POLICY "Mentees can delete own todos" ON public.mentee_todos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM mentees 
      WHERE mentees.id = mentee_todos.mentee_id 
      AND mentees.user_id = auth.uid()
    )
  );