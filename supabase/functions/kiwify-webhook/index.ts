import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ACCESS_PASSWORD,
  PRODUCT_NAMES,
  ProductSlug,
  getCustomerFromPayload,
  getProductSlugsToGrant,
  getWebhookEventType,
  isApprovalEvent,
  isRevocationEvent,
  isValidProductSlug,
} from "./kiwify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function sendWhatsAppWithEmail(
  phone: string,
  name: string,
  email: string,
  productSlug: ProductSlug,
) {
  const apiUrl = Deno.env.get("EVOLUTION_API_URL");
  const apiKey = Deno.env.get("EVOLUTION_API_KEY");
  const instance = Deno.env.get("EVOLUTION_INSTANCE");

  if (!apiUrl || !apiKey || !instance) {
    console.log("Evolution API env vars not set, skipping WhatsApp");
    return;
  }

  const number = phone.replace(/\D/g, "");
  const productName = PRODUCT_NAMES[productSlug] || productSlug;

  const text =
    `Olá, ${name}! 🎉\n\n` +
    `Sua compra foi confirmada! Seja bem-vindo(a) ao *${productName}*!\n\n` +
    `🔗 *Acesse sua área de membros:*\nhttps://membrosgenios.com/\n\n` +
    `📧 *Login:* ${email}\n` +
    `🔑 *Senha de acesso:* ${ACCESS_PASSWORD}\n\n` +
    `Qualquer dúvida é só chamar. Bons estudos! 🚀`;

  const url = `${apiUrl}/message/sendText/${encodeURIComponent(instance)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({ number, text }),
  });

  if (!res.ok) {
    const responseText = await res.text();
    console.error("WhatsApp send failed:", responseText);
    return;
  }

  console.log("WhatsApp sent");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const url = new URL(req.url);
    const productSlug = url.searchParams.get("product") || "genios-ia";

    if (!isValidProductSlug(productSlug)) {
      console.error(`Invalid product slug: ${productSlug}`);
      return jsonResponse({ error: "Invalid product" }, 400);
    }

    const rawBody = await req.text();
    const signature = url.searchParams.get("signature");
    const token = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");

    const signatureResult = await verifyKiwifySignature(
      rawBody,
      signature,
      token,
    );

    if (!signatureResult.ok) {
      console.error("Invalid Kiwify webhook signature");
      return jsonResponse({ error: "Invalid signature" }, 401);
    }

    if (signatureResult.skipped) {
      console.warn("KIWIFY_WEBHOOK_TOKEN not set, signature check skipped");
    }

    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const eventType = getWebhookEventType(body);
    const customer = getCustomerFromPayload(body);

    console.log(
      `Kiwify webhook: event=${eventType}, product=${productSlug}, email=${customer.email}`,
    );

    if (!customer.email) {
      console.warn("No customer email found in Kiwify payload");
      return jsonResponse({ ok: true, ignored: "missing_email" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (isApprovalEvent(body)) {
      await createAuthUserIfNeeded(supabase, customer);
      await authorizeBuyer(supabase, customer.email);
      await grantProducts(supabase, customer.email, productSlug);

      if (customer.phone) {
        await sendWhatsAppWithEmail(
          customer.phone,
          customer.name,
          customer.email,
          productSlug,
        );
      }

      return jsonResponse({ ok: true, action: "granted" });
    }

    if (isRevocationEvent(body)) {
      await revokeProducts(supabase, customer.email, productSlug);
      await removeBuyerIfNoProductsRemain(supabase, customer.email);
      return jsonResponse({ ok: true, action: "revoked" });
    }

    console.log(`Ignored Kiwify event: ${eventType || "unknown"}`);
    return jsonResponse({ ok: true, ignored: eventType || "unknown_event" });
  } catch (err) {
    console.error("Webhook error:", err);
    return jsonResponse({ error: "Webhook processing failed" }, 500);
  }
});

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createAuthUserIfNeeded(
  supabase: ReturnType<typeof createClient>,
  customer: ReturnType<typeof getCustomerFromPayload>,
) {
  const { error } = await supabase.auth.admin.createUser({
    email: customer.email,
    password: ACCESS_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: customer.name,
      phone: customer.phone || null,
      source: "kiwify",
    },
  });

  if (!error) {
    console.log(`Auth user created for ${customer.email}`);
    return;
  }

  if (isAlreadyRegisteredError(error.message)) {
    console.log(`Auth user already exists for ${customer.email}`);
    return;
  }

  throw error;
}

async function authorizeBuyer(
  supabase: ReturnType<typeof createClient>,
  email: string,
) {
  const { error } = await supabase
    .from("compradores_autorizados")
    .upsert({ email }, { onConflict: "email" });

  if (error) throw error;
}

async function grantProducts(
  supabase: ReturnType<typeof createClient>,
  email: string,
  productSlug: ProductSlug,
) {
  for (const slug of getProductSlugsToGrant(productSlug)) {
    const { error } = await supabase
      .from("user_products")
      .upsert({ email, product_slug: slug }, { onConflict: "email,product_slug" });

    if (error) throw error;
  }

  console.log(`Products unlocked for ${email}: ${getProductSlugsToGrant(productSlug).join(", ")}`);
}

async function revokeProducts(
  supabase: ReturnType<typeof createClient>,
  email: string,
  productSlug: ProductSlug,
) {
  const slugs = getProductSlugsToGrant(productSlug);
  const { error } = await supabase
    .from("user_products")
    .delete()
    .eq("email", email)
    .in("product_slug", slugs);

  if (error) throw error;
}

async function removeBuyerIfNoProductsRemain(
  supabase: ReturnType<typeof createClient>,
  email: string,
) {
  const { data, error } = await supabase
    .from("user_products")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (error) throw error;

  if (!data || data.length === 0) {
    const { error: deleteError } = await supabase
      .from("compradores_autorizados")
      .delete()
      .eq("email", email);

    if (deleteError) throw deleteError;
    console.log(`All access removed for ${email}`);
  }
}

function isAlreadyRegisteredError(message: string) {
  return /already (registered|exists)|already been registered/i.test(message);
}

async function verifyKiwifySignature(
  rawBody: string,
  signature: string | null,
  token: string | undefined,
) {
  if (!token) {
    return { ok: true, skipped: true };
  }

  if (!signature) {
    return { ok: false, skipped: false };
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(token),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return {
    ok: timingSafeEqual(expected.toLowerCase(), signature.toLowerCase()),
    skipped: false,
  };
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
