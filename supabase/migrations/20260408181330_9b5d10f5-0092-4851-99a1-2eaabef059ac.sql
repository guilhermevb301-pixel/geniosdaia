
-- ============================================================
-- Seed complementar de desafios + vínculos com objetivos
-- Idempotente: pode rodar várias vezes sem duplicar
-- ============================================================

-- 1. Garante constraint UNIQUE em title pra permitir ON CONFLICT
DO $$ BEGIN
  ALTER TABLE public.daily_challenges
    ADD CONSTRAINT daily_challenges_title_unique UNIQUE (title);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;

-- 2. Insere os novos desafios (ignora se já existir pelo título)
INSERT INTO public.daily_challenges (track, difficulty, title, objective, steps, deliverable, checklist, estimated_minutes, is_bonus) VALUES

-- ===== agentes (complemento) =====
('agentes','avancado','Coloque seu agente pra rodar com um cliente de teste',
 'Validar que seu agente funciona com uma pessoa real usando de verdade',
 '["Escolha 1 pessoa conhecida pra testar seu agente","Explique o que ele faz e peça pra ela usar por 10 minutos","Anote tudo que deu certo e o que deu errado","Ajuste o agente com base nos problemas encontrados","Peça pra ela testar de novo"]'::jsonb,
 'Print das conversas do teste + lista dos ajustes que você fez',
 '["Teste feito com pessoa real","Problemas identificados","Ajustes aplicados"]'::jsonb, 45, false),

('agentes','iniciante','Deixe sua infraestrutura do agente pronta',
 'Seguir a aula de infra e ter tudo rodando pra colocar seus agentes no ar',
 '["Assista a aula de infraestrutura do zero ao fim","Siga o passo a passo exatamente como mostrado","Se travar em algum ponto, volte e reveja aquele trecho","Confirme que tudo tá rodando antes de finalizar"]'::jsonb,
 'Print da sua infra rodando (tela inicial do seu n8n)',
 '["Aula assistida","Passos seguidos","Tudo rodando sem erro"]'::jsonb, 60, false),

('agentes','intermediario','Teste se sua infra aguenta rodar um agente real',
 'Garantir que sua infra tá estável e pronta pra ter agente atendendo cliente',
 '["Deixe um agente simples rodando na sua infra por 1 dia inteiro","Mande pelo menos 20 mensagens de teste ao longo do dia","Verifique se todas foram respondidas sem travar","Se deu problema, ajuste e teste de novo"]'::jsonb,
 'Print mostrando 20+ mensagens respondidas pelo seu agente na sua infra',
 '["Agente rodou 24h sem cair","20+ mensagens respondidas","Sem erros travando"]'::jsonb, 40, false),

-- ===== propostas (vender_projeto) =====
('propostas','iniciante','Monte seus 3 pacotes de serviço',
 'Ter uma oferta clara em 3 níveis pra apresentar pra qualquer cliente',
 '["Defina um pacote básico (entrega mínima, preço acessível)","Defina um pacote intermediário (mais entregas, preço médio)","Defina um pacote premium (tudo incluso, preço alto)","Escreva o que tá dentro de cada um em 3 bullets","Coloque o preço final de cada pacote"]'::jsonb,
 'Documento de 1 página com os 3 pacotes, entregas e preços',
 '["3 pacotes definidos","Entregas claras em cada um","Preços definidos"]'::jsonb, 30, false),

('propostas','intermediario','Apresente sua oferta pra 5 pessoas e colete feedback',
 'Validar se sua oferta faz sentido antes de sair vendendo pra valer',
 '["Escolha 5 pessoas do seu nicho (amigos empresários, contatos, conhecidos)","Apresente seus pacotes pra cada uma","Pergunte: qual pacote elas escolheriam e por quê","Pergunte se o preço tá justo, alto ou baixo","Anote tudo e ajuste sua oferta"]'::jsonb,
 'Lista com os 5 feedbacks recebidos e os ajustes que você fez',
 '["5 pessoas ouvidas","Feedback anotado","Oferta ajustada"]'::jsonb, 60, false),

('propostas','avancado','Feche sua primeira venda de agente de IA',
 'Receber o primeiro pagamento de um cliente real pelo seu serviço',
 '["Defina o cliente que tem a maior chance de fechar","Apresente a proposta pessoalmente ou em call","Negocie condições e prazo","Envie o contrato ou acordo por escrito","Receba o sinal do pagamento"]'::jsonb,
 'Print do pagamento recebido ou do contrato assinado',
 '["Proposta apresentada","Negociação fechada","Pagamento recebido"]'::jsonb, 120, false),

-- ===== propostas (fechar_clientes) =====
('propostas','iniciante','Liste 50 empresas que têm a dor que você resolve',
 'Ter uma lista concreta de leads qualificados pra começar a prospectar',
 '["Defina o nicho que você quer atacar","Use Google, Instagram ou LinkedIn pra achar 50 empresas desse nicho","Anote nome da empresa, contato e o que elas fazem","Marque quais têm mais chance de precisar do seu serviço","Organize tudo numa planilha simples"]'::jsonb,
 'Planilha com 50 empresas qualificadas',
 '["50 empresas listadas","Contato de cada uma","Priorizadas por potencial"]'::jsonb, 45, false),

('propostas','intermediario','Fale com 20 leads em 1 semana',
 'Começar a abrir conversa ativa com clientes em potencial',
 '["Pegue 20 contatos da sua lista","Escreva uma mensagem simples apresentando o que você faz","Mande a mesma mensagem pros 20 (personalize o nome)","Responda todo mundo que responder","Anote quantos responderam e o que disseram"]'::jsonb,
 'Print de 20 mensagens enviadas + resumo das respostas',
 '["20 mensagens enviadas","Respostas anotadas","Follow-up feito"]'::jsonb, 60, false),

('propostas','avancado','Agende 5 reuniões comerciais',
 'Ter 5 calls marcadas com leads interessados na sua solução',
 '["A partir dos que responderam, puxe pra uma call","Ofereça um horário específico","Mande o link da reunião na hora","Confirme 1 dia antes","Conclua as 5 reuniões"]'::jsonb,
 'Print da agenda com 5 reuniões marcadas',
 '["5 calls agendadas","Confirmadas pelo lead","Reuniões realizadas"]'::jsonb, 90, false),

-- ===== propostas (vender_fechar_combo) =====
('propostas','intermediario','Junte prospecção + proposta em 1 fluxo completo',
 'Ter um caminho claro de como você prospecta e fecha do começo ao fim',
 '["Desenhe no papel seu fluxo: de onde vem o lead até fechar","Liste cada etapa: abordagem, resposta, call, proposta, fechamento","Defina quanto tempo cada etapa demora","Identifique onde você costuma travar","Ajuste o fluxo pra resolver os gargalos"]'::jsonb,
 'Desenho ou print do seu fluxo de venda completo',
 '["Fluxo desenhado","Etapas claras","Gargalos identificados"]'::jsonb, 45, false),

('propostas','avancado','Feche sua 2ª venda usando o fluxo completo',
 'Repetir o processo de venda de forma previsível',
 '["Use exatamente o fluxo que você desenhou","Pegue um lead novo da sua lista","Passe por todas as etapas sem pular nenhuma","Anote onde foi mais rápido e onde travou","Feche o pagamento"]'::jsonb,
 'Print do pagamento da 2ª venda',
 '["Fluxo seguido do início ao fim","Aprendizados anotados","Venda fechada"]'::jsonb, 120, false),

-- ===== propostas (criar_proposta complemento) =====
('propostas','iniciante','Estruture sua proposta em 1 página',
 'Ter um modelo de proposta limpo e objetivo pra mandar pra qualquer cliente',
 '["Escreva 1 parágrafo da dor do cliente","Escreva 1 parágrafo da sua solução","Liste as entregas em 3 bullets","Coloque o preço e condições","Termine com uma chamada clara pra próxima etapa"]'::jsonb,
 'Link do Google Docs com a proposta de 1 página',
 '["Dor identificada","Solução clara","Entregas listadas","Preço e CTA definidos"]'::jsonb, 40, false),

('propostas','avancado','Teste sua proposta com 3 clientes e refine',
 'Validar se a proposta realmente fecha venda ou só gera dúvida',
 '["Mande sua proposta pra 3 clientes diferentes","Pergunte se ficou claro tudo que tá ali","Pergunte o que fez sentido e o que não fez","Ajuste os pontos confusos","Mande a versão refinada de volta"]'::jsonb,
 'Lista dos ajustes feitos com base no feedback dos 3',
 '["3 clientes testaram","Feedback coletado","Proposta refinada"]'::jsonb, 60, false),

-- ===== crescimento (viralizar) =====
('crescimento','iniciante','Defina seu posicionamento em 1 frase',
 'Saber exatamente pra quem você fala e o que entrega (base de todo conteúdo)',
 '["Preencha a frase: Eu ajudo [QUEM] a [RESULTADO] sem [DOR]","Teste a frase lendo em voz alta","Pergunte pra 3 pessoas se ficou claro","Ajuste até a pessoa entender de primeira","Salve a frase final"]'::jsonb,
 'Sua frase de posicionamento final + 3 validações',
 '["Frase escrita","Testada em voz alta","Validada por 3 pessoas"]'::jsonb, 20, false),

('crescimento','intermediario','Publique 5 conteúdos em 1 semana',
 'Começar a criar consistência no seu perfil pra ganhar tração',
 '["Planeje 5 conteúdos diferentes (reel, carrossel, story, post, vídeo)","Produza tudo num único dia","Agende ou publique ao longo da semana","Responda todos os comentários","Anote qual teve melhor resultado"]'::jsonb,
 'Print dos 5 conteúdos publicados + qual performou melhor',
 '["5 conteúdos publicados","Comentários respondidos","Melhor performance identificada"]'::jsonb, 90, false),

('crescimento','avancado','Alcance 10 mil de alcance orgânico em 1 post',
 'Provar que seu conteúdo consegue viralizar quando tá afiado',
 '["Estude os 10 posts mais virais do seu nicho","Identifique o padrão (gancho, formato, tema)","Crie 1 post seguindo exatamente esse padrão","Publique no melhor horário do seu perfil","Acompanhe as métricas por 48h"]'::jsonb,
 'Print das métricas do post com 10k+ de alcance',
 '["Padrão viral estudado","Post publicado","10k+ alcance atingido"]'::jsonb, 60, false),

-- ===== crescimento (conteudo_vende) =====
('crescimento','iniciante','Escreva 10 ideias de conteúdo que geram venda',
 'Ter um banco de ideias focado em converter, não só entreter',
 '["Liste 10 dores que seu cliente tem","Transforme cada dor numa pauta de conteúdo","Pra cada pauta, pense no gancho inicial","Escreva tudo numa lista","Marque as 3 mais fortes pra produzir primeiro"]'::jsonb,
 'Lista com 10 ideias de conteúdo + top 3 destacadas',
 '["10 ideias escritas","Conectadas com dor real","Top 3 escolhidas"]'::jsonb, 30, false),

('crescimento','intermediario','Publique 3 conteúdos de venda direta',
 'Testar conteúdo que fala diretamente da sua oferta sem medo',
 '["Pegue 3 ideias da sua lista","Produza 3 conteúdos que terminam com chamada pra call ou DM","Publique os 3 em dias diferentes","Responda todo mundo que chegar no DM","Anote quantas conversas geraram"]'::jsonb,
 'Print dos 3 conteúdos + conversas geradas no DM',
 '["3 conteúdos publicados","CTA claro em cada","Conversas geradas no DM"]'::jsonb, 75, false),

('crescimento','avancado','Gere 10 conversas no DM a partir do seu conteúdo',
 'Validar que seu conteúdo realmente traz gente qualificada pra falar com você',
 '["Publique 1 conteúdo forte com chamada pra DM","Responda rápido todo mundo que chegar","Qualifique cada um: é cliente potencial ou não?","Puxe os qualificados pra uma call","Anote quantos vieram do conteúdo"]'::jsonb,
 'Print de 10 conversas no DM vindas de conteúdo + quantos viraram call',
 '["10 conversas no DM","Vindas de conteúdo","Qualificados identificados"]'::jsonb, 60, false),

-- ===== videos =====
('videos','avancado','Crie um vídeo comercial de 60 segundos',
 'Ter um vídeo pronto pra usar em anúncio ou pra vender serviço',
 '["Escreve um roteiro curto com gancho, problema, solução e chamada","Gera as cenas com IA","Coloca uma trilha sonora","Edita cortando tudo que tá sobrando","Exporta em vertical e horizontal"]'::jsonb,
 'Vídeo de até 60 segundos',
 '["Até 60s","Trilha incluída","2 formatos exportados"]'::jsonb, 50, false),

-- ===== fotos =====
('fotos','avancado','Crie um personagem consistente em 10 imagens',
 'Conseguir gerar a mesma pessoa em cenários diferentes',
 '["Define o visual do personagem (cabelo, roupa, estilo)","Gera a primeira imagem e salva como referência","Gera mais 9 em cenários diferentes mantendo o visual","Ajusta até todas parecerem a mesma pessoa"]'::jsonb,
 'Pasta com 10 imagens do mesmo personagem',
 '["10 imagens","Mesmo visual","Cenários diferentes"]'::jsonb, 60, false),

('fotos','intermediario','Monte um portfólio com 20 fotos do seu nicho',
 'Ter prova de trabalho pra mostrar pra cliente pagar pelo seu serviço',
 '["Escolhe um nicho (moda, imóveis, comida, etc)","Gera 20 imagens profissionais desse nicho","Organiza num Behance ou Google Drive","Escreve uma descrição de cada","Compartilha o link"]'::jsonb,
 'Link do portfólio com 20 imagens',
 '["20 imagens","Organizadas","Link público funcionando"]'::jsonb, 60, false)

ON CONFLICT (title) DO NOTHING;

-- 3. Limpa todos os vínculos existentes e recria
DELETE FROM public.objective_challenge_links
WHERE objective_item_id IN (SELECT id FROM public.objective_items);

-- 4. Insere vínculos usando CTEs pra buscar IDs por título/key
WITH
  obj AS (SELECT id, objective_key FROM public.objective_items),
  ch AS (SELECT id, title FROM public.daily_challenges),

  -- === criar_videos ===
  cv1 AS (SELECT id FROM ch WHERE title = 'Gere seu primeiro vídeo com avatar IA'),
  cv2 AS (SELECT id FROM ch WHERE title = 'Crie um vídeo com múltiplas cenas'),
  cv3 AS (SELECT id FROM ch WHERE title = 'Crie um vídeo comercial de 60 segundos'),

  -- === criar_fotos ===
  cf1 AS (SELECT id FROM ch WHERE title = 'Crie 100 fotos com IA (LEIA A DESCRIÇÃO)'),
  cf2 AS (SELECT id FROM ch WHERE title = 'Crie um personagem consistente em 10 imagens'),

  -- === fotos_portfolio ===
  fp1 AS (SELECT id FROM ch WHERE title = 'Monte um portfólio com 20 fotos do seu nicho'),

  -- === vender_projeto ===
  vp1 AS (SELECT id FROM ch WHERE title = 'Estruture sua proposta em 1 página'),
  vp2 AS (SELECT id FROM ch WHERE title = 'Monte seus 3 pacotes de serviço'),
  vp3 AS (SELECT id FROM ch WHERE title = 'Apresente sua oferta pra 5 pessoas e colete feedback'),
  vp4 AS (SELECT id FROM ch WHERE title = 'Feche sua primeira venda de agente de IA'),

  -- === viralizar ===
  vi1 AS (SELECT id FROM ch WHERE title = 'Defina seu posicionamento em 1 frase'),
  vi2 AS (SELECT id FROM ch WHERE title = 'Escreva 10 ideias de conteúdo que geram venda'),
  vi3 AS (SELECT id FROM ch WHERE title = 'Publique 5 conteúdos em 1 semana'),
  vi4 AS (SELECT id FROM ch WHERE title = 'Publique 3 conteúdos de venda direta'),
  vi5 AS (SELECT id FROM ch WHERE title = 'Alcance 10 mil de alcance orgânico em 1 post'),

  -- === agentes_fechar_viralizar_combo ===
  co1 AS (SELECT id FROM ch WHERE title = 'Deixe sua infraestrutura do agente pronta'),
  co2 AS (SELECT id FROM ch WHERE title = 'Teste se sua infra aguenta rodar um agente real'),
  co3 AS (SELECT id FROM ch WHERE title = 'Coloque seu primeiro de agente de IA para rodar'),
  co4 AS (SELECT id FROM ch WHERE title = 'Coloque seu agente pra rodar com um cliente de teste'),
  co5 AS (SELECT id FROM ch WHERE title = 'Liste 50 empresas que têm a dor que você resolve'),
  co6 AS (SELECT id FROM ch WHERE title = 'Fale com 20 leads em 1 semana'),
  co7 AS (SELECT id FROM ch WHERE title = 'Agende 5 reuniões comerciais'),
  co8 AS (SELECT id FROM ch WHERE title = 'Junte prospecção + proposta em 1 fluxo completo'),
  co9 AS (SELECT id FROM ch WHERE title = 'Feche sua 2ª venda usando o fluxo completo')

INSERT INTO public.objective_challenge_links (objective_item_id, daily_challenge_id, order_index, is_initial_active, predecessor_challenge_id)

-- criar_videos: 3 desafios em cadeia
SELECT (SELECT id FROM obj WHERE objective_key='criar_videos'), (SELECT id FROM cv1), 0, true, NULL
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='criar_videos'), (SELECT id FROM cv2), 1, false, (SELECT id FROM cv1)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='criar_videos'), (SELECT id FROM cv3), 2, false, (SELECT id FROM cv2)

UNION ALL
-- criar_fotos: 2 desafios em cadeia
SELECT (SELECT id FROM obj WHERE objective_key='criar_fotos'), (SELECT id FROM cf1), 0, true, NULL
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='criar_fotos'), (SELECT id FROM cf2), 1, false, (SELECT id FROM cf1)

UNION ALL
-- fotos_portfolio: 1 desafio
SELECT (SELECT id FROM obj WHERE objective_key='fotos_portfolio'), (SELECT id FROM fp1), 0, true, NULL

UNION ALL
-- vender_projeto: 4 desafios em cadeia
SELECT (SELECT id FROM obj WHERE objective_key='vender_projeto'), (SELECT id FROM vp1), 0, true, NULL
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='vender_projeto'), (SELECT id FROM vp2), 1, false, (SELECT id FROM vp1)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='vender_projeto'), (SELECT id FROM vp3), 2, false, (SELECT id FROM vp2)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='vender_projeto'), (SELECT id FROM vp4), 3, false, (SELECT id FROM vp3)

UNION ALL
-- viralizar: 5 desafios em cadeia
SELECT (SELECT id FROM obj WHERE objective_key='viralizar'), (SELECT id FROM vi1), 0, true, NULL
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='viralizar'), (SELECT id FROM vi2), 1, false, (SELECT id FROM vi1)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='viralizar'), (SELECT id FROM vi3), 2, false, (SELECT id FROM vi2)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='viralizar'), (SELECT id FROM vi4), 3, false, (SELECT id FROM vi3)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='viralizar'), (SELECT id FROM vi5), 4, false, (SELECT id FROM vi4)

UNION ALL
-- agentes_fechar_viralizar_combo: 9 desafios em cadeia (infra → agente → prospecção → venda)
SELECT (SELECT id FROM obj WHERE objective_key='agentes_fechar_viralizar_combo'), (SELECT id FROM co1), 0, true, NULL
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='agentes_fechar_viralizar_combo'), (SELECT id FROM co2), 1, false, (SELECT id FROM co1)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='agentes_fechar_viralizar_combo'), (SELECT id FROM co3), 2, false, (SELECT id FROM co2)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='agentes_fechar_viralizar_combo'), (SELECT id FROM co4), 3, false, (SELECT id FROM co3)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='agentes_fechar_viralizar_combo'), (SELECT id FROM co5), 4, false, (SELECT id FROM co4)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='agentes_fechar_viralizar_combo'), (SELECT id FROM co6), 5, false, (SELECT id FROM co5)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='agentes_fechar_viralizar_combo'), (SELECT id FROM co7), 6, false, (SELECT id FROM co6)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='agentes_fechar_viralizar_combo'), (SELECT id FROM co8), 7, false, (SELECT id FROM co7)
UNION ALL
SELECT (SELECT id FROM obj WHERE objective_key='agentes_fechar_viralizar_combo'), (SELECT id FROM co9), 8, false, (SELECT id FROM co8);
