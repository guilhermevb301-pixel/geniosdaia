
# Plano: Miniatura com Foco Ajustavel e Titulo Abaixo

## Resumo

Atualmente a imagem esta usando `object-contain` que deixa espacos vazios. Voce quer:

1. Imagem preenchendo o card completamente (`object-cover`)
2. Titulo abaixo da imagem (fora do overlay)
3. Mentor pode ajustar o ponto focal da imagem para escolher qual parte aparece

---

## Solucao Proposta

Adicionar um campo `thumbnail_focus` na tabela `prompts` que armazena a posicao do foco (ex: "center", "top", "bottom", "left", "right"). O mentor seleciona isso ao fazer upload da imagem, e a exibicao usa essa posicao como `object-position`.

---

## Mudancas Visuais

```text
ANTES (object-contain):          DEPOIS (object-cover + foco):
+--------------------+           +--------------------+
|    [ Imagem    ]   |           |####################|
|    [ com       ]   |           |## Imagem cheia  ##|
|    [ espacos   ]   |           |## foco ajustado ##|
|                    |           |####################|
+--------------------+           +--------------------+
|~~~ Titulo ~~~      |           | Titulo do Prompt   |
+--------------------+           +--------------------+
     (overlay)                        (abaixo)
```

---

## 1. Migracao do Banco de Dados

Adicionar coluna para armazenar a posicao do foco:

```sql
ALTER TABLE public.prompts 
ADD COLUMN thumbnail_focus TEXT DEFAULT 'center';
```

**Valores possiveis:**
- `center` (padrao)
- `top`
- `bottom`
- `left`
- `right`
- `top-left`
- `top-right`
- `bottom-left`
- `bottom-right`

---

## 2. Interface de Edicao (AdminPrompts.tsx)

Adicionar seletor de foco abaixo do upload de thumbnail:

```text
Imagem de Capa
+---------------------------+
|   [Preview da imagem]     |
+---------------------------+
        
Ponto Focal:
[Topo] [Centro] [Baixo]
[Esq]   [•]    [Dir]
```

O mentor clica em uma das opcoes e o preview atualiza em tempo real mostrando como ficara.

**Implementacao:**
- Adicionar estado `thumbnailFocus` 
- Criar grid 3x3 com botoes para as 9 posicoes
- Aplicar `object-position` no preview

---

## 3. Exibicao no Grid (PromptCard.tsx)

Alterar o layout do card:

**Antes (overlay):**
```tsx
<Card>
  <div className="aspect-video">
    <img className="object-contain" />
  </div>
  <div className="absolute overlay">Titulo</div>
</Card>
```

**Depois (titulo abaixo):**
```tsx
<Card>
  <div className="aspect-video">
    <img 
      className="object-cover" 
      style={{ objectPosition: prompt.thumbnail_focus || 'center' }}
    />
  </div>
  <div className="p-3">
    <span>Titulo</span>
  </div>
</Card>
```

---

## 4. Atualizacao da Interface Prompt

Adicionar `thumbnail_focus` ao tipo:

```typescript
interface Prompt {
  // ... campos existentes
  thumbnail_focus: string | null;
}
```

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| Migracao SQL | Adicionar coluna `thumbnail_focus` |
| `src/pages/admin/AdminPrompts.tsx` | Adicionar seletor de foco, salvar na mutation |
| `src/components/prompts/PromptCard.tsx` | Usar `object-cover` + `objectPosition`, mover titulo para baixo |
| `src/pages/Prompts.tsx` | Atualizar interface Prompt |

---

## Fluxo do Mentor

1. Mentor faz upload da imagem de capa
2. Preview aparece com foco centralizado
3. Mentor clica nos botoes para ajustar o foco (ex: "Topo" para mostrar a parte de cima)
4. Preview atualiza mostrando como ficara no grid
5. Mentor salva e a imagem aparece corretamente no Banco de Prompts

---

## Secao Tecnica

### Componente de Selecao de Foco

```tsx
const focusOptions = [
  { label: '↖', value: 'top left' },
  { label: '↑', value: 'top center' },
  { label: '↗', value: 'top right' },
  { label: '←', value: 'center left' },
  { label: '•', value: 'center' },
  { label: '→', value: 'center right' },
  { label: '↙', value: 'bottom left' },
  { label: '↓', value: 'bottom center' },
  { label: '↘', value: 'bottom right' },
];

<div className="grid grid-cols-3 gap-1 w-32">
  {focusOptions.map((opt) => (
    <Button
      key={opt.value}
      variant={thumbnailFocus === opt.value ? 'default' : 'outline'}
      size="sm"
      onClick={() => setThumbnailFocus(opt.value)}
    >
      {opt.label}
    </Button>
  ))}
</div>
```

### CSS para Object Position

```tsx
<img
  src={prompt.thumbnail_url}
  className="w-full h-full object-cover"
  style={{ objectPosition: prompt.thumbnail_focus || 'center' }}
/>
```

---

## Resultado Esperado

- Cards com imagens preenchendo todo o espaco (sem bordas vazias)
- Titulo limpo abaixo da imagem
- Mentor tem controle sobre qual parte da imagem aparece no grid
- Visual consistente e profissional no Banco de Prompts
