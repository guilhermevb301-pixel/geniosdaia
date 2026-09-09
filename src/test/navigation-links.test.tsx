import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AchievementsStrip } from "@/components/dashboard/AchievementsStrip";
import { SidebarContent } from "@/components/layout/SidebarContent";
import { SidebarUserFooter } from "@/components/layout/SidebarUserFooter";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { email: "gui@example.com", user_metadata: { full_name: "Gui Vilasia" } },
    signOut: vi.fn(),
  }),
}));
vi.mock("@/hooks/useUserXP", () => ({
  useUserXP: () => ({
    isLoading: false,
    levelInfo: { name: "Construtor", level: 3, xpInLevel: 40, xpForNextLevel: 100, progress: 40 },
  }),
}));
vi.mock("@/hooks/useUserBadges", () => ({
  useUserBadges: () => ({ badgesWithStatus: [{ id: "badge-1" }], isLoading: false }),
}));
vi.mock("@/components/gamification/BadgeGrid", () => ({
  BadgeGrid: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/hooks/useIsAdmin", () => ({ useIsAdmin: () => ({ isAdmin: false }) }));
vi.mock("@/hooks/useIsMentor", () => ({ useIsMentor: () => ({ isMentor: false }) }));
vi.mock("@/hooks/useIsMentee", () => ({ useIsMentee: () => ({ isMentee: false }) }));

function renderSidebar() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SidebarContent />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("existing navigation destinations", () => {
  it("keeps the member menu focused and leaves Templates as the final resource", () => {
    renderSidebar();

    expect(screen.queryByText("Meus GPTs")).not.toBeInTheDocument();
    expect(screen.queryByText("Desafios")).not.toBeInTheDocument();
    const navigationLinks = screen.getByRole("navigation").querySelectorAll("a");
    expect(navigationLinks[navigationLinks.length - 1]).toHaveTextContent("Templates");
  });

  it("renders sidebar account information without linking to the missing profile route", () => {
    render(
      <MemoryRouter>
        <SidebarUserFooter />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: /perfil/i })).not.toBeInTheDocument();
    expect(screen.getByText("Nível 3")).toBeInTheDocument();
  });

  it("links achievements to certificates with matching copy", () => {
    render(
      <MemoryRouter>
        <AchievementsStrip />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /ver certificados/i })).toHaveAttribute(
      "href",
      "/certificados",
    );
    expect(screen.queryByRole("link", { name: /perfil/i })).not.toBeInTheDocument();
  });
});
