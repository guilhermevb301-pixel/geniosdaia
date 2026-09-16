-- Adiciona a Aula 02 à sequência de Mentorias em grupo.
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
  '423c8f67-18fa-4521-9eaf-1e58229b65fe',
  'c843f5dd-99e6-4aca-9b84-735906f0f2ad',
  'Aula 02 - Entendendo sobre roteiros',
  E'Material da aula:\n\nMiro: https://miro.com/app/board/uXjVHwvljYw=/?share_link_id=772491327032',
  'https://youtu.be/mRFuCXifWIc',
  '14:44',
  2
)
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  youtube_url = EXCLUDED.youtube_url,
  duration = EXCLUDED.duration,
  order_index = EXCLUDED.order_index;
