
# Plano: Editar Arena dos Genios para Mentores + Corrigir Duplicacao

## Problema Identificado na Imagem

A secao "Defina Seus Objetivos" esta aparecendo **duplicada multiplas vezes**. Isso provavelmente e um problema de renderizacao ou key duplicada no React.

---

## Resumo das Mudancas

1. **Corrigir duplicacao** do checklist de objetivos
2. **Substituir banner** "Desafio da Semana" por "Seus Desafios" (personalizado)
3. **Permitir edicao** de objetivos por mentores/admins
4. **Permitir edicao** do catalogo de desafios recomendados por mentores/admins
5. **Persistencia** em tabelas do banco de dados
6. **Controle de acesso**: so mentor/admin veem botoes de edicao

---

## Estrutura de Dados Proposta

### Nova Tabela: `objective_groups`

Para armazenar os grupos de objetivos (editaveis por mentor/admin):

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | PK |
| title | text | Titulo do grupo (ex: "A) Quero construir meu Agente") |
| order_index | int | Ordenacao |
| created_at | timestamp | Data de criacao |

### Nova Tabela: `objective_items`

Para armazenar os itens de cada grupo:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | PK |
| group_id | uuid | FK para objective_groups |
| label | text | Texto do objetivo |
| objective_key | text | ID unico (ex: "criar_agente") |
| requires_infra | bool | Se requer infra automaticamente |
| is_infra | bool | Se e o item de infra |
| order_index | int | Ordenacao |
| tags | text[] | Tags para filtrar desafios |
| created_at | timestamp | Data de criacao |

---

## Fluxo de Edicao para Mentor/Admin

```text
+------------------------------------------+
|  DEFINA SEUS OBJETIVOS    [Editar]       |  <- Botao visivel so para mentor/admin
+------------------------------------------+
|                                          |
|  A) Quero construir meu Agente (produto) |  [Editar Grupo] [Adicionar Item]
|  [x] Criar meu 1o Agente de IA do zero   |  [Editar] [Excluir]
|                                          |
|  ... outros grupos ...                   |
+------------------------------------------+
```

Modal de edicao permitira:
- Editar titulo do grupo
- Adicionar/remover/editar itens
- Definir regras de dependencia (requires_infra, is_infra)
- Definir tags para filtragem de desafios

---

## Substituicao do Banner

Antes:
```text
+------------------------------------------+
|  DESAFIO DA SEMANA (banner gradiente)    |
|  Titulo do desafio global                |
|  Tempo restante, participantes, etc      |
+------------------------------------------+
```

Depois:
```text
+------------------------------------------+
|  SEUS DESAFIOS (banner personalizado)    |
|  Baseado na sua trilha: Agentes          |
|  X desafios para voce | Nivel: Y         |
+------------------------------------------+
```

O banner mostrara:
- Titulo personalizado: "Seus Desafios"
- Trilha principal do usuario
- Quantidade de desafios recomendados
- Nivel atual do usuario
- Botao para ver todos os desafios

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/Desafios.tsx` | Remover duplicacao, substituir banner, adicionar botoes de edicao condicionais |
| `src/components/challenges/ObjectivesChecklist.tsx` | Adicionar modo de edicao, carregar dados do banco |
| `src/components/challenges/RecommendedChallenges.tsx` | Adicionar botao de edicao para mentor/admin |
| Nova migracao SQL | Criar tabelas objective_groups e objective_items |

---

## Componentes Novos

### 1. `ObjectivesEditorModal.tsx`

Modal para mentor/admin editar grupos e itens de objetivos:
- Lista de grupos com drag-and-drop para reordenar
- Formulario para adicionar/editar grupo
- Formulario para adicionar/editar item
- Campos: label, requires_infra, is_infra, tags

### 2. `YourChallengesBanner.tsx`

Banner personalizado substituindo o ActiveChallengeHero:
- Mostra trilha do usuario
- Quantidade de desafios recomendados
- Nivel atual
- Gradiente similar ao design atual

---

## Logica de Permissao

```tsx
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsMentor } from "@/hooks/useIsMentor";

function ObjectivesChecklist() {
  const { isAdmin } = useIsAdmin();
  const { isMentor } = useIsMentor();
  const canEdit = isAdmin || isMentor;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Defina Seus Objetivos</CardTitle>
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      {/* ... conteudo ... */}
    </Card>
  );
}
```

---

## Correcao da Duplicacao

O problema de duplicacao pode estar em:
1. Multiplas renderizacoes do componente no `Desafios.tsx`
2. Problema de key no map
3. StrictMode do React (renderiza 2x em dev)

Verificar e garantir que:
- `ObjectivesChecklist` aparece apenas UMA VEZ
- Keys unicas em todas as listas

---

## RLS Policies para Novas Tabelas

```sql
-- objective_groups
CREATE POLICY "Anyone can read objective_groups"
ON objective_groups FOR SELECT USING (true);

CREATE POLICY "Mentors and admins can manage objective_groups"
ON objective_groups FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

-- objective_items (mesmas policies)
```

---

## Persistencia dos Dados

1. **Objetivos do usuario**: ja salvo em `user_profiles.goals.selected_objectives` (array)
2. **Grupos de objetivos**: nova tabela `objective_groups`
3. **Itens de objetivos**: nova tabela `objective_items`
4. **Desafios recomendados**: ja existe em `daily_challenges`

---

## Fluxo Completo

1. Usuario acessa `/desafios`
2. Ve banner "Seus Desafios" com info personalizada
3. Abaixo, ve checklist de objetivos (carregado do banco)
4. Marca objetivos (salvo no perfil)
5. Ve desafios recomendados filtrados
6. Se mentor/admin: ve botoes de edicao
7. Mentor clica em "Editar Objetivos" -> abre modal
8. Mentor edita grupos/itens -> salva no banco
9. Mudancas refletem para todos os usuarios

---

## Criterios de Aceite

- [ ] "Defina Seus Objetivos" aparece apenas uma vez (corrigir duplicacao)
- [ ] Banner do topo e "Seus Desafios" (personalizado)
- [ ] Mentor/admin ve botoes de edicao
- [ ] Membro comum so ve e marca objetivos
- [ ] Mentor consegue editar objetivos (itens, grupos, textos)
- [ ] Mentor consegue editar catalogo de desafios recomendados
- [ ] Tudo persistente ao recarregar
- [ ] Visual dark consistente, sem placeholders
