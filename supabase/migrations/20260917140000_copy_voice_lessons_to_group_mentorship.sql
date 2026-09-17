-- Mantém as aulas originais e copia vídeo, duração e materiais para a mentoria.
INSERT INTO public.lessons (
  id,
  module_id,
  title,
  description,
  youtube_url,
  download_url,
  duration,
  order_index
)
SELECT
  '482f6f1a-d888-4a5a-9ea2-72edad85b163',
  'c843f5dd-99e6-4aca-9b84-735906f0f2ad',
  'Aula 05 - Vozes (Parte 1): Como clonar a sua voz',
  description,
  youtube_url,
  download_url,
  duration,
  5
FROM public.lessons
WHERE id = '756d16ba-d553-4d8d-a73f-22ac22ca17a0'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (
  id,
  module_id,
  title,
  description,
  youtube_url,
  download_url,
  duration,
  order_index
)
SELECT
  'ab9de2b5-33e9-4a41-b7a0-e3563ba3e5cc',
  'c843f5dd-99e6-4aca-9b84-735906f0f2ad',
  'Aula 05 - Vozes (Parte 2): Criando sua voz no ElevenLabs',
  description,
  youtube_url,
  download_url,
  duration,
  6
FROM public.lessons
WHERE id = '298b609a-6537-4f80-b68c-5e7029538985'
ON CONFLICT (id) DO NOTHING;
