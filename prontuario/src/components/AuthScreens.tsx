import { motion } from "framer-motion";
import { ArrowRight, Check, Copy, Database, ExternalLink, KeyRound, Loader2, Lock, Mail, RefreshCw, ShieldCheck, Sparkles, WifiOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import schemaSQL from "../../supabase/schema.sql?raw";
import { SQL_EDITOR_URL, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { retryStart, signOut, startDemo } from "@/store/sync";
import { Logo, ToothPattern } from "./Logo";
import { Button } from "./ui/Button";
import { toast } from "./ui/feedback";
import { Field } from "./ui/misc";
import { Modal } from "./ui/Modal";

function translateAuthError(msg: string) {
  if (/invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar (verifique a caixa de entrada e o spam).";
  if (/already registered|already been registered/i.test(msg)) return "Este e-mail já tem cadastro. Use “Entrar”.";
  if (/password should be at least/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  if (/signups not allowed|signup is disabled/i.test(msg)) return "Novos cadastros estão desativados. Peça o acesso ao administrador.";
  if (/fetch|network/i.test(msg)) return "Sem conexão com o servidor. Verifique a internet.";
  if (/rate limit/i.test(msg)) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  return msg;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-full lg:grid-cols-[1.1fr_1fr]">
      <div className="sidebar-bg relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <ToothPattern className="absolute inset-0 h-full w-full text-white/[0.035]" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-jade-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <Logo size={48} />
          <div>
            <p className="font-display text-xl font-semibold text-white">Dr. Mizael Cardoso</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jade-300/80">Odontologia</p>
          </div>
        </div>
        <div className="relative max-w-lg">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl font-semibold leading-[1.05] text-white"
          >
            Cada sorriso,
            <br />
            <span className="bg-gradient-to-r from-jade-200 to-jade-400 bg-clip-text text-transparent">bem cuidado.</span>
          </motion.h1>
          <p className="mt-5 text-lg leading-relaxed text-jade-100/75">
            Prontuário digital completo: odontograma interativo, agenda, radiografias, receitas, orçamentos e lembretes — tudo em um só lugar.
          </p>
          <ul className="mt-8 space-y-3 text-jade-100/85">
            {["Dados protegidos e salvos na nuvem", "Funciona no computador, tablet e celular", "Continua funcionando mesmo sem internet"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-jade-400/20 text-jade-300">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-jade-200/50">Feito com carinho para o Dr. Mizael Cardoso 💚</p>
      </div>
      <div className="flex items-center justify-center px-5 py-10 sm:px-10">{children}</div>
    </div>
  );
}

export function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [demoBusy, setDemoBusy] = useState(false);

  const submit = async () => {
    setError("");
    setInfo("");
    const mail = email.trim().toLowerCase();
    if (!mail) return setError("Informe seu e-mail.");
    if (mode !== "reset" && password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: mail,
          password,
          options: { emailRedirectTo: window.location.origin + window.location.pathname },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo("Conta criada! Enviamos um link de confirmação para o seu e-mail. Clique nele e depois entre aqui.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(mail, {
          redirectTo: window.location.origin + window.location.pathname,
        });
        if (error) throw error;
        setInfo("Pronto! Enviamos um link para redefinir sua senha.");
        setMode("login");
      }
    } catch (e) {
      setError(translateAuthError(String((e as Error).message ?? e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <Logo size={44} />
          <div>
            <p className="font-display text-lg font-semibold text-ink">Dr. Mizael Cardoso</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">Prontuário digital</p>
          </div>
        </div>
        <h2 className="font-display text-3xl font-semibold text-ink">
          {mode === "login" ? "Bem-vindo de volta" : mode === "signup" ? "Criar acesso" : "Recuperar senha"}
        </h2>
        <p className="mt-2 text-sm text-ink-3">
          {mode === "login"
            ? "Entre para acessar seus pacientes."
            : mode === "signup"
              ? "Primeiro acesso: crie o login do consultório."
              : "Informe seu e-mail para receber o link de redefinição."}
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Field label="E-mail">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
              <input type="email" autoComplete="email" className="input h-12 pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
          </Field>
          {mode !== "reset" && (
            <Field label="Senha">
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                <input
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="input h-12 pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </Field>
          )}
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
          {info && <p className="rounded-xl bg-jade-50 px-3 py-2 text-sm font-medium text-jade-800 dark:bg-jade-900/40 dark:text-jade-200">{info}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy} icon={busy ? <Loader2 className="h-5 w-5 animate-spin" /> : undefined}>
            {mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
            {!busy && <ArrowRight className="h-5 w-5" />}
          </Button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
          {mode === "login" ? (
            <>
              <button className="font-semibold text-brand hover:underline" onClick={() => setMode("reset")}>
                Esqueci minha senha
              </button>
              <button className="font-semibold text-ink-2 hover:text-brand" onClick={() => setMode("signup")}>
                Primeiro acesso? Criar conta
              </button>
            </>
          ) : (
            <button className="font-semibold text-brand hover:underline" onClick={() => setMode("login")}>
              ← Voltar para o login
            </button>
          )}
        </div>

        <div className="my-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
          <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={demoBusy}
          onClick={async () => {
            setDemoBusy(true);
            await startDemo();
          }}
          icon={demoBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-jade-500" />}
        >
          Ver demonstração
        </Button>
        <p className="mt-3 text-center text-xs text-ink-3">Explore com pacientes fictícios. Nada é salvo.</p>

        <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-ink-3">
          <ShieldCheck className="h-3.5 w-3.5 text-jade-500" /> Conexão segura · cada conta só acessa os próprios dados
        </p>
      </motion.div>
    </Shell>
  );
}

export function SetupScreen() {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const email = useStore((s) => s.userEmail);
  return (
    <div className="flex min-h-full items-center justify-center p-5">
      <div className="card w-full max-w-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Falta só um passo: criar o banco de dados</h1>
            <p className="mt-1 text-sm text-ink-2">
              Você entrou como <b>{email}</b>, mas as tabelas do prontuário ainda não existem no Supabase. Leva 30 segundos:
            </p>
          </div>
        </div>
        <ol className="mt-6 space-y-3 text-sm text-ink-2">
          <li className="flex gap-3">
            <b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade-600 text-xs text-white">1</b>
            Clique em “Copiar SQL”.
          </li>
          <li className="flex gap-3">
            <b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade-600 text-xs text-white">2</b>
            Abra o SQL Editor do Supabase, cole e clique em <b>Run</b>.
          </li>
          <li className="flex gap-3">
            <b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade-600 text-xs text-white">3</b>
            Volte aqui e clique em “Já executei”.
          </li>
        </ol>
        <pre className="scrollbar-thin mt-5 max-h-56 overflow-auto rounded-xl border border-line bg-surface-2 p-4 text-[11px] leading-relaxed text-ink-2">{schemaSQL}</pre>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            onClick={async () => {
              await navigator.clipboard.writeText(schemaSQL);
              setCopied(true);
              toast.success("SQL copiado!");
            }}
          >
            {copied ? "Copiado" : "Copiar SQL"}
          </Button>
          <a href={SQL_EDITOR_URL} target="_blank" rel="noreferrer">
            <Button variant="secondary" icon={<ExternalLink className="h-4 w-4" />}>
              Abrir SQL Editor
            </Button>
          </a>
          <Button
            variant="soft"
            disabled={busy}
            icon={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            onClick={async () => {
              setBusy(true);
              await retryStart();
              setBusy(false);
            }}
          >
            Já executei
          </Button>
          <Button variant="ghost" onClick={() => void signOut(true)}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorScreen() {
  const err = useStore((s) => s.bootError);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex min-h-full items-center justify-center p-5">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40">
          <WifiOff className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Não foi possível conectar</h1>
        <p className="mt-2 text-sm text-ink-2">Verifique a internet e tente novamente.</p>
        {err && <p className="mt-3 rounded-lg bg-surface-2 p-2 font-mono text-xs text-ink-3">{err}</p>}
        <div className="mt-6 flex justify-center gap-2">
          <Button
            disabled={busy}
            icon={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            onClick={async () => {
              setBusy(true);
              await retryStart();
              setBusy(false);
            }}
          >
            Tentar novamente
          </Button>
          <Button variant="secondary" onClick={() => void signOut(true)}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LoadingScreen({ label = "Carregando prontuário…" }: { label?: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5">
      <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
        <Logo size={64} />
      </motion.div>
      <p className="text-sm font-semibold text-ink-3">{label}</p>
    </div>
  );
}

export function RecoveryModal() {
  const recovery = useStore((s) => s.recovery);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={recovery}
      onClose={() => useStore.setState({ recovery: false })}
      size="sm"
      title="Definir nova senha"
      icon={<Lock className="h-5 w-5" />}
      footer={
        <Button
          disabled={busy || password.length < 6}
          onClick={async () => {
            setBusy(true);
            const { error } = await supabase.auth.updateUser({ password });
            setBusy(false);
            if (error) toast.error("Não foi possível alterar", translateAuthError(error.message));
            else {
              toast.success("Senha alterada!");
              useStore.setState({ recovery: false });
            }
          }}
        >
          Salvar nova senha
        </Button>
      }
    >
      <Field label="Nova senha (mínimo 6 caracteres)">
        <input type="password" className={cn("input h-11")} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
      </Field>
    </Modal>
  );
}
