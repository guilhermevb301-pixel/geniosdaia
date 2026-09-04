import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

function AuthActions() {
  const { signIn, signUp } = useAuth();

  return (
    <>
      <button type="button" onClick={() => void signIn("  GUI@Example.COM  ", "  123456  ")}>
        Entrar
      </button>
      <button type="button" onClick={() => void signUp("  GUI@Example.COM  ", "  123456  ")}>
        Cadastrar
      </button>
    </>
  );
}

describe("AuthContext password handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mocks.unsubscribe } },
    });
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    mocks.signUp.mockResolvedValue({ data: { user: null }, error: null });
  });

  it("normalizes only email and passes the sign-in password exactly as received", async () => {
    render(
      <AuthProvider>
        <AuthActions />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mocks.signInWithPassword).toHaveBeenCalledWith({
        email: "gui@example.com",
        password: "  123456  ",
      });
    });
  });

  it("normalizes only email and passes the sign-up password exactly as received", async () => {
    render(
      <AuthProvider>
        <AuthActions />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => {
      expect(mocks.signUp).toHaveBeenCalledWith({
        email: "gui@example.com",
        password: "  123456  ",
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
    });
  });
});
