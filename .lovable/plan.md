
# Plano: Módulos em Grid Estilo Hotmart

## Visão Geral

Transformar a página de Aulas de um layout com accordion lateral para um layout com **cards em grid** onde cada módulo é um card visual com imagem de capa, similar à Hotmart. O usuário poderá navegar clicando no módulo e depois escolher a aula.

---

## Fluxo de Navegação Proposto

```text
Página de Módulos (Grid)      →      Página de Aulas do Módulo
┌──────┐ ┌──────┐ ┌──────┐           ┌─────────────────────────┐
│ Capa │ │ Capa │ │ Capa │           │  Lista de Aulas         │
│ Mod1 │ │ Mod2 │ │ Mod3 │    →      │  + Video Player         │
│ 5/10 │ │ 0/8  │ │ 3/3  │           │                         │
└──────┘ └──────┘ └──────┘           └─────────────────────────┘
```

---

## Mudanças Necessárias

### 1. Banco de Dados - Adicionar campo de imagem

Adicionar coluna `cover_image_url` na tabela `modules` para armazenar a URL da imagem de capa.

**SQL:**
```sql
ALTER TABLE modules ADD COLUMN cover_image_url text;
```

---

### 2. Novo Componente - ModuleGrid

Criar um novo componente que exibe os módulos em grid com cards visuais.

| Arquivo | Descrição |
|---------|-----------|
| `src/components/aulas/ModuleGrid.tsx` | Grid de cards de módulos com imagem de capa |

**Características do card:**
- Imagem de capa (ou placeholder com gradiente)
- Título do módulo
- Barra de progresso visual
- Indicador de aulas completadas (ex: "5/10 aulas")
- Clique leva para as aulas do módulo

---

### 3. Nova Página - Aulas do Módulo

Criar uma página para exibir as aulas de um módulo específico.

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/ModuleLessons.tsx` | Página com player + lista de aulas do módulo |

Esta página terá o layout atual com o player à direita e lista de aulas à esquerda, mas apenas para o módulo selecionado.

---

### 4. Atualizar Página de Aulas

Modificar `src/pages/Aulas.tsx` para exibir o grid de módulos.

**De:**
- Layout split com accordion + player

**Para:**
- Grid de cards de módulos
- Barra de progresso geral no topo

---

### 5. Atualizar Rotas

Adicionar nova rota para a página de aulas do módulo.

| Arquivo | Mudança |
|---------|---------|
| `src/App.tsx` | Adicionar rota `/aulas/:moduleId` |

---

### 6. Admin - Editar Capa dos Módulos

Modificar a página de administração para permitir upload de imagem de capa.

| Arquivo | Mudança |
|---------|---------|
| `src/pages/admin/AdminModules.tsx` | Adicionar campo de upload de imagem |

**Funcionalidades:**
- Upload de imagem de capa (usando a validação existente)
- Preview da imagem atual
- Botão para remover imagem

---

## Layout do Grid

```text
Desktop (lg): 3 colunas
┌──────┐ ┌──────┐ ┌──────┐
│      │ │      │ │      │
└──────┘ └──────┘ └──────┘

Tablet (md): 2 colunas
┌──────┐ ┌──────┐
│      │ │      │
└──────┘ └──────┘

Mobile (sm): 1 coluna
┌──────────┐
│          │
└──────────┘
```

**Classes Tailwind:**
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

---

## Design do Card de Módulo

```text
┌────────────────────────────┐
│                            │
│      [Imagem de Capa]      │
│      ou Placeholder        │
│                            │
├────────────────────────────┤
│ Módulo 1                   │
│ Introdução ao n8n          │
│                            │
│ ████████░░░░ 5/10 aulas    │
└────────────────────────────┘
```

- Aspecto da imagem: 16:9
- Efeito hover: scale + sombra
- Badge de "Completo" se 100%

---

## Resumo dos Arquivos

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/migrations/` | Criar | Adicionar `cover_image_url` à tabela modules |
| `src/components/aulas/ModuleGrid.tsx` | Criar | Componente de grid de módulos |
| `src/components/aulas/ModuleCard.tsx` | Criar | Card individual do módulo |
| `src/pages/ModuleLessons.tsx` | Criar | Página de aulas de um módulo |
| `src/pages/Aulas.tsx` | Modificar | Exibir grid de módulos |
| `src/pages/admin/AdminModules.tsx` | Modificar | Adicionar upload de imagem |
| `src/App.tsx` | Modificar | Adicionar nova rota |

---

## Seção Técnica

### Estrutura de Dados Atualizada

```typescript
interface Module {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null; // NOVO
  order_index: number;
  lessons: Lesson[];
  completedCount: number;
  totalCount: number;
}
```

### Upload de Imagem (AdminModules)

Reutilizar a função `validateImageFile` do `src/lib/fileValidation.ts` para validar uploads:

```typescript
import { validateImageFile, ALLOWED_IMAGE_EXTENSIONS } from "@/lib/fileValidation";

async function uploadCoverImage(file: File): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);
  
  const fileName = `covers/${Date.now()}.${file.name.split('.').pop()}`;
  const { error } = await supabase.storage.from('modules').upload(fileName, file);
  if (error) throw error;
  
  return supabase.storage.from('modules').getPublicUrl(fileName).data.publicUrl;
}
```

### Navegação

```typescript
// Em ModuleCard.tsx
<Link to={`/aulas/${module.id}`}>
  <Card className="hover:scale-[1.02] transition-transform cursor-pointer">
    ...
  </Card>
</Link>
```

### Rota

```typescript
// Em App.tsx
<Route path="/aulas/:moduleId" element={<ProtectedRoute><ModuleLessons /></ProtectedRoute>} />
```

---

## Resultado Esperado

1. **Página de Aulas** mostra grid de módulos com capas visuais
2. **Clicar em um módulo** leva para as aulas daquele módulo
3. **Admin pode editar** nome e imagem de capa de cada módulo
4. **Responsivo** - funciona bem em mobile, tablet e desktop
5. **Progresso visual** - cada card mostra o progresso do usuário
