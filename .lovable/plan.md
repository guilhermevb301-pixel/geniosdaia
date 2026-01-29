
# Plano: Sistema Completo de Gamificacao, Desafios, Certificados e Notas

## Visao Geral

Implementacao de 4 grandes funcionalidades que vao transformar a plataforma em uma experiencia de aprendizado gamificada e interativa.

---

## 1. SISTEMA DE GAMIFICACAO (XP, Niveis e Streaks)

### 1.1 Novas Tabelas no Banco de Dados

| Tabela | Descricao |
|--------|-----------|
| `user_xp` | Armazena XP total, nivel atual e streak do usuario |
| `xp_transactions` | Historico de todas as transacoes de XP |
| `user_badges` | Badges conquistadas por cada usuario |
| `badges` | Catalogo de badges disponiveis |
| `user_streaks` | Registro diario de acessos para calcular streak |

```sql
-- Tabela principal de XP do usuario
CREATE TABLE user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transacoes de XP
CREATE TABLE xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  action_type text NOT NULL, -- 'lesson_completed', 'module_completed', 'prompt_copied', 'event_attended', 'challenge_completed', 'streak_bonus'
  reference_id uuid, -- ID da aula/modulo/evento relacionado
  created_at timestamptz DEFAULT now()
);

-- Catalogo de badges
CREATE TABLE badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  criteria_type text NOT NULL, -- 'lessons_completed', 'streak_days', 'prompts_copied', 'modules_completed', 'challenges_won'
  criteria_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Badges conquistadas
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Registro de streaks
CREATE TABLE user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, activity_date)
);
```

### 1.2 Logica de XP e Niveis

| Acao | XP |
|------|-----|
| Aula assistida | +10 XP |
| Modulo concluido | +25 XP |
| Prompt copiado | +5 XP |
| Evento ao vivo | +50 XP |
| Desafio semanal completo | +100 XP |
| Bonus de streak diario | +5 XP |

| Nivel | Nome | XP Minimo |
|-------|------|-----------|
| 1 | Iniciante | 0 |
| 2 | Aprendiz | 101 |
| 3 | Praticante | 301 |
| 4 | Automatizador | 601 |
| 5 | Especialista | 1001 |
| 6 | Mestre | 2001 |
| 7 | Genio da IA | 5001 |

### 1.3 Componentes de Interface

**TopBar.tsx (atualizar)**
- Badge de nivel ao lado do perfil
- Pequena barra de progresso XP
- Icone de fogo com contador de streak

**Dashboard (novo componente: EvolutionCard.tsx)**
- Card "Sua Evolucao" com:
  - XP total em numero grande
  - Nivel atual + nome
  - Barra de progresso para proximo nivel
  - Streak atual com icone de fogo
  - Grid de badges (coloridas vs cinza)

---

## 2. DESAFIOS SEMANAIS (Arena dos Genios)

### 2.1 Novas Tabelas

```sql
-- Desafios
CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  rules text,
  xp_reward integer DEFAULT 100,
  badge_reward_id uuid REFERENCES badges(id),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text DEFAULT 'active', -- 'upcoming', 'active', 'ended'
  created_at timestamptz DEFAULT now()
);

-- Submissoes
CREATE TABLE challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  file_url text,
  link_url text,
  votes_count integer DEFAULT 0,
  is_winner boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Votos
CREATE TABLE challenge_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES challenge_submissions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(submission_id, user_id)
);
```

### 2.2 Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/Desafios.tsx` | Pagina principal de desafios |
| `src/components/challenges/ActiveChallenge.tsx` | Card do desafio ativo |
| `src/components/challenges/SubmissionGrid.tsx` | Grid de submissoes |
| `src/components/challenges/SubmissionCard.tsx` | Card individual de submissao |
| `src/components/challenges/RankingTable.tsx` | Top 10 mais votados |
| `src/components/challenges/PastChallenges.tsx` | Desafios anteriores |
| `src/components/challenges/SubmitModal.tsx` | Modal de submissao |
| `src/components/dashboard/WeeklyChallengeCard.tsx` | Card no dashboard |

### 2.3 Sidebar

- Novo item: "Desafios" com icone Trophy
- Posicao: apos "Eventos"

---

## 3. SISTEMA DE CERTIFICADOS

### 3.1 Novas Tabelas

```sql
-- Certificados emitidos
CREATE TABLE certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  certificate_code text UNIQUE NOT NULL, -- Codigo unico para verificacao
  user_name text NOT NULL,
  module_title text NOT NULL,
  module_duration text,
  issued_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);
```

### 3.2 Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/Certificados.tsx` | Pagina "Meus Certificados" |
| `src/pages/VerifyCertificate.tsx` | Pagina publica de verificacao |
| `src/components/certificates/CertificateCard.tsx` | Card de certificado |
| `src/components/certificates/CertificateModal.tsx` | Modal com certificado grande |
| `src/components/certificates/CelebrationModal.tsx` | Modal de celebracao com confetti |
| `src/components/certificates/CertificateTemplate.tsx` | Template visual do certificado |

### 3.3 Logica de Emissao

- Ao marcar a ultima aula de um modulo como concluida:
  1. Verificar se todas as aulas do modulo estao concluidas
  2. Se sim, criar registro na tabela `certificates`
  3. Gerar codigo unico de verificacao
  4. Exibir modal de celebracao com confetti
  5. Adicionar XP bonus (+25)

### 3.4 Pagina Publica de Verificacao

- Rota: `/certificado/:code`
- Mostra: "Certificado Valido" ou "Nao Encontrado"
- Dados: nome do aluno, modulo, data

---

## 4. NOTAS E FAVORITOS PESSOAIS

### 4.1 Novas Tabelas

```sql
-- Notas pessoais
CREATE TABLE user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Favoritos
CREATE TABLE user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  note text, -- Nota pessoal opcional
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_favorite CHECK (
    (lesson_id IS NOT NULL AND prompt_id IS NULL) OR
    (lesson_id IS NULL AND prompt_id IS NOT NULL)
  )
);
```

### 4.2 Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/MeuCaderno.tsx` | Pagina "Meu Caderno" com abas |
| `src/components/notebook/NotesTab.tsx` | Aba de notas |
| `src/components/notebook/FavoritesTab.tsx` | Aba de favoritos |
| `src/components/notebook/NoteCard.tsx` | Card de nota individual |
| `src/components/notes/NotesSidebar.tsx` | Painel lateral de notas nas aulas |
| `src/components/notes/FavoriteButton.tsx` | Botao de favoritar reutilizavel |

### 4.3 Modificacoes Existentes

**ModuleLessons.tsx**
- Adicionar botao de favoritar no header da aula
- Adicionar botao "Minhas Notas" que abre painel lateral
- Painel com editor de texto simples (auto-save)

**Prompts.tsx / PromptCard.tsx**
- Adicionar botao de favoritar em cada prompt
- Ao favoritar, opcao de adicionar nota

---

## Arquivos a Criar (Total: 20+)

### Hooks
| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useUserXP.ts` | Hook para gerenciar XP do usuario |
| `src/hooks/useUserStreak.ts` | Hook para gerenciar streak |
| `src/hooks/useUserBadges.ts` | Hook para badges |
| `src/hooks/useChallenges.ts` | Hook para desafios |
| `src/hooks/useCertificates.ts` | Hook para certificados |
| `src/hooks/useUserNotes.ts` | Hook para notas |
| `src/hooks/useUserFavorites.ts` | Hook para favoritos |

### Paginas
| Arquivo | Descricao |
|---------|-----------|
| `src/pages/Desafios.tsx` | Arena dos Genios |
| `src/pages/Certificados.tsx` | Meus Certificados |
| `src/pages/MeuCaderno.tsx` | Notas e Favoritos |
| `src/pages/VerifyCertificate.tsx` | Verificacao publica |

### Componentes Dashboard
| Arquivo | Descricao |
|---------|-----------|
| `src/components/dashboard/EvolutionCard.tsx` | Card de evolucao XP |
| `src/components/dashboard/WeeklyChallengeCard.tsx` | Card desafio semanal |

### Componentes Gamificacao
| Arquivo | Descricao |
|---------|-----------|
| `src/components/gamification/LevelBadge.tsx` | Badge de nivel |
| `src/components/gamification/XPBar.tsx` | Barra de XP |
| `src/components/gamification/StreakCounter.tsx` | Contador de streak |
| `src/components/gamification/BadgeGrid.tsx` | Grid de badges |

### Componentes Desafios
| Arquivo | Descricao |
|---------|-----------|
| `src/components/challenges/ActiveChallenge.tsx` | Desafio ativo |
| `src/components/challenges/SubmissionGrid.tsx` | Grid de submissoes |
| `src/components/challenges/SubmissionCard.tsx` | Card de submissao |
| `src/components/challenges/SubmitModal.tsx` | Modal submissao |
| `src/components/challenges/RankingTable.tsx` | Ranking |

### Componentes Certificados
| Arquivo | Descricao |
|---------|-----------|
| `src/components/certificates/CertificateCard.tsx` | Card certificado |
| `src/components/certificates/CertificateModal.tsx` | Modal certificado |
| `src/components/certificates/CelebrationModal.tsx` | Celebracao |

### Componentes Notas
| Arquivo | Descricao |
|---------|-----------|
| `src/components/notes/NotesSidebar.tsx` | Painel lateral |
| `src/components/notes/FavoriteButton.tsx` | Botao favoritar |
| `src/components/notebook/NotesTab.tsx` | Aba notas |
| `src/components/notebook/FavoritesTab.tsx` | Aba favoritos |

---

## Arquivos a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/components/layout/TopBar.tsx` | Adicionar nivel, XP bar, streak |
| `src/components/layout/SidebarContent.tsx` | Novos itens: Desafios, Certificados, Meu Caderno |
| `src/pages/Dashboard.tsx` | Adicionar EvolutionCard e WeeklyChallengeCard |
| `src/pages/ModuleLessons.tsx` | Botao favoritar, painel notas, logica certificado |
| `src/pages/Prompts.tsx` | Botao favoritar nos prompts |
| `src/components/prompts/PromptCard.tsx` | Botao favoritar |
| `src/App.tsx` | Novas rotas |

---

## Fluxo de XP e Gamificacao

```text
Usuario acessa plataforma
        |
        v
[Registra acesso do dia] --> Atualiza streak
        |
        v
Usuario completa aula --> +10 XP
        |
        v
[Verifica se modulo completo]
        |
    [SIM] --> +25 XP + Gera Certificado + Modal Celebracao
        |
        v
[Verifica badges desbloqueadas]
        |
        v
[Atualiza nivel se necessario]
```

---

## RLS Policies (Seguranca)

Todas as tabelas terao RLS habilitado:
- Usuarios so podem ver/editar seus proprios dados
- Desafios e badges sao leitura publica
- Votos: um voto por usuario por submissao
- Certificados: verificacao publica por codigo

---

## Estimativa de Implementacao

| Etapa | Componentes |
|-------|-------------|
| 1. Migracoes DB | 8 tabelas + RLS + indexes |
| 2. Hooks | 7 hooks customizados |
| 3. Gamificacao | TopBar + EvolutionCard + Badges |
| 4. Desafios | Pagina + 5 componentes |
| 5. Certificados | Pagina + 3 componentes + verificacao |
| 6. Notas/Favoritos | Pagina + 4 componentes + modificacoes |
| 7. Integracao | Rotas + Sidebar + Dashboard |

---

## Resultado Final

1. **Header Premium** - Nivel, XP e streak visiveis
2. **Dashboard Gamificado** - Card de evolucao + desafio semanal
3. **Arena de Desafios** - Competicao semanal com votacao
4. **Certificados Verificaveis** - PDF + QR code + LinkedIn
5. **Caderno Pessoal** - Notas e favoritos organizados
6. **Sistema de Badges** - 9+ badges desbloqueaveis
7. **Streak System** - Incentivo a consistencia
