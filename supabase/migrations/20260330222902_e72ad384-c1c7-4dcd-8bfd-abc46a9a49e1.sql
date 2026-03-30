
-- Drop old admin-only policy
DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;

-- Create new policy allowing admins AND mentors
CREATE POLICY "Admins and mentors can manage templates"
ON public.templates
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role));
