

# Plano: Corrigir Erro ao Adicionar Imagem nos Prompts

## Problema Identificado

Quando você tenta adicionar uma imagem maior que **5MB** no prompt, o sistema está bloqueando corretamente (por segurança), mas existem dois problemas:

1. **Validação tardia**: A imagem só é validada quando você clica em "Criar" ou "Salvar", não no momento que seleciona o arquivo
2. **Mensagem genérica**: O erro "Arquivo muito grande. Tamanho máximo: 5MB" aparece rapidamente, mas é seguido por "Erro ao criar prompt" que é confuso

---

## Solução

### 1. Validar imagem imediatamente ao selecionar

Adicionar validação no momento em que o arquivo é selecionado, tanto na thumbnail quanto nas variações, mostrando o erro instantaneamente.

**Arquivos a modificar:**

| Arquivo | Mudança |
|---------|---------|
| `src/components/prompts/VariationEditor.tsx` | Adicionar validação ao selecionar imagem |

### Mudanças no VariationEditor.tsx

```typescript
// Importar a função de validação
import { validateImageFile, ALLOWED_IMAGE_EXTENSIONS } from "@/lib/fileValidation";

// Na função handleImageChange, validar ANTES de aceitar o arquivo:
const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Validar o arquivo antes de aceitar
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Arquivo inválido");
      e.target.value = ''; // Limpar o input
      return;
    }
    updateVariation(index, "imageFile", file);
  }
};
```

---

### 2. Melhorar mensagem de erro na mutação

Modificar o `onError` para exibir a mensagem de erro específica em vez de uma genérica.

**Arquivo:** `src/pages/admin/AdminPrompts.tsx`

```typescript
// Antes
onError: () => toast.error("Erro ao criar prompt"),

// Depois
onError: (error: Error) => toast.error(error.message || "Erro ao criar prompt"),
```

---

## Observações Importantes

Se a imagem que você está tentando enviar tem mais de 5MB, você tem duas opções:

1. **Comprimir a imagem** antes de fazer upload (usando ferramentas como TinyPNG, Squoosh, ou redimensionando)
2. **Aumentar o limite** de 5MB para um valor maior (se necessário)

---

## Resumo das Mudanças

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/components/prompts/VariationEditor.tsx` | Modificar | Adicionar validação imediata ao selecionar arquivo |
| `src/pages/admin/AdminPrompts.tsx` | Modificar | Melhorar mensagens de erro nas mutações |

---

## Resultado Esperado

1. Ao selecionar uma imagem maior que 5MB, você verá imediatamente: **"Arquivo muito grande. Tamanho máximo: 5MB"**
2. A imagem não será aceita e o campo será limpo
3. Você poderá tentar novamente com uma imagem menor
4. Se houver outros erros, a mensagem específica será exibida

