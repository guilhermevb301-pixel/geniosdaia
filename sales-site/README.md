# RealFrame Filmes IA — página independente

Site: https://realframe-filmes-ia.vercel.app

Projeto Vercel: `realframe-filmes-ia`, separado do projeto `membros-genios`.

## Correções solicitadas

- Mantida a copy, o valor de R$297, o acesso vitalício e o checkout informado pelo Guilherme.
- Removidas navegação de alunos e dependências da aplicação de membros.
- Portfólio sem filtros ou rótulos de categoria; todos os oito vídeos usam arquivos próprios H.264/AAC, sem iframe, redirecionamento ou links para o Drive.
- Demonstração substituída por `2026-10-16-edicao-chatgpt.mp4`, confirmada por Guilherme em 15/10/2026. Como o vídeo mostra ChatGPT, o player identifica edição com IA, sem atribuir esse vídeo especificamente ao Claude. O ensino de Claude e suas skills continuam na oferta.
- Incluídos os cinco prints de perfis enviados: Léo Santana, Renato Cariani, Pablo, Guga Meyra e Kauanzinho. Podem ser ampliados em um diálogo local; não são apresentados como depoimentos ou endosso do curso.
- Incluídos o print do dashboard e a montagem de comprovantes. Dados de transação, CPF/CNPJ e chave Pix ocultados na cópia pública; valores, empresas e datas mantidos. Os R$12.055,09 são atribuídos ao resultado pessoal de serviços em um dia informado por Guilherme. Comprovantes de datas diferentes não são somados como ganhos desse dia nem vendidos como resultado garantido.
- Bônus visuais de imagens, influencer, clone, voz e Claude. Conteúdo conferido na biblioteca de membros; imagens de referência copiadas para este projeto. Nova imagem fotográfica ilustrativa para voz, sem depoimento fictício.

## Materiais

Mídia pública em `public/realframe-videos/`; conteúdo em `src/data/videoCourse.ts`.

Pasta fornecida: https://drive.google.com/drive/folders/1kWkkEqJcxBZO7ulOAyzcoVVROr5C4_bO.

| Vídeo | Arquivo de origem no Drive |
| --- | --- |
| GTA | `1Y1XKotd5ouWJBjFEUJf7jiIwnPf8viJs` |
| Peaky Blinders | `1LemhpmtXMJO9C_jk4tScAEUbkPotFPc-` |
| Donut | `16JiuFmh00CjqpfXCUHR_6sSCPUAu_pOr` |
| Doggy | `1GzsPUXKqVphTQ2Yzv50kojUonTtt-tk3` |
| Odisseya | `1cfwbgOZqmRl8WUdgozVwTQuvnii5NpJ4` |
| They have one hour | `1Pi1uFoWaIBvUYLN8PSC9iaWZCElbMcqY` |
| Kauanzinho | `1XxscZclc67CXPTibdpbyiLtu1ubHb8nl` |

O clipe de Léo Santana/Guga Meyra e o retrato de Guilherme são materiais locais fornecidos para o projeto. O vídeo de edição está também no acervo local `outputs/publicacao-tutoriais-2026-10-15/videos/2026-10-16-edicao-chatgpt.mp4`.

## Imagens criadas

Ferramenta integrada `image_gen`, sem CLI alternativo. Arquivos finais incorporados:

- `public/realframe-videos/bonus-voz.png`: ilustração fotográfica do conteúdo, não um case real.
- `public/realframe-videos/comprovantes-publicos.png`: edição de privacidade da captura fornecida; valores, empresas e datas conferidos visualmente contra o original. Não foram criados recibos novos.

Prompt da capa de voz:

> Create a premium editorial photograph to illustrate a voice-cloning lesson bonus in an AI filmmaking course. Landscape 3:2 composition. Tight cinematic close-up of a real adult male vocalist in a contemporary professional recording booth, three-quarter side profile, black studio headphones, large-diaphragm condenser microphone with pop filter clearly visible. A computer monitor farther behind shows a precise audio waveform and two aligned recorded voice tracks, no legible words. Believable real equipment, natural facial skin and metal textures, restrained red recording light, soft warm daylight and charcoal acoustic panels. Subject and microphone immediately readable at small card size. Crisp photographic realism, not 3D, no robots, no futuristic holograms, no neon green treatment, no floating objects, no text, no logos, no watermark.

Prompt da edição de privacidade:

> Preserve this supplied screenshot exactly: same three receipts, same banks, same companies, same dates and all amounts including R$8.000,00, R$1.500,00 and R$3.000,00. Do not recreate, beautify or invent transactions. Only cover the transaction ID, both CPF/CNPJ values and the Chave Pix value with opaque light gray rectangles. Leave the field labels visible. Everything outside those identifiers must remain unchanged.

## Verificação

- `npm test`: sete testes, incluindo vídeo correto, arquivos de mídia presentes e ampliação dos prints.
- `npm run build`: build independente.
- `npm audit`: nenhuma vulnerabilidade nas dependências na conferência de 15/10/2026.
- Navegador em 320, 390, 768, 1440 e 1920px: sem transbordamento horizontal; navegação móvel, fotos e bônus presentes.
- Reprodução real da demonstração confirmada: 67,73s, 720x1280, player nativo.
- Aplicação de membros: 126 testes preservados, sem mudanças em autenticação, permissões ou webhook.

## Pendência no checkout

Guilherme confirmou Clone Criativo e Influencer incluídos nos R$297. A retirada dos dois order bumps de R$57 continua pendente na Kiwify, cujo controle de remoção não respondeu na tentativa anterior. Conferir também liberação dos bônus antes de iniciar tráfego. Esta página não altera permissões, produtos ou pagamentos.
