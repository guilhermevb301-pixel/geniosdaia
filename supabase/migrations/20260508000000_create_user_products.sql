-- Tabela para controlar quais produtos cada usuário comprou
CREATE TABLE public.user_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  product_slug text NOT NULL,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email, product_slug)
);

ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seus próprios produtos
CREATE POLICY "Users can view their own products"
ON public.user_products FOR SELECT
TO authenticated
USING (lower(email) = lower((auth.jwt() ->> 'email')));

-- Admins gerenciam tudo
CREATE POLICY "Admins can manage user_products"
ON public.user_products FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Adiciona product_slug em module_sections para que admin possa vincular seção a produto
ALTER TABLE public.module_sections ADD COLUMN IF NOT EXISTS product_slug text;

COMMENT ON COLUMN public.module_sections.product_slug IS 'Slug do produto necessário para acessar esta seção. NULL = acesso livre para todos os membros do curso principal.';
