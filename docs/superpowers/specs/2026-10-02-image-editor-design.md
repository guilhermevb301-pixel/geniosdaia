# Editor não destrutivo de imagens clínicas

## Objetivo

Permitir que o profissional abra qualquer anexo de imagem e faça ajustes clínicos — corte, rotação, zoom e marcações — sem sobrescrever nem degradar o arquivo original. As edições ficam salvas no prontuário, reaparecem em qualquer dispositivo da conta e podem ser desfeitas ou restauradas.

PDFs e outros documentos continuam no visualizador atual. O editor se aplica a anexos cujo MIME começa com `image/`.

## Experiência do usuário

O visualizador mantém os controles atuais de zoom, pan, rotação, brilho, contraste e negativo. Um botão **Editar imagem** abre o modo de edição com uma barra simples:

- **Cortar**: seleção retangular, com aplicar ou cancelar.
- **Girar**: passos de 90 graus.
- **Desenhar**: traço livre.
- **Seta**: indica uma região clínica.
- **Círculo** e **retângulo**: destacam áreas.
- **Texto**: adiciona uma observação curta sobre a imagem.
- Cor e espessura da marcação.
- Selecionar/apagar marcação, desfazer e refazer.
- **Salvar edições**, **Cancelar** e **Restaurar original**.

O modo normal permite zoom e pan sem alterar o prontuário. O modo de edição separa navegação e desenho para evitar marcas acidentais. Ao sair com mudanças não salvas, o sistema pede confirmação.

O download oferece **Baixar original** e **Baixar versão editada**. A versão editada é renderizada em uma nova imagem no momento do download; o arquivo original armazenado não muda.

## Modelo de dados

Cada `Attachment` pode receber `imageEdits`, mantendo compatibilidade com anexos antigos:

- `rotation`: `0 | 90 | 180 | 270`.
- `crop`: retângulo normalizado (`x`, `y`, `width`, `height`, valores de 0 a 1).
- `brightness`, `contrast` e `invert`.
- `annotations`: lista ordenada de anotações.
- `updatedAt`: data da última edição.

Cada anotação tem `id`, `kind` (`freehand`, `arrow`, `ellipse`, `rectangle`, `text`), cor, espessura e geometria em coordenadas normalizadas. Texto inclui o conteúdo. Coordenadas normalizadas mantêm as marcações alinhadas em telas e resoluções diferentes.

Anexos sem `imageEdits` continuam funcionando sem migração. Restaurar o original remove apenas `imageEdits`; nome, categoria, data, dente e observações permanecem.

## Componentes e responsabilidades

### `image-editor.ts`

Funções puras para normalizar rotação, validar/limitar corte e anotações, aplicar comandos, desfazer/refazer e converter coordenadas. Esse núcleo não depende do React e recebe testes diretos.

### `ImageCanvas`

Renderiza a imagem, corte e rotação, mais a camada SVG de anotações. Usa a mesma transformação para imagem e marcações. Captura ponteiro somente no modo de edição.

### `ImageEditor`

Controla ferramenta ativa, rascunho, seleção, histórico local de desfazer/refazer e confirmação de saída. Só atualiza o paciente ao clicar em **Salvar edições**.

### Visualizador e miniaturas

O `Viewer` abre o editor e aplica as edições salvas na visualização. Miniaturas mostram rotação e corte; as anotações aparecem no visualizador e no download editado, sem poluir excessivamente a grade.

### Exportação

Uma função cria um canvas na resolução resultante do corte, desenha a imagem transformada, aplica filtros e renderiza as anotações. O resultado é baixado como PNG ou JPEG. Falhas de carregamento ou exportação exibem mensagem clara e nunca alteram o original.

## Persistência e segurança

As edições são metadados no paciente e usam o sincronismo já existente com Supabase e cache local. Não é criado um segundo arquivo durante a edição e não há upload até o usuário salvar. O original continua no mesmo `Attachment.id` e permanece disponível para download e restauração.

Somente dados da conta atual são alterados. A demonstração continua em memória. Excluir a imagem remove o original e seus metadados como já ocorre hoje.

## Casos-limite

- Imagem sem dimensões: o editor aguarda o carregamento antes de habilitar ferramentas.
- SVG e GIF: podem ser visualizados e anotados; exportação gera imagem estática.
- Corte inválido ou pequeno demais: não é aplicado.
- Texto vazio: não cria anotação.
- Troca de imagem com edição pendente: pede confirmação.
- PDF: mantém zoom e visualização do navegador, sem ferramentas de edição.

## Testes e validação

- Testes unitários do núcleo: rotação, corte limitado, criação/remoção de cada anotação, coordenadas normalizadas, desfazer/refazer e restauração.
- Teste de compatibilidade: anexos antigos sem `imageEdits` continuam válidos.
- Teste de persistência: salvar altera apenas os metadados do anexo selecionado.
- Teste de proteção: restaurar remove edições, mas preserva o arquivo e os demais metadados.
- Compilação TypeScript e suíte completa existente.
- Verificação manual na demonstração: editar, fechar/reabrir, baixar original, baixar editado e restaurar.

## Fora do escopo

- Edição de páginas de PDF.
- IA para diagnóstico ou interpretação de exames.
- Alteração de pixels do arquivo original.
- Colaboração simultânea entre dois usuários na mesma imagem.
