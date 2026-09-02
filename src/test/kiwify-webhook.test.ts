import { describe, expect, it } from "vitest";
import {
  getCustomerFromPayload,
  getWebhookEventType,
  getProductSlugsToGrant,
  isApprovalEvent,
  isRevocationEvent,
} from "../../supabase/functions/kiwify-webhook/kiwify";

describe("kiwify webhook helpers", () => {
  it("recognizes the current Kiwify approved order event", () => {
    const payload = {
      webhook_event_type: "order_approved",
      Customer: {
        email: " ALUNO@EXEMPLO.COM ",
        full_name: "Aluno Teste",
        mobile: "+55 11 99999-9999",
      },
    };

    expect(getWebhookEventType(payload)).toBe("order_approved");
    expect(isApprovalEvent(payload)).toBe(true);
    expect(isRevocationEvent(payload)).toBe(false);
    expect(getCustomerFromPayload(payload)).toEqual({
      email: "aluno@exemplo.com",
      name: "Aluno Teste",
      phone: "+55 11 99999-9999",
    });
  });

  it("keeps the legacy approved event working", () => {
    expect(isApprovalEvent({ event: "compra_aprovada" })).toBe(true);
  });

  it("unlocks all modules when the Gênios da IA product is bought", () => {
    expect(getProductSlugsToGrant("genios-ia")).toEqual([
      "genios-ia",
      "agente-atendimento",
      "banco-prompts",
      "videos-cinematograficos",
      "fotos-profissionais",
      "influencer-ia",
      "clone-criativo",
    ]);
  });

  it("unlocks only the purchased product for standalone courses", () => {
    expect(getProductSlugsToGrant("agente-atendimento")).toEqual([
      "agente-atendimento",
    ]);
  });

  it("recognizes refund, chargeback, and subscription cancellation events", () => {
    expect(isRevocationEvent({ webhook_event_type: "order_refunded" })).toBe(true);
    expect(isRevocationEvent({ webhook_event_type: "chargeback" })).toBe(true);
    expect(isRevocationEvent({ webhook_event_type: "subscription_canceled" })).toBe(true);
  });
});
