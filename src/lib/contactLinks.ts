export const WHATSAPP_NUMBER = "5516995414563";

export const MENTORSHIP_APPLICATION_URL =
  "https://mentoria-gui.vercel.app/formulario/mentoria";

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
