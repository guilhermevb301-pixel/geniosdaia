import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RealFrameHero } from "@/components/dashboard/RealFrameHero";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "member-1",
      email: "guilherme@example.com",
      user_metadata: { full_name: "Guilherme" },
    },
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: { display_name: "Guilherme" } }),
}));

describe("RealFrameHero", () => {
  it("personalizes the welcome and keeps the library as the primary action", () => {
    render(
      <MemoryRouter>
        <RealFrameHero />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Olá, Guilherme" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /continuar aprendendo/i }),
    ).toHaveAttribute("href", "/aulas");
    expect(screen.getByRole("img", { name: /guilherme vilas/i })).toHaveClass(
      "object-cover",
    );
  });
});
