# Formação de vídeos ultrarrealistas — página pública

Rota: `/videos-realistas`. Oferta definida por Guilherme: R$297, pagamento único e acesso vitalício. Checkout: https://pay.kiwify.com.br/a8LzNm8.

## Implementação

- Entrada Vite própria em `videos-realistas/index.html`, com metadados em português para a oferta.
- A página usa React, a marca e as fontes locais já existentes. Não inicializa Supabase, autenticação ou consultas da área de membros.
- O build continua gerando a aplicação de membros em `dist/index.html`; gera também `dist/videos-realistas/index.html`. A Vercel direciona somente a rota nova para a nova entrada.
- `src/data/videoCourse.ts` concentra preço, checkout, vídeos e conteúdo.
- Os vídeos locais têm H.264/AAC e faststart. A prévia da abertura é curta, muda e respeita movimento reduzido. Os demais vídeos só carregam quando o usuário abre o player.
- A janela de vídeo usa o diálogo acessível existente: foco no título ao abrir, Esc para fechar e retorno ao botão de origem. Vídeos externos também têm link para abrir o arquivo no Drive.
- Filtros do portfólio, programa e FAQ funcionam com teclado; há navegação móvel e botão de compra fixo quando a oferta está fora da tela.

## Material real utilizado

Pasta pública fornecida por Guilherme: https://drive.google.com/drive/folders/1kWkkEqJcxBZO7ulOAyzcoVVROr5C4_bO.

| Trabalho | Arquivo no Drive |
| --- | --- |
| GTA — A isca | `1Y1XKotd5ouWJBjFEUJf7jiIwnPf8viJs` |
| Peaky Blinders | `1LemhpmtXMJO9C_jk4tScAEUbkPotFPc-` |
| RealFrame Donut | `16JiuFmh00CjqpfXCUHR_6sSCPUAu_pOr` |
| Doggy Plus | `1GzsPUXKqVphTQ2Yzv50kojUonTtt-tk3` |
| Odisseya | `1cfwbgOZqmRl8WUdgozVwTQuvnii5NpJ4` |
| They have one hour | `1Pi1uFoWaIBvUYLN8PSC9iaWZCElbMcqY` |
| Kauanzinho | `1XxscZclc67CXPTibdpbyiLtu1ubHb8nl` |

As capas vêm dos arquivos reais no Drive. GTA e RealFrame Donut foram baixados dessa pasta e otimizados. O trecho do clipe de Léo Santana/Guga Meyra e a foto de Guilherme foram reaproveitados dos materiais locais da página de mentoria. A demonstração de edição vem do vídeo local `claude 02 editor.mp4`, que mostra o Claude Code.

## Afirmações da oferta

Conteúdo e oferta se baseiam no pedido de Guilherme: criação de vídeo, edição com Claude, skills completas do curso, portfólio/prospecção, bônus de imagens, influencers, clone, voz e aulas de Claude. Não foram inventados quantidade de aulas, alunos, depoimentos, vagas, prazos de oferta, parcelamento, suporte ou garantia comercial.

Guilherme informou que os R$12.055,09 da captura anexada foram recebidos por serviços em um dia. A página atribui o resultado a ele e explica que não é promessa de renda. R$8.000 e R$1.500 são exemplos de trabalhos distintos, não uma soma apresentada como resultado do mesmo dia. A montagem original de comprovantes, com CNPJs, chave Pix e identificador de transação, não foi copiada para os arquivos públicos. Apenas a captura do total líquido, sem esses identificadores, é publicada.

Assinaturas e créditos das ferramentas são informados como custos separados do curso. Esta mudança cria a página de vendas; não altera produto, usuários, permissões, webhook ou liberação de acesso no Supabase/Kiwify.
