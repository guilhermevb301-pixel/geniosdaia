import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPassword from "@/pages/ForgotPassword";
import Login from "@/pages/Login";

const mocks = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
  signIn: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ signIn: mocks.signIn }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mocks.toast }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: mocks.resetPasswordForEmail,
    },
  },
}));

function renderRoute(component: React.ReactNode) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </MemoryRouter>,
  );
}

describe("Terminal Premium authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signIn.mockResolvedValue({ error: null });
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
  });

  it("presents RealFrame IA as the single accessible brand heading", () => {
    renderRoute(<Login />);

    expect(screen.getByRole("heading", { name: "RealFrame IA", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("RealFrame IA")).toHaveLength(1);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /esqueceu a senha/i })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("normalizes the email without changing password whitespace", async () => {
    renderRoute(<Login />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "  GUI@Example.COM  " },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "  senha com espaços  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mocks.signIn).toHaveBeenCalledWith(
        "gui@example.com",
        "  senha com espaços  ",
      );
    });
  });

  it("keeps recovery on the same brand shell and normalizes its Supabase request", async () => {
    renderRoute(<ForgotPassword />);

    expect(screen.getByRole("heading", { name: "RealFrame IA", level: 1 })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "  GUI@Example.COM  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar link de recuperação/i }));

    await waitFor(() => {
      expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith("gui@example.com", {
        redirectTo: `${window.location.origin}/login`,
      });
    });
  });
});
