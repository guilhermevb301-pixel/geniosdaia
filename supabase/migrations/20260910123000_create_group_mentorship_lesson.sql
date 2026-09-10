-- Converte Mentorias em grupo em uma sessão real da biblioteca.
INSERT INTO public.module_sections (id, title, order_index, product_slug)
VALUES (
  'a2a5d8ad-16ae-4d4f-a960-84783cbb82b4',
  'Mentorias em grupo',
  7,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  order_index = EXCLUDED.order_index,
  product_slug = EXCLUDED.product_slug;

INSERT INTO public.modules (id, title, description, order_index, section_id)
VALUES (
  'c843f5dd-99e6-4aca-9b84-735906f0f2ad',
  'Mentoria em grupo #1',
  'Aula completa com as ferramentas e referências usadas durante a mentoria.',
  0,
  'a2a5d8ad-16ae-4d4f-a960-84783cbb82b4'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  section_id = EXCLUDED.section_id;

INSERT INTO public.lessons (
  id,
  module_id,
  title,
  description,
  youtube_url,
  duration,
  order_index
)
VALUES (
  'bc05038b-144d-4767-8a90-f3e83543be91',
  'c843f5dd-99e6-4aca-9b84-735906f0f2ad',
  'Aula 00 - Suas ferramentas',
  E'Links e ferramentas mencionados na aula:\n\nHiggsfield: https://higgsfield.ai/\nMorphix: https://morphix.pro/\nClaude: https://claude.ai/\nCodex: https://chatgpt.com/codex\nMiro: https://miro.com/app/board/uXjVHvwdVZs=/?share_link_id=443763463903',
  'https://youtu.be/HT7KAoKC2qs',
  '18:52',
  0
)
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  youtube_url = EXCLUDED.youtube_url,
  duration = EXCLUDED.duration,
  order_index = EXCLUDED.order_index;
