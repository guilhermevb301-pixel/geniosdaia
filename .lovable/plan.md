

# Plano: Melhorar UX para Vincular Desafios aos Objetivos

## Problema Identificado

O sistema atual ja tem a funcionalidade de vincular desafios aos objetivos, porem:

1. A secao de "Desafios Vinculados" so aparece ao **editar** um item existente (nao ao criar)
2. A tabela `objective_challenge_links` esta vazia - nenhum link foi salvo ainda
3. A interface nao deixa claro que voce precisa clicar no icone de lapis para acessar os vinculos

## Solucao Proposta

Melhorar a experiencia de vinculacao com:

### 1. Adicionar Indicador Visual na Lista de Itens

Mostrar um contador de desafios vinculados diretamente na lista de objetivos:

```text
+------------------------------------------+
|  A) Quero vender e viralizar             |
+------------------------------------------+
|  [icone] Viralizar nas redes...          |
|          crescimento, redes, marketing   |
|          [3 desafios vinculados]  <- NOVO|
|                              [lapis][lixo]|
+------------------------------------------+
```

### 2. Adicionar Botao Dedicado para Vincular Desafios

Alem do botao de editar, adicionar um botao especifico "Vincular Desafios":

```text
[Link2] [Pencil] [Trash]
```

### 3. Melhorar o Modal de Edicao

Reorganizar o modal para dar mais destaque aos desafios vinculados:
- Mover a secao "Desafios Vinculados" para um local mais visivel
- Adicionar badge mostrando quantos desafios estao vinculados no titulo

### 4. Permitir Vincular ao Criar Novo Item

Atualmente so permite vincular ao editar. Solucao:
- Criar o item primeiro
- Depois abrir automaticamente para edicao com a secao de vinculos

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/components/admin/ObjectivesEditor.tsx` | Adicionar indicador de vinculos na lista, botao dedicado, melhorar modal |
| `src/hooks/useObjectiveChallengeLinks.ts` | Adicionar query para buscar contagem de links por item |

---

## Alteracoes Detalhadas

### ObjectivesEditor.tsx - Lista de Itens

Adicionar badge com contagem de desafios vinculados:

```tsx
// Na lista de itens (linha ~287-343)
<div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium">{item.label}</span>
      {item.is_infra && (
        <Badge variant="secondary" className="text-xs">INFRA</Badge>
      )}
    </div>
    <div className="flex items-center gap-2 mt-1">
      <code className="text-xs text-muted-foreground">{item.objective_key}</code>
      {/* NOVO: Indicador de desafios vinculados */}
      <Badge 
        variant="outline" 
        className="text-xs text-primary border-primary/30"
      >
        <Link2 className="h-3 w-3 mr-1" />
        {linkedCount[item.id] || 0} desafios
      </Badge>
    </div>
  </div>
  <div className="flex items-center gap-1 shrink-0">
    {/* NOVO: Botao especifico para vinculos */}
    <Button
      variant="ghost"
      size="sm"
      title="Vincular desafios"
      onClick={() => openLinkingModal(item)}
    >
      <Link2 className="h-4 w-4 text-primary" />
    </Button>
    <Button variant="ghost" size="sm" onClick={() => handleOpenItemDialog(group.id, item)}>
      <Pencil className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ type: "item", id: item.id })}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
</div>
```

### ObjectivesEditor.tsx - Modal de Vinculos

Criar um modal dedicado so para vincular desafios (mais focado):

```tsx
// Novo modal so para vinculos
<Dialog open={isLinkingModalOpen} onOpenChange={setIsLinkingModalOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-primary" />
        Vincular Desafios ao Objetivo
      </DialogTitle>
      <DialogDescription>
        "{linkingItem?.label}"
      </DialogDescription>
    </DialogHeader>
    
    <div className="py-4">
      <Input
        placeholder="Buscar desafios por titulo ou trilha..."
        value={challengeSearchQuery}
        onChange={(e) => setChallengeSearchQuery(e.target.value)}
        className="mb-4"
      />
      
      <div className="text-sm text-muted-foreground mb-2">
        {selectedChallengeIds.length} desafio(s) selecionado(s)
      </div>
      
      <ScrollArea className="h-[400px] border rounded-lg">
        {filteredChallenges.map(challenge => (
          <div
            key={challenge.id}
            className="flex items-center gap-3 p-3 border-b hover:bg-muted/50 cursor-pointer"
            onClick={() => toggleChallengeLink(challenge.id)}
          >
            <Checkbox checked={selectedChallengeIds.includes(challenge.id)} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{challenge.title}</div>
              <div className="text-xs text-muted-foreground">{challenge.objective}</div>
            </div>
            <div className="shrink-0 flex gap-2">
              <Badge variant="secondary">{challenge.track}</Badge>
              <Badge variant="outline">{challenge.difficulty}</Badge>
              <span className="text-xs text-muted-foreground">
                {challenge.estimated_minutes}min
              </span>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsLinkingModalOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSaveLinks} disabled={isSaving}>
        Salvar Vinculos
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### useObjectiveChallengeLinks.ts - Adicionar Contagem

```tsx
// Adicionar query para contagem de links por item
const { data: linkCounts = {} } = useQuery({
  queryKey: ["objectiveLinkCounts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("objective_challenge_links")
      .select("objective_item_id");
    
    if (error) throw error;
    
    // Contar por item
    const counts: Record<string, number> = {};
    data.forEach(link => {
      counts[link.objective_item_id] = (counts[link.objective_item_id] || 0) + 1;
    });
    return counts;
  },
});
```

---

## Fluxo de Usuario Melhorado

1. Mentor acessa `/admin/challenges` > aba "Objetivos"
2. Ve lista de grupos e itens com indicador de quantos desafios cada um tem
3. Clica no icone de link (novo botao) em qualquer item
4. Abre modal dedicado mostrando todos os desafios disponiveis
5. Marca os desafios que devem aparecer para este objetivo
6. Clica "Salvar Vinculos"
7. Os vinculos sao salvos na tabela `objective_challenge_links`
8. Alunos que marcarem este objetivo verao os desafios vinculados

---

## Criterios de Aceite

- [ ] Lista de objetivos mostra contagem de desafios vinculados
- [ ] Botao dedicado de vincular (icone Link2) em cada item
- [ ] Modal focado so em vincular desafios
- [ ] Busca por titulo/trilha funciona no modal
- [ ] Salvar persiste os vinculos no banco
- [ ] Vinculos aparecem corretamente para alunos em /desafios
- [ ] Toast de sucesso ao salvar

