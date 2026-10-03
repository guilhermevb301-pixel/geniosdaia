#!/usr/bin/env node
/*
 * Publica o Prontuário do Dr. Mizael de ponta a ponta:
 *   1. gera o build (arquivo único dist/index.html)
 *   2. cria/atualiza o banco no Supabase (tabelas, RLS, bucket de imagens, limite de contas)
 *   3. publica na Vercel como  https://mizaelprontuario.vercel.app
 *   4. configura o login do Supabase para esse endereço
 *   5. (opcional) cria a conta do Dr. Mizael
 *   6. confere se está tudo no ar
 *
 * Uso:  SUPABASE_ACCESS_TOKEN=sbp_... VERCEL_TOKEN=... node scripts/publicar.mjs
 * Opcionais: DOCTOR_EMAIL + DOCTOR_PASSWORD (cria a conta), VERCEL_TEAM_ID, PROJECT_NAME
 * Nenhuma chave é impressa na tela.
 */
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REF = "wubzprfmwsfvwvptywlf";
const SUPABASE_URL = `https://${REF}.supabase.co`;
const PROJECT = process.env.PROJECT_NAME || "mizaelprontuario";
const SB_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const VC_TOKEN = process.env.VERCEL_TOKEN;
const args = new Set(process.argv.slice(2));

const ok = (m) => console.log(`  \x1b[32m✔\x1b[0m ${m}`);
const warn = (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`);
const step = (m) => console.log(`\n\x1b[1m▸ ${m}\x1b[0m`);
const fail = (m) => {
  console.error(`\n\x1b[31m✘ ${m}\x1b[0m`);
  process.exit(1);
};

if (!SB_TOKEN && !args.has("--sem-supabase")) fail("Defina SUPABASE_ACCESS_TOKEN (supabase.com/dashboard/account/tokens).");
if (!VC_TOKEN && !args.has("--sem-vercel")) fail("Defina VERCEL_TOKEN (vercel.com/account/tokens).");

async function http(url, { method = "GET", headers = {}, body, raw } = {}) {
  const res = await fetch(url, {
    method,
    headers: { ...(body && !raw ? { "Content-Type": "application/json" } : {}), ...headers },
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, ok: res.ok, json };
}

/* ---------------- Supabase ---------------- */
const mgmt = (method, path, body) =>
  http(`https://api.supabase.com/v1/projects/${REF}${path}`, { method, body, headers: { Authorization: `Bearer ${SB_TOKEN}` } });

async function sql(query) {
  const r = await mgmt("POST", "/database/query", { query });
  if (!r.ok) throw new Error(`SQL falhou (${r.status}): ${JSON.stringify(r.json).slice(0, 400)}`);
  return r.json;
}

async function setupDatabase() {
  step("Banco de dados (Supabase)");
  await sql(readFileSync(join(ROOT, "supabase/schema.sql"), "utf8"));
  const tables = await sql(
    "select table_name from information_schema.tables where table_schema = 'public' and table_name in ('patients','appointments','clinic_settings') order by 1",
  );
  if (tables.length !== 3) throw new Error("tabelas não foram criadas");
  ok(`tabelas: ${tables.map((t) => t.table_name).join(", ")}`);
  const rls = await sql("select relname from pg_class where relname in ('patients','appointments','clinic_settings') and relrowsecurity");
  if (rls.length !== 3) throw new Error("RLS não está ativo em todas as tabelas");
  ok("segurança por usuário (RLS) ativa");
  const bucket = await sql("select id, public from storage.buckets where id = 'prontuario'");
  if (!bucket.length || bucket[0].public) throw new Error("bucket 'prontuario' ausente ou público");
  ok("bucket privado de imagens: prontuario");
  const users = await sql("select count(*)::int as n from auth.users");
  ok(`contas existentes: ${users[0].n} (limite: 3)`);
}

async function configureAuth(siteUrl) {
  step("Login (Supabase Auth)");
  const r = await mgmt("PATCH", "/config/auth", {
    site_url: siteUrl,
    uri_allow_list: `${siteUrl},${siteUrl}/**,http://localhost:5174/**`,
    mailer_autoconfirm: true,
    disable_signup: false,
  });
  if (!r.ok) throw new Error(`não foi possível configurar o login (${r.status}): ${JSON.stringify(r.json).slice(0, 300)}`);
  ok(`endereço do site: ${siteUrl}`);
  ok("confirmação por e-mail desligada (o doutor entra direto) — novos cadastros limitados a 3 contas");

  const t = await mgmt("PATCH", "/config/auth", {
    mailer_subjects_recovery: "Redefinir sua senha — Prontuário Dr. Mizael Cardoso",
    mailer_templates_recovery_content:
      '<h2>Redefinir senha</h2><p>Recebemos um pedido para redefinir a senha do seu prontuário digital.</p><p><a href="{{ .ConfirmationURL }}">Clique aqui para criar uma nova senha</a></p><p>Se não foi você, ignore este e-mail.</p>',
    mailer_subjects_invite: "Seu acesso ao Prontuário Digital — Dr. Mizael Cardoso",
    mailer_templates_invite_content:
      '<h2>Bem-vindo ao seu prontuário digital 🦷</h2><p><a href="{{ .ConfirmationURL }}">Clique aqui para entrar e criar sua senha</a></p>',
  });
  if (t.ok) ok("e-mails de senha em português");
  else warn("não consegui traduzir os e-mails (não é essencial)");
}

async function createDoctor() {
  const email = process.env.DOCTOR_EMAIL?.trim().toLowerCase();
  const password = process.env.DOCTOR_PASSWORD;
  if (!email || !password) {
    warn("DOCTOR_EMAIL/DOCTOR_PASSWORD não informados: o doutor cria a conta no site em “Primeiro acesso? Criar conta”.");
    return;
  }
  step("Conta do Dr. Mizael");
  const keys = await mgmt("GET", "/api-keys?reveal=true");
  const service = Array.isArray(keys.json) && keys.json.find((k) => k.name === "service_role" || k.type === "secret")?.api_key;
  if (!service) throw new Error("não consegui obter a chave de administração do projeto");
  const r = await http(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: service, Authorization: `Bearer ${service}` },
    body: { email, password, email_confirm: true, user_metadata: { name: "Dr. Mizael Cardoso" } },
  });
  if (r.ok) ok(`conta criada: ${email}`);
  else if (/already|registered|exists/i.test(JSON.stringify(r.json))) ok(`conta já existia: ${email}`);
  else throw new Error(`não foi possível criar a conta (${r.status}): ${JSON.stringify(r.json).slice(0, 300)}`);
}

/* ---------------- Vercel ---------------- */
let team = process.env.VERCEL_TEAM_ID || "";
const vc = (method, path, body, extra = {}) => {
  const sep = path.includes("?") ? "&" : "?";
  return http(`https://api.vercel.com${path}${team ? `${sep}teamId=${team}` : ""}`, {
    method,
    body,
    ...extra,
    headers: { Authorization: `Bearer ${VC_TOKEN}`, ...(extra.headers ?? {}) },
  });
};

async function uploadFile(buf) {
  const sha = createHash("sha1").update(buf).digest("hex");
  const r = await vc("POST", "/v2/files", undefined, {
    raw: buf,
    headers: { "Content-Type": "application/octet-stream", "x-vercel-digest": sha, "Content-Length": String(buf.length) },
  });
  if (!r.ok) throw new Error(`upload falhou (${r.status}): ${JSON.stringify(r.json).slice(0, 300)}`);
  return { sha, size: buf.length };
}

async function deployVercel() {
  step("Publicação (Vercel)");
  const me = await vc("GET", "/v2/user");
  if (!me.ok) throw new Error(`token da Vercel inválido (${me.status})`);
  if (!team && me.json.user?.defaultTeamId) team = me.json.user.defaultTeamId;
  ok(`conta Vercel: ${me.json.user?.username ?? me.json.user?.email}`);

  let project = await vc("POST", "/v11/projects", { name: PROJECT, framework: null });
  if (project.status === 409 || (!project.ok && /already exists/i.test(JSON.stringify(project.json)))) project = await vc("GET", `/v9/projects/${PROJECT}`);
  if (!project.ok) throw new Error(`não consegui criar o projeto (${project.status}): ${JSON.stringify(project.json).slice(0, 300)}`);
  const projectId = project.json.id;
  ok(`projeto: ${PROJECT}`);

  const html = readFileSync(join(ROOT, "dist/index.html"));
  const cfg = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
  const staticCfg = Buffer.from(JSON.stringify({ cleanUrls: true, headers: cfg.headers }, null, 2));
  const [f1, f2] = [await uploadFile(html), await uploadFile(staticCfg)];
  ok(`arquivo enviado (${(html.length / 1024).toFixed(0)} KB)`);

  const dep = await vc("POST", "/v13/deployments?skipAutoDetectionConfirmation=1", {
    name: PROJECT,
    project: projectId,
    target: "production",
    files: [
      { file: "index.html", ...f1 },
      { file: "vercel.json", ...f2 },
    ],
    projectSettings: { framework: null, buildCommand: null, installCommand: null, outputDirectory: null, devCommand: null },
  });
  if (!dep.ok) throw new Error(`deploy falhou (${dep.status}): ${JSON.stringify(dep.json).slice(0, 400)}`);
  let state = dep.json.readyState;
  for (let i = 0; i < 60 && !["READY", "ERROR", "CANCELED"].includes(state); i++) {
    await new Promise((r) => setTimeout(r, 2000));
    state = (await vc("GET", `/v13/deployments/${dep.json.id}`)).json?.readyState;
  }
  if (state !== "READY") throw new Error(`deploy terminou como ${state}`);
  ok("deploy concluído");

  const wanted = `${PROJECT}.vercel.app`;
  let domains = (await vc("GET", `/v9/projects/${projectId}/domains`)).json?.domains?.map((d) => d.name) ?? [];
  if (!domains.includes(wanted)) {
    const add = await vc("POST", `/v10/projects/${projectId}/domains`, { name: wanted });
    if (add.ok) domains.push(wanted);
    else warn(`o endereço ${wanted} não está disponível (${JSON.stringify(add.json?.error?.message ?? add.json).slice(0, 160)})`);
  }
  const main = domains.includes(wanted) ? wanted : domains.find((d) => d.endsWith(".vercel.app")) ?? dep.json.url;
  return `https://${main}`;
}

async function verify(url) {
  step("Conferência final");
  for (let i = 0; i < 10; i++) {
    const r = await fetch(url).catch(() => null);
    if (r?.ok) {
      const html = await r.text();
      if (html.includes("Dr. Mizael")) {
        ok(`site no ar: ${url}`);
        break;
      }
    }
    if (i === 9) warn(`o site ainda não respondeu em ${url} — pode levar alguns segundos`);
    await new Promise((r) => setTimeout(r, 3000));
  }
  const anonKey = /eyJ[\w-]+\.[\w-]+\.[\w-]+/.exec(readFileSync(join(ROOT, "src/lib/supabase.ts"), "utf8"))?.[0];
  const rest = await fetch(`${SUPABASE_URL}/rest/v1/patients?select=id&limit=1`, { headers: { apikey: anonKey ?? "" } }).catch(() => null);
  if (rest?.status === 401 || rest?.status === 403 || (rest?.ok && (await rest.json()).length === 0))
    ok("dados protegidos: sem login, a API não devolve nenhum paciente");
  else warn(`verifique a proteção da tabela patients (status ${rest?.status})`);
}

(async () => {
  try {
    if (!args.has("--sem-build")) {
      step("Build");
      execSync("npm install --no-audit --no-fund && npm run build", { cwd: ROOT, stdio: ["ignore", "ignore", "inherit"] });
      ok("dist/index.html gerado");
    }
    if (!args.has("--sem-supabase")) await setupDatabase();
    const url = args.has("--sem-vercel") ? `https://${PROJECT}.vercel.app` : await deployVercel();
    if (!args.has("--sem-supabase")) {
      await configureAuth(url);
      await createDoctor();
    }
    await verify(url);
    console.log(`\n\x1b[1m\x1b[32m🦷 Pronto! Prontuário no ar em ${url}\x1b[0m\n`);
  } catch (err) {
    fail(err.message);
  }
})();
