
# Plano: Personalização de Banners + Notas Livres com Upload

## Resumo das Mudanças

| Feature | Descrição |
|---------|-----------|
| **1. Largura/Altura dos Banners** | Mentor pode definir dimensões customizadas para cada banner |
| **2. Notas Livres no Caderno** | Alunos podem criar notas sem vínculo com aulas, com título e mídia |

---

## 1. Banners Customizáveis (Altura/Largura)

### Problema Atual
- Banners têm altura fixa (`h-44` = 176px)
- Largura é `md:basis-1/2` (metade no desktop)
- Não há como o mentor personalizar

### Solução
Adicionar campos `height` e `width` na tabela `dashboard_banners`:
- **height**: Altura em pixels (ex: 176, 200, 250)
- **width**: Tipo de layout (`half` = 50%, `full` = 100%, `third` = 33%)

### Mudanças no Banco de Dados

```sql
ALTER TABLE dashboard_banners 
ADD COLUMN height integer DEFAULT 176,
ADD COLUMN width_type text DEFAULT 'half';
-- width_type: 'half' (50%), 'full' (100%), 'third' (33%)
```

### Mudanças no Código

| Arquivo | Mudança |
|---------|---------|
| `AdminBanners.tsx` | Adicionar campos height e width_type no formulário |
| `AnnouncementCarousel.tsx` | Usar valores dinâmicos ao invés de classes fixas |
| `useDashboardBanners.ts` | Atualizar interface DashboardBanner |

### Exemplo no Carrossel

```tsx
// AnnouncementCarousel.tsx
const getWidthClass = (widthType: string) => {
  switch (widthType) {
    case 'full': return 'md:basis-full';
    case 'third': return 'md:basis-1/3';
    default: return 'md:basis-1/2';
  }
};

<CarouselItem className={`pl-2 md:pl-4 ${getWidthClass(banner.width_type)}`}>
  <div style={{ height: `${banner.height}px` }} className="...">
```

---

## 2. Notas Livres no "Meu Caderno"

### Problema Atual
- Notas só podem ser criadas vinculadas a aulas
- Não há suporte para mídia (imagens/vídeos)

### Solução
1. Permitir notas sem `lesson_id` ou `prompt_id` (nota livre)
2. Adicionar campos `title` e `media_urls` na tabela `user_notes`
3. Criar bucket de storage para uploads
4. Adicionar botão "Nova Nota" no MeuCaderno

### Mudanças no Banco de Dados

```sql
-- Adicionar campos na tabela user_notes
ALTER TABLE user_notes 
ADD COLUMN title text,
ADD COLUMN media_urls text[] DEFAULT '{}';

-- Criar bucket para armazenar mídia das notas
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-notes', 'user-notes', true);

-- RLS para o bucket
CREATE POLICY "Users can upload own media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-notes' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Mudanças no Código

| Arquivo | Mudança |
|---------|---------|
| `MeuCaderno.tsx` | Botão "Nova Nota", modal de criação com upload |
| `useUserNotes.ts` | Suporte a title, media_urls, notas livres |
| `useDashboardBanners.ts` | Atualizar interface |

### Interface da Nova Nota

```text
┌──────────────────────────────────────────────────────┐
│  + Nova Nota                                         │
├──────────────────────────────────────────────────────┤
│  Título: ____________________________________        │
│                                                      │
│  Conteúdo:                                           │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Mídia: [📷 Imagem] [🎥 Vídeo]                       │
│                                                      │
│  Arquivos anexados:                                  │
│  - imagem1.png [x]                                   │
│  - video1.mp4 [x]                                    │
│                                                      │
│  [Cancelar]                    [Salvar Nota]         │
└──────────────────────────────────────────────────────┘
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/new_migration.sql` | Adicionar campos e bucket |
| `src/hooks/useDashboardBanners.ts` | Adicionar height, width_type na interface |
| `src/pages/admin/AdminBanners.tsx` | Campos de altura e largura no form |
| `src/components/dashboard/AnnouncementCarousel.tsx` | Usar dimensões dinâmicas |
| `src/hooks/useUserNotes.ts` | Adicionar title, media_urls, createFreeNote |
| `src/pages/MeuCaderno.tsx` | Modal de criação de nota livre com upload |

---

## Fluxo de Upload de Mídia

1. Usuário clica em "Adicionar Imagem" ou "Adicionar Vídeo"
2. Seleciona arquivo (validação: imagem até 10MB, vídeo até 50MB)
3. Upload para `user-notes/{user_id}/{uuid}.ext`
4. URL é adicionada ao array `media_urls`
5. Ao salvar, todas as URLs são persistidas

---

## Validação de Arquivos

```typescript
// Imagens: JPEG, PNG, WebP, GIF - máx 10MB
// Vídeos: MP4, WebM, MOV - máx 50MB

const validateMedia = (file: File): boolean => {
  const isImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
  const isVideo = ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type);
  
  if (isImage && file.size > 10 * 1024 * 1024) return false;
  if (isVideo && file.size > 50 * 1024 * 1024) return false;
  
  return isImage || isVideo;
};
```

---

## Resultado Esperado

1. **Banners**: Mentor pode ajustar altura (ex: 200px) e largura (50%, 100%, 33%) de cada banner
2. **Notas Livres**: Alunos podem criar notas com título, texto e anexar imagens/vídeos
3. **Mídia segura**: Arquivos são armazenados no bucket com RLS por usuário
