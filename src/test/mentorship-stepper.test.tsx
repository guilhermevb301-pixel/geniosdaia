import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  MentorshipStepper,
  buildMentorshipWhatsAppUrl,
} from "@/components/mentoria/MentorshipStepper";
import Mentoria from "@/pages/Mentoria";

vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

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

  it("encodes all answers in the WhatsApp URL", () => {
    const url = buildMentorshipWhatsAppUrl({
      name: "Gui",
      interest: "Automação",
      objective: "Vender agentes",
    });

    expect(url).toContain("wa.me/5571981939047");
    expect(decodeURIComponent(url)).toContain("Gui");
    expect(decodeURIComponent(url)).toContain("Automação");
    expect(decodeURIComponent(url)).toContain("Vender agentes");
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
});
