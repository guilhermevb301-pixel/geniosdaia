import {
  Bell,
  CalendarDays,
  Download,
  Eraser,
  HardDriveDownload,
  Heart,
  KeyRound,
  Lock,
  LogOut,
  MessageCircle,
  Palette,
  Plus,
  Sparkles,
  Stethoscope,
  Tags,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { handleSignOut } from "@/components/Layout";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { confirmDialog, toast } from "@/components/ui/feedback";
import { Field, Segmented, Select, Switch, TagChip } from "@/components/ui/misc";
import { Modal } from "@/components/ui/Modal";
import { TAG_PALETTE } from "@/lib/constants";
import { blobToDataURL, dataURLToBlob, getFile, putFile, resizeImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { AppData, Settings } from "@/lib/types";
import { cn, downloadBlob, fmtDate, money, nowISO, parseMoney, sha256, uid } from "@/lib/utils";
import { DATA_VERSION, useStore } from "@/store/store";
import { eraseEverything, removeDemoPatients } from "@/store/sync";

const SECTIONS = [
  { id: "perfil", label: "Perfil do consultório", icon: UserRound },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "procedimentos", label: "Procedimentos e preços", icon: Stethoscope },
  { id: "etiquetas", label: "Etiquetas", icon: Tags },
  { id: "mensagens", label: "Mensagens do WhatsApp", icon: MessageCircle },
  { id: "seguranca", label: "Segurança e notificações", icon: Lock },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "backup", label: "Backup e dados", icon: HardDriveDownload },
  { id: "conta", label: "Conta", icon: KeyRound },
];

function Section({ id, title, desc, icon, children }: { id: string; title: string; desc?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section id={`secao-${id}`} className="card scroll-mt-24 p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">{icon}</div>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
          {desc && <p className="text-sm text-ink-3">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function PinModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const updateSettings = useStore((s) => s.updateSettings);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  useEffect(() => {
    if (open) {
      setPin("");
      setPin2("");
    }
  }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Definir PIN de bloqueio"
      icon={<Lock className="h-5 w-5" />}
      footer={
        <Button
          disabled={pin.length < 4 || pin !== pin2}
          onClick={async () => {
            updateSettings({ pinHash: await sha256(pin), autoLockMinutes: useStore.getState().settings.autoLockMinutes || 10 });
            toast.success("PIN definido", "Use o menu “Novo → Bloquear tela” ou aguarde o bloqueio automático.");
            onClose();
          }}
        >
          Salvar PIN
        </Button>
      }
    >
      <div className="space-y-4">
        <Field label="PIN (4 a 6 números)">
          <input className="input h-12 text-center text-2xl tracking-[0.5em]" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} autoFocus />
        </Field>
        <Field label="Confirme o PIN">
          <input className="input h-12 text-center text-2xl tracking-[0.5em]" inputMode="numeric" maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} />
        </Field>
        {pin2 && pin !== pin2 && <p className="text-sm font-semibold text-rose-600">Os PINs não conferem.</p>}
      </div>
    </Modal>
  );
}

export function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const patients = useStore((s) => s.patients);
  const mode = useStore((s) => s.mode);
  const email = useStore((s) => s.userEmail);
  const [params] = useSearchParams();
  const [pinOpen, setPinOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<Settings>) => updateSettings(patch);

  useEffect(() => {
    const s = params.get("secao");
    if (s) setTimeout(() => document.getElementById(`secao-${s}`)?.scrollIntoView({ behavior: "smooth" }), 150);
  }, [params]);

  const demoCount = patients.filter((p) => p.demo).length;

  const exportBackup = async () => {
    setBusy("export");
    try {
      const s = useStore.getState();
      const data: AppData = { version: DATA_VERSION, patients: s.patients, appointments: s.appointments, settings: s.settings, recent: s.recent, onboarded: true };
      const files: Record<string, string> = {};
      for (const p of s.patients)
        for (const a of p.attachments) {
          const blob = await getFile(a.id);
          if (blob) files[a.id] = await blobToDataURL(blob);
        }
      const blob = new Blob([JSON.stringify({ app: "prontuario-dr-mizael", exportedAt: nowISO(), data, files })], { type: "application/json" });
      downloadBlob(blob, `backup-prontuario-${fmtDate(new Date(), "yyyy-MM-dd")}.json`);
      set({ lastBackupAt: nowISO() });
      toast.success("Backup baixado!", "Guarde o arquivo em um pen drive ou no Google Drive.");
    } catch {
      toast.error("Não foi possível gerar o backup");
    } finally {
      setBusy(null);
    }
  };

  const importBackup = async (file?: File) => {
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      if (json.app !== "prontuario-dr-mizael" || !json.data) throw new Error("arquivo inválido");
      const ok = await confirmDialog({
        title: "Restaurar este backup?",
        description: `O backup de ${fmtDate(json.exportedAt, "dd/MM/yyyy HH:mm")} tem ${json.data.patients?.length ?? 0} pacientes. Os dados atuais serão SUBSTITUÍDOS.`,
        confirmLabel: "Restaurar",
        danger: true,
      });
      if (!ok) return;
      setBusy("import");
      for (const [id, url] of Object.entries(json.files ?? {})) await putFile(id, await dataURLToBlob(url as string));
      useStore.getState().replaceAll(json.data);
      toast.success("Backup restaurado!");
    } catch {
      toast.error("Arquivo de backup inválido");
    } finally {
      setBusy(null);
    }
  };

  const onSignature = async (file?: File) => {
    if (!file) return;
    const { blob } = await resizeImage(file, 600, "image/png");
    set({ signature: await blobToDataURL(blob) });
    toast.success("Assinatura salva", "Ela aparecerá nas receitas, atestados e recibos.");
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Configurações</h1>
      <p className="mt-1 text-sm text-ink-3">Tudo é salvo automaticamente.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="hidden space-y-1 self-start lg:sticky lg:top-24 lg:block">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => document.getElementById(`secao-${s.id}`)?.scrollIntoView({ behavior: "smooth" })}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink-2 transition hover:bg-surface hover:text-brand"
            >
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          <Section id="perfil" title="Perfil do consultório" desc="Aparece no cabeçalho de receitas, atestados e orçamentos." icon={<UserRound className="h-5 w-5" />}>
            <div className="grid gap-4 sm:grid-cols-[100px_1fr_1fr]">
              <Field label="Título">
                <Select value={settings.title} onChange={(e) => set({ title: e.target.value })}>
                  <option>Dr.</option>
                  <option>Dra.</option>
                  <option value="">—</option>
                </Select>
              </Field>
              <Field label="Nome">
                <input className="input" value={settings.doctorName} onChange={(e) => set({ doctorName: e.target.value })} />
              </Field>
              <Field label="CRO (ex.: SP 12345)">
                <input className="input" value={settings.cro} onChange={(e) => set({ cro: e.target.value })} placeholder="UF 00000" />
              </Field>
              <Field label="Especialidade" className="sm:col-span-2">
                <input className="input" value={settings.specialty} onChange={(e) => set({ specialty: e.target.value })} />
              </Field>
              <Field label="Telefone do consultório">
                <input className="input" value={settings.phone} onChange={(e) => set({ phone: e.target.value })} />
              </Field>
              <Field label="Endereço (com cidade)" className="sm:col-span-2">
                <input className="input" value={settings.address} onChange={(e) => set({ address: e.target.value })} placeholder="Rua, número - Bairro - Cidade" />
              </Field>
              <Field label="E-mail">
                <input className="input" value={settings.email} onChange={(e) => set({ email: e.target.value })} />
              </Field>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-line p-4">
              {settings.signature ? (
                <img src={settings.signature} alt="Assinatura" className="h-16 rounded-lg bg-white p-2" />
              ) : (
                <div className="flex h-16 w-40 items-center justify-center rounded-lg bg-surface-2 text-xs text-ink-3">sem assinatura</div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Assinatura digitalizada</p>
                <p className="text-xs text-ink-3">Tire uma foto da sua assinatura em papel branco. Ela será colocada nos documentos impressos.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => sigRef.current?.click()} icon={<Upload className="h-3.5 w-3.5" />}>
                  Enviar
                </Button>
                {settings.signature && (
                  <Button variant="ghost" size="sm" onClick={() => set({ signature: undefined })}>
                    Remover
                  </Button>
                )}
              </div>
              <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={(e) => onSignature(e.target.files?.[0])} />
            </div>
          </Section>

          <Section id="agenda" title="Agenda" icon={<CalendarDays className="h-5 w-5" />}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Início do expediente">
                <Select value={settings.startHour} onChange={(e) => set({ startHour: Number(e.target.value) })}>
                  {Array.from({ length: 12 }, (_, i) => i + 5).map((h) => (
                    <option key={h} value={h}>
                      {h}:00
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Fim do expediente">
                <Select value={settings.endHour} onChange={(e) => set({ endHour: Number(e.target.value) })}>
                  {Array.from({ length: 12 }, (_, i) => i + 12).map((h) => (
                    <option key={h} value={h} disabled={h <= settings.startHour}>
                      {h}:00
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Retorno padrão (meses)">
                <Select value={settings.recallMonths} onChange={(e) => set({ recallMonths: Number(e.target.value) })}>
                  {[3, 4, 6, 9, 12].map((m) => (
                    <option key={m} value={m}>
                      {m} meses
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <Switch checked={settings.workSaturday} onChange={(v) => set({ workSaturday: v })} label="Atende aos sábados" />
            </div>
          </Section>

          <Section id="procedimentos" title="Procedimentos e preços" desc="Usados no plano de tratamento, orçamentos e agenda." icon={<Stethoscope className="h-5 w-5" />}>
            <div className="space-y-2">
              {settings.procedures.map((p) => (
                <div key={p.id} className="group grid grid-cols-[1fr_130px_auto] items-center gap-2 sm:grid-cols-[1fr_170px_130px_auto]">
                  <input
                    className="input"
                    defaultValue={p.name}
                    onBlur={(e) => set({ procedures: settings.procedures.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)) })}
                  />
                  <input
                    className="input hidden sm:block"
                    defaultValue={p.category}
                    onBlur={(e) => set({ procedures: settings.procedures.map((x) => (x.id === p.id ? { ...x, category: e.target.value } : x)) })}
                  />
                  <input
                    className="input text-right font-semibold"
                    defaultValue={p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    onBlur={(e) => set({ procedures: settings.procedures.map((x) => (x.id === p.id ? { ...x, price: parseMoney(e.target.value) } : x)) })}
                  />
                  <button
                    onClick={() => set({ procedures: settings.procedures.filter((x) => x.id !== p.id) })}
                    className="rounded-lg p-2 text-ink-3 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              variant="soft"
              size="sm"
              className="mt-3"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => set({ procedures: [...settings.procedures, { id: uid("p_"), name: "Novo procedimento", price: 0, category: "Outros" }] })}
            >
              Adicionar procedimento
            </Button>
            <p className="mt-2 text-xs text-ink-3">
              Valor médio: {money(settings.procedures.reduce((s, p) => s + p.price, 0) / Math.max(1, settings.procedures.length))}
            </p>
          </Section>

          <Section id="etiquetas" title="Etiquetas" desc="Para organizar e filtrar pacientes." icon={<Tags className="h-5 w-5" />}>
            <div className="flex flex-wrap gap-2">
              {settings.tags.map((t) => (
                <div key={t.name} className="flex items-center gap-1">
                  <TagChip name={t.name} onRemove={() => set({ tags: settings.tags.filter((x) => x.name !== t.name) })} />
                  <div className="flex gap-0.5">
                    {TAG_PALETTE.slice(0, 4).map((c) => (
                      <button
                        key={c}
                        onClick={() => set({ tags: settings.tags.map((x) => (x.name === t.name ? { ...x, color: c } : x)) })}
                        className={cn("h-3 w-3 rounded-full opacity-0 transition hover:opacity-100", t.color === c && "opacity-100")}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const name = newTag.trim();
                if (!name || settings.tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) return;
                set({ tags: [...settings.tags, { name, color: TAG_PALETTE[settings.tags.length % TAG_PALETTE.length] }] });
                setNewTag("");
              }}
            >
              <input className="input max-w-xs" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Nova etiqueta" />
              <Button type="submit" variant="soft" icon={<Plus className="h-4 w-4" />}>
                Criar
              </Button>
            </form>
          </Section>

          <Section id="mensagens" title="Mensagens do WhatsApp" desc="Use {nome}, {data}, {hora} e {procedimento} — são preenchidos automaticamente." icon={<MessageCircle className="h-5 w-5" />}>
            <div className="space-y-4">
              <Field label="Confirmação de consulta">
                <textarea className="input" rows={4} value={settings.messages.confirm} onChange={(e) => set({ messages: { ...settings.messages, confirm: e.target.value } })} />
              </Field>
              <Field label="Aniversário">
                <textarea className="input" rows={3} value={settings.messages.birthday} onChange={(e) => set({ messages: { ...settings.messages, birthday: e.target.value } })} />
              </Field>
              <Field label="Chamar para retorno">
                <textarea className="input" rows={3} value={settings.messages.recall} onChange={(e) => set({ messages: { ...settings.messages, recall: e.target.value } })} />
              </Field>
            </div>
          </Section>

          <Section id="seguranca" title="Segurança e notificações" icon={<Lock className="h-5 w-5" />}>
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4">
                <div>
                  <p className="text-sm font-bold text-ink">PIN de bloqueio de tela</p>
                  <p className="text-xs text-ink-3">Protege a tela quando você se afasta do computador do consultório.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setPinOpen(true)}>
                    {settings.pinHash ? "Trocar PIN" : "Definir PIN"}
                  </Button>
                  {settings.pinHash && (
                    <Button variant="ghost" size="sm" onClick={() => set({ pinHash: undefined })}>
                      Remover
                    </Button>
                  )}
                </div>
              </div>
              {settings.pinHash && (
                <Field label="Bloquear automaticamente após">
                  <Select value={settings.autoLockMinutes} onChange={(e) => set({ autoLockMinutes: Number(e.target.value) })} className="max-w-xs">
                    <option value={0}>Nunca</option>
                    {[5, 10, 15, 30, 60].map((m) => (
                      <option key={m} value={m}>
                        {m} minutos sem uso
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-ink">
                    <Bell className="h-4 w-4" /> Notificações no computador
                  </p>
                  <p className="text-xs text-ink-3">Avisa na tela quando um lembrete de paciente vencer (com o prontuário aberto).</p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onChange={async (v) => {
                    if (v && typeof Notification !== "undefined") {
                      const perm = await Notification.requestPermission();
                      if (perm !== "granted") return toast.error("Permissão negada pelo navegador");
                    }
                    set({ notificationsEnabled: v });
                  }}
                />
              </div>
            </div>
          </Section>

          <Section id="aparencia" title="Aparência" icon={<Palette className="h-5 w-5" />}>
            <Segmented
              value={settings.theme}
              onChange={(v) => set({ theme: v })}
              options={[
                { value: "light", label: "Claro" },
                { value: "dark", label: "Escuro" },
                { value: "system", label: "Automático" },
              ]}
            />
          </Section>

          <Section id="backup" title="Backup e dados" desc="Seus dados ficam salvos na nuvem. O backup é uma cópia extra de segurança." icon={<HardDriveDownload className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={exportBackup} disabled={!!busy} className="flex items-center gap-4 rounded-2xl border border-line p-4 text-left transition hover:border-jade-400 hover:bg-brand-soft/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-jade-600 text-white">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-ink">{busy === "export" ? "Gerando…" : "Baixar backup completo"}</p>
                  <p className="text-xs text-ink-3">Último: {settings.lastBackupAt ? fmtDate(settings.lastBackupAt, "dd/MM/yyyy HH:mm") : "nunca"}</p>
                </div>
              </button>
              <button onClick={() => importRef.current?.click()} disabled={!!busy} className="flex items-center gap-4 rounded-2xl border border-line p-4 text-left transition hover:border-jade-400 hover:bg-brand-soft/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-ink">{busy === "import" ? "Restaurando…" : "Restaurar backup"}</p>
                  <p className="text-xs text-ink-3">A partir de um arquivo .json</p>
                </div>
              </button>
              <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => (void importBackup(e.target.files?.[0]), (e.target.value = ""))} />
            </div>
            <div className="mt-5 space-y-3 border-t border-line pt-5">
              {demoCount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-2">
                    <Sparkles className="mr-1 inline h-4 w-4 text-jade-500" />
                    Há <b>{demoCount} pacientes de exemplo</b> (fictícios).
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Eraser className="h-4 w-4" />}
                    onClick={async () => {
                      if (await confirmDialog({ title: "Remover os pacientes de exemplo?", description: "Somente os pacientes fictícios da demonstração serão removidos. Os seus pacientes reais não são afetados.", confirmLabel: "Remover exemplos" })) {
                        const n = await removeDemoPatients();
                        toast.success(`${n} pacientes de exemplo removidos`);
                      }
                    }}
                  >
                    Remover exemplos
                  </Button>
                </div>
              )}
              {mode === "cloud" && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-2">Apagar todos os pacientes, consultas e imagens desta conta.</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={async () => {
                      if (
                        await confirmDialog({
                          title: "Apagar TODOS os dados?",
                          description: "Esta ação não pode ser desfeita. Recomendamos baixar um backup antes.",
                          confirmLabel: "Apagar tudo",
                          danger: true,
                        })
                      ) {
                        await eraseEverything();
                        toast.success("Todos os dados foram apagados");
                      }
                    }}
                  >
                    Apagar tudo
                  </Button>
                </div>
              )}
            </div>
          </Section>

          <Section id="conta" title="Conta" icon={<KeyRound className="h-5 w-5" />}>
            {mode === "demo" ? (
              <p className="text-sm text-ink-2">Você está no modo demonstração. Entre com e-mail e senha para salvar os dados na nuvem.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-ink-2">
                  Conectado como <b>{email}</b>
                </p>
                <div className="flex flex-wrap items-end gap-2">
                  <Field label="Nova senha" className="w-64">
                    <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="mínimo 6 caracteres" />
                  </Field>
                  <Button
                    variant="secondary"
                    disabled={newPassword.length < 6}
                    onClick={async () => {
                      const { error } = await supabase.auth.updateUser({ password: newPassword });
                      if (error) toast.error("Não foi possível alterar a senha", error.message);
                      else {
                        toast.success("Senha alterada");
                        setNewPassword("");
                      }
                    }}
                  >
                    Alterar senha
                  </Button>
                </div>
                <Button variant="ghost" className="text-rose-600" icon={<LogOut className="h-4 w-4" />} onClick={() => void handleSignOut()}>
                  Sair da conta
                </Button>
              </div>
            )}
          </Section>

          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Logo size={44} />
            <p className="font-display text-lg font-semibold text-ink">Prontuário Digital · {settings.title} {settings.doctorName}</p>
            <p className="flex items-center gap-1.5 text-sm text-ink-3">
              Feito com <Heart className="h-4 w-4 fill-rose-500 text-rose-500" /> para o Dr. Mizael Cardoso
            </p>
          </div>
        </div>
      </div>
      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} />
    </div>
  );
}
