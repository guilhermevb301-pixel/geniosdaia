
# Plano: Dashboard Premium Estilo Pressel + Melhorias "Absurdas"

## Visao Geral

Vou transformar o Dashboard inspirando-me no Pressel App (imagem de referencia) e adicionar elementos premium que vao deixar a plataforma muito mais atraente e profissional.

---

## Estrutura do Novo Dashboard

```text
+----------------------------------------------------------+
|                                                          |
|  "Quem automatiza, domina o tempo."                     |
|  Frase motivacional GRANDE no topo                       |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  [CAROUSEL DE BANNERS]                                   |
|  <- Banner 1: Convite comunidade | Banner 2: Evento ->   |
|                                                          |
+----------------------------------------------------------+
|  Dashboard Global           [ 7 dias ] [ 30 dias ] [ Tudo ]|
|  Estatisticas da plataforma                              |
+------------------------+------------------------+---------+
| AULAS ASSISTIDAS       | TEMPLATES BAIXADOS     | PROMPTS |
| 47                     | 156                    | 23      |
| Total acumulado        | Mais popular: X        | Usados  |
+------------------------+------------------------+---------+
|                                                          |
|  Continuar de onde parou (com thumbnails + progresso)    |
|                                                          |
+----------------------------------------------------------+
|  Top Templates          |  Top Prompts          |        |
|  1. Template X - 392    |  1. Logo 3D - 50      |        |
|  2. Template Y - 179    |  2. Prompt Z - 28     |        |
+----------------------------------------------------------+
```

---

## 1. Banner Hero com Frase Motivacional

Elemento GRANDE no topo do dashboard com:
- Frase motivacional impactante
- Gradiente animado sutil no fundo
- Saudacao personalizada com nome do usuario

**Frases que podem rotacionar:**
- "Quem automatiza, domina o tempo."
- "A automacao e o superpoder do seculo XXI."
- "Menos cliques, mais resultados."
- "Automatize o chato, foque no que importa."

---

## 2. Carousel de Banners (Estilo Pressel)

Carrossel horizontal com navegacao por setas:
- Banner 1: Convite para comunidade
- Banner 2: Proximo evento ao vivo
- Banner 3: Novo template disponivel
- CTA buttons em cada banner

Usando o componente Carousel ja existente no projeto.

---

## 3. Cards de Estatisticas Globais

4 cards em linha com:
- Icone colorido
- Numero grande
- Label descritiva
- Tooltip de info (opcional)

| Card | Dados |
|------|-------|
| Aulas Assistidas | Total de aulas que o usuario completou |
| Templates Baixados | Contagem real do banco |
| Prompts Usados | Quantidade de prompts visualizados |
| Proximo Evento | Data/hora do proximo evento (ou "Em breve") |

---

## 4. Secao "Continuar de Onde Parou"

Cards horizontais mostrando:
- Thumbnail do modulo (cover_image_url)
- Titulo da aula atual
- Barra de progresso do modulo
- Botao "Continuar"

---

## 5. Secoes de Ranking (Estilo Pressel)

Duas colunas lado a lado:

**Top Templates:**
- Lista com icone de medalha (ouro, prata, bronze)
- Nome do template + contagem de downloads

**Top Prompts:**
- Lista com icone de medalha
- Nome do prompt + contagem de views

---

## Melhorias "Absurdas" Adicionais

Para deixar a plataforma ainda mais diferenciada:

| Melhoria | Descricao |
|----------|-----------|
| Confetti ao completar aula | Animacao de celebracao ao marcar aula como concluida |
| Streak de dias | Contador de dias seguidos acessando a plataforma |
| Badges/Conquistas | Sistema de conquistas por marcos atingidos |
| Sound effects sutis | Sons de clique e sucesso (opcional, desligavel) |
| Modo Foco | Timer Pomodoro integrado para estudar |
| Atalhos de teclado | Navegacao rapida com teclado |
| Tema customizavel | Cores de destaque personalizaveis |

---

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/components/dashboard/HeroBanner.tsx` | Criar | Banner hero com frase motivacional |
| `src/components/dashboard/AnnouncementCarousel.tsx` | Criar | Carrossel de banners promocionais |
| `src/components/dashboard/StatsCards.tsx` | Criar | Cards de estatisticas globais |
| `src/components/dashboard/ContinueLearning.tsx` | Criar | Secao de aulas em progresso |
| `src/components/dashboard/RankingLists.tsx` | Criar | Listas de top templates/prompts |
| `src/pages/Dashboard.tsx` | Modificar | Integrar todos os novos componentes |

---

## Design Visual

### Paleta de Cores (ja existente)
- Primary: Roxo (#8B5CF6)
- Accent: Dourado (#FFD93D)
- Background: Dark (#111318)
- Cards: (#1A1D24)

### Frase Motivacional
```text
font-size: 2.5rem (40px)
font-weight: 700
line-height: 1.2
text-gradient ou cor accent
```

### Cards de Stats
```text
border-radius: 12px
padding: 20px
icone com fundo colorido (primary/10, accent/10, etc)
hover: scale(1.02) + sombra
```

---

## Secao Tecnica

### Buscar Estatisticas Reais

```typescript
// Total de aulas completadas pelo usuario
const { data: completedCount } = useQuery({
  queryKey: ["completedLessons", user?.id],
  queryFn: async () => {
    const { count } = await supabase
      .from("lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id)
      .eq("completed", true);
    return count || 0;
  },
});

// Total de downloads de templates
const { data: totalDownloads } = useQuery({
  queryKey: ["totalDownloads"],
  queryFn: async () => {
    const { data } = await supabase
      .from("templates")
      .select("downloads_count");
    return data?.reduce((acc, t) => acc + t.downloads_count, 0) || 0;
  },
});
```

### Carousel de Banners

```typescript
<Carousel className="w-full" opts={{ loop: true }}>
  <CarouselContent>
    <CarouselItem>
      <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-r from-primary to-blue-600">
        <div className="absolute inset-0 p-6 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-white">Junte-se a Comunidade</h3>
          <p className="text-white/80 mt-2">Conecte-se com outros automatizadores</p>
          <Button className="mt-4 w-fit">Acessar Comunidade</Button>
        </div>
      </div>
    </CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

### Frase Motivacional Rotacionando

```typescript
const phrases = [
  "Quem automatiza, domina o tempo.",
  "A automacao e o superpoder do seculo XXI.",
  "Menos cliques, mais resultados.",
];

const [phraseIndex, setPhraseIndex] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setPhraseIndex((prev) => (prev + 1) % phrases.length);
  }, 10000); // Muda a cada 10 segundos
  return () => clearInterval(interval);
}, []);
```

---

## Resultado Esperado

1. **Hero impactante** - Frase motivacional grande que inspira o usuario
2. **Banners promocionais** - Carrossel estilo Pressel com CTAs
3. **Estatisticas visuais** - Cards com dados reais da plataforma
4. **Continuidade de aprendizado** - Thumbnails dos modulos em progresso
5. **Gamificacao visual** - Rankings com medalhas de ouro/prata/bronze
6. **UX Premium** - Animacoes sutis, hover effects, transicoes suaves
