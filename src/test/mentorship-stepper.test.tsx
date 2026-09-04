import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MentorshipStepper,
  buildMentorshipWhatsAppUrl,
} from "@/components/mentoria/MentorshipStepper";
import Mentoria from "@/pages/Mentoria";

vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MentorshipStepper", () => {
  it("reveals one question at a time", () => {
    render(<MentorshipStepper onComplete={vi.fn()} />);

    expect(screen.getByLabelText(/seu nome/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/principal área/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/seu nome/i), {
      target: { value: "Guilherme" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    expect(screen.getByLabelText(/principal área/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/seu nome/i)).not.toBeInTheDocument();
  });

  it("encodes reserved characters without changing the WhatsApp URL structure", () => {
    const url = buildMentorshipWhatsAppUrl({
      name: "Gui & Téo",
      interest: "IA + vendas?",
      objective: "Vender 10% #meta\nsem perder ritmo",
    });
    const parsedUrl = new URL(url);

    expect(parsedUrl.origin).toBe("https://wa.me");
    expect(parsedUrl.pathname).toBe("/5571981939047");
    expect(parsedUrl.hash).toBe("");
    expect(parsedUrl.searchParams.get("text")).toBe(
      "Olá, Gui! Meu nome é Gui & Téo. Tenho interesse em IA + vendas?. Meu objetivo com a mentoria é Vender 10% #meta\nsem perder ritmo.",
    );
    expect(url).toEqual(expect.stringContaining("%26"));
    expect(url).toEqual(expect.stringContaining("%2B"));
    expect(url).toEqual(expect.stringContaining("%3F"));
    expect(url).toEqual(expect.stringContaining("%25"));
    expect(url).toEqual(expect.stringContaining("%23"));
    expect(url).toEqual(expect.stringContaining("%0A"));
  });

  it("disables forward navigation while the current answer is blank", () => {
    render(<MentorshipStepper onComplete={vi.fn()} />);

    const continueButton = screen.getByRole("button", { name: /continuar/i });
    expect(continueButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/seu nome/i), {
      target: { value: "   " },
    });
    expect(continueButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/seu nome/i), {
      target: { value: "Gui" },
    });
    expect(continueButton).toBeEnabled();
  });

  it("moves back without losing answers and reports progress", () => {
    render(<MentorshipStepper onComplete={vi.fn()} />);

    expect(screen.getByText("Etapa 1 de 3")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");

    fireEvent.change(screen.getByLabelText(/seu nome/i), {
      target: { value: "Guilherme" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    expect(screen.getByText("Etapa 2 de 3")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));

    expect(screen.getByLabelText(/seu nome/i)).toHaveValue("Guilherme");
  });

  it("keeps visual and keyboard order aligned for step actions", () => {
    render(<MentorshipStepper onComplete={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/seu nome/i), {
      target: { value: "Guilherme" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    const backButton = screen.getByRole("button", { name: /voltar/i });
    const actionGroup = backButton.parentElement;

    expect(actionGroup).toHaveClass("flex-col", "sm:flex-row");
    expect(actionGroup).not.toHaveClass("flex-col-reverse");
    expect(
      Array.from(actionGroup?.querySelectorAll("button") ?? []).map((button) =>
        button.textContent?.trim(),
      ),
    ).toEqual(["Voltar", "Continuar"]);
  });

  it("completes with the encoded URL without opening WhatsApp itself", () => {
    let completedUrl = "";

    render(
      <MentorshipStepper
        onComplete={(url) => {
          completedUrl = url;
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText(/seu nome/i), {
      target: { value: "Gui" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    fireEvent.change(screen.getByLabelText(/principal área/i), {
      target: { value: "Automatizações com IA" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    expect(screen.getByLabelText(/seu objetivo/i)).toBeInTheDocument();
    const finalButton = screen.getByRole("button", {
      name: /conversar no whatsapp/i,
    });
    expect(finalButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/seu objetivo/i), {
      target: { value: "Vender agentes" },
    });
    fireEvent.click(finalButton);

    expect(decodeURIComponent(completedUrl)).toContain("Gui");
    expect(decodeURIComponent(completedUrl)).toContain("Automatizações com IA");
    expect(decodeURIComponent(completedUrl)).toContain("Vender agentes");
  });
});

describe("Mentoria page", () => {
  it("puts the focused application before mentorship expectations on mobile", () => {
    render(<Mentoria />);

    expect(screen.getByLabelText(/seu nome/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/principal área/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("mentoria-stepper-column")).toHaveClass("order-1", "lg:order-2");
    expect(screen.getByTestId("mentoria-value-column")).toHaveClass("order-2", "lg:order-1");
  });

  it("opens the generated WhatsApp URL with an isolated browsing context", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<Mentoria />);

    fireEvent.change(screen.getByLabelText(/seu nome/i), {
      target: { value: "Gui & Téo" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    fireEvent.change(screen.getByLabelText(/principal área/i), {
      target: { value: "Automatizações com IA" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    fireEvent.change(screen.getByLabelText(/seu objetivo/i), {
      target: { value: "Vender 10% #meta" },
    });
    fireEvent.click(screen.getByRole("button", { name: /conversar no whatsapp/i }));

    expect(openSpy).toHaveBeenCalledOnce();
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/5571981939047?text="),
      "_blank",
      "noopener,noreferrer",
    );

    const [openedUrl] = openSpy.mock.calls[0];
    const parsedUrl = new URL(String(openedUrl));
    expect(parsedUrl.searchParams.get("text")).toBe(
      "Olá, Gui! Meu nome é Gui & Téo. Tenho interesse em Automatizações com IA. Meu objetivo com a mentoria é Vender 10% #meta.",
    );
  });
});
