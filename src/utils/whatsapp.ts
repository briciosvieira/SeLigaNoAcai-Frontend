export function onlyDigits(value?: string | null): string {
  return String(value ?? '').replace(/\D/g, '');
}

export function buildWhatsAppUrl(phone?: string | null, message?: string): string | null {
  const digits = onlyDigits(phone);
  if (!digits) return null;
  const normalized = digits.startsWith('55') ? digits : `55${digits}`;
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${normalized}${encodedMessage}`;
}
