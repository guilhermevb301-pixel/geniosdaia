

# Plano: Integrar Desafio Ativo no Banner Roxo com Countdown

## Objetivo

Mover o desafio ativo para dentro do banner roxo "Seus Desafios" no topo da pagina, substituindo o contador "0 desafios para voce" pela contagem regressiva em tempo real.

---

## Estado Atual vs. Estado Desejado

### Atual

```text
+----------------------------------------------------------------+
| [Banner Roxo] PERSONALIZADO PARA VOCE                          |
|                                                    +-------+   |
| Seus Desafios                                      |   0   |   |
| Baseado nos seus X objetivos...                    |desaf. |   |
|                                                    +-------+   |
+----------------------------------------------------------------+

[Card separado abaixo]
+----------------------------------------------------------------+
| DESAFIO ATIVO                              Iniciante | agentes |
| Crie seu primeiro agente...                                    |
| Tempo restante: 29min 45s                                      |
| [Progress bar]                                                 |
| [Checklist]                                                    |
| [Botao Completar]                                              |
+----------------------------------------------------------------+
```

### Desejado

```text
+----------------------------------------------------------------+
| [Banner Roxo] DESAFIO ATIVO                Iniciante | agentes |
|                                                    +-------+   |
| Crie seu primeiro agente de atendimento            |  29m  |   |
| Objetivo: Construir um agente simples...           |  45s  |   |
|                                                    +-------+   |
| [Progress bar 99% restante]                                    |
+----------------------------------------------------------------+
+----------------------------------------------------------------+
| Checklist (0/3)                                                |
| [ ] Agente responde corretamente                               |
| [ ] Respostas sao naturais                                     |
| [ ] Cobre casos de erro                                        |
|                                                                |
| [Completei Este Desafio]                                       |
+----------------------------------------------------------------+
```

---

## Solucao Proposta

### 1. Criar Componente Unificado: ActiveChallengeBanner

Novo componente que combina o visual do `YourChallengesBanner` (fundo roxo gradiente) com o conteudo do `ActiveChallengeCard` (countdown, objetivo, checklist).

Estrutura do componente:

```tsx
function ActiveChallengeBanner({
  challenge,        // DailyChallenge
  progress,         // UserChallengeProgress (com deadline)
  userTrack,
  userLevel,
  onComplete,
  isCompleting,
  lockedCount,      // Numero de desafios bloqueados
  completedCount,   // Numero de desafios completados
}) {
  // Countdown em tempo real
  // Checklist interativo
  // Botao de completar
}
```

### 2. Modificar YourChallengesBanner

Adicionar props opcionais para receber dados do desafio ativo:

```tsx
interface YourChallengesBannerProps {
  // ... props existentes
  activeChallenge?: DailyChallenge;
  activeProgress?: UserChallengeProgress;
  onCompleteChallenge?: () => void;
  isCompleting?: boolean;
}
```

Quando `activeChallenge` estiver presente:
- Trocar badge de "PERSONALIZADO PARA VOCE" para "DESAFIO ATIVO"
- Trocar titulo "Seus Desafios" para o titulo do desafio
- Trocar contador de desafios pela contagem regressiva
- Adicionar barra de progresso do tempo
- Mover checklist e botao para dentro do banner

### 3. Modificar ChallengeProgressSection

Passar o desafio ativo como prop para o banner em vez de renderizar o `ActiveChallengeCard` separadamente.

### 4. Atualizar Desafios.tsx

Passar o estado do desafio ativo para o `YourChallengesBanner`.

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/components/challenges/YourChallengesBanner.tsx` | Adicionar logica para exibir desafio ativo com countdown |
| `src/components/challenges/ChallengeProgressSection.tsx` | Exportar dados do desafio ativo para o banner |
| `src/pages/Desafios.tsx` | Integrar o estado do progresso no banner |

---

## Detalhes do Design

### Estrutura Visual do Banner Ativo

```text
+------------------------------------------------------------------+
| [Badge: DESAFIO ATIVO]                [Iniciante] [agentes]      |
|                                                                  |
| Titulo do Desafio (grande, bold)          +------------------+   |
|                                           |      29min       |   |
| Trilha: Agentes de IA                     |       45s        |   |
| Nivel 1: Iniciante                        |   tempo restante |   |
|                                           +------------------+   |
|                                                                  |
| Progresso do tempo                                  99% restante |
| [=========================================================-]     |
+------------------------------------------------------------------+
| Objetivo                                                         |
| Construir um agente simples que responde perguntas frequentes    |
+------------------------------------------------------------------+
| Checklist (0/3)                                                  |
| [ ] Agente responde corretamente                                 |
| [ ] Respostas sao naturais                                       |
| [ ] Cobre casos de erro                                          |
|                                                                  |
| [           Completei Este Desafio           ]                   |
| Complete todos os itens do checklist para finalizar              |
+------------------------------------------------------------------+
```

### Cores e Estilos

- Fundo: `bg-gradient-to-br from-primary via-purple-600 to-indigo-800` (mantido do banner atual)
- Badge "DESAFIO ATIVO": `bg-primary text-primary-foreground` (verde/roxo vibrante)
- Countdown: Texto grande amarelo/accent como na imagem
- Progress bar: Verde gradiente (como na primeira imagem)
- Checklist: Background semi-transparente `bg-background/10`
- Botao: Roxo solido ocupando largura total

### Codigo do Contador

O contador deve mostrar no estilo compacto quando ha dias restantes, e detalhado quando esta proximo:

```tsx
function formatTimeCompact(timeLeft) {
  if (timeLeft.days > 0) {
    return `${timeLeft.days}d ${timeLeft.hours}h`;
  }
  if (timeLeft.hours > 0) {
    return `${timeLeft.hours}h ${timeLeft.minutes}min`;
  }
  return `${timeLeft.minutes}min ${timeLeft.seconds}s`;
}
```

---

## Logica de Condicional

O banner deve exibir conteudo diferente baseado no estado:

1. **Sem objetivos selecionados**: Mostrar mensagem para definir objetivos
2. **Objetivos selecionados, sem desafio ativo**: Mostrar contador de desafios recomendados
3. **Desafio ativo presente**: Mostrar desafio com countdown e checklist

```tsx
{activeChallenge ? (
  <ActiveChallengeBannerContent ... />
) : (
  <DefaultBannerContent ... />
)}
```

---

## Fluxo do Usuario

1. Usuario acessa `/desafios`
2. Marca um objetivo no checklist
3. Sistema busca desafios vinculados
4. **Banner roxo muda instantaneamente** para mostrar o desafio ativo
5. Countdown comeca a rodar em tempo real
6. Usuario marca itens do checklist
7. Clica em "Completei Este Desafio"
8. Banner atualiza para mostrar o proximo desafio (ou mensagem de sucesso)

---

## Criterios de Aceite

- Desafio ativo aparece integrado no banner roxo
- Countdown em tempo real no lugar do contador de desafios
- Barra de progresso verde mostrando tempo restante
- Checklist interativo dentro do banner
- Botao "Completei" funcional
- Transicao suave ao completar um desafio
- Manter visual quando nao ha desafio ativo (fallback para contador)

