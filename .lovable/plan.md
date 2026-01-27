
# Plano: Aumentar Limite de Upload de Imagens para 10MB

## Mudança Necessária

Alterar o limite máximo de tamanho de imagens de **5MB** para **10MB** no arquivo de validação.

---

## Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/lib/fileValidation.ts` | Alterar `MAX_IMAGE_SIZE` de 5MB para 10MB |

---

## Alteração

**Linha 27:**

```typescript
// Antes
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Depois
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
```

---

## Impacto

Esta única mudança afetará automaticamente:

- **Thumbnail principal** do prompt
- **Imagens das variações** 
- **Qualquer outro upload de imagem** que use a função `validateImageFile()`

---

## Resultado

Após a alteração, você poderá fazer upload de imagens de até **10MB** em todos os campos de imagem do sistema de prompts.
