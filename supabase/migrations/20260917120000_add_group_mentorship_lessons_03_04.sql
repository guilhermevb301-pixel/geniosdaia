-- Adiciona as Aulas 03 e 04 à sequência de Mentorias em grupo.
INSERT INTO public.lessons (
  id,
  module_id,
  title,
  description,
  youtube_url,
  duration,
  order_index
)
VALUES
  (
    '4e66f7db-6d31-4300-8cbd-2743da44de13',
    'c843f5dd-99e6-4aca-9b84-735906f0f2ad',
    'Aula 03 - Processo de criação de vídeos',
    E'Material da aula:\n\nMiro: https://miro.com/app/board/uXjVHwmSiYo=/?share_link_id=412172721087\n\nSkills usadas: Seedance e Sheets.',
    'https://youtu.be/bm2Efv-EUsk',
    '28:02',
    3
  ),
  (
    '2da6487f-d8de-4cdb-ad32-c69e0b6a3f2a',
    'c843f5dd-99e6-4aca-9b84-735906f0f2ad',
    'Aula 04 - Criando um vídeo do zero',
    E'Materiais da aula:\n\nMiro: https://miro.com/app/board/uXjVHmZ8CsM=/?share_link_id=547150903875\nElevenLabs: https://elevenlabs.io/\nHiggsfield: https://higgsfield.ai/\nMorphix: https://morphix.pro/\n\nSkills usadas: Blender, Seedance e Sheets.',
    'https://youtu.be/B5P0hdjvNkc',
    NULL,
    4
  )
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  youtube_url = EXCLUDED.youtube_url,
  duration = EXCLUDED.duration,
  order_index = EXCLUDED.order_index;
