import { useEffect, useRef } from "react";
import { useStore } from "@/store/store";
import { toDate } from "./utils";

/** Dispara notificações do navegador quando um lembrete vence (se o doutor permitir). */
export function useReminderAlerts() {
  const enabled = useStore((s) => s.settings.notificationsEnabled);
  const fired = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const startedAt = Date.now();
    const tick = () => {
      const now = Date.now();
      for (const p of useStore.getState().patients) {
        for (const r of p.reminders) {
          if (r.done || fired.current.has(r.id)) continue;
          const due = toDate(r.dueAt)?.getTime() ?? 0;
          if (due <= now && due > startedAt - 60_000) {
            fired.current.add(r.id);
            new Notification(`🦷 ${r.title}`, { body: p.name, tag: r.id });
          }
        }
      }
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [enabled]);
}
