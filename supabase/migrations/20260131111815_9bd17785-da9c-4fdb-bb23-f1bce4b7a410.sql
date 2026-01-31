-- Create table for objective groups (editable by mentor/admin)
CREATE TABLE public.objective_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for objective items
CREATE TABLE public.objective_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.objective_groups(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  objective_key TEXT NOT NULL UNIQUE,
  requires_infra BOOLEAN NOT NULL DEFAULT false,
  is_infra BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.objective_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objective_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for objective_groups
CREATE POLICY "Anyone can read objective_groups"
ON public.objective_groups FOR SELECT USING (true);

CREATE POLICY "Mentors and admins can manage objective_groups"
ON public.objective_groups FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role));

-- RLS policies for objective_items
CREATE POLICY "Anyone can read objective_items"
ON public.objective_items FOR SELECT USING (true);

CREATE POLICY "Mentors and admins can manage objective_items"
ON public.objective_items FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role));

-- Insert default objective groups
INSERT INTO public.objective_groups (title, order_index) VALUES
('A) Quero construir meu Agente (produto)', 0),
('B) Quero vender (dinheiro)', 1),
('C) Quero crescer (audiência)', 2),
('D) Infra obrigatória (pré-requisito do Agente)', 3),
('E) Ativos criativos', 4);

-- Insert default objective items
INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Criar meu 1º Agente de IA do zero (rodando)', 'criar_agente', true, false, 0, ARRAY['agentes', 'n8n', 'automacao', 'ia']
FROM public.objective_groups WHERE title LIKE 'A)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Vender primeiro projeto de Agente de IA (pacotes + oferta)', 'vender_projeto', false, false, 0, ARRAY['vendas', 'comercial', 'propostas']
FROM public.objective_groups WHERE title LIKE 'B)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Fechar clientes para Agentes (prospecção ativa + passiva)', 'fechar_clientes', false, false, 1, ARRAY['prospecao', 'clientes', 'vendas']
FROM public.objective_groups WHERE title LIKE 'B)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Vender + Fechar clientes (combo)', 'vender_fechar_combo', false, false, 2, ARRAY['vendas', 'prospecao', 'comercial']
FROM public.objective_groups WHERE title LIKE 'B)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Criar proposta que vende (1 página + 3 pacotes)', 'criar_proposta', false, false, 3, ARRAY['propostas', 'comercial', 'vendas']
FROM public.objective_groups WHERE title LIKE 'B)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Viralizar nas redes (posicionamento + ideias + consistência)', 'viralizar', false, false, 0, ARRAY['crescimento', 'redes', 'marketing']
FROM public.objective_groups WHERE title LIKE 'C)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Criar conteúdo que vende (não só viral)', 'conteudo_vende', false, false, 1, ARRAY['conteudo', 'marketing', 'vendas']
FROM public.objective_groups WHERE title LIKE 'C)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Criar Agentes + Viralizar (combo)', 'agentes_viralizar_combo', true, false, 2, ARRAY['agentes', 'crescimento', 'marketing', 'automacao']
FROM public.objective_groups WHERE title LIKE 'C)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Criar Agentes + Fechar clientes + Viralizar (combo completo)', 'agentes_fechar_viralizar_combo', true, false, 3, ARRAY['agentes', 'vendas', 'crescimento', 'automacao']
FROM public.objective_groups WHERE title LIKE 'C)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Infra do Agente: VPS + Baserow + n8n + credenciais + número/WhatsApp', 'infra_agente', false, true, 0, ARRAY['infra', 'n8n', 'vps', 'baserow', 'whatsapp']
FROM public.objective_groups WHERE title LIKE 'D)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Criar vídeos incríveis (produção)', 'criar_videos', false, false, 0, ARRAY['videos', 'producao']
FROM public.objective_groups WHERE title LIKE 'E)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Criar vídeos + Viralizar (combo)', 'videos_viralizar_combo', false, false, 1, ARRAY['videos', 'crescimento', 'marketing']
FROM public.objective_groups WHERE title LIKE 'E)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Criar fotos profissionais (produção)', 'criar_fotos', false, false, 2, ARRAY['fotos', 'producao']
FROM public.objective_groups WHERE title LIKE 'E)%';

INSERT INTO public.objective_items (group_id, label, objective_key, requires_infra, is_infra, order_index, tags)
SELECT id, 'Fotos profissionais + portfólio pra vender serviço', 'fotos_portfolio', false, false, 3, ARRAY['fotos', 'portfolio', 'vendas']
FROM public.objective_groups WHERE title LIKE 'E)%';