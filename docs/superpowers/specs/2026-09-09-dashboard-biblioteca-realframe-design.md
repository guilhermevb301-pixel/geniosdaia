# Dashboard e Biblioteca RealFrame IA

**Data:** 2026-09-09  
**Status:** aprovado pelo Gui  
**Escopo:** dashboard, navegacao principal, biblioteca de aulas e direcao das capas

## Objetivo

Transformar a area de membros em um produto reconhecivel da RealFrame IA, com
menos aparencia de template pronto, navegacao mais simples e imagens que
comuniquem o conteudo antes da leitura do titulo.

O dashboard deve apresentar a marca e orientar o proximo passo. A biblioteca
deve deixar de despejar todos os modulos em uma unica pagina: primeiro o aluno
escolhe uma sessao, depois navega pelos modulos daquela sessao.

## Direcao escolhida

### Editorial RealFrame

- Base escura e neutra, com verde `#34d399` como cor funcional.
- Azul Codex e laranja Claude aparecem apenas em imagens onde ajudam a contar a
  historia; nao viram enfeites permanentes da interface.
- Fotografia, composicao editorial e arte conceitual podem conviver. Nao ha
  obrigacao de usar 3D, mascotes ou o mesmo enquadramento em todas as capas.
- Todas as imagens mantem uma linguagem comum: contraste cinematografico,
  assunto central legivel, fundo controlado, ausencia de texto gerado dentro da
  imagem e bom recorte em desktop e mobile.
- O rosto do Gui funciona como ativo de confianca e autoria. Ele aparece no
  dashboard, na mentoria e nos conteudos em que sua identidade e parte do tema,
  como clones. Nao deve aparecer mecanicamente em toda capa.

## Dashboard

### Primeiro viewport

1. **Hero RealFrame compacto**
   - Altura controlada, sem ocupar a tela inteira.
   - Saudacao personalizada e acao principal para continuar estudando.
   - Imagem do Gui integrada a composicao, segurando ou interagindo com a marca
     RealFrame; rosto inteiro e bem enquadrado.
   - A imagem e o texto formam uma unica composicao, sem card dentro de card.

2. **Continuar assistindo**
   - Mostra um unico modulo acionavel: titulo, sessao, progresso e botao.
   - Prioriza a decisao mais importante do aluno e evita repetir toda a
     biblioteca no dashboard.

3. **Proxima live e mentoria**
   - Dois blocos compactos, com hierarquia secundaria.
   - Mentoria abre diretamente
     `https://mentoria-gui.vercel.app/formulario/mentoria`.

### Destaques promocionais

- O carrossel atual deixa de ser um banner alto e generico.
- Os destaques tornam-se cards editoriais compactos, com autoplay pausado no
  hover/foco, swipe no mobile, setas discretas e indicadores pequenos.
- Cada destaque tem composicao propria da RealFrame e area segura para o
  assunto principal; nao depende de texto gravado na imagem.
- O dashboard nao lista as sete sessoes. No maximo pode exibir tres atalhos
  contextuais no futuro, sem competir com o proximo passo.

### Elementos removidos ou reduzidos

- Nada de grade completa de aulas no dashboard.
- Nada de barra global de progresso duplicada se a mesma informacao ja aparece
  no rodape do perfil ou no card de continuidade.
- Estatisticas e conquistas ficam discretas e abaixo do conteudo principal.

## Biblioteca de aulas

### Rota `/aulas`

A pagina passa a ser a capa da biblioteca. Ela exibe as sete sessoes existentes
no banco, ordenadas por `module_sections.order_index`:

1. Agentes de IA + Claude
2. Genios das Vendas
3. Genios dos Clones de IA
4. Influencers de IA
5. Genios das Imagens
6. Genios dos Videos
7. Bonus

Cada sessao e um card grande o suficiente para comunicar seu universo, mas sem
virar banner. No desktop, a grade usa tres colunas; em larguras intermediarias,
duas; no mobile, uma. O card mostra:

- imagem exclusiva da sessao;
- nome da sessao;
- quantidade de modulos;
- progresso agregado apenas quando houver acesso;
- estado bloqueado e acao de compra quando aplicavel.

### Rota `/aulas/sessao/:sectionId`

Ao abrir uma sessao, o aluno ve somente seus modulos:

- breadcrumb para voltar a Aulas;
- titulo e descricao curta da sessao;
- progresso agregado da sessao;
- grade responsiva de modulos, sem carrossel obrigatorio no desktop;
- cards com capa individual, titulo, quantidade de aulas e progresso;
- swipe/carrossel apenas quando for ergonomicamente melhor em telas pequenas;
- estados de carregamento, erro, vazio e bloqueio consistentes.

A rota existente `/aulas/:moduleId` continua abrindo as aulas de um modulo.
A nova rota de sessao deve ser declarada antes dela para evitar conflito de
roteamento.

### Acesso

- A listagem da sessao respeita `module_sections.product_slug` e
  `useUserProducts`.
- O bloqueio visual nao substitui a validacao nas rotas internas.
- A pagina da sessao e a pagina do modulo validam o produto exigido.
- Usuario sem acesso permanece autenticado e vai para `/acesso-negado`, sem
  logout automatico.

## Direcao das imagens

### Capas das sessoes

- **Agentes de IA + Claude:** agente/robo operando com Claude, com referencia
  visual clara ao produto, sem repetir dois mascotes numa base 3D generica.
- **Genios das Vendas:** cena de negociacao, proposta ou fechamento, com energia
  comercial e leitura imediata.
- **Genios dos Clones:** Gui frente a frente com seu clone, com diferenca visual
  controlada entre original e replica.
- **Influencers de IA:** influencer digital em contexto real de criacao, camera,
  luz e interface social.
- **Genios das Imagens:** fotografia premium, camera e resultado visual final.
- **Genios dos Videos:** set cinematografico, timeline, camera ou cena em
  producao.
- **Bonus:** presente/caixa de recursos com aparencia premium, sem emoji literal.

### Capas dos modulos

As 29 capas atuais serao substituidas de forma individual. O titulo e a
descricao do modulo orientam o conceito de cada imagem. Regras:

- uma imagem nao pode ser reutilizada apenas porque os modulos pertencem a
  mesma sessao;
- o elemento principal deve comunicar o assunto sem precisar ler o titulo;
- ferramentas como HeyGen, Kling, Veo e Seedance usam referencias visuais ao
  fluxo ou resultado da ferramenta, sem copiar marcas de forma enganosa;
- modulos de influencer usam pessoas/influencers, nao mascotes;
- modulos de clone podem usar o Gui ou uma persona duplicada;
- modulos de venda usam situacoes comerciais, nao graficos abstratos repetidos;
- nenhuma imagem deve conter texto pequeno gerado por IA.

As capas usam proporcao 4:3 e sao entregues em WebP otimizado. O sistema mantem
fallback neutro caso uma imagem falhe.

## Navegacao

Menu do aluno, em ordem:

### Conteudo

1. Dashboard
2. Aulas
3. Banco de Prompts
4. Lives

### Voce

1. Certificados
2. Meu Caderno
3. Aplicar Mentoria

### Comunidade

1. Entrar no grupo

### Recursos

1. Templates

`Meus GPTs` e `Desafios` deixam de aparecer para alunos. As rotas e telas de
administracao podem continuar existindo internamente para evitar perda de dados
ou quebra de ferramentas administrativas.

## Dados e componentes

- Nao e necessaria migracao dos modulos: `module_sections` ja representa as
  sessoes e `modules.section_id` ja estabelece a relacao.
- Um hook compartilhado deve buscar sessoes, modulos, aulas e progresso uma
  unica vez e produzir os modelos de tela para `/aulas` e para a pagina de
  sessao.
- O catalogo de capas deve separar imagens de sessao e imagens de modulo.
- A administracao continua controlando titulo, ordem, produto e associacao dos
  modulos sem alterar o fluxo existente.

## Responsividade e acessibilidade

- Hero e imagens devem preservar rosto e assunto principal em 390 px, 768 px e
  desktop largo.
- Cards mantem dimensoes estaveis para evitar saltos durante o carregamento.
- Navegacao por teclado, foco visivel, nomes acessiveis e preferencia por
  movimento reduzido sao obrigatorios.
- Autoplay pausa quando o usuario interage e nao roda com
  `prefers-reduced-motion`.

## Verificacao

- Testes de agrupamento, rotas, acesso e estados de erro/vazio.
- Testes do menu garantindo ausencia de Meus GPTs e Desafios para alunos e
  Templates no final.
- Testes do dashboard para garantir ordem do hero, continuidade e destaques.
- Verificacao visual de `/`, `/aulas`, `/aulas/sessao/:sectionId` e
  `/aulas/:moduleId` em desktop e mobile.
- `npm run test`, `npm run lint` e `npm run build` antes do deploy.
- Deploy de preview para aprovacao antes de promover para
  `membrosgenios.com`.

