export function parseBRLInput(value: string): number {
  const normalized = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.]/g, '');

  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}
