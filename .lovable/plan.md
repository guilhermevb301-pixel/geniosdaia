

# Plano: Corrigir Bugs do Modificador de Prompts

## Problemas Identificados

1. **Dados duplicados no banco**: "Cameras e Lentes" aparece duas vezes (o registro com ID `...0003` deveria ser "Angulos e Enquadramentos")
2. **Modal de edicao com estado obsoleto**: O formulario do editor inicializa os valores apenas na primeira renderizacao. Quando voce clica para editar um prompt diferente, os campos continuam com os dados antigos, causando duplicacoes ao salvar
3. **Mentor nao consegue editar**: O hook `useIsMentor` usa a funcao `has_role` do banco, que deve funcionar corretamente. Preciso verificar se o usuario logado realmente tem a role `mentor` no banco

## Correcoes Planejadas

### 1. Corrigir dados duplicados no banco
- Atualizar o registro `a1000001-0000-0000-0000-000000000003` de "Cameras e Lentes" para "Angulos e Enquadramentos"

### 2. Corrigir o estado do modal de edicao (PromptEditorModal)
- Adicionar um `useEffect` que reseta o formulario quando `editingPrompt` ou `open` mudam
- Isso resolve tanto o problema de edicao incorreta quanto a duplicacao ao salvar

### 3. Verificar role do mentor
- Consultar o banco para confirmar que o usuario logado tem a role `mentor`
- Se nao tiver, orientar sobre como atribuir a role

## Detalhes Tecnicos

**Arquivo: `src/components/prompts/PromptEditorModal.tsx`**
- Adicionar `useEffect` sincronizando `editingPrompt`/`open` com o estado interno do formulario
- Remover a dependencia do `useState` initializer para dados do `editingPrompt`

**Banco de dados:**
- UPDATE para corrigir titulo do registro duplicado
- Verificar roles do usuario atual

