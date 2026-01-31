
# Plano: Popup de Objetivos na Entrada da Arena dos Genios

## Resumo do Pedido

Voce quer:
1. Remover as letras dos grupos (A), B), C)...) e mostrar apenas os objetivos
2. Criar um popup/modal que aparece ao entrar na pagina /desafios
3. O usuario escolhe seus objetivos no popup e depois ve os desafios

---

## Solucao Proposta

### Como Vai Funcionar

```text
Usuario entra em /desafios
         |
         v
  Ja tem objetivos salvos?
      /          \
   SIM            NAO
    |              |
    v              v
 Vai direto    Abre popup
 para os       "Defina seus
 desafios      objetivos"
                  |
                  v
           Usuario escolhe
           e clica Confirmar
                  |
                  v
            Fecha popup,
            mostra desafios
```

### Visual do Popup

```text
+----------------------------------------------------------+
|  [X]                                                      |
|                                                           |
|     [icone alvo]                                          |
|                                                           |
|     QUAL E O SEU OBJETIVO?                                |
|                                                           |
|     Escolha um ou mais objetivos para personalizarmos     |
|     seus desafios e sua jornada de aprendizado.           |
|                                                           |
|  +-----------------------------------------------------+  |
|  | [ ] Vender primeiro projeto de Agente de IA        |  |
|  +-----------------------------------------------------+  |
|  | [X] Viralizar nas redes (posicionamento + ideias)  |  |
|  +-----------------------------------------------------+  |
|  | [X] Criar conteudo que vende (nao so viral)        |  |
|  +-----------------------------------------------------+  |
|  | [ ] Criar Agentes + Fechar clientes + Viralizar    |  |
|  +-----------------------------------------------------+  |
|  | [ ] Criar videos incriveis (producao)              |  |
|  +-----------------------------------------------------+  |
|  | [ ] Criar videos + Viralizar (combo)               |  |
|  +-----------------------------------------------------+  |
|  | [ ] Criar fotos profissionais (producao)           |  |
|  +-----------------------------------------------------+  |
|  | [ ] Fotos profissionais + portfolio pra vender     |  |
|  +-----------------------------------------------------+  |
|                                                           |
|  Dica: Voce pode mudar seus objetivos depois              |
|                                                           |
|  [          Confirmar Objetivos (2)          ]            |
|                                                           |
+----------------------------------------------------------+
```

### Na Pagina Apos Confirmar

O card "Defina Seus Objetivos" atual sera substituido por um card menor e mais limpo:

```text
+----------------------------------------------------------+
| Seus Objetivos (2 selecionados)              [Editar]    |
|                                                          |
| [chip] Viralizar nas redes                               |
| [chip] Criar conteudo que vende                          |
+----------------------------------------------------------+
```

---

## Arquivos a Criar/Modificar

### Novo Arquivo

| Arquivo | Descricao |
|---------|-----------|
| `src/components/challenges/ObjectivesModal.tsx` | Modal que aparece na primeira visita |

### Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/components/challenges/ObjectivesChecklist.tsx` | Remover agrupamento A), B), C) e simplificar visual |
| `src/pages/Desafios.tsx` | Adicionar logica para abrir modal automaticamente |

---

## Detalhes Tecnicos

### Logica do Modal

O modal aparece automaticamente se:
- `profile?.goals?.selected_objectives` esta vazio ou undefined
- Usuario ainda nao tem objetivos salvos

```tsx
// Em Desafios.tsx
const [showObjectivesModal, setShowObjectivesModal] = useState(false);

// Verificar se precisa mostrar o modal
useEffect(() => {
  if (!isLoading && profile) {
    const hasObjectives = profile.goals?.selected_objectives?.length > 0;
    if (!hasObjectives) {
      setShowObjectivesModal(true);
    }
  }
}, [profile, isLoading]);
```

### Estrutura do Modal

```tsx
function ObjectivesModal({
  open,
  onOpenChange,
  selectedObjectives,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedObjectives: string[];
  onConfirm: (objectives: string[]) => void;
}) {
  const [localSelection, setLocalSelection] = useState(selectedObjectives);
  const { objectiveGroups, infraRequiredBy } = useObjectives();
  
  // Achata todos os itens (sem mostrar grupos)
  const allItems = objectiveGroups.flatMap(g => g.items);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <div className="flex flex-col items-center text-center gap-3">
            <Target className="h-12 w-12 text-primary" />
            <DialogTitle className="text-2xl">
              Qual e o seu objetivo?
            </DialogTitle>
            <p className="text-muted-foreground">
              Escolha um ou mais objetivos para personalizarmos 
              seus desafios e sua jornada de aprendizado.
            </p>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-2">
            {allItems.map((item) => (
              <ObjectiveItem 
                key={item.id}
                item={item}
                isSelected={localSelection.includes(item.objective_key)}
                onToggle={() => toggleItem(item)}
              />
            ))}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <p className="text-xs text-muted-foreground mr-auto">
            Voce pode mudar seus objetivos depois
          </p>
          <Button onClick={() => onConfirm(localSelection)}>
            Confirmar Objetivos ({localSelection.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Card Resumido de Objetivos (Substitui o Checklist)

```tsx
function ObjectivesSummary({
  selectedObjectives,
  allItems,
  onEdit,
}: {
  selectedObjectives: string[];
  allItems: ObjectiveItem[];
  onEdit: () => void;
}) {
  const selectedItems = allItems.filter(item => 
    selectedObjectives.includes(item.objective_key)
  );

  if (selectedItems.length === 0) {
    return (
      <Card className="p-4 border-dashed border-primary/50 cursor-pointer"
            onClick={onEdit}>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Target className="h-5 w-5" />
          <span>Clique para definir seus objetivos</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="font-medium">
            Seus Objetivos ({selectedItems.length})
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Editar
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item) => (
          <Badge key={item.id} variant="secondary">
            {item.label}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
```

---

## Fluxo Completo

1. **Primeira visita**: Usuario entra em /desafios, modal abre automaticamente
2. **Selecao**: Usuario marca os objetivos desejados (lista simples, sem grupos A/B/C)
3. **Confirmar**: Clica no botao "Confirmar Objetivos (X)"
4. **Salvar**: Sistema salva em `profile.goals.selected_objectives` e fecha modal
5. **Visualizacao**: Card resumido mostra os objetivos selecionados com badges
6. **Editar**: Usuario pode clicar em "Editar" para reabrir o modal

---

## Visitas Seguintes

- Se usuario ja tem objetivos salvos, o modal nao abre
- A pagina mostra diretamente o banner de desafio ativo + card resumido de objetivos
- Usuario pode clicar em "Editar" para mudar objetivos

---

## Beneficios da Mudanca

1. **Mais intuitivo**: Popup guia o usuario na primeira visita
2. **Menos poluicao visual**: Remove categorias A), B), C) desnecessarias
3. **Lista limpa**: Objetivos aparecem em lista simples e clara
4. **Menos espaco na pagina**: Card resumido ocupa menos espaco que o checklist completo
5. **Facilidade**: Usuario pode mudar objetivos a qualquer momento

---

## Criterios de Aceite

- Modal abre automaticamente se usuario nao tem objetivos
- Objetivos aparecem em lista simples (sem A, B, C)
- Botao "Confirmar" fecha modal e salva objetivos
- Card resumido mostra badges dos objetivos selecionados
- Botao "Editar" reabre o modal
- Logica de infra obrigatoria continua funcionando

