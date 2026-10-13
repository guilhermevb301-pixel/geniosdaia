/*
 * Links enviados pelo Supabase (convite, redefinição de senha, confirmação) voltam com
 * os tokens no "#" da URL. Como o app usa rotas com "#/", capturamos esses dados
 * antes de qualquer outra coisa e limpamos a URL.
 * Este módulo precisa ser o PRIMEIRO import de main.tsx.
 */
export interface CapturedAuth {
  access_token?: string;
  refresh_token?: string;
  type?: string;
  error?: string;
}

export let capturedAuth: CapturedAuth | null = null;

if (typeof window !== "undefined") {
  const raw = window.location.hash.replace(/^#\/?/, "");
  if (/(^|&)(access_token|error_description)=/.test(raw)) {
    const params = new URLSearchParams(raw);
    capturedAuth = {
      access_token: params.get("access_token") ?? undefined,
      refresh_token: params.get("refresh_token") ?? undefined,
      type: params.get("type") ?? undefined,
      error: params.get("error_description")?.replace(/\+/g, " ") ?? undefined,
    };
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/`);
  }
}
