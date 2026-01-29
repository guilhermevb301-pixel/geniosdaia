

# Plano: Sistema de Secoes para Agrupar Modulos

## Visao Geral

Vou criar um sistema de **Secoes** que funcionam como titulos grandes acima dos modulos, permitindo organizar o conteudo de forma hierarquica. Baseado na imagem de referencia (ex: "Cursos - Aprimoramento"), cada secao tera um titulo e contera varios modulos abaixo.

---

## Estrutura Visual Desejada

```text
+------------------------------------------------------------------+
|  AULAS                                                            |
|  Seu curso de automacao com n8n                                   |
|                                                                   |
|  [========= Progresso Geral =========]                           |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  Cursos - Fundamentos                    <-- TITULO DA SECAO     |
|  +--------+  +--------+  +--------+                              |
|  |Mod 1   |  |Mod 2   |  |Mod 3   |      <-- MODULOS DA SECAO    |
|  +--------+  +--------+  +--------+                              |
|                                                                   |
|  Cursos - Aprimoramento                  <-- OUTRO TITULO        |
|  +--------+  +--------+  +--------+  +--------+                  |
|  |Mod 4   |  |Mod 5   |  |Mod 6   |  |Mod 7   |                  |
|  +--------+  +--------+  +--------+  +--------+                  |
|                                                                   |
|  Projetos Praticos                       <-- OUTRO TITULO        |
|  +--------+  +--------+                                          |
|  |Mod 8   |  |Mod 9   |                                          |
|  +--------+  +--------+                                          |
+------------------------------------------------------------------+
```

---

## Arquitetura da Solucao

### Opcao Escolhida: Nova Tabela `module_sections`

Criar uma tabela separada para secoes, com os modulos referenciando a secao a qual pertencem.

```text
module_sections                    modules
+------------------+              +------------------+
| id               |<-------------| section_id (FK)  |
| title            |              | id               |
| order_index      |              | title            |
| created_at       |              | order_index      |
+------------------+              +------------------+
```

---

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| Nova migracao SQL | Criar | Tabela `module_sections` + coluna `section_id` em `modules` |
| `src/pages/Aulas.tsx` | Modificar | Agrupar modulos por secao na exibicao |
| `src/components/aulas/ModuleGrid.tsx` | Modificar | Aceitar titulo de secao como prop |
| `src/pages/admin/AdminModules.tsx` | Modificar | Adicionar gestao de secoes |

---

## Detalhes de Implementacao

### 1. Migracao de Banco de Dados

```sql
-- Criar tabela de secoes
CREATE TABLE IF NOT EXISTS public.module_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar coluna section_id na tabela modules
ALTER TABLE public.modules 
ADD COLUMN section_id UUID REFERENCES public.module_sections(id) ON DELETE SET NULL;

-- RLS para secoes (leitura publica, escrita admin/mentor)
ALTER TABLE public.module_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sections" 
ON public.module_sections FOR SELECT USING (true);

CREATE POLICY "Admins and mentors can manage sections"
ON public.module_sections FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentor'::app_role)
);
```

### 2. Pagina Aulas.tsx - Agrupar por Secao

```tsx
// Buscar secoes
const { data: sectionsData } = useQuery({
  queryKey: ["module_sections"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("module_sections")
      .select("*")
      .order("order_index");
    if (error) throw error;
    return data;
  },
});

// Agrupar modulos por secao
const modulesWithoutSection = modules.filter(m => !m.section_id);
const sectionGroups = (sectionsData || []).map(section => ({
  section,
  modules: modules.filter(m => m.section_id === section.id)
}));

// Renderizar
return (
  <div className="space-y-8">
    {/* Modulos sem secao */}
    {modulesWithoutSection.length > 0 && (
      <ModuleGrid modules={modulesWithoutSection} />
    )}
    
    {/* Secoes com seus modulos */}
    {sectionGroups.map(({ section, modules }) => (
      <div key={section.id} className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {section.title}
        </h2>
        <ModuleGrid modules={modules} />
      </div>
    ))}
  </div>
);
```

### 3. AdminModules.tsx - Gestao de Secoes

Adicionar interface para:

**Criar/Editar Secoes:**
- Botao "Nova Secao" no topo
- Lista de secoes existentes com opcao de editar/excluir
- Campo de titulo para cada secao

**Vincular Modulos a Secoes:**
- Ao criar/editar modulo, select para escolher a secao
- Opcao "Sem secao" para modulos avulsos
- Drag-and-drop para reordenar (opcional, fase 2)

```tsx
// No modal de modulo, adicionar select de secao
<div className="space-y-2">
  <Label>Secao</Label>
  <Select value={sectionId} onValueChange={setSectionId}>
    <SelectTrigger>
      <SelectValue placeholder="Sem secao" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">Sem secao</SelectItem>
      {sections.map(section => (
        <SelectItem key={section.id} value={section.id}>
          {section.title}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

---

## Fluxo do Administrador

```text
1. Acessar /admin/modules
        |
        v
2. Criar Secao (ex: "Cursos - Fundamentos")
        |
        v
3. Criar Modulos e vincular a secao criada
        |
        v
4. Resultado: Na pagina /aulas, modulos aparecem
   agrupados sob o titulo da secao
```

---

## Interface Admin - Layout Proposto

```text
+------------------------------------------------------------------+
| [<-] Gerenciar Modulos                        [+ Nova Secao]     |
|      Crie e organize os modulos do curso      [+ Novo Modulo]    |
+------------------------------------------------------------------+
|                                                                   |
| SECOES                                                           |
| +------------------------------------------------------------+   |
| | Cursos - Fundamentos        [Editar] [Excluir]             |   |
| +------------------------------------------------------------+   |
| | Cursos - Aprimoramento      [Editar] [Excluir]             |   |
| +------------------------------------------------------------+   |
|                                                                   |
| MODULOS                                                          |
| +--------+  +--------+  +--------+                               |
| |Mod 1   |  |Mod 2   |  |Mod 3   |                               |
| |Secao:  |  |Secao:  |  |Secao:  |                               |
| |Fundam. |  |Fundam. |  |Aprimo. |                               |
| +--------+  +--------+  +--------+                               |
+------------------------------------------------------------------+
```

---

## Resultado Esperado

1. **Titulos grandes** - Secoes aparecem como titulos acima dos modulos
2. **Organizacao flexivel** - Modulos podem pertencer a qualquer secao
3. **Modulos avulsos** - Modulos sem secao aparecem no topo
4. **Gestao simples** - Admin cria secoes e vincula modulos via select
5. **Visual premium** - Layout identico a imagem de referencia

---

## Secao Tecnica

### Interface de Tipos

```typescript
interface ModuleSection {
  id: string;
  title: string;
  order_index: number;
  created_at: string;
}

interface ModuleWithSection extends Module {
  section_id: string | null;
}

interface SectionGroup {
  section: ModuleSection;
  modules: ModuleWithProgress[];
}
```

### Queries Atualizadas

```typescript
// Buscar modulos com section_id
const { data: modulesData } = useQuery({
  queryKey: ["modules"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("modules")
      .select("*, section_id")  // incluir section_id
      .order("order_index");
    if (error) throw error;
    return data;
  },
});
```

