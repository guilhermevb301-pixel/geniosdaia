# RealFrame IA — Terminal Premium

## Objetivo

Reconstruir a experiência visual da área de membros para que ela pareça um produto premium, rápido e autoral. A interface deve carregar a personalidade dos mascotes Codex e Claude sem repetir os personagens como papel de parede nem assumir uma estética infantil.

## Direção Visual

O verde `#34d399` permanece como a cor principal da RealFrame IA. Ele identifica navegação ativa, botões primários, progresso, foco, sucesso e estados ao vivo.

Azul Codex e coral Claude aparecem apenas como cores secundárias nas ilustrações, fundos editoriais e pequenos detalhes de categoria. Eles nunca competem com o verde por ações primárias.

### Paleta

- Fundo principal: `#0b0d10`
- Superfície: `#12151a`
- Superfície elevada: `#181c22`
- Texto principal: `#f2f1ed`
- Texto secundário: `#969ba6`
- Linha sutil: `rgba(255,255,255,0.08)`
- Verde RealFrame: `#34d399`
- Verde profundo: `#123d31`
- Azul Codex: `#557cff`
- Coral Claude: `#e97951`

### Tipografia

- Interface, títulos e botões: Geist Sans.
- Microdados, níveis, duração e progresso: Geist Mono quando melhorar a leitura.
- A serif atual sai das telas de produto e fica fora da navegação, dashboard e biblioteca.
- Hierarquia compacta: títulos de página entre 32 e 40px no desktop; títulos de cards entre 15 e 18px.

## Estrutura Global

### Sidebar

- Fundo grafite levemente separado do conteúdo.
- Marca RealFrame IA mais simples, sem efeitos decorativos excessivos.
- Ícones neutros por padrão; item ativo recebe verde, superfície elevada e indicador lateral.
- Azul e coral não são usados na navegação principal.
- Perfil e XP permanecem fixos no rodapé, porém com leitura mais limpa e menos linhas concorrentes.

### Topbar

- Busca como elemento principal.
- Nível, streak e notificações agrupados de forma compacta.
- Remover mascote flutuante e elementos decorativos sem função.

## Dashboard

O dashboard deixa de ser uma pilha vertical de caixas e passa a responder três perguntas: onde parei, o que acontece agora e como avanço.

### Desktop

- Saudação compacta no topo com contexto de progresso.
- Grid principal assimétrico: card grande de continuidade à esquerda; próxima live e mentoria empilhadas à direita.
- Banner editorial abaixo do grid com altura máxima entre 180 e 220px.
- Conquistas em faixa discreta no fim.

### Mobile

- Coluna única.
- Continuidade aparece primeiro, depois live, mentoria, anúncios e conquistas.
- Nenhum bloco depende de hover para revelar uma ação.

### Banners

- Proporção larga e altura limitada.
- Imagem composta com área de respiro reservada ao texto.
- Sem autoplay agressivo; navegação manual e indicador de posição.
- Título, contexto e CTA ficam legíveis sem gradientes escuros pesados cobrindo toda a arte.

## Biblioteca de Aulas

### Organização

- Uma seção por trilha de produto.
- Título da trilha, progresso específico e ação de navegação no mesmo cabeçalho.
- Carrossel horizontal no desktop e swipe nativo no mobile.
- Exibir aproximadamente 4,5 cards em desktop amplo, mantendo indicação visual de continuidade lateral.

### Cards

- Proporção 4:3.
- Imagem ocupa a capa; texto e progresso ficam abaixo em bloco compacto.
- Hover curto: elevação de 2px, realce de borda e leve zoom da imagem.
- Estado bloqueado informa o produto necessário sem destruir a legibilidade da capa.

### Sistema de Capas

As capas deixam de repetir a mesma dupla de robôs em todos os módulos.

- Cada módulo recebe uma composição própria relacionada ao conteúdo.
- Um objeto central comunica o tema: terminal, conversa, câmera, avatar, gráfico, claquete, automação ou documento.
- Os mascotes podem aparecer como coadjuvantes, nunca obrigatoriamente como protagonistas.
- Todas as imagens compartilham o mesmo fundo grafite, iluminação verde principal e reflexos azul/coral.
- Sem texto gerado dentro das imagens. Número e nome do módulo permanecem na interface.

## Mentoria

- O banner e o card do dashboard apontam para `/mentoria`.
- A página vira um fluxo de três etapas, uma pergunta por tela.
- Barra de progresso e transições curtas deixam a aplicação mais intencional.
- A última etapa monta a mensagem e abre o WhatsApp.
- O estado concluído oferece reabrir o WhatsApp ou revisar respostas.

## Login

- Layout concentrado e sóbrio, com marca clara e um pequeno encontro visual entre os universos Codex e Claude.
- Verde RealFrame no CTA e foco dos campos.
- Azul/coral apenas na arte lateral ou em reflexos discretos.
- Mesma tipografia e mesmos tokens de superfície da área interna.

## Movimento

- Transições entre 180 e 420ms com curvas suaves.
- Cards animam apenas `transform` e `opacity`.
- Respeitar `prefers-reduced-motion`.
- Nada pisca, pulsa continuamente ou desloca o layout.

## Desempenho

- Capas 4:3 code-native, leves e responsivas, compostas por tema e identificador estável do módulo. WebP/AVIF permanece disponível como fallback editorial pelo banco, mas não é requisito para a família principal: o usuário rejeitou as imagens sintéticas repetitivas e aprovou uma biblioteca mais coerente e determinística.
- Preload apenas para o conteúdo visível no primeiro viewport.
- Lazy loading para trilhas seguintes.
- Banners com art direction para desktop e mobile quando o mesmo crop não funcionar.

## Critérios de Aceite

- O verde `#34d399` é reconhecido como a cor principal em todas as telas.
- Azul e coral enriquecem a identidade sem virar novas cores de ação.
- Dashboard apresenta continuidade, live e mentoria no primeiro viewport desktop.
- Banners não dominam a tela e permanecem legíveis em desktop e mobile.
- Aulas exibem mais cards por linha, com swipe funcional no mobile.
- Capas não repetem a mesma composição entre módulos e continuam reconhecíveis após reordenação administrativa.
- Mentoria funciona como um fluxo de três etapas e termina no WhatsApp.
- Login, dashboard, aulas, sidebar e mentoria parecem partes do mesmo produto.
