
# Plano: Remover Seção de Pilares e Simplificar Interface

## Resumo

Remover completamente a gestão de Pilares como entidade separada. As Fases (stages) serão os elementos principais, cada uma com seu título, objetivo, cor e tarefas. O visual do aluno e do mentor será simplificado sem a exibição de badges de pilares.

---

## Estrutura Visual Final

```text
Etapas (para alunos e mentores)
+------------------------------------------+------------------------------------------+
| Fase 1: Preparação Técnica               | Fase 3: Estratégia de Vendas             |
| Objetivo: ter o ambiente pronto...       | Objetivo: preparar a base...             |
|                                          |                                          |
| ✅ Onboarding e alinhamento              | ☐ Definir estratégia de venda            |
| ✅ Contratação e configuração de VPS     | ☐ Estruturar presença no Instagram       |
| ✅ Instalação das ferramentas            | ☐ Roteiro para primeiras reuniões        |
| ✅ Configuração de credenciais           | ✅ Mapeamento, precificação...           |
| ✅ Visão geral do N8N e instalação       |                                          |
| ✅ Criação do primeiro agente de IA      |                                          |
+------------------------------------------+------------------------------------------+
| Fase 2: Construção de Projeto            | Fase 4: Entrega e Escala                 |
| Objetivo: criar um projeto funcional...  | Objetivo: aprender a entregar...         |
|                                          |                                          |
| ☐ Escolha de nicho do primeiro projeto   | ☐ Passo a passo: "Cliente fechou..."     |
| ☐ Definição do objetivo e escopo         | ☐ Modelo validado de organização         |
| ☐ Montagem do projeto real               | ☐ Ajustes para aumentar capacidade       |
+------------------------------------------+------------------------------------------+
```

---

## Mudanças Necessárias

### 1. MenteeEditor.tsx - Remover Gestão de Pilares

| Item | Ação |
|------|------|
| Seção "Pilares" (linhas 573-650) | Remover completamente |
| Dialog de Pilar (linhas 946-1014) | Remover |
| Estado `isPillarOpen`, `editingPillar`, `pillarForm` | Remover |
| Funções `handleSavePillar`, `handleDeletePillar` | Remover |
| Campo `pillar_id` no formulário de Fase | Remover |
| Badge de pilar nos cards de Fase | Remover |

### 2. StageCard.tsx - Remover Badge do Pilar

| Item | Ação |
|------|------|
| Import e uso do Badge para Pilar | Remover |
| Lógica `PillarIcon` | Remover |
| Seção "Pillar Badge" no header | Remover |
| Props type `pillar` | Simplificar |

### 3. MinhaMentoria.tsx

A página já está correta, apenas usa `stages`. Nenhuma mudança necessária.

### 4. useMenteeData.ts

Manter a query de pilares no hook por enquanto (pode ser removida em refatoração futura), mas não será mais utilizada na interface.

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/pages/admin/MenteeEditor.tsx` | Remover seção de Pilares, dialog, estados e funções relacionadas |
| `src/components/mentoria/StageCard.tsx` | Remover badge e referências ao Pilar |

---

## Implementação Detalhada

### Parte 1: MenteeEditor.tsx

**Remover estados (linhas 111-118):**
```tsx
// REMOVER:
const [isPillarOpen, setIsPillarOpen] = useState(false);
const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);
const [pillarForm, setPillarForm] = useState({...});
```

**Remover funções CRUD de Pilares (linhas 208-261):**
```tsx
// REMOVER handleSavePillar e handleDeletePillar
```

**Remover seção visual de Pilares (linhas 573-650):**
```tsx
// REMOVER Card com título "Pilares" e badges
```

**Simplificar formulário de Fase - remover campo pillar_id:**
```tsx
// ANTES:
const [stageForm, setStageForm] = useState({
  title: "",
  objective: "",
  icon_color: "#F59E0B",
  pillar_id: "", // REMOVER
});

// DEPOIS:
const [stageForm, setStageForm] = useState({
  title: "",
  objective: "",
  icon_color: "#F59E0B",
});
```

**Remover badge de pilar dos cards de Fase (linhas 695-699):**
```tsx
// REMOVER:
{linkedPillar && (
  <Badge variant="outline" className="text-xs">
    {linkedPillar.title}
  </Badge>
)}
```

**Remover Dialog de Pilar (linhas 946-1014):**
```tsx
// REMOVER Dialog completo
```

**Remover seletor de Pilar no Dialog de Fase (linhas 1041-1058):**
```tsx
// REMOVER campo "Pilar (opcional)" do formulário
```

### Parte 2: StageCard.tsx

**Remover referências ao Pilar:**
```tsx
// ANTES:
const PillarIcon = stage.pillar ? (iconMap[stage.pillar.icon || "folder"] || Folder) : null;

// DEPOIS: Remover esta linha

// REMOVER todo o bloco "Pillar Badge" (linhas 70-88):
{stage.pillar && PillarIcon && (
  <Badge ...>
    ...
  </Badge>
)}
```

---

## Seção Técnica

### Imports a Remover no MenteeEditor

```typescript
// Remover do import do useMenteeData:
import { ..., type Pillar } from "@/hooks/useMenteeData";
// Fica:
import { ..., type Stage, type Task, type Note, type Meeting } from "@/hooks/useMenteeData";
```

### invalidateAll - Remover referência a pillars

```typescript
// ANTES:
const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ["meetings", menteeId] });
  queryClient.invalidateQueries({ queryKey: ["stages", menteeId] });
  queryClient.invalidateQueries({ queryKey: ["pillars", menteeId] }); // REMOVER
  queryClient.invalidateQueries({ queryKey: ["menteeProfile", menteeId] });
};
```

### handleSaveStage - Remover pillar_id

```typescript
// ANTES:
const { error } = await supabase.from("mentorship_stages").insert({
  mentee_id: menteeId,
  title: stageForm.title,
  objective: stageForm.objective || null,
  icon_color: stageForm.icon_color,
  pillar_id: stageForm.pillar_id || null, // REMOVER
  order_index: maxOrder,
});

// DEPOIS:
const { error } = await supabase.from("mentorship_stages").insert({
  mentee_id: menteeId,
  title: stageForm.title,
  objective: stageForm.objective || null,
  icon_color: stageForm.icon_color,
  order_index: maxOrder,
});
```

---

## Resultado Esperado

1. Interface do mentor sem seção de "Pilares" - apenas "Fases" editáveis
2. Cards de fase sem badge de pilar, apenas título + objetivo + tarefas
3. Dialog de nova fase simplificado: título, objetivo e cor
4. Visualização do aluno igual ao do mentor: grid 2x2 com fases e tarefas
5. Código mais limpo e manutenível
