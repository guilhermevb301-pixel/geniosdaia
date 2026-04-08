import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const body = await req.json();
    const event = body?.event;
    const email = body?.customer?.email?.toLowerCase()?.trim();

    console.log(`Kiwify webhook received: event=${event}, email=${email}`);

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
      const { error } = await supabase
        .from("compradores_autorizados")
        .upsert({ email }, { onConflict: "email" });

      if (error) {
        console.error("Error inserting buyer:", error);
      } else {
        console.log(`Buyer authorized: ${email}`);
      }
    } else if (
      event === "compra_reembolsada" ||
      event === "chargeback" ||
      event === "subscription_canceled"
    ) {
      const { error } = await supabase
        .from("compradores_autorizados")
        .delete()
        .eq("email", email);

      if (error) {
        console.error("Error removing buyer:", error);
      } else {
        console.log(`Buyer removed: ${email}`);
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
