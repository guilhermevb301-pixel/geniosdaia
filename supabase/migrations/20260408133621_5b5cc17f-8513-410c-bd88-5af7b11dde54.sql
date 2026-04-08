
CREATE TABLE public.compradores_autorizados (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.compradores_autorizados ENABLE ROW LEVEL SECURITY;

-- Authenticated users can check if their own email exists
CREATE POLICY "Users can check their own email"
ON public.compradores_autorizados
FOR SELECT
TO authenticated
USING (lower(email) = lower((select auth.jwt() ->> 'email')));

-- Admins and mentors can manage all records
CREATE POLICY "Admins and mentors can manage compradores"
ON public.compradores_autorizados
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role));
