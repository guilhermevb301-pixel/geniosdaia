import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_PRODUCTS = [
  "genios-ia",
  "agente-atendimento",
  "banco-prompts",
  "videos-cinematograficos",
  "fotos-profissionais",
  "influencer-ia",
  "clone-criativo",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Produto identificado pelo query param: ?product=agente-atendimento
    const url = new URL(req.url);
    const productSlug = (url.searchParams.get("product") || "genios-ia") as typeof VALID_PRODUCTS[number];

    if (!VALID_PRODUCTS.includes(productSlug)) {
      console.error(`Invalid product slug: ${productSlug}`);
      return new Response(JSON.stringify({ error: "Invalid product" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const event = body?.event;
    const email = body?.customer?.email?.toLowerCase()?.trim();

    console.log(`Kiwify webhook: event=${event}, product=${productSlug}, email=${email}`);

    if (!email) {
      console.log("No email found in payload");
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event === "compra_aprovada") {
      // 1. Autoriza acesso geral à plataforma
      await supabase
        .from("compradores_autorizados")
        .upsert({ email }, { onConflict: "email" });

      // 2. Registra produto específico comprado
      const { error: productError } = await supabase
        .from("user_products")
        .upsert({ email, product_slug: productSlug }, { onConflict: "email,product_slug" });

      if (productError) {
        console.error("Error inserting user_product:", productError);
      } else {
        console.log(`Product ${productSlug} unlocked for ${email}`);
      }

      // 3. Gênios da IA libera todos os produtos
      if (productSlug === "genios-ia") {
        for (const slug of VALID_PRODUCTS) {
          if (slug !== "genios-ia") {
            await supabase
              .from("user_products")
              .upsert({ email, product_slug: slug }, { onConflict: "email,product_slug" });
          }
        }
        console.log(`All products unlocked for ${email}`);
      }

      // 4. Cria conta com senha 123456 (se ainda não existe)
      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        password: "123456",
        email_confirm: true,
      });

      if (createError && !createError.message.includes("already registered")) {
        console.error("Error creating auth user:", createError);
      } else if (!createError) {
        console.log(`Auth user created for ${email}`);
      }
    } else if (
      event === "compra_reembolsada" ||
      event === "chargeback" ||
      event === "subscription_canceled"
    ) {
      // Remove produto específico
      await supabase
        .from("user_products")
        .delete()
        .eq("email", email)
        .eq("product_slug", productSlug);

      // Se não tem mais nenhum produto, remove acesso geral
      const { data: remaining } = await supabase
        .from("user_products")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (!remaining || remaining.length === 0) {
        await supabase.from("compradores_autorizados").delete().eq("email", email);
        console.log(`All access removed for ${email}`);
      } else {
        console.log(`Product ${productSlug} removed for ${email}, others remain`);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
