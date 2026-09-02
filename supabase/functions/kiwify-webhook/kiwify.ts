export const ACCESS_PASSWORD = "123456";

export const VALID_PRODUCTS = [
  "genios-ia",
  "agente-atendimento",
  "banco-prompts",
  "videos-cinematograficos",
  "fotos-profissionais",
  "influencer-ia",
  "clone-criativo",
] as const;

export type ProductSlug = (typeof VALID_PRODUCTS)[number];

export const PRODUCT_NAMES: Record<ProductSlug, string> = {
  "genios-ia": "Gênios da IA",
  "agente-atendimento": "Agente de Atendimento IA + Claude Code",
  "banco-prompts": "Banco de 200 Prompts",
  "videos-cinematograficos": "Vídeos Cinematográficos com IA",
  "fotos-profissionais": "Fotos Profissionais com IA",
  "influencer-ia": "Influencer de IA Ultra-realista",
  "clone-criativo": "Método Clone Criativo",
};

const APPROVAL_EVENTS = new Set([
  "order_approved",
  "compra_aprovada",
]);

const REVOCATION_EVENTS = new Set([
  "order_refunded",
  "compra_reembolsada",
  "refund",
  "refunded",
  "chargeback",
  "subscription_canceled",
]);

interface CustomerInfo {
  email: string;
  name: string;
  phone: string;
}

export function isValidProductSlug(slug: string): slug is ProductSlug {
  return (VALID_PRODUCTS as readonly string[]).includes(slug);
}

export function getWebhookEventType(payload: Record<string, unknown>): string {
  return String(
    payload?.webhook_event_type ||
      payload?.event ||
      payload?.event_type ||
      payload?.type ||
      "",
  )
    .trim()
    .toLowerCase();
}

export function isApprovalEvent(payload: Record<string, unknown>): boolean {
  return APPROVAL_EVENTS.has(getWebhookEventType(payload));
}

export function isRevocationEvent(payload: Record<string, unknown>): boolean {
  return REVOCATION_EVENTS.has(getWebhookEventType(payload));
}

export function getProductSlugsToGrant(productSlug: ProductSlug): ProductSlug[] {
  if (productSlug === "genios-ia") {
    return [...VALID_PRODUCTS];
  }

  return [productSlug];
}

export function getCustomerFromPayload(payload: Record<string, unknown>): CustomerInfo {
  const customer = getObject(payload.Customer) || getObject(payload.customer) || {};

  const email = String(customer.email || "")
    .trim()
    .toLowerCase();

  const name = String(
    customer.full_name ||
      customer.name ||
      customer.first_name ||
      "Aluno",
  ).trim();

  const phone = String(
    customer.mobile ||
      customer.phone ||
      customer.phone_number ||
      "",
  ).trim();

  return {
    email,
    name: name || "Aluno",
    phone,
  };
}

function getObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
