-- Add new columns to challenges table for enhanced functionality
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'intermediario',
ADD COLUMN IF NOT EXISTS reward_badge text,
ADD COLUMN IF NOT EXISTS reward_highlight boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tracks text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deliverables_schema jsonb DEFAULT '{}';

-- Add comment for tracks
COMMENT ON COLUMN public.challenges.tracks IS 'Array of track names: agentes, videos, fotos, crescimento, propostas';
COMMENT ON COLUMN public.challenges.difficulty IS 'iniciante, intermediario, avancado';

-- Add new columns to challenge_submissions
ALTER TABLE public.challenge_submissions
ADD COLUMN IF NOT EXISTS track text,
ADD COLUMN IF NOT EXISTS proof_links text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assets text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS time_spent_minutes integer,
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1;

-- Create user_profiles table for user preferences and goals
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  main_track text DEFAULT 'agentes',
  goals jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins and mentors can view all profiles
CREATE POLICY "Admins and mentors can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

-- Create xp_events table for XP transaction logging
CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text NOT NULL,
  xp integer NOT NULL,
  reference_type text,
  reference_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on xp_events
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for xp_events
CREATE POLICY "Users can view their own xp events" 
ON public.xp_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own xp events" 
ON public.xp_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all xp events
CREATE POLICY "Admins can view all xp events" 
ON public.xp_events 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create user_votes tracking table to check if user already voted
CREATE TABLE IF NOT EXISTS public.user_submission_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  submission_id uuid REFERENCES public.challenge_submissions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, submission_id)
);

-- Enable RLS on user_submission_votes
ALTER TABLE public.user_submission_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_submission_votes
CREATE POLICY "Users can view votes" 
ON public.user_submission_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own vote" 
ON public.user_submission_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vote" 
ON public.user_submission_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create daily_challenges table for personalized challenges
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track text NOT NULL,
  difficulty text NOT NULL DEFAULT 'iniciante',
  title text NOT NULL,
  objective text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]',
  deliverable text NOT NULL,
  checklist jsonb NOT NULL DEFAULT '[]',
  estimated_minutes integer DEFAULT 30,
  is_bonus boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on daily_challenges
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Anyone can view daily challenges
CREATE POLICY "Anyone can view daily challenges" 
ON public.daily_challenges 
FOR SELECT 
USING (true);

-- Only admins and mentors can manage daily challenges
CREATE POLICY "Admins and mentors can manage daily challenges" 
ON public.daily_challenges 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

-- Insert sample daily challenges for each track
INSERT INTO public.daily_challenges (track, difficulty, title, objective, steps, deliverable, checklist, estimated_minutes, is_bonus) VALUES
-- Agentes
('agentes', 'iniciante', 'Crie seu primeiro agente de atendimento', 'Construir um agente simples que responde perguntas frequentes', '["Escolha uma plataforma (ChatGPT, Claude, etc)", "Defina 5 perguntas frequentes do seu nicho", "Escreva respostas claras e objetivas", "Teste o agente com diferentes variações de perguntas"]', 'Link do agente funcionando ou print das conversas de teste', '["Agente responde corretamente", "Respostas são naturais", "Cobre casos de erro"]', 30, false),
('agentes', 'intermediario', 'Integre seu agente com uma base de conhecimento', 'Conectar seu agente a documentos ou dados externos', '["Prepare seus documentos (PDF, TXT)", "Configure a integração de conhecimento", "Defina instruções de busca", "Teste com perguntas específicas dos documentos"]', 'Demonstração do agente respondendo com base nos documentos', '["Busca funciona corretamente", "Citações são precisas", "Fallback configurado"]', 45, false),
-- Vídeos
('videos', 'iniciante', 'Gere seu primeiro vídeo com avatar IA', 'Criar um vídeo curto usando um avatar de IA', '["Escolha uma ferramenta (HeyGen, Synthesia, etc)", "Escreva um roteiro de 30 segundos", "Selecione um avatar e voz", "Gere e baixe o vídeo"]', 'Vídeo de até 30 segundos com avatar IA', '["Áudio está sincronizado", "Qualidade visual boa", "Mensagem clara"]', 25, false),
('videos', 'intermediario', 'Crie um vídeo com múltiplas cenas', 'Produzir um vídeo com transições e diferentes elementos', '["Planeje 3-5 cenas diferentes", "Crie cada cena separadamente", "Adicione transições e música", "Exporte em alta qualidade"]', 'Vídeo editado com múltiplas cenas', '["Transições suaves", "Áudio consistente", "Narrativa coerente"]', 45, false),
-- Fotos
('fotos', 'iniciante', 'Gere sua primeira imagem com IA', 'Criar uma imagem impressionante usando prompts', '["Escolha uma ferramenta (Midjourney, DALL-E, etc)", "Estude exemplos de bons prompts", "Escreva seu prompt detalhado", "Gere e refine a imagem"]', 'Imagem gerada + prompt utilizado', '["Imagem de alta qualidade", "Prompt bem estruturado", "Resultado consistente"]', 20, false),
('fotos', 'intermediario', 'Crie um pack de imagens para rede social', 'Produzir um conjunto coeso de imagens para posts', '["Defina o estilo visual", "Crie 5 variações mantendo consistência", "Ajuste cores e composição", "Prepare para diferentes formatos"]', '5 imagens prontas para uso em redes sociais', '["Estilo consistente", "Formatos corretos", "Alta resolução"]', 40, false),
-- Crescimento
('crescimento', 'iniciante', 'Mapeie sua primeira audiência ideal', 'Identificar e documentar seu público-alvo', '["Liste características demográficas", "Identifique dores e desejos", "Pesquise onde sua audiência está", "Crie uma persona detalhada"]', 'Documento com persona e mapa de audiência', '["Persona bem definida", "Dores identificadas", "Canais mapeados"]', 30, false),
('crescimento', 'intermediario', 'Crie um funil simples de captação', 'Montar um funil básico para captar leads', '["Defina a oferta de entrada (isca)", "Crie landing page simples", "Configure automação de e-mail", "Teste o fluxo completo"]', 'Funil funcionando com pelo menos 1 lead teste', '["Landing page funciona", "E-mails são enviados", "Dados são capturados"]', 60, false),
-- Propostas (Bônus semanal)
('propostas', 'intermediario', 'Escreva uma proposta comercial irresistível', 'Criar uma proposta que converte usando IA', '["Analise o cliente e suas dores", "Use IA para estruturar a proposta", "Inclua cases e provas sociais", "Defina preço e condições claras", "Revise e personalize o documento"]', 'PDF da proposta comercial completa', '["Estrutura profissional", "Valor claro", "Call-to-action definido", "Prazo e condições especificados"]', 45, true)
ON CONFLICT DO NOTHING;