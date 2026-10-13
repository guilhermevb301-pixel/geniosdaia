export function DoctorLoginIdentity({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-jade-100 bg-jade-50/70 p-3">
        <img
          src="/dr-mizael.png"
          alt="Dr. Mizael Magalhães Cardoso"
          className="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover object-top shadow-sm"
        />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-ink">Dr. Mizael Magalhães Cardoso</p>
          <p className="mt-0.5 text-[11px] leading-snug text-ink-3">Cirurgia e Traumatologia Bucomaxilofacial</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative z-10 w-fit" tabIndex={0} aria-label="Conheça o Dr. Mizael Magalhães Cardoso">
      <div className="pointer-events-none absolute bottom-[calc(100%+12px)] left-0 w-80 translate-y-2 rounded-2xl border border-white/15 bg-emerald-950/95 p-4 opacity-0 shadow-2xl shadow-black/25 backdrop-blur-md transition duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
        <p className="font-display text-lg font-semibold text-white">Dr. Mizael Magalhães Cardoso</p>
        <p className="mt-1 text-sm leading-relaxed text-jade-100/75">Cirurgia e Traumatologia Bucomaxilofacial</p>
        <div className="mt-3 h-px bg-white/10" />
        <p className="mt-3 text-xs leading-relaxed text-jade-200/60">Um prontuário pensado especialmente para o cuidado dos seus pacientes.</p>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] py-2 pl-2 pr-4 backdrop-blur-sm transition duration-300 ease-out group-hover:-translate-y-1 group-hover:border-jade-300/35 group-hover:bg-white/[0.1] group-hover:shadow-xl group-hover:shadow-black/20 group-focus:-translate-y-1 group-focus:border-jade-300/35 group-focus:bg-white/[0.1]">
        <span className="relative">
          <span className="absolute -inset-1 rounded-full bg-jade-300/25 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100" />
          <img
            src="/dr-mizael.png"
            alt="Dr. Mizael Magalhães Cardoso"
            className="relative h-12 w-12 rounded-full border-2 border-white/80 object-cover object-top shadow-sm transition-transform duration-300 group-hover:scale-105 group-focus:scale-105"
          />
        </span>
        <span>
          <span className="block text-sm font-semibold text-white">Dr. Mizael</span>
          <span className="mt-0.5 block text-xs text-jade-200/55">Passe o mouse para conhecer</span>
        </span>
      </div>
    </div>
  );
}
