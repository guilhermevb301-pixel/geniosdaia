import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResetPassword from "@/pages/ResetPassword";

const mocks = vi.hoisted(() => ({
  toast: vi.fn(),
  updateUser: vi.fn(),
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
    mocks.updateUser.mockResolvedValue({ error: null });
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
      expect(field).toHaveAttribute("minlength", "6");
      expect(field).toHaveAttribute("autocomplete", "new-password");
    }
  });

  it.each([
    {
      name: "a password shorter than the Supabase-compatible minimum",
      password: "12345",
      confirmation: "12345",
      description: "A senha deve ter no mínimo 6 caracteres.",
    },
    {
      name: "a confirmation that does not match",
      password: "123456",
      confirmation: "654321",
      description: "As senhas não coincidem.",
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

  it("accepts 123456, disables duplicate submission and exposes the successful return to login", async () => {
    const request = deferred<{ error: Error | null }>();
    mocks.updateUser.mockReturnValueOnce(request.promise);
    renderPage();

    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();
    submitNewPassword("123456", "123456");

    expect(screen.getByRole("button", { name: "Atualizando..." })).toBeDisabled();
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: "123456" });

    await act(async () => {
      request.resolve({ error: null });
      await request.promise;
    });

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

    submitNewPassword("123456", "123456");

    await waitFor(() => {
      expect(mocks.toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: "Não foi possível atualizar sua senha. Solicite um novo link e tente novamente.",
      });
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.getByRole("button", { name: /salvar nova senha/i })).toBeEnabled();
  });
});
