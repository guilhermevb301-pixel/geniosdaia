import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ModuleCard } from "@/components/aulas/ModuleCard";
import { ModuleCarousel } from "@/components/aulas/ModuleCarousel";
import { ModuleCoverArtwork } from "@/components/aulas/ModuleCoverArtwork";
import { getModuleCover } from "@/lib/moduleCoverCatalog";

const moduleFixture = {
  id: "0a58dcfd-8430-4cac-8295-3f178c2eaa97",
  title: "Instalando as Ferramentas",
  description: "Configure o ambiente.",
  cover_image_url: null,
  order_index: 1,
  completedLessons: 2,
  totalLessons: 5,
};

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("premium module library", () => {
  it("names each trail region and its module progress bars", () => {
    render(
      <MemoryRouter>
        <ModuleCarousel
          modules={[moduleFixture]}
          title="Agente de Atendimento"
          productSlug="agente-atendimento"
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("region", { name: "Agente de Atendimento" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", {
        name: "Progresso em Agente de Atendimento",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", {
        name: "Progresso do módulo Instalando as Ferramentas",
      }),
    ).toBeInTheDocument();
  });

  it("keeps focal icons and borders emerald for every reflection family", () => {
    const moduleIds = [
      "f53202aa-94ec-4270-add0-da334f1bdd44",
      "525bc166-7653-47ca-93b4-48f7e7dd7332",
    ];

    moduleIds.forEach((moduleId) => {
      const metadata = getModuleCover({
        moduleId,
        productSlug: null,
        orderIndex: -1,
      });
      expect(metadata).not.toBeNull();

      const { container, unmount } = render(
        <ModuleCoverArtwork metadata={metadata!} />,
      );
      const focalObject = container.querySelector("svg")?.parentElement;

      expect(focalObject).toHaveClass("border-primary/40", "text-primary");
      unmount();
    });
  });

  it("does not zoom code-native artwork while its module is locked", () => {
    const metadata = getModuleCover({
      moduleId: "f53202aa-94ec-4270-add0-da334f1bdd44",
      productSlug: null,
      orderIndex: -1,
    });
    expect(metadata).not.toBeNull();

    const { container } = render(
      <MemoryRouter>
        <ModuleCard
          id={moduleFixture.id}
          title={moduleFixture.title}
          description={moduleFixture.description}
          coverMetadata={metadata!}
          completedLessons={0}
          totalLessons={5}
          orderIndex={1}
          locked
        />
      </MemoryRouter>,
    );

    expect(container.querySelector("[data-cover-topic]")).not.toHaveClass(
      "group-hover/card:scale-[1.025]",
    );
  });

  it("gives the unlock action a 44px touch target", () => {
    render(
      <MemoryRouter>
        <ModuleCarousel
          modules={[moduleFixture]}
          title="Agente de Atendimento"
          locked
          buyUrl="https://example.com/comprar"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Desbloquear" })).toHaveClass("h-11");
  });

  it("prioritizes cover images only when the carousel is the first visible trail", () => {
    const imageModule = {
      ...moduleFixture,
      id: "custom-module-with-image",
      cover_image_url: "https://example.com/cover.jpg",
      order_index: 99,
    };
    const { rerender } = render(
      <MemoryRouter>
        <ModuleCarousel modules={[imageModule]} title="Primeira trilha" prioritizeImages />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img", { name: imageModule.title })).toHaveAttribute(
      "loading",
      "eager",
    );

    rerender(
      <MemoryRouter>
        <ModuleCarousel modules={[imageModule]} title="Segunda trilha" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img", { name: imageModule.title })).toHaveAttribute(
      "loading",
      "lazy",
    );
  });
});
