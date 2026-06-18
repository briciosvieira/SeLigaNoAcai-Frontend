export function normalizeCouponCode(value: string | null | undefined): string {
  return String(value ?? '').trim().toUpperCase();
}
