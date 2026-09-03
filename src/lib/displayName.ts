/**
 * Nome de exibição do aluno: usa o nome salvo no perfil quando existir, e só
 * cai para o início do e-mail quando esse início parece um nome de verdade
 * (só letras) — evita saudar/identificar o aluno como "Guilhermevb301".
 */
export function displayNameOf(fullName?: string | null, email?: string | null): string | null {
  const fromName = fullName?.trim().split(/\s+/)[0];
  if (fromName) return fromName;

  const fromEmail = email?.split("@")[0]?.split(/[.+_-]/)[0];
  if (!fromEmail || !/^[a-zà-ú]{2,}$/i.test(fromEmail)) return null;
  return fromEmail.charAt(0).toUpperCase() + fromEmail.slice(1);
}
