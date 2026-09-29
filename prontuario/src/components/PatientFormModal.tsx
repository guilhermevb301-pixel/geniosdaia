import { Camera, ImagePlus, Trash2, UserPlus, UserRoundPen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AVATAR_COLORS, STAGES } from "@/lib/constants";
import { blobToDataURL, resizeImage } from "@/lib/storage";
import type { Patient } from "@/lib/types";
import { cn, maskCPF, maskPhone } from "@/lib/utils";
import { useStore } from "@/store/store";
import { useUI } from "@/store/ui";
import { Button } from "./ui/Button";
import { toast } from "./ui/feedback";
import { Avatar, Field, Select, TagChip } from "./ui/misc";
import { Modal } from "./ui/Modal";

type Form = Pick<
  Patient,
  | "name"
  | "birthDate"
  | "gender"
  | "cpf"
  | "rg"
  | "phone"
  | "email"
  | "address"
  | "city"
  | "profession"
  | "insurance"
  | "referredBy"
  | "emergencyContact"
  | "photo"
  | "color"
  | "tags"
  | "stage"
>;

const blank = (): Form => ({
  name: "",
  birthDate: "",
  gender: undefined,
  cpf: "",
  rg: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  profession: "",
  insurance: "",
  referredBy: "",
  emergencyContact: "",
  photo: undefined,
  color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  tags: [],
  stage: "avaliacao",
});

export function PatientFormModal() {
  const { open, id } = useUI((s) => s.patientModal);
  const close = useUI((s) => s.closePatientModal);
  const patient = useStore((s) => s.patients.find((p) => p.id === id));
  const tagDefs = useStore((s) => s.settings.tags);
  const addPatient = useStore((s) => s.addPatient);
  const updatePatient = useStore((s) => s.updatePatient);
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(blank);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (patient) {
      const { name, birthDate, gender, cpf, rg, phone, email, address, city, profession, insurance, referredBy, emergencyContact, photo, color, tags, stage } =
        patient;
      setForm({ name, birthDate, gender, cpf, rg, phone, email, address, city, profession, insurance, referredBy, emergencyContact, photo, color, tags, stage });
    } else setForm(blank());
  }, [open, patient]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try {
      const { blob } = await resizeImage(file, 320, "image/jpeg", 0.85);
      set("photo", await blobToDataURL(blob));
    } catch {
      toast.error("Não foi possível carregar a foto");
    }
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Informe o nome do paciente");
      return;
    }
    const data = { ...form, name: form.name.trim().replace(/\s+/g, " ") };
    if (patient) {
      updatePatient(patient.id, data);
      toast.success("Dados atualizados");
      close();
    } else {
      const p = addPatient(data);
      toast.success("Paciente cadastrado!", `${p.name} já está na sua lista.`);
      close();
      navigate(`/pacientes/${p.id}`);
    }
  };

  const toggleTag = (name: string) => set("tags", form.tags.includes(name) ? form.tags.filter((t) => t !== name) : [...form.tags, name]);

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={patient ? "Editar dados do paciente" : "Novo paciente"}
      subtitle={patient ? patient.name : "Só o nome é obrigatório — o resto pode ser preenchido depois."}
      icon={patient ? <UserRoundPen className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button onClick={save}>{patient ? "Salvar alterações" : "Cadastrar paciente"}</Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative self-center">
            <Avatar patient={{ name: form.name || "?", color: form.color, photo: form.photo }} size={88} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-jade-600 text-white shadow-lg transition hover:bg-jade-700"
              title="Adicionar foto"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </div>
          <div className="flex-1 space-y-3">
            <Field label="Nome completo *">
              <input autoFocus className="input h-11 text-base" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex.: Maria da Silva Santos" />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-ink-3">Cor:</span>
              {AVATAR_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => set("color", c)}
                  className={cn("h-6 w-6 rounded-full transition", form.color === c ? "ring-2 ring-offset-2 ring-offset-surface" : "opacity-80 hover:opacity-100")}
                  style={{ background: c, ["--tw-ring-color" as string]: c }}
                />
              ))}
              {form.photo && (
                <button type="button" onClick={() => set("photo", undefined)} className="ml-2 flex items-center gap-1 text-xs font-semibold text-rose-600">
                  <Trash2 className="h-3.5 w-3.5" /> remover foto
                </button>
              )}
              {!form.photo && (
                <button type="button" onClick={() => fileRef.current?.click()} className="ml-2 flex items-center gap-1 text-xs font-semibold text-brand">
                  <ImagePlus className="h-3.5 w-3.5" /> enviar foto
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Data de nascimento">
            <input type="date" className="input" value={form.birthDate ?? ""} onChange={(e) => set("birthDate", e.target.value)} />
          </Field>
          <Field label="Sexo">
            <Select value={form.gender ?? ""} onChange={(e) => set("gender", (e.target.value || undefined) as Form["gender"])}>
              <option value="">—</option>
              <option value="F">Feminino</option>
              <option value="M">Masculino</option>
              <option value="O">Outro</option>
            </Select>
          </Field>
          <Field label="Etapa do tratamento">
            <Select value={form.stage} onChange={(e) => set("stage", e.target.value as Form["stage"])}>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Celular / WhatsApp">
            <input className="input" inputMode="tel" value={form.phone ?? ""} onChange={(e) => set("phone", maskPhone(e.target.value))} placeholder="(11) 99999-9999" />
          </Field>
          <Field label="CPF">
            <input className="input" inputMode="numeric" value={form.cpf ?? ""} onChange={(e) => set("cpf", maskCPF(e.target.value))} placeholder="000.000.000-00" />
          </Field>
          <Field label="RG">
            <input className="input" value={form.rg ?? ""} onChange={(e) => set("rg", e.target.value)} />
          </Field>
          <Field label="E-mail" className="sm:col-span-2">
            <input type="email" className="input" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Profissão">
            <input className="input" value={form.profession ?? ""} onChange={(e) => set("profession", e.target.value)} />
          </Field>
          <Field label="Endereço" className="sm:col-span-2">
            <input className="input" value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="Rua, número, bairro" />
          </Field>
          <Field label="Cidade">
            <input className="input" value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Convênio">
            <input className="input" value={form.insurance ?? ""} onChange={(e) => set("insurance", e.target.value)} placeholder="Particular" />
          </Field>
          <Field label="Como conheceu">
            <input className="input" value={form.referredBy ?? ""} onChange={(e) => set("referredBy", e.target.value)} placeholder="Indicação, Instagram…" />
          </Field>
          <Field label="Contato de emergência">
            <input className="input" value={form.emergencyContact ?? ""} onChange={(e) => set("emergencyContact", e.target.value)} placeholder="Nome · telefone" />
          </Field>
        </div>

        <div>
          <span className="label">Etiquetas</span>
          <div className="flex flex-wrap gap-2">
            {tagDefs.map((t) => (
              <button type="button" key={t.name} onClick={() => toggleTag(t.name)} className={cn("transition", !form.tags.includes(t.name) && "opacity-40 grayscale hover:opacity-80")}>
                <TagChip name={t.name} />
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}
