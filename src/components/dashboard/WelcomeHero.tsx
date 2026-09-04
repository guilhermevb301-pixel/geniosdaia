import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { displayNameOf } from "@/lib/displayName";

export function WelcomeHero() {
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
    profile?.display_name ?? (user?.user_metadata?.full_name as string | undefined),
    user?.email,
  );

  return (
    <section>
      <h1 className="!text-white text-[2rem] sm:text-[2.25rem]">
        {name ? `Olá, ${name}` : "Olá"}
      </h1>
    </section>
  );
}
