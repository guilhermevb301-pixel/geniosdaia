# Dashboard e Biblioteca RealFrame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar a area de membros para apresentar a RealFrame no dashboard e transformar `/aulas` em uma biblioteca de sessoes com paginas internas de modulos.

**Architecture:** `module_sections` continua como fonte das sessoes e `modules.section_id` como vinculo. Um hook de biblioteca monta modelos com progresso e acesso para tres consumidores: capa da biblioteca, pagina da sessao e proximo passo do dashboard. As rotas administrativas e os dados existentes permanecem intactos.

**Tech Stack:** React 18, TypeScript, Vite, React Router, TanStack Query, Supabase, Tailwind CSS, Vitest, Testing Library, Embla Carousel.

**Spec:** `docs/superpowers/specs/2026-09-09-dashboard-biblioteca-realframe-design.md`

## Global Constraints

- Verde funcional principal: `#34d399`.
- Nao alterar nem apagar dados de producao.
- Nao remover rotas ou ferramentas administrativas de GPTs e desafios.
- `/aulas/:moduleId` deve continuar funcionando para links existentes.
- Acesso deve ser validado na pagina da sessao e na pagina do modulo.
- Capas em 4:3, WebP otimizado, sem texto gerado dentro da imagem.
- Deploy de preview e verificacao visual antes de promover para producao.

---

## File Structure

- `src/hooks/useCourseLibrary.ts`: consulta e transforma sessoes, modulos, aulas e progresso.
- `src/lib/courseLibrary.ts`: funcoes puras de agrupamento, progresso e acesso.
- `src/lib/sectionCoverImages.ts`: catalogo estatico das sete capas de sessao.
- `src/components/aulas/SectionCard.tsx`: card acionavel de uma sessao.
- `src/components/aulas/SectionGrid.tsx`: grade responsiva e skeletons.
- `src/components/aulas/ModuleGrid.tsx`: grade interna de modulos.
- `src/pages/Aulas.tsx`: capa da biblioteca.
- `src/pages/SectionModules.tsx`: pagina de uma sessao.
- `src/pages/ModuleLessons.tsx`: validacao de acesso e retorno para a sessao correta.
- `src/components/layout/SidebarContent.tsx`: menu simplificado e Templates por ultimo.
- `src/components/dashboard/RealFrameHero.tsx`: hero autoral com Gui e CTA de continuidade.
- `src/pages/Dashboard.tsx`: nova hierarquia do dashboard.
- `src/components/dashboard/AnnouncementCarousel.tsx`: destaques compactos.
- `src/assets/section-covers/*.webp`: sete capas de sessao.
- `src/assets/module-covers-editorial/*.webp`: 29 capas de modulo congruentes.

---

### Task 1: Modelo compartilhado da biblioteca

**Files:**
- Create: `src/lib/courseLibrary.ts`
- Create: `src/hooks/useCourseLibrary.ts`
- Test: `src/test/course-library.test.ts`

**Interfaces:**
- Produces: `CourseSectionView`, `CourseModuleView`, `buildCourseLibrary(input)` e `useCourseLibrary()`.
- Consumes: tabelas `module_sections`, `modules`, `lessons`, `lesson_progress` e `useUserProducts()`.

- [ ] **Step 1: Write the failing pure-model tests**

```ts
expect(result.sections[0]).toMatchObject({
  id: "section-1",
  moduleCount: 2,
  totalLessons: 5,
  completedLessons: 2,
  locked: false,
});
expect(result.sections[0].modules.map((module) => module.id)).toEqual(["m-1", "m-2"]);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm run test -- course-library`

Expected: FAIL because `buildCourseLibrary` does not exist.

- [ ] **Step 3: Implement typed transformation and query hook**

```ts
export interface CourseSectionView {
  id: string;
  title: string;
  productSlug: string | null;
  orderIndex: number;
  moduleCount: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  locked: boolean;
  modules: CourseModuleView[];
}

export function buildCourseLibrary(input: CourseLibraryInput): CourseLibraryView;
export function useCourseLibrary(): {
  sections: CourseSectionView[];
  modulesWithoutSection: CourseModuleView[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};
```

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- course-library`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/courseLibrary.ts src/hooks/useCourseLibrary.ts src/test/course-library.test.ts
git commit -m "refactor(aulas): centralize course library model"
```

### Task 2: Capa da biblioteca com as sete sessoes

**Files:**
- Create: `src/components/aulas/SectionCard.tsx`
- Create: `src/components/aulas/SectionGrid.tsx`
- Create: `src/lib/sectionCoverImages.ts`
- Modify: `src/pages/Aulas.tsx`
- Test: `src/test/section-library.test.tsx`
- Modify: `src/test/aulas-error-state.test.tsx`

**Interfaces:**
- Consumes: `CourseSectionView[]` de `useCourseLibrary()`.
- Produces: links `/aulas/sessao/:sectionId` e acoes de desbloqueio por produto.

- [ ] **Step 1: Write failing page tests**

```tsx
expect(screen.getAllByRole("link", { name: /abrir sessao/i })).toHaveLength(7);
expect(screen.queryByText("Instalando as Ferramentas")).not.toBeInTheDocument();
expect(screen.getByText("7 sessoes")).toBeInTheDocument();
```

- [ ] **Step 2: Run tests and verify the old carousel page fails**

Run: `npm run test -- section-library aulas-error-state`

- [ ] **Step 3: Implement session cards and responsive grid**

`SectionCard` receives exactly:

```ts
interface SectionCardProps {
  section: CourseSectionView;
  coverImage: string | null;
  buyUrl?: string;
  priority?: boolean;
}
```

Use `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`, `aspect-[4/3]`, 8 px radius,
stable image dimensions, keyboard focus and an explicit locked state.

- [ ] **Step 4: Replace all module carousels in `/aulas` with `SectionGrid`**

Keep the current loading, error, retry and empty states, sourcing all data from
`useCourseLibrary()`.

- [ ] **Step 5: Run focused tests**

Run: `npm run test -- section-library aulas-error-state aulas-image-priority`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Aulas.tsx src/components/aulas/SectionCard.tsx src/components/aulas/SectionGrid.tsx src/lib/sectionCoverImages.ts src/test/section-library.test.tsx src/test/aulas-error-state.test.tsx src/test/aulas-image-priority.test.tsx
git commit -m "feat(aulas): show course sessions before modules"
```

### Task 3: Pagina interna da sessao e acesso direto

**Files:**
- Create: `src/pages/SectionModules.tsx`
- Create: `src/components/aulas/ModuleGrid.tsx`
- Modify: `src/App.tsx`
- Modify: `src/lib/appRoutes.ts`
- Modify: `src/pages/ModuleLessons.tsx`
- Test: `src/test/section-modules.test.tsx`
- Test: `src/test/module-access.test.tsx`
- Modify: `src/test/app-lazy-routes.test.tsx`

**Interfaces:**
- Consumes: `useCourseLibrary()` and route param `sectionId`.
- Produces: route `/aulas/sessao/:sectionId` and safe module navigation.

- [ ] **Step 1: Write failing route and access tests**

```tsx
expect(APP_ROUTES.sectionModules).toBe("/aulas/sessao/:sectionId");
expect(screen.getByRole("heading", { name: "Influencers de IA" })).toBeInTheDocument();
expect(screen.getAllByRole("link", { name: /abrir modulo/i })).toHaveLength(5);
```

For a locked product, assert navigation to `/acesso-negado` and no lesson video.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test -- section-modules module-access app-lazy-routes`

- [ ] **Step 3: Add route before `/aulas/:moduleId`**

```ts
sectionModules: "/aulas/sessao/:sectionId",
moduleLessons: "/aulas/:moduleId",
```

- [ ] **Step 4: Implement `SectionModules` and `ModuleGrid`**

The page finds the exact section, renders breadcrumb, aggregated progress and
only `section.modules`. Unknown IDs render a clear not-found state. Locked
sections redirect to `/acesso-negado` only after products finish loading.

- [ ] **Step 5: Harden `ModuleLessons` access**

Fetch the module together with its section, validate `section.product_slug`
through `useUserProducts`, redirect when locked, and make the back link target
`/aulas/sessao/${module.section_id}` when available.

- [ ] **Step 6: Run focused tests**

Run: `npm run test -- section-modules module-access app-lazy-routes`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/SectionModules.tsx src/components/aulas/ModuleGrid.tsx src/App.tsx src/lib/appRoutes.ts src/pages/ModuleLessons.tsx src/test/section-modules.test.tsx src/test/module-access.test.tsx src/test/app-lazy-routes.test.tsx
git commit -m "feat(aulas): add session module pages and access checks"
```

### Task 4: Menu enxuto do aluno

**Files:**
- Modify: `src/components/layout/SidebarContent.tsx`
- Modify: `src/test/navigation-links.test.tsx`
- Modify: `src/lib/prefetchRoutes.ts`
- Modify: `src/test/prefetch-routes.test.ts`

**Interfaces:**
- Produces: menu visivel sem Meus GPTs e Desafios, com Templates como ultimo recurso.
- Preserves: rotas e links administrativos existentes.

- [ ] **Step 1: Write failing navigation-order test**

```tsx
expect(screen.queryByText("Meus GPTs")).not.toBeInTheDocument();
expect(screen.queryByText("Desafios")).not.toBeInTheDocument();
expect(screen.getAllByRole("link").at(-1)).toHaveTextContent("Templates");
```

- [ ] **Step 2: Run the navigation tests**

Run: `npm run test -- navigation-links prefetch-routes`

- [ ] **Step 3: Reorder the student navigation**

Render Dashboard, Aulas, Banco de Prompts and Lives under Conteudo; Certificados,
Meu Caderno and Aplicar Mentoria under Voce; Entrar no grupo under Comunidade;
and Templates under Recursos at the bottom. Do not render user GPTs or Challenges.

- [ ] **Step 4: Remove unused student-route prefetch entries**

Keep admin prefetch behavior unchanged.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm run test -- navigation-links prefetch-routes`

```bash
git add src/components/layout/SidebarContent.tsx src/lib/prefetchRoutes.ts src/test/navigation-links.test.tsx src/test/prefetch-routes.test.ts
git commit -m "refactor(navigation): simplify member sidebar"
```

### Task 5: Dashboard autoral e compacto

**Files:**
- Create: `src/components/dashboard/RealFrameHero.tsx`
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/components/dashboard/DashboardGrid.tsx`
- Modify: `src/components/dashboard/AnnouncementCarousel.tsx`
- Modify: `src/components/dashboard/NextStepCard.tsx`
- Remove: `src/components/dashboard/WelcomeHero.tsx`
- Modify: `src/test/dashboard-layout.test.tsx`
- Modify: `src/test/dashboard-performance.test.tsx`
- Modify: `src/test/announcement-carousel.test.tsx`

**Interfaces:**
- Consumes: current user display name and next accessible module.
- Produces: compact branded hero, continuation, live, mentorship and compact autoplay highlights.

- [ ] **Step 1: Write failing dashboard hierarchy tests**

```tsx
expect(screen.getByTestId("realframe-hero")).toBeInTheDocument();
expect(screen.getByTestId("dashboard-learning-region")).toBeInTheDocument();
expect(screen.getByTestId("announcement-carousel")).toHaveClass("max-h-[152px]");
expect(screen.queryByLabelText("Resumo da sua jornada")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test -- dashboard-layout dashboard-performance announcement-carousel`

- [ ] **Step 3: Implement `RealFrameHero`**

Use a bounded `min-h-[230px] lg:min-h-[280px]`, text and CTA on the left, Gui
image on the right, a real `<img>` with responsive object position, and no nested
marketing card. Mobile stacks text before image while preserving the face.

- [ ] **Step 4: Recompose dashboard order**

Render hero, continuation/live/mentorship grid, compact highlights, and
achievements. Remove `JourneyStrip` from the dashboard because XP already exists
in the sidebar footer.

- [ ] **Step 5: Compact the highlights carousel**

Use maximum visual height 152 px on desktop, 132 px on mobile, autoplay with
pause on hover/focus, swipe, reduced-motion support and safe text/image regions.

- [ ] **Step 6: Run focused tests and commit**

Run: `npm run test -- dashboard-layout dashboard-performance announcement-carousel`

```bash
git add src/pages/Dashboard.tsx src/components/dashboard/RealFrameHero.tsx src/components/dashboard/DashboardGrid.tsx src/components/dashboard/AnnouncementCarousel.tsx src/components/dashboard/NextStepCard.tsx src/components/dashboard/WelcomeHero.tsx src/test/dashboard-layout.test.tsx src/test/dashboard-performance.test.tsx src/test/announcement-carousel.test.tsx
git commit -m "feat(dashboard): introduce founder-led RealFrame experience"
```

### Task 6: Nova biblioteca visual

**Files:**
- Create: `src/assets/section-covers/*.webp`
- Create: `src/assets/module-covers-editorial/*.webp`
- Create: `src/assets/dashboard/gui-realframe-hero.webp`
- Modify: `src/lib/sectionCoverImages.ts`
- Modify: `src/lib/moduleCoverImages.ts`
- Test: `src/test/section-cover-images.test.ts`
- Modify: `src/test/module-cover-images.test.ts`

**Interfaces:**
- Produces: sete capas de sessao, 29 capas de modulo e um hero do dashboard.
- Consumes: referencia facial autorizada em `/Users/guilhermefvb/Downloads/morphix-1785967530408.jpg`.

- [ ] **Step 1: Build and review the prompt manifest**

Create one prompt per section/module from its actual title and description.
Require 4:3, subject in a mobile-safe central region, cinematic editorial
lighting, no UI text, no repeated mascot pedestal and no mandatory green wash.

- [ ] **Step 2: Generate the seven session covers and dashboard hero**

Use Gui only in Dashboard, Clones and Mentorship contexts. Verify face fidelity,
hands, logos and crop before importing.

- [ ] **Step 3: Generate the 29 individual module covers**

Use the actual module topic: influencer for influencer modules, sales situations
for sales, production workflows for video, cameras/results for image, and
product-specific workflows for Claude/HeyGen/Kling/Veo/Seedance.

- [ ] **Step 4: Optimize assets**

Convert to WebP, preserve 4:3, keep each card cover below 220 KB where visual
quality allows, and hero below 450 KB.

- [ ] **Step 5: Update image catalogs and tests**

```ts
expect(getSectionCoverImage("clone-criativo")).toMatch(/clone-criativo/);
expect(MODULE_COVER_TOPICS).toHaveLength(29);
```

- [ ] **Step 6: Run asset tests and commit**

Run: `npm run test -- section-cover-images module-cover-images`

```bash
git add src/assets/section-covers src/assets/module-covers-editorial src/assets/dashboard src/lib/sectionCoverImages.ts src/lib/moduleCoverImages.ts src/test/section-cover-images.test.ts src/test/module-cover-images.test.ts
git commit -m "feat(brand): add editorial RealFrame course artwork"
```

### Task 7: Full verification and preview deployment

**Files:**
- Modify only files required by verified regressions.

**Interfaces:**
- Produces: tested preview URL for stakeholder review.

- [ ] **Step 1: Run all automated checks**

Run: `npm run test`

Run: `npm run lint`

Run: `npm run build`

- [ ] **Step 2: Run local visual verification**

Check `/`, `/aulas`, each of the seven `/aulas/sessao/:sectionId` pages and one
`/aulas/:moduleId` page at 1440x900, 768x1024 and 390x844. Confirm no blank
images, clipped faces, overlapping text, horizontal page overflow or broken
keyboard focus.

- [ ] **Step 3: Verify functional flows**

Sign in with the existing test account, open every session, return from a module,
test a locked section fixture, open mentorship, swipe highlights and verify the
Templates position on desktop and mobile.

- [ ] **Step 4: Deploy preview**

Run: `vercel --yes`

Expected: a preview URL separate from `membrosgenios.com`.

- [ ] **Step 5: Promote only after stakeholder approval**

Run: `vercel --prod --yes`

Expected: alias resolves to `https://membrosgenios.com/`.

- [ ] **Step 6: Commit verified corrections**

Run `git status --short`, stage only the literal paths edited while correcting a
verified regression in this task, and leave every unrelated dirty file unstaged.

```bash
git commit -m "fix: polish RealFrame member experience"
```
