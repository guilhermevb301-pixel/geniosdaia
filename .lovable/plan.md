
# Plano: Corrigir Upload e Exibição de Imagens nos Prompts

## Problemas Identificados

1. **Upload não está funcionando**: A imagem do thumbnail não está sendo salva no banco. O campo `thumbnail_url` está `null` mesmo após editar e salvar.

2. **Visualização cortando imagens**: O card usa `object-cover` que corta as imagens para preencher o espaço.

---

## Causa Raiz

O problema principal é que quando você **edita** um prompt existente e adiciona uma imagem, o sistema mostra apenas o preview local mas pode estar falhando no upload. Preciso verificar e corrigir o fluxo de upload.

---

## Correções Necessárias

### 1. Corrigir o Preview de Imagens no PromptCard.tsx

Trocar `object-cover` por `object-contain` para mostrar a imagem completa sem cortar:

**Arquivo**: `src/components/prompts/PromptCard.tsx`

```
ANTES (linha 58):
className="w-full h-full object-cover transition-transform..."

DEPOIS:
className="w-full h-full object-contain transition-transform..."
```

Isso garante que:
- A imagem aparece inteira, sem cortes
- Mantém a proporção original da imagem
- Fundo do card fica visível nas bordas se a imagem não tiver a mesma proporção

### 2. Adicionar Log de Erros no Upload

Para diagnosticar melhor, adicionar tratamento de erro mais detalhado no `AdminPrompts.tsx`:

```tsx
const uploadFile = async (file: File, folder: string): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error, data } = await supabase.storage.from("prompts").upload(fileName, file);
  
  if (error) {
    console.error("Upload error:", error);
    toast.error(`Erro no upload: ${error.message}`);
    throw error;
  }

  const { data: urlData } = supabase.storage.from("prompts").getPublicUrl(fileName);
  return urlData.publicUrl;
};
```

### 3. Verificar e Corrigir a Mutation de Update

Garantir que ao editar, os arquivos estão sendo processados corretamente e a mutation está aguardando o upload.

---

## Mudanças no Card de Visualização

### Layout Atual vs Layout Corrigido

```
ATUAL (object-cover):          CORRIGIDO (object-contain):
+--------------------+         +--------------------+
|                    |         |    [ Imagem    ]   |
|    Imagem cortada  |         |    [ completa  ]   |
|    para preencher  |         |    [ sem corte ]   |
|                    |         |                    |
+--------------------+         +--------------------+
| Título             |         | Título             |
+--------------------+         +--------------------+
```

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/components/prompts/PromptCard.tsx` | Trocar `object-cover` por `object-contain` no thumbnail do card |
| `src/pages/admin/AdminPrompts.tsx` | Adicionar logs de erro no upload e verificar fluxo da mutation |

---

## Teste Após Implementação

1. Criar novo prompt com imagem
2. Verificar se imagem aparece no grid sem cortes
3. Editar prompt existente e adicionar imagem
4. Confirmar que imagem foi salva no storage
5. Verificar que modal de visualização mostra imagem completa
