import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

vi.mock("@/components/dashboard/NextStepCard", () => ({
  NextStepCard: () => <div>Continuar aprendendo</div>,
}));

vi.mock("@/components/dashboard/NextLiveCard", () => ({
  NextLiveCard: () => <div>Próxima live</div>,
}));

describe("DashboardGrid", () => {
  it("puts learning, live and mentorship in the primary dashboard region", () => {
    render(
      <MemoryRouter>
        <DashboardGrid />
      </MemoryRouter>,
    );

    expect(screen.getByText("Continuar aprendendo")).toBeInTheDocument();
    expect(screen.getByText("Próxima live")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /aplicar para mentoria/i }),
    ).toHaveAttribute("href", "/mentoria");
  });
});
