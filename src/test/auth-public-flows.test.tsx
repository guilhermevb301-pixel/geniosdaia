import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </MemoryRouter>,
  );
}

function fillRegistration({
  email = "gui@example.com",
  phone = "11999999999",
  password = "Senha123",
  confirmation = password,
} = {}) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: phone } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: password } });
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

  it("uses the compact RealFrame authentication shell and 44px controls", () => {
    const { container } = renderRoute(<Register />);

    expect(screen.getByRole("heading", { name: "RealFrame IA", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Criar conta", level: 2 })).toBeInTheDocument();
    expect(screen.queryByText(/automação|workflows|terminal premium/i)).not.toBeInTheDocument();

    const rail = screen.getByRole("complementary");
    const shell = rail.closest("section");
    expect(shell).toHaveClass(
      "grid-rows-[auto_1fr]",
      "lg:grid-rows-1",
      "lg:grid-cols-[0.72fr_1.28fr]",
    );
    expect(rail.firstElementChild).toHaveClass("h-14", "w-14", "sm:h-20", "sm:w-20");
    expect(container.firstElementChild).toHaveClass("overflow-x-hidden", "bg-[#0b0d10]");

    for (const field of ["Email", /telefone/i, "Senha", "Confirmar Senha"]) {
      expect(screen.getByLabelText(field)).toHaveClass("h-11");
    }
    expect(screen.getByRole("button", { name: /criar conta/i })).toHaveClass(
      "h-11",
      "bg-[#34d399]",
    );
    expect(screen.getByRole("link", { name: /fazer login/i })).toHaveClass("min-h-11");
  });

  it("keeps sign-up, success toast and login navigation behavior", async () => {
    render(
      <MemoryRouter
        initialEntries={["/register"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<h1>Login de destino</h1>} />
        </Routes>
      </MemoryRouter>,
    );

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
    expect(await screen.findByRole("heading", { name: "Login de destino" })).toBeInTheDocument();
  });

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
      description: "A senha deve conter pelo menos uma letra maiúscula e um número",
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

  it("keeps the session active, avoids external checkout and offers valid member routes", () => {
    const { container } = renderRoute(<AcessoNegado />);

    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(screen.queryByRole("link", { name: /comprar/i })).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="http"]')).not.toBeInTheDocument();
    expect(screen.queryByText(/kiwify|seu-produto/i)).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /meus produtos/i })).toHaveAttribute(
      "href",
      "/meus-produtos",
    );
    expect(screen.getByRole("link", { name: /voltar para as aulas/i })).toHaveAttribute(
      "href",
      "/aulas",
    );
  });

  it("uses the RealFrame shell and sends signed-out visitors to login", () => {
    mocks.user = null;
    renderRoute(<AcessoNegado />);

    expect(screen.getByRole("heading", { name: "RealFrame IA", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Acesso não liberado", level: 2 })).toBeInTheDocument();
    const rail = screen.getByRole("complementary");
    expect(rail.firstElementChild).toHaveClass("h-14", "w-14", "sm:h-20", "sm:w-20");
    expect(screen.getByRole("link", { name: /ir para o login/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /ir para o login/i })).toHaveClass("h-11");
    expect(within(rail).getByText(/acesso da conta/i)).toBeInTheDocument();
  });
});
