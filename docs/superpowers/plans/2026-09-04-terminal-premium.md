# Terminal Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar login, navegação, dashboard, biblioteca e mentoria da RealFrame IA em uma experiência premium, compacta e coerente, mantendo `#34d399` como cor principal.

**Architecture:** Centralizar a linguagem visual em tokens CSS e pequenos componentes reutilizáveis. Reorganizar o dashboard em um grid responsivo orientado à próxima ação, substituir o carrossel de banners dominante por promos compactas, adicionar um catálogo local de capas 4:3 e transformar a mentoria em um fluxo de três etapas sem alterar contratos do Supabase.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/Radix, Embla Carousel, TanStack Query, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-04-terminal-premium-design.md`

## Global Constraints

- Verde RealFrame `#34d399` é a única cor de ação primária.
- Azul Codex `#557cff` e coral Claude `#e97951` são cores atmosféricas e de ilustração.
- Fundo principal `#0b0d10`, superfície `#12151a`, superfície elevada `#181c22`.
- Raio visual entre 8px e 12px; nada de cards excessivamente arredondados.
- Não alterar tabelas, dados ou secrets do Supabase.
- Animações usam apenas `transform` e `opacity` e respeitam `prefers-reduced-motion`.
- Desktop mostra continuidade, live e mentoria no primeiro viewport; mobile usa coluna única.
- Capas de aula permanecem 4:3 e não repetem a mesma cena em módulos diferentes.

---

## File Structure

- `public/fonts/geist-sans-variable.woff2`: fonte variável da interface.
- `public/fonts/geist-mono-variable.woff2`: fonte de microdados.
- `src/index.css`: tokens, tipografia, superfícies e utilitários globais.
- `tailwind.config.ts`: famílias tipográficas e cores auxiliares Codex/Claude.
- `src/components/layout/*`: shell, sidebar, topbar e perfil compacto.
- `src/components/dashboard/DashboardGrid.tsx`: composição responsiva do primeiro viewport.
- `src/components/dashboard/MentorshipCard.tsx`: CTA compacto para `/mentoria`.
- `src/components/dashboard/*`: continuidade, live, jornada, banners e conquistas.
- `src/assets/module-covers/*.webp`: capas locais únicas em 4:3.
- `src/lib/moduleCoverCatalog.ts`: resolução determinística de capa por produto e ordem.
- `src/components/aulas/*`: cabeçalho de trilha, cards, carrossel e progresso.
- `src/pages/Mentoria.tsx`: orquestração do fluxo em três etapas.
- `src/components/mentoria/MentorshipStepper.tsx`: perguntas, progresso e conclusão.
- `src/pages/Login.tsx`: login Terminal Premium.
- `src/test/*.test.tsx`: testes de composição e comportamento.

---

### Task 1: Design System and Application Shell

**Files:**
- Create: `public/fonts/geist-sans-variable.woff2`
- Create: `public/fonts/geist-mono-variable.woff2`
- Modify: `src/index.css`
- Modify: `tailwind.config.ts`
- Modify: `src/components/layout/AppLayout.tsx`
- Modify: `src/components/layout/AppSidebar.tsx`
- Modify: `src/components/layout/SidebarContent.tsx`
- Modify: `src/components/layout/SidebarUserFooter.tsx`
- Modify: `src/components/layout/TopBar.tsx`
- Test: `src/test/design-system.test.tsx`

**Interfaces:**
- Produces: CSS utilities `.surface`, `.surface-raised`, `.interactive-surface`, `.micro-label`, `.focus-ring`.
- Produces: Tailwind colors `codex` and `claude`, font families `sans` and `mono`.

- [ ] **Step 1: Add a failing design-token test**

```tsx
import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("Terminal Premium tokens", () => {
  it("keeps RealFrame green primary and registers both mascot accents", () => {
    const css = fs.readFileSync("src/index.css", "utf8");
    expect(css).toContain("--primary: 160 64% 52%");
    expect(css).toContain("--codex: 226 100% 67%");
    expect(css).toContain("--claude: 16 76% 62%");
    expect(css).toContain("Geist Sans");
  });
});
```

- [ ] **Step 2: Verify the test fails before the new tokens exist**

Run: `npm run test -- src/test/design-system.test.tsx`

Expected: FAIL on missing `--codex`, `--claude`, or `Geist Sans`.

- [ ] **Step 3: Install the self-hosted font files and define the visual tokens**

Use the official Vercel Geist variable WOFF2 files. Define `@font-face` for `Geist Sans` and `Geist Mono`; remove Instrument Serif from page headings. Add:

```css
--background: 218 15% 5%;
--card: 218 16% 9%;
--secondary: 218 15% 12%;
--foreground: 48 16% 94%;
--muted-foreground: 220 6% 62%;
--primary: 160 64% 52%;
--codex: 226 100% 67%;
--claude: 16 76% 62%;
--border: 220 12% 16%;
--radius: 0.625rem;
```

Register `codex: hsl(var(--codex))`, `claude: hsl(var(--claude))`, `sans: ['Geist Sans', ...]`, and `mono: ['Geist Mono', ...]` in Tailwind.

- [ ] **Step 4: Rebuild the shell with quieter navigation states**

Change sidebar icons to neutral at rest and green only on hover/active. Use an active surface plus the existing 2px left indicator. Remove any floating mascot decoration from the shell. Keep XP and profile fixed at the bottom with one progress bar and one exit action.

- [ ] **Step 5: Verify the token test and shell build**

Run: `npm run test -- src/test/design-system.test.tsx && npm run build`

Expected: PASS and successful Vite build.

- [ ] **Step 6: Commit the shell**

```bash
git add public/fonts src/index.css tailwind.config.ts src/components/layout src/test/design-system.test.tsx
git commit -m "feat(design): establish Terminal Premium visual system"
```

---

### Task 2: Dashboard First-Viewport Grid

**Files:**
- Create: `src/components/dashboard/DashboardGrid.tsx`
- Create: `src/components/dashboard/MentorshipCard.tsx`
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/components/dashboard/WelcomeHero.tsx`
- Modify: `src/components/dashboard/JourneyStrip.tsx`
- Modify: `src/components/dashboard/NextStepCard.tsx`
- Modify: `src/components/dashboard/NextLiveCard.tsx`
- Modify: `src/components/dashboard/AchievementsStrip.tsx`
- Test: `src/test/dashboard-layout.test.tsx`

**Interfaces:**
- Produces: `DashboardGrid(): JSX.Element` containing `NextStepCard`, `NextLiveCard`, and `MentorshipCard`.
- Produces: `MentorshipCard(): JSX.Element` linking to `/mentoria`.

- [ ] **Step 1: Write the failing composition test**

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

vi.mock("@/components/dashboard/NextStepCard", () => ({ NextStepCard: () => <div>Continuar aprendendo</div> }));
vi.mock("@/components/dashboard/NextLiveCard", () => ({ NextLiveCard: () => <div>Próxima live</div> }));

describe("DashboardGrid", () => {
  it("puts learning, live and mentorship in the primary dashboard region", () => {
    render(<MemoryRouter><DashboardGrid /></MemoryRouter>);
    expect(screen.getByText("Continuar aprendendo")).toBeInTheDocument();
    expect(screen.getByText("Próxima live")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /aplicar para mentoria/i })).toHaveAttribute("href", "/mentoria");
  });
});
```

- [ ] **Step 2: Run the test and verify the component is missing**

Run: `npm run test -- src/test/dashboard-layout.test.tsx`

Expected: FAIL because `DashboardGrid` does not exist.

- [ ] **Step 3: Implement the responsive dashboard grid**

Use a 12-column grid on `lg`: `NextStepCard` spans 8 columns and 2 rows; a right rail spans 4 columns and contains `NextLiveCard` and `MentorshipCard`. Collapse to one column below `lg`.

`MentorshipCard` must use coral only as atmospheric detail and expose a green primary CTA:

```tsx
<Link to="/mentoria" aria-label="Aplicar para mentoria" className="interactive-surface group">
  <span className="micro-label text-claude">Mentoria individual</span>
  <h2>Transforme o plano em execução</h2>
  <span className="text-primary">Aplicar agora</span>
</Link>
```

- [ ] **Step 4: Compact the welcome and journey regions**

Move level and XP context into a single line beneath `Olá, {nome}`. Keep streak, completed lessons and achievements scannable, without wrapping them in a full-width heavy card.

- [ ] **Step 5: Run tests and build**

Run: `npm run test -- src/test/dashboard-layout.test.tsx && npm run build`

Expected: PASS and successful build.

- [ ] **Step 6: Commit the dashboard grid**

```bash
git add src/pages/Dashboard.tsx src/components/dashboard src/test/dashboard-layout.test.tsx
git commit -m "feat(dashboard): prioritize continuation live and mentorship"
```

---

### Task 3: Compact Promotional Rail

**Files:**
- Modify: `src/components/dashboard/AnnouncementCarousel.tsx`
- Test: `src/test/announcement-carousel.test.tsx`

**Interfaces:**
- Consumes: `useDashboardBanners()` existing banner records.
- Produces: a manually navigable rail limited to 220px desktop height.

- [ ] **Step 1: Write the banner rendering test**

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AnnouncementCarousel } from "@/components/dashboard/AnnouncementCarousel";

vi.mock("@/hooks/useDashboardBanners", () => ({
  useDashboardBanners: () => ({ isLoading: false, banners: [{
    id: "one", title: "Confira as próximas lives", subtitle: "Encontros ao vivo",
    image_url: "", button_text: "Ver agenda", button_url: "/eventos", gradient: ""
  }] })
}));

describe("AnnouncementCarousel", () => {
  it("renders the promotion as an accessible destination", () => {
    render(<MemoryRouter><AnnouncementCarousel /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /confira as próximas lives/i })).toHaveAttribute("href", "/eventos");
  });
});
```

- [ ] **Step 2: Verify the current carousel fails accessibility naming**

Run: `npm run test -- src/test/announcement-carousel.test.tsx`

Expected: FAIL because the current clickable wrapper has no explicit accessible name contract.

- [ ] **Step 3: Remove autoplay and cap the visual height**

Remove `embla-carousel-autoplay`. Use `h-[168px] sm:h-[188px] lg:h-[212px]`, `object-cover`, manual previous/next controls, and dot indicators. Keep one promo visible at a time.

- [ ] **Step 4: Separate image atmosphere from readable content**

Render copy in a constrained content column with a directional fade only behind that column. Give the link `aria-label={banner.title || banner.button_text}` and use the green CTA style.

- [ ] **Step 5: Run test and build**

Run: `npm run test -- src/test/announcement-carousel.test.tsx && npm run build`

Expected: PASS and successful build.

- [ ] **Step 6: Commit the promotional rail**

```bash
git add src/components/dashboard/AnnouncementCarousel.tsx src/test/announcement-carousel.test.tsx
git commit -m "feat(dashboard): replace oversized banners with compact promos"
```

---

### Task 4: Premium Lesson Library and Local Cover Catalog

**Files:**
- Create: `src/lib/moduleCoverCatalog.ts`
- Create: `src/assets/module-covers/*.webp`
- Modify: `src/pages/Aulas.tsx`
- Modify: `src/components/aulas/ModuleCarousel.tsx`
- Modify: `src/components/aulas/ModuleCard.tsx`
- Modify: `src/components/aulas/ModuleCardSkeleton.tsx`
- Modify: `src/components/aulas/CourseProgress.tsx`
- Test: `src/test/module-cover-catalog.test.ts`

**Interfaces:**
- Produces: `getModuleCover(productSlug: string | null, orderIndex: number): string | null`.
- `ModuleCarousel` receives new prop `productSlug?: string | null` and passes the resolved local cover to `ModuleCard`.

- [ ] **Step 1: Write the failing deterministic-cover test**

```ts
import { describe, expect, it } from "vitest";
import { getModuleCover } from "@/lib/moduleCoverCatalog";

describe("module cover catalog", () => {
  it("returns different art for neighboring modules in the same product", () => {
    const first = getModuleCover("genios-ia", 0);
    const second = getModuleCover("genios-ia", 1);
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(first).not.toBe(second);
  });

  it("returns null for an unknown product", () => {
    expect(getModuleCover("produto-inexistente", 0)).toBeNull();
  });
});
```

- [ ] **Step 2: Verify the catalog is missing**

Run: `npm run test -- src/test/module-cover-catalog.test.ts`

Expected: FAIL because `moduleCoverCatalog` does not exist.

- [x] **Step 3: Build the complete code-native 4:3 cover family**

Read the existing module titles from the app data. Build one deterministic composition per module with no embedded words: graphite studio background, emerald key light, selective Codex-blue and Claude-coral reflections, one subject object matching the module, mascots used only as occasional signatures. This supersedes the original WebP generation step because repeated AI-generated imagery was explicitly rejected during visual review; the code-native system is lighter, stable and consistent while database images remain a fallback.

- [x] **Step 4: Implement the static catalog**

Map every real module by stable UUID, using product slug and zero-based order only when UUID is unavailable. Return `null` for an unknown UUID so future modules retain their database cover as the final fallback.

- [ ] **Step 5: Tighten the library composition**

Show 4.5 cards on wide desktop using `xl:basis-[22%]`; preserve the partial next card. Use 4:3 covers, 8px radius, 2px hover lift, concise metadata, and a two-line title clamp. Place section progress and carousel arrows in each trail header. Swipe remains enabled.

- [ ] **Step 6: Run catalog tests and build**

Run: `npm run test -- src/test/module-cover-catalog.test.ts && npm run build`

Expected: PASS and successful build.

- [ ] **Step 7: Commit the library**

```bash
git add src/lib/moduleCoverCatalog.ts src/pages/Aulas.tsx src/components/aulas src/test/module-cover-catalog.test.ts
git commit -m "feat(aulas): add unique covers and premium learning trails"
```

---

### Task 5: Three-Step Mentorship Application

**Files:**
- Create: `src/components/mentoria/MentorshipStepper.tsx`
- Modify: `src/pages/Mentoria.tsx`
- Test: `src/test/mentorship-stepper.test.tsx`

**Interfaces:**
- Produces: `MentorshipAnswers = { name: string; interest: string; objective: string }`.
- Produces: `buildMentorshipWhatsAppUrl(answers: MentorshipAnswers): string`.
- `MentorshipStepper` accepts `onComplete(url: string): void` for opening WhatsApp.

- [ ] **Step 1: Write failing progression and URL tests**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MentorshipStepper, buildMentorshipWhatsAppUrl } from "@/components/mentoria/MentorshipStepper";

describe("MentorshipStepper", () => {
  it("reveals one question at a time", () => {
    render(<MentorshipStepper onComplete={vi.fn()} />);
    expect(screen.getByLabelText(/seu nome/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/principal área/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/seu nome/i), { target: { value: "Guilherme" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByLabelText(/principal área/i)).toBeInTheDocument();
  });

  it("encodes all answers in the WhatsApp URL", () => {
    const url = buildMentorshipWhatsAppUrl({ name: "Gui", interest: "Automação", objective: "Vender agentes" });
    expect(url).toContain("wa.me/5571981939047");
    expect(decodeURIComponent(url)).toContain("Vender agentes");
  });
});
```

- [ ] **Step 2: Verify the stepper does not exist**

Run: `npm run test -- src/test/mentorship-stepper.test.tsx`

Expected: FAIL on missing module.

- [ ] **Step 3: Implement the three-step state machine**

Use steps `name`, `interest`, `objective`. Disable forward navigation while the current answer is empty. Show `Etapa N de 3`, a green progress indicator, Back from steps 2–3, and `Conversar no WhatsApp` on step 3.

- [ ] **Step 4: Recompose the Mentoria page**

Use a two-column desktop composition: concise value proposition and expectations on the left; stepper on the right. Collapse to stepper-first single column on mobile. Use coral only in a small mentorship label and atmospheric edge.

- [ ] **Step 5: Run tests and build**

Run: `npm run test -- src/test/mentorship-stepper.test.tsx && npm run build`

Expected: PASS and successful build.

- [ ] **Step 6: Commit the mentorship flow**

```bash
git add src/pages/Mentoria.tsx src/components/mentoria/MentorshipStepper.tsx src/test/mentorship-stepper.test.tsx
git commit -m "feat(mentoria): create focused three-step application"
```

---

### Task 6: Terminal Premium Login

**Files:**
- Create: `src/components/brand/AgentMark.tsx`
- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/ForgotPassword.tsx`
- Test: `src/test/login-layout.test.tsx`

**Interfaces:**
- Produces: `AgentMark({ size?: 'sm' | 'md' | 'lg' })` as a decorative, accessible brand mark.
- Consumes: unchanged `useAuth().signIn(email, password)`.

- [ ] **Step 1: Write a failing semantic login test**

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Login from "@/pages/Login";

vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ signIn: vi.fn() }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

describe("Login", () => {
  it("presents the RealFrame brand and recovery route", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: /realframe ia/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /esqueceu a senha/i })).toHaveAttribute("href", "/forgot-password");
  });
});
```

- [ ] **Step 2: Run and verify the heading contract fails**

Run: `npm run test -- src/test/login-layout.test.tsx`

Expected: FAIL because the brand is not currently exposed as the page heading.

- [ ] **Step 3: Build the new login composition**

Remove `gui-hero.jpg`. Use a contained form surface on graphite, with a restrained brand scene showing Codex-blue and Claude-coral material cues around a green RealFrame signal. Keep the login form dominant and preserve all existing authentication behavior.

- [ ] **Step 4: Align password recovery visually**

Apply the same shell, inputs, focus rings, error hierarchy and CTA style to `ForgotPassword` without changing its Supabase flow.

- [ ] **Step 5: Run test and build**

Run: `npm run test -- src/test/login-layout.test.tsx && npm run build`

Expected: PASS and successful build.

- [ ] **Step 6: Commit authentication visuals**

```bash
git add src/components/brand/AgentMark.tsx src/pages/Login.tsx src/pages/ForgotPassword.tsx src/test/login-layout.test.tsx
git commit -m "feat(auth): redesign login with RealFrame visual language"
```

---

### Task 7: Responsive Visual Verification and Cleanup

**Files:**
- Modify only files found defective during verification.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified desktop and mobile experience without production-data mutations.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm run test`

Expected: all Vitest suites pass.

- [ ] **Step 2: Run lint and distinguish existing failures from regressions**

Run: `npm run lint`

Expected: no new lint errors in files changed by this plan. Existing unrelated warnings/errors must be reported separately if still present.

- [ ] **Step 3: Produce the production bundle**

Run: `npm run build`

Expected: Vite build succeeds.

- [ ] **Step 4: Verify desktop at 1440×900**

Inspect `/login`, `/`, `/aulas`, `/aulas/:moduleId`, `/mentoria`, `/eventos`, and `/meus-produtos`. Confirm dashboard primary actions fit the first viewport, banners remain below 220px, 4+ lesson cards are visible, and focus/hover states remain green.

- [ ] **Step 5: Verify mobile at 390×844**

Inspect the same routes. Confirm sidebar sheet, horizontal swipe, non-overlapping text, 44px touch targets, stepper navigation and banner crops.

- [ ] **Step 6: Inspect image loading and console state**

Confirm no broken cover assets, no avoidable eager loading below the fold, and no new console errors.

- [ ] **Step 7: Commit verification fixes**

```bash
git add src public
git commit -m "fix(design): polish responsive Terminal Premium experience"
```

Do not create an empty commit when verification requires no code changes.
