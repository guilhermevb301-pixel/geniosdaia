

# Plano: Variações com Vídeo para Categoria "Vídeos"

## O Que Será Feito

1. **Adicionar coluna `video_url` na tabela `prompt_variations`** para suportar upload de vídeo por variação
2. **Atualizar `VariationEditor`** para mostrar upload de vídeo OU imagem dependendo da categoria
3. **Atualizar `PromptCard`** para exibir vídeo nas variações e sempre mostrar o vídeo de exemplo

---

## Problema Atual

### No Admin (VariationEditor)
- As variações sempre pedem **imagem** do resultado
- Para categoria "vídeo", deveria pedir **vídeo** do resultado
- O campo de upload de imagem não faz sentido para prompts de vídeo

### No Modal do Aluno (PromptCard)
- Se o prompt tem variações → **não mostra o vídeo de exemplo**
- O vídeo só aparece no bloco "else" (fallback legado)
- Aluno não consegue ver/baixar o vídeo

---

## Solução

### 1. Banco de Dados

Adicionar coluna `video_url` na tabela `prompt_variations`:

```sql
ALTER TABLE prompt_variations ADD COLUMN video_url text;
```

### 2. VariationEditor - Upload Condicional

Passar a categoria como prop e mostrar campo diferente:

| Categoria | Campo de Upload |
|-----------|-----------------|
| `video` | Upload de **vídeo MP4** |
| `image` | Upload de **imagem** |
| `agent` | Upload de **imagem** |

```text
+---------------------------------------------+
|  Variação 1                           [X]   |
+---------------------------------------------+
|  Texto do Prompt *                          |
|  [________________________]                 |
|                                             |
|  Vídeo do Resultado  <- Se categoria=video  |
|  ┌────────────────────────┐                 |
|  │  📹 Adicionar MP4      │                 |
|  └────────────────────────┘                 |
+---------------------------------------------+
```

### 3. PromptCard - Exibir Vídeo

Mover a seção de vídeo para **fora** do bloco condicional:

```text
ANTES:
  hasVariations ? (variações) : (legado + vídeo)

DEPOIS:
  hasVariations ? (variações com vídeo) : (legado)
  + vídeo de exemplo sempre visível se existir
```

Para variações na categoria vídeo, mostrar o `video_url` da variação:

```tsx
{/* Na variação de vídeo */}
{currentVariation.video_url && (
  <video src={currentVariation.video_url} controls />
  <Button>Baixar vídeo</Button>
)}
```

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| **Banco de dados** | Adicionar coluna `video_url` em `prompt_variations` |
| `src/components/prompts/VariationEditor.tsx` | Aceitar prop `category`, mostrar upload de vídeo ou imagem |
| `src/pages/admin/AdminPrompts.tsx` | Passar `category` para `VariationEditor`, upload de vídeo por variação |
| `src/components/prompts/PromptCard.tsx` | Exibir `video_url` nas variações e mostrar `example_video_url` sempre |
| `src/integrations/supabase/types.ts` | (Auto-atualizado após migration) |

---

## Detalhes Técnicos

### Interface Variation Atualizada

```typescript
export interface Variation {
  id?: string;
  content: string;
  image_url: string | null;
  video_url: string | null;  // NOVO
  order_index: number;
  isNew?: boolean;
  imageFile?: File;
  imagePreview?: string;
  videoFile?: File;          // NOVO
  videoPreview?: string;     // NOVO
}
```

### Props do VariationEditor

```typescript
interface VariationEditorProps {
  variations: Variation[];
  onChange: (variations: Variation[]) => void;
  isUploading: boolean;
  category: PromptCategory;  // NOVO - para saber qual tipo de upload mostrar
}
```

### Lógica Condicional no Editor

```tsx
{category === 'video' ? (
  // Upload de vídeo
  <div>
    <Label>Vídeo do Resultado</Label>
    <input type="file" accept="video/mp4" />
    {videoPreview && <video src={videoPreview} controls />}
  </div>
) : (
  // Upload de imagem (para image e agent)
  <div>
    <Label>Imagem do Resultado</Label>
    <input type="file" accept="image/*" />
    {imagePreview && <img src={imagePreview} />}
  </div>
)}
```

### Query Atualizada

```typescript
.select(`
  *,
  variations:prompt_variations(
    id, content, image_url, video_url, order_index
  )
`)
```

---

## Fluxo para o Mentor

1. Seleciona categoria "Vídeos"
2. Adiciona variação
3. Cola o prompt de texto
4. Faz upload do **vídeo MP4** do resultado (ao invés de imagem)
5. Salva

---

## Fluxo para o Aluno

1. Clica no prompt
2. Vê as variações com navegação < >
3. Cada variação mostra:
   - O vídeo do resultado (se for categoria vídeo)
   - A imagem do resultado (se for categoria imagem/agente)
   - O texto do prompt
   - Botão de copiar
4. Pode baixar o vídeo

---

## Resultado Esperado

### Admin
- Categoria "Vídeos": variações pedem upload de vídeo MP4
- Categorias "Imagens" e "Agentes": variações pedem upload de imagem

### Aluno
- Modal mostra vídeo da variação quando existe
- Botão de download para vídeos
- Vídeo de exemplo geral sempre visível se existir

---

## Critérios de Aceite

1. Nova coluna `video_url` na tabela `prompt_variations`
2. Upload de vídeo nas variações de prompts de vídeo
3. Upload de imagem nas variações de outros tipos
4. Vídeo exibido no modal do aluno
5. Download de vídeo funcionando
6. Não quebrar prompts existentes

