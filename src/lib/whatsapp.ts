/**
 * WhatsApp SSOT — SDR Laura (Grupo US).
 * Cardinal #6: never inline wa.me URLs anywhere else.
 */

export const WHATSAPP_SDR_E164 = "556294705081";

export const WHATSAPP_DEFAULT_MESSAGE =
	"Olá, Laura! Quero saber mais sobre a próxima turma do OTB nos Estados Unidos.";

const REQUIRED_PREFIX = "Olá, Laura!";

const WHATSAPP_URL_PATTERN = /^https?:\/\/(wa\.me|api\.whatsapp\.com)/i;

export function whatsappUrlWithText(message: string): string {
	if (!message.startsWith(REQUIRED_PREFIX)) {
		throw new Error(
			`WhatsApp message must start with "${REQUIRED_PREFIX}" (SDR SSOT). Received: "${message.slice(0, 32)}…"`,
		);
	}
	return `https://wa.me/${WHATSAPP_SDR_E164}?text=${encodeURIComponent(message)}`;
}

export function isWhatsAppDestination(url: string): boolean {
	return WHATSAPP_URL_PATTERN.test(url);
}

export function defaultWhatsAppUrl(): string {
	return whatsappUrlWithText(WHATSAPP_DEFAULT_MESSAGE);
}
