-- Atualizar RLS para prompts - permitir mentores gerenciarem
DROP POLICY IF EXISTS "Admins can manage prompts" ON prompts;
CREATE POLICY "Admins and mentors can manage prompts"
ON prompts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role));