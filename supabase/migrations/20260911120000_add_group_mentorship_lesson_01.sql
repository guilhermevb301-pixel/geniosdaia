-- Atualiza os materiais da Aula 00 e adiciona a Aula 01 da mentoria em grupo.
UPDATE public.lessons
SET description = E'Links e ferramentas mencionados na aula:\n\nHiggsfield: https://higgsfield.ai/\nMorphix: https://morphix.pro/\nCupom Morphix: GUIVILAS15 — 15% de desconto\nClaude: https://claude.ai/\nCodex: https://chatgpt.com/codex\nMiro: https://miro.com/app/board/uXjVHvwdVZs=/?share_link_id=443763463903'
WHERE id = 'bc05038b-144d-4767-8a90-f3e83543be91';

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
  '7e049910-2940-4768-aefb-cf299e8452b4',
  'c843f5dd-99e6-4aca-9b84-735906f0f2ad',
  'Aula 01 - Como criar imagens do jeito certo',
  E'Material da aula:\n\nMiro: https://miro.com/app/board/uXjVHwgJROU=/?share_link_id=999353231760',
  'https://youtu.be/G2yr7zfMYAw',
  '20:56',
  1
)
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  youtube_url = EXCLUDED.youtube_url,
  duration = EXCLUDED.duration,
  order_index = EXCLUDED.order_index;
