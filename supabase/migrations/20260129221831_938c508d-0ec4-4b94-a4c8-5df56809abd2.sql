-- Criar tabela de secoes para agrupar modulos
CREATE TABLE IF NOT EXISTS public.module_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar coluna section_id na tabela modules
ALTER TABLE public.modules 
ADD COLUMN section_id UUID REFERENCES public.module_sections(id) ON DELETE SET NULL;

-- Habilitar RLS para secoes
ALTER TABLE public.module_sections ENABLE ROW LEVEL SECURITY;

-- Politica de leitura publica
CREATE POLICY "Anyone can read sections" 
ON public.module_sections FOR SELECT USING (true);

-- Politica de gerenciamento para admins e mentores
CREATE POLICY "Admins and mentors can manage sections"
ON public.module_sections FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentor'::app_role)
);