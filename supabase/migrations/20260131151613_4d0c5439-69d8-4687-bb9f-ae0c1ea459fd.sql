-- Criar tabela de banners do dashboard
CREATE TABLE public.dashboard_banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text,
  gradient text DEFAULT 'from-primary to-purple-600',
  button_text text DEFAULT 'Saiba Mais',
  button_url text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.dashboard_banners ENABLE ROW LEVEL SECURITY;

-- Todos usuarios autenticados podem ver banners ativos
CREATE POLICY "Anyone can view active banners"
ON public.dashboard_banners FOR SELECT
USING (is_active = true);

-- Admins e mentores podem gerenciar banners
CREATE POLICY "Admins and mentors can manage banners"
ON public.dashboard_banners FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role));

-- Inserir banners iniciais de exemplo
INSERT INTO public.dashboard_banners (title, subtitle, button_text, button_url, gradient, order_index) VALUES
('Junte-se à Comunidade', 'Conecte-se com outros automatizadores', 'Acessar Comunidade', '/eventos', 'from-primary to-purple-600', 1),
('Próximo Evento Ao Vivo', 'Workshop: Automações Avançadas com IA', 'Ver Eventos', '/eventos', 'from-blue-500 to-cyan-500', 2),
('Novos Templates', 'Confira os templates mais recentes', 'Explorar Templates', '/templates', 'from-accent to-orange-500', 3),
('Desafios Semanais', 'Complete desafios e ganhe XP', 'Ver Desafios', '/desafios', 'from-green-500 to-emerald-600', 4);