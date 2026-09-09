import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { APP_ROUTES } from "@/lib/appRoutes";
import AcessoNegado from "@/pages/AcessoNegado";
import Register from "@/pages/Register";

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  signUp: vi.fn(),
  toast: vi.fn(),
  user: { id: "user-1" } as { id: string } | null,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signOut: mocks.signOut,
    signUp: mocks.signUp,
    user: mocks.user,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mocks.toast }),
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

function renderRegisterRoute() {
  return render(
    <MemoryRouter
      initialEntries={[APP_ROUTES.register]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path={APP_ROUTES.register} element={<Register />} />
        <Route path={APP_ROUTES.login} element={<h1>Login de destino</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillRegistration({
  email = "gui@example.com",
  phone = "11999999999",
  password = "Senha123",
  confirmation = password,
} = {}) {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/telefone/i), {
    target: { value: phone },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Confirmar Senha"), {
    target: { value: confirmation },
  });
}

describe("Register public flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = { id: "user-1" };
    mocks.signUp.mockResolvedValue({ error: null });
  });

  it("presents the semantic RealFrame registration flow without deprecated decoration", () => {
    const { container } = renderRoute(<Register />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Criar conta", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/RealFrame/)).toHaveLength(2);
    const rail = screen.getByRole("complementary");
    expect(
      within(rail).queryByText(/codex, ia e execução real/i),
    ).not.toBeInTheDocument();
    expect(
      rail.querySelector('img[src="/brand/gui-login.webp"]'),
    ).toBeInTheDocument();

    for (const field of ["Email", /telefone/i, "Senha", "Confirmar Senha"]) {
      expect(screen.getByLabelText(field)).toBeRequired();
    }
    expect(screen.getByRole("button", { name: /criar conta/i })).toBeEnabled();
    expect(screen.getByRole("link", { name: /fazer login/i })).toHaveAttribute(
      "href",
      APP_ROUTES.login,
    );

    expect(
      screen.queryByText(/automação|workflows|n8n|gênios|terminal premium/i),
    ).not.toBeInTheDocument();
    expect(container.querySelector('[class*="from-"]')).not.toBeInTheDocument();
    expect(
      container.querySelector('[class*="blur-3xl"]'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[class*="font-serif"]'),
    ).not.toBeInTheDocument();
  });

  it("keeps sign-up, success toast and login navigation behavior", async () => {
    renderRegisterRoute();

    fillRegistration();
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(mocks.signUp).toHaveBeenCalledWith("gui@example.com", "Senha123", {
        phone: "11999999999",
      });
    });
    expect(mocks.toast).toHaveBeenCalledWith({
      title: "Conta criada com sucesso!",
      description: "Verifique seu email para confirmar o cadastro.",
    });
    expect(
      await screen.findByRole("heading", { name: "Login de destino" }),
    ).toBeInTheDocument();
  });

  it.each([
    {
      name: "an email that is already registered",
      error: "User already registered",
      description: "Este email já está cadastrado. Tente fazer login.",
    },
    {
      name: "a generic sign-up failure",
      error: "service unavailable",
      description: "Não foi possível criar sua conta. Tente novamente.",
    },
  ])(
    "shows the exact error toast and stays on registration for $name",
    async ({ error, description }) => {
      mocks.signUp.mockResolvedValueOnce({ error: new Error(error) });
      renderRegisterRoute();

      fillRegistration();
      fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

      await waitFor(() => {
        expect(mocks.toast).toHaveBeenCalledWith({
          variant: "destructive",
          title: "Erro ao criar conta",
          description,
        });
      });
      expect(
        screen.getByRole("heading", { name: "Criar conta" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Login de destino" }),
      ).not.toBeInTheDocument();
    },
  );

  it.each([
    {
      name: "mismatched passwords",
      values: { password: "Senha123", confirmation: "Senha456" },
      description: "As senhas não coincidem",
    },
    {
      name: "short password",
      values: { password: "Sen1", confirmation: "Sen1" },
      description: "A senha deve ter no mínimo 8 caracteres",
    },
    {
      name: "password without required complexity",
      values: { password: "senhasemnumero", confirmation: "senhasemnumero" },
      description:
        "A senha deve conter pelo menos uma letra maiúscula e um número",
    },
    {
      name: "phone without DDD",
      values: { phone: "999999999" },
      description: "Digite um número de telefone válido com DDD",
    },
  ])("preserves the $name validation", ({ values, description }) => {
    renderRoute(<Register />);
    fillRegistration(values);
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Erro",
      description,
    });
  });
});

describe("AcessoNegado public flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = { id: "user-1" };
  });

  it("keeps the session active and offers only public recovery actions", () => {
    const { container } = renderRoute(<AcessoNegado />);

    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("link", { name: /comprar/i }),
    ).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="http"]')).not.toBeInTheDocument();
    expect(screen.queryByText(/kiwify|seu-produto/i)).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: /meus produtos/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /voltar para as aulas/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reverificar acesso/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /usar outra conta/i }),
    ).toHaveAttribute("href", APP_ROUTES.login);
  });

  it("reloads the public access check without signing the user out", () => {
    const originalLocation = window.location;
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload },
    });

    try {
      renderRoute(<AcessoNegado />);
      fireEvent.click(
        screen.getByRole("button", { name: /reverificar acesso/i }),
      );

      expect(reload).toHaveBeenCalledOnce();
      expect(mocks.signOut).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    }
  });

  it("uses the RealFrame shell and sends signed-out visitors to login", () => {
    mocks.user = null;
    renderRoute(<AcessoNegado />);

    expect(
      screen.getByRole("heading", { name: "RealFrame IA", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Acesso não liberado", level: 2 }),
    ).toBeInTheDocument();
    const rail = screen.getByRole("complementary");
    expect(within(rail).getByText(/acesso da conta/i)).toBeInTheDocument();
    expect(within(rail).queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /usar outra conta/i }),
    ).toHaveAttribute("href", APP_ROUTES.login);
  });
});
