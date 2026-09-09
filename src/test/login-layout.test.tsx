import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgentMark } from "@/components/brand/AgentMark";
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

function renderRoute(component: ReactNode) {
  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {component}
    </MemoryRouter>,
  );
}

function submitLogin(email = "gui@example.com", password = "senha válida") {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

function submitRecovery(email = "gui@example.com") {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.click(
    screen.getByRole("button", { name: /enviar link de recuperação/i }),
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("RealFrame authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signIn.mockResolvedValue({ error: null });
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
  });

  it("presents the RealFrame brand without exposing the internal design codename", () => {
    renderRoute(<Login />);

    expect(
      screen.getByRole("heading", { name: "Entrar na RealFrame IA", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/RealFrame/)).toHaveLength(3);
    expect(screen.queryByText(/terminal premium/i)).not.toBeInTheDocument();
    const forgotPasswordLink = screen.getByRole("link", {
      name: /esqueceu a senha/i,
    });
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
    expect(forgotPasswordLink).toHaveClass("min-h-11");
    expect(screen.getByRole("link", { name: /criar conta/i })).toHaveClass(
      "min-h-11",
    );
  });

  it("keeps AgentMark completely decorative", () => {
    const { container } = render(<AgentMark size="lg" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it.each([
    ["login", <Login />, /continue suas aulas/i],
    ["password recovery", <ForgotPassword />, /digite seu email/i],
  ])(
    "uses the founder photo shell on %s while preserving the mobile brand",
    (_, component, copy) => {
      renderRoute(component);

      const rail = screen.getByRole("complementary");
      const shell = rail.closest("section");
      expect(shell).toHaveClass(
        "grid",
        "min-h-screen",
        "lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.72fr)]",
      );
      expect(rail).toHaveClass("hidden", "lg:block");
      expect(
        rail.querySelector('img[src="/brand/gui-login.webp"]'),
      ).toBeInTheDocument();
      expect(screen.getByText(copy)).toBeInTheDocument();
    },
  );

  it("normalizes the email without changing password whitespace", async () => {
    renderRoute(<Login />);
    submitLogin("  GUI@Example.COM  ", "  senha com espaços  ");

    await waitFor(() => {
      expect(mocks.signIn).toHaveBeenCalledWith(
        "gui@example.com",
        "  senha com espaços  ",
      );
    });
  });

  it("navigates to the member area after a successful login", async () => {
    render(
      <MemoryRouter
        initialEntries={["/login"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<h1>Área logada</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    submitLogin();

    expect(
      await screen.findByRole("heading", { name: "Área logada" }),
    ).toBeInTheDocument();
  });

  it("shows the existing destructive toast when login fails", async () => {
    mocks.signIn.mockResolvedValueOnce({
      error: new Error("invalid credentials"),
    });
    renderRoute(<Login />);

    submitLogin();

    await waitFor(() => {
      expect(mocks.toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Email ou senha incorretos. Verifique suas credenciais.",
      });
    });
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });

  it("disables login submission while authentication is pending", async () => {
    const request = deferred<{ error: Error | null }>();
    mocks.signIn.mockReturnValueOnce(request.promise);
    renderRoute(<Login />);

    submitLogin();

    expect(screen.getByRole("button", { name: "Entrando..." })).toBeDisabled();

    await act(async () => {
      request.resolve({ error: new Error("invalid credentials") });
      await request.promise;
    });

    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });

  it("keeps recovery on the RealFrame shell without exposing the codename", () => {
    renderRoute(<ForgotPassword />);

    expect(
      screen.getByRole("heading", { name: "Recuperar senha", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/terminal premium/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /fazer login/i })).toHaveClass(
      "min-h-11",
    );
  });

  it("announces successful recovery after sending the normalized email", async () => {
    const request = deferred<{ error: Error | null }>();
    mocks.resetPasswordForEmail.mockReturnValueOnce(request.promise);
    renderRoute(<ForgotPassword />);

    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();

    submitRecovery("  GUI@Example.COM  ");

    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();

    await act(async () => {
      request.resolve({ error: null });
      await request.promise;
    });

    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
      "gui@example.com",
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );
    expect(
      within(status).getByRole("heading", { name: "Email enviado" }),
    ).toBeInTheDocument();
    expect(
      within(status).getByRole("link", { name: /voltar para o login/i }),
    ).toHaveAttribute("href", "/login");
  });

  it("keeps recovery available and shows the existing toast when Supabase fails", async () => {
    mocks.resetPasswordForEmail.mockResolvedValueOnce({
      error: new Error("service unavailable"),
    });
    renderRoute(<ForgotPassword />);

    submitRecovery();

    await waitFor(() => {
      expect(mocks.toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o email. Tente novamente.",
      });
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(
      screen.getByRole("button", { name: /enviar link de recuperação/i }),
    ).toBeEnabled();
  });
});
