import { AnimatePresence, motion } from "framer-motion";
import { Delete, Lock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { sha256 } from "@/lib/utils";
import { useStore } from "@/store/store";
import { signOut } from "@/store/sync";
import { Logo, ToothPattern } from "./Logo";

/** Bloqueio de tela por PIN — protege a tela quando o doutor se afasta do computador. */
export function LockScreen() {
  const locked = useStore((s) => s.locked);
  const pinHash = useStore((s) => s.settings.pinHash);
  const autoLock = useStore((s) => s.settings.autoLockMinutes);
  const setLocked = useStore((s) => s.setLocked);
  const doctor = useStore((s) => `${s.settings.title} ${s.settings.doctorName}`);
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(0);
  const idle = useRef(Date.now());

  useEffect(() => {
    if (!pinHash || !autoLock) return;
    const bump = () => (idle.current = Date.now());
    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const t = setInterval(() => {
      if (Date.now() - idle.current > autoLock * 60_000) setLocked(true);
    }, 15_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      clearInterval(t);
    };
  }, [pinHash, autoLock, setLocked]);

  const check = useCallback(
    async (value: string) => {
      if ((await sha256(value)) === pinHash) {
        setLocked(false);
        setPin("");
        idle.current = Date.now();
      } else {
        setShake((s) => s + 1);
        setPin("");
      }
    },
    [pinHash, setLocked],
  );

  const press = useCallback(
    (d: string) => {
      setPin((p) => {
        const next = (p + d).slice(0, 6);
        if (next.length >= 4 && next.length === 6) void check(next);
        return next;
      });
    },
    [check],
  );

  useEffect(() => {
    if (!locked) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
      else if (e.key === "Enter") void check(pin);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, pin, press, check]);

  return createPortal(
    <AnimatePresence>
      {locked && pinHash && (
        <motion.div
          className="sidebar-bg fixed inset-0 z-[90] flex flex-col items-center justify-center p-6 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
        >
          <ToothPattern className="absolute inset-0 h-full w-full text-white/[0.03]" />
          <div className="relative flex flex-col items-center">
            <Logo size={64} />
            <p className="mt-5 font-display text-2xl font-semibold">{doctor}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-jade-200/70">
              <Lock className="h-3.5 w-3.5" /> Tela bloqueada — digite seu PIN
            </p>
            <motion.div key={shake} animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : {}} className="mt-7 flex gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={`h-3.5 w-3.5 rounded-full border-2 border-jade-300 transition ${i < pin.length ? "bg-jade-300" : ""}`} />
              ))}
            </motion.div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "ok", "0", "del"].map((k) => (
                <button
                  key={k}
                  onClick={() => (k === "del" ? setPin((p) => p.slice(0, -1)) : k === "ok" ? void check(pin) : press(k))}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.07] text-xl font-semibold ring-1 ring-white/10 transition hover:bg-white/15 active:scale-95"
                >
                  {k === "del" ? <Delete className="h-5 w-5" /> : k === "ok" ? <span className="text-sm">OK</span> : k}
                </button>
              ))}
            </div>
            <button className="mt-8 text-xs font-semibold text-jade-200/60 hover:text-white" onClick={() => void signOut(true)}>
              Esqueci o PIN — sair e entrar com e-mail e senha
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
