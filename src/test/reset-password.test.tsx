import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResetPassword from "@/pages/ResetPassword";

const mocks = vi.hoisted(() => ({
  authLoading: false,
  isPasswordRecovery: true,
  signOut: vi.fn(),
  toast: vi.fn(),
  updateUser: vi.fn(),
  user: { id: "existing-user" } as { id: string } | null,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    isPasswordRecovery: mocks.isPasswordRecovery,
    loading: mocks.authLoading,
    signOut: mocks.signOut,
    user: mocks.user,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mocks.toast }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      updateUser: mocks.updateUser,
    },
  },
}));

function renderPage() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ResetPassword />
    </MemoryRouter>,
  );
}

function submitNewPassword(password: string, confirmation: string) {
  fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
    target: { value: confirmation },
  });
  fireEvent.submit(screen.getByRole("button", { name: /salvar nova senha/i }).closest("form")!);
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("ResetPassword public flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authLoading = false;
    mocks.isPasswordRecovery = true;
    mocks.signOut.mockResolvedValue(undefined);
    mocks.updateUser.mockResolvedValue({ error: null });
    mocks.user = { id: "existing-user" };
  });

  it("uses the RealFrame recovery shell and exposes accessible new-password fields", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "RealFrame IA", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Definir nova senha", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveTextContent(/acesso seguro/i);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    for (const name of ["Nova senha", "Confirmar nova senha"]) {
      const field = screen.getByLabelText(name);
      expect(field).toBeRequired();
      expect(field).toHaveAttribute("minlength", "8");
      expect(field).toHaveAttribute("autocomplete", "new-password");
    }
  });

  it.each([
    {
      name: "a password shorter than the shared minimum",
      password: "Senha1",
      confirmation: "Senha1",
      description: "A senha deve ter no mínimo 8 caracteres",
    },
    {
      name: "a password without an uppercase letter",
      password: "senha123",
      confirmation: "senha123",
      description: "A senha deve conter pelo menos uma letra maiúscula e um número",
    },
    {
      name: "a password without a number",
      password: "SenhaForte",
      confirmation: "SenhaForte",
      description: "A senha deve conter pelo menos uma letra maiúscula e um número",
    },
    {
      name: "a confirmation that does not match",
      password: "Senha123",
      confirmation: "Senha456",
      description: "As senhas não coincidem",
    },
  ])("rejects $name before calling Supabase", ({ password, confirmation, description }) => {
    renderPage();

    submitNewPassword(password, confirmation);

    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Erro",
      description,
    });
  });

  it("updates the password, signs out, then exposes the successful return to login", async () => {
    const signOutRequest = deferred<void>();
    mocks.signOut.mockReturnValueOnce(signOutRequest.promise);
    renderPage();

    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();
    submitNewPassword("Senha123", "Senha123");

    expect(screen.getByRole("button", { name: "Atualizando..." })).toBeDisabled();
    await waitFor(() => {
      expect(mocks.updateUser).toHaveBeenCalledWith({ password: "Senha123" });
      expect(mocks.signOut).toHaveBeenCalledOnce();
    });
    expect(screen.queryByRole("heading", { name: "Senha atualizada" })).not.toBeInTheDocument();

    await act(async () => {
      signOutRequest.resolve();
      await signOutRequest.promise;
    });

    expect(mocks.updateUser.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.signOut.mock.invocationCallOrder[0],
    );
    expect(mocks.toast).toHaveBeenCalledWith({
      title: "Senha atualizada",
      description: "Agora você pode entrar com sua nova senha.",
    });
    expect(within(status).getByRole("heading", { name: "Senha atualizada" })).toBeInTheDocument();
    expect(within(status).getByRole("link", { name: /fazer login/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("keeps the form available and reports a Supabase update failure", async () => {
    mocks.updateUser.mockResolvedValueOnce({ error: new Error("expired recovery session") });
    renderPage();

    submitNewPassword("Senha123", "Senha123");

    await waitFor(() => {
      expect(mocks.toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: "Não foi possível atualizar sua senha. Solicite um novo link e tente novamente.",
      });
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.getByRole("button", { name: /salvar nova senha/i })).toBeEnabled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("blocks a preexisting session when PASSWORD_RECOVERY was not emitted", () => {
    mocks.isPasswordRecovery = false;
    renderPage();

    expect(screen.getByRole("heading", { name: /link inválido ou expirado/i })).toBeInTheDocument();
    expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /solicitar novo link/i })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(screen.getByRole("link", { name: /voltar para o login/i })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
});
