import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/toaster", () => ({ Toaster: () => null }));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("@/pages/Aulas", () => ({ default: () => <h1>Aulas carregadas</h1> }));

describe("route-level loading", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/aulas");
  });

  it("shows an accessible fallback before rendering the lazy Aulas page", async () => {
    render(<App />);

    expect(screen.getByRole("status", { name: "Carregando página" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Aulas carregadas" })).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Aulas carregadas" })).toBeInTheDocument();
  });
});
