import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  unsubscribe: vi.fn(),
  authStateChangeCallback: undefined as
    | ((event: AuthChangeEvent, session: Session | null) => void)
    | undefined,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      signOut: mocks.signOut,
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

function AuthStateProbe() {
  const { isPasswordRecovery, loading, signOut, user } = useAuth();

  return (
    <>
      <output>
        {loading
          ? "loading"
          : `recovery:${String(isPasswordRecovery)};user:${user?.id ?? "none"}`}
      </output>
      <button type="button" onClick={() => void signOut()}>
        Sair
      </button>
    </>
  );
}

describe("AuthContext password handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authStateChangeCallback = undefined;
    mocks.onAuthStateChange.mockImplementation((callback) => {
      mocks.authStateChangeCallback = callback;
      return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
    });
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    mocks.signOut.mockResolvedValue({ error: null });
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

  it("does not treat a preexisting signed-in session as password recovery", async () => {
    const session = { user: { id: "existing-user" } } as Session;
    mocks.getSession.mockResolvedValueOnce({ data: { session } });

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText("recovery:false;user:existing-user")).toBeInTheDocument();
  });

  it("enables recovery only after Supabase emits PASSWORD_RECOVERY", async () => {
    const session = { user: { id: "recovery-user" } } as Session;
    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );
    expect(await screen.findByText("recovery:false;user:none")).toBeInTheDocument();

    act(() => {
      mocks.authStateChangeCallback?.("SIGNED_IN", session);
    });
    expect(screen.getByText("recovery:false;user:recovery-user")).toBeInTheDocument();

    act(() => {
      mocks.authStateChangeCallback?.("PASSWORD_RECOVERY", session);
    });
    expect(screen.getByText("recovery:true;user:recovery-user")).toBeInTheDocument();
  });

  it("clears password recovery state when signing out", async () => {
    const session = { user: { id: "recovery-user" } } as Session;
    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );
    await screen.findByText("recovery:false;user:none");

    act(() => {
      mocks.authStateChangeCallback?.("PASSWORD_RECOVERY", session);
    });
    expect(screen.getByText("recovery:true;user:recovery-user")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => {
      expect(mocks.signOut).toHaveBeenCalledOnce();
      expect(screen.getByText("recovery:false;user:none")).toBeInTheDocument();
    });
  });
});
