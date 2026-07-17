import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Slugs válidos — espelha o kiwify-webhook
const VALID_PRODUCTS = [
  "genios-ia",
  "agente-atendimento",
  "banco-prompts",
  "videos-cinematograficos",
  "fotos-profissionais",
  "influencer-ia",
  "clone-criativo",
] as const;

const DEFAULT_PASSWORD = "123456";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Client com service_role para operações privilegiadas
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // 1. Autentica o chamador e garante que é admin
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return json({ error: "Não autenticado" }, 401);
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return json({ error: "Não autenticado" }, 401);
    }

    const { data: adminRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRow) {
      return json({ error: "Apenas administradores podem criar usuários" }, 403);
    }

    // 2. Lê e valida o body
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").toLowerCase().trim();
    const name = String(body?.name ?? "").trim();
    const password = String(body?.password ?? "").trim() || DEFAULT_PASSWORD;
    const requested: string[] = Array.isArray(body?.products) ? body.products : [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "E-mail inválido" }, 400);
    }

    // Filtra apenas slugs válidos
    let products = requested.filter((p) => (VALID_PRODUCTS as readonly string[]).includes(p));
    // Gênios da IA libera todos os produtos (mesma regra do webhook)
    if (products.includes("genios-ia")) {
      products = [...VALID_PRODUCTS];
    }

    // 3. Cria a conta de auth (se ainda não existe)
    let userExisted = false;
    let createdUserId: string | null = null;

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: name ? { display_name: name } : undefined,
    });

    if (createError) {
      const msg = createError.message?.toLowerCase() ?? "";
      if (msg.includes("already") && msg.includes("registered")) {
        userExisted = true;
      } else if (msg.includes("already been registered") || msg.includes("email address")) {
        userExisted = true;
      } else {
        console.error("createUser error:", createError);
        return json({ error: `Erro ao criar conta: ${createError.message}` }, 400);
      }
    } else {
      createdUserId = created?.user?.id ?? null;
    }

    // 4. Autoriza acesso geral à plataforma (por email)
    const { error: authErr } = await admin
      .from("compradores_autorizados")
      .upsert({ email }, { onConflict: "email" });
    if (authErr) console.error("compradores_autorizados error:", authErr);

    // 5. Libera os produtos comprados (por email)
    for (const slug of products) {
      const { error: prodErr } = await admin
        .from("user_products")
        .upsert({ email, product_slug: slug }, { onConflict: "email,product_slug" });
      if (prodErr) console.error(`user_products error (${slug}):`, prodErr);
    }

    // 6. Atualiza o nome no profile (quando a conta acabou de ser criada)
    if (name && createdUserId) {
      const { error: profErr } = await admin
        .from("profiles")
        .upsert({ user_id: createdUserId, display_name: name }, { onConflict: "user_id" });
      if (profErr) console.error("profiles error:", profErr);
    }

    console.log(
      `admin-create-user: ${email} (existia=${userExisted}) produtos=[${products.join(", ")}] por admin=${user.id}`
    );

    return json({
      ok: true,
      email,
      userExisted,
      products,
      password: userExisted ? null : password,
    });
  } catch (err) {
    console.error("admin-create-user fatal:", err);
    return json({ error: "Erro interno ao criar usuário" }, 500);
  }
});
