

# Plano: Corrigir Build + Reestruturar Modificador de Imagens

## 1. Erro de Build

O erro e o mesmo timeout de `bun install` que aconteceu antes -- problema temporario de infraestrutura, nao do codigo. Vou forcar um rebuild com uma mudanca minima.

## 2. Reestruturar "Modificador de Imagens"

A categoria "Modificador de Imagens" vai funcionar como um banco de comandos organizados por grupos/titulos. Cada grupo tem ~10 prompts com texto em ingles e traducao em portugues.

### Como vai funcionar

Cada "prompt" na categoria `modifier` representa um **grupo** (ex: "Estilos de Imagem", "Cameras e Lentes"). As `prompt_variations` desse grupo sao os comandos individuais, onde:
- `content` = texto em ingles (ex: "change the style to cinematic realism")
- `image_url` = traducao em portugues (ex: "muda o estilo para realismo cinematografico")

Isso **ja e exatamente a estrutura atual** do banco de dados. O `ModifierCard` ja exibe isso corretamente. Nao precisa mudar o schema.

### Permissoes

- **Mentores e admins**: podem criar, editar e excluir grupos e prompts (ja funciona via RLS)
- **Alunos**: so visualizam e copiam (ja funciona)

### Mudancas no `ModifierCard`

O card atual ja funciona bem, mas vou melhorar a visualizacao:

1. Adicionar numeracao nos prompts (1, 2, 3...)
2. Destacar melhor a seta de traducao (ingles -> portugues)
3. Adicionar botao de copiar tambem na traducao
4. Melhorar a tipografia para facilitar leitura rapida

### Mudancas no Accordion (pagina `/prompts` sem filtro de categoria)

Na view geral com accordion, a categoria "Modificador de Imagens" ja usa `ModifierCard` em vez de `PromptCard`. Isso ja esta implementado. Vou garantir que na view de accordion tambem use o layout de lista simples.

### Visual do ModifierCard atualizado

```text
+--------------------------------------------------+
| Estilos de Imagem                    [Editar] [X] |  <- so para mentores
+--------------------------------------------------+
| 1. change the style to cinematic realism     [C]  |
|    -> muda o estilo para realismo cinematografico  |
|--------------------------------------------------|
| 2. change the style to editorial fashion...  [C]  |
|    -> muda para estilo editorial de revista       |
|--------------------------------------------------|
| ...                                               |
+--------------------------------------------------+

[C] = botao copiar
```

## Arquivos a modificar

1. **`src/components/prompts/ModifierCard.tsx`**
   - Adicionar numeracao (1, 2, 3...) nos prompts
   - Melhorar layout da traducao com seta mais visivel
   - Adicionar botao de copiar na traducao tambem
   - Usar `font-mono` no ingles e fonte normal no portugues

2. **`src/pages/Prompts.tsx`**
   - Na view accordion (sem filtro), garantir que a categoria `modifier` use `ModifierCard` em vez de `PromptCard` (ja esta implementado na view filtrada, precisa verificar na view accordion)

3. **Trigger de rebuild** para resolver o timeout de build

