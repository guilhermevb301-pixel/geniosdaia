

# Plano: Upload de Imagem para Banners + Remover Campo de Botão

## Resumo das Mudanças

| Mudança | Descrição |
|---------|-----------|
| **1. Upload de Imagem** | Substituir campo de URL por input de upload de arquivo |
| **2. Remover Texto do Botão** | O banner inteiro é clicável, não precisa de texto separado |
| **3. Bucket de Storage** | Criar bucket `banners` para armazenar as imagens |

---

## 1. Criar Bucket de Storage

O projeto já tem buckets para `templates`, `prompts`, `modules` e `user-notes`. Vamos criar um para banners.

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true);

-- Permitir mentores e admins fazer upload
CREATE POLICY "Admins and mentors can upload banners"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'banners' AND 
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
);

-- Permitir visualização pública
CREATE POLICY "Anyone can view banners"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'banners');

-- Permitir exclusão por admins/mentores
CREATE POLICY "Admins and mentors can delete banners"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'banners' AND 
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
);
```

---

## 2. Mudanças no Formulário

### Antes (Atual)
- Campo "URL da Imagem" (texto)
- Campo "Texto do Botão"

### Depois (Novo)
- **Área de Upload** com preview da imagem
- Remove campo "Texto do Botão" (banner inteiro é clicável)

---

## 3. Implementação do Upload

```typescript
// Lógica de upload
const handleImageUpload = async (file: File) => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('banners')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('banners')
    .getPublicUrl(fileName);

  setFormData({ ...formData, image_url: publicUrl });
};
```

---

## 4. Interface do Upload

```text
┌─────────────────────────────────────────────┐
│  Imagem do Banner                           │
├─────────────────────────────────────────────┤
│                                             │
│    ┌─────────────────────────────────┐      │
│    │                                 │      │
│    │     [Preview da imagem]         │      │
│    │                                 │      │
│    └─────────────────────────────────┘      │
│                                             │
│    [📷 Escolher Imagem]  [🗑️ Remover]       │
│                                             │
│    Formatos: JPG, PNG, WebP, GIF            │
│    Tamanho máximo: 10MB                     │
└─────────────────────────────────────────────┘
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/migrations/` | Criar bucket `banners` com RLS |
| `src/pages/admin/AdminBanners.tsx` | Upload de imagem, remover campo de botão |
| `src/hooks/useDashboardBanners.ts` | Remover `button_text` da interface (opcional) |

---

## Campos do Formulário (Final)

1. **Título** - texto obrigatório
2. **Subtítulo** - texto opcional
3. **Imagem** - upload de arquivo (com preview)
4. **Gradiente** - fallback se não houver imagem
5. **Link de Destino** - URL obrigatória (banner clicável)
6. **Altura** - em pixels
7. **Largura** - half/third/full
8. **Ordem** - número
9. **Ativo** - switch

---

## Resultado Esperado

1. Mentor faz upload de imagem diretamente (qualquer tamanho de imagem)
2. Preview aparece no formulário
3. Não precisa mais copiar/colar URLs
4. Banner inteiro é clicável (sem botão separado)

