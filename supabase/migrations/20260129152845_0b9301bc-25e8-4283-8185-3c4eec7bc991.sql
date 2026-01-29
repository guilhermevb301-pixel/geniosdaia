-- Remove política antiga de admin only
DROP POLICY IF EXISTS "Admins can manage challenges" ON public.challenges;

-- Nova política para admins E mentores
CREATE POLICY "Admins and mentors can manage challenges"
ON public.challenges
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentor'::app_role)
);