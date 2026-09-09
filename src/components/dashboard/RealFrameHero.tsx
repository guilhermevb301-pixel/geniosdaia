import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import guiHero from "@/assets/dashboard/gui-realframe-hero.webp";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { displayNameOf } from "@/lib/displayName";

export function RealFrameHero() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["user_profile_name", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  const name = displayNameOf(
    profile?.display_name ??
      (user?.user_metadata?.full_name as string | undefined),
    user?.email,
  );

  return (
    <section className="relative isolate min-h-[244px] overflow-hidden rounded-lg border border-white/10 bg-[#101413] sm:min-h-[268px] lg:min-h-[286px]">
      <img
        src={guiHero}
        alt="Guilherme Vilas Boas"
        className="absolute inset-0 h-full w-full object-cover object-[67%_center] opacity-60 sm:object-center sm:opacity-82 lg:opacity-95"
        loading="eager"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,15,14,0.99)_0%,rgba(11,15,14,0.96)_38%,rgba(11,15,14,0.48)_70%,rgba(11,15,14,0.18)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-primary via-primary/25 to-transparent"
      />

      <div className="relative z-10 flex min-h-[244px] max-w-[38rem] flex-col justify-center px-6 py-8 sm:min-h-[268px] sm:px-8 lg:min-h-[286px] lg:px-10">
        <span className="micro-label text-primary">RealFrame IA</span>
        <h1 className="mt-4 max-w-[12ch] !text-[2.25rem] !font-semibold !leading-[0.98] !text-white sm:!text-[3rem]">
          {name ? `Olá, ${name}` : "Olá"}
        </h1>
        <p className="mt-4 max-w-[29rem] text-sm leading-relaxed text-white/66 sm:text-base">
          Seu próximo passo está pronto. Continue construindo com IA, sem
          acumular teoria.
        </p>
        <Link
          to="/aulas"
          className="focus-ring mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-[#07130f] hover:-translate-y-0.5"
        >
          Continuar aprendendo
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
