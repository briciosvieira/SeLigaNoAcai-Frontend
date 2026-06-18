export function safeText(value: string | null | undefined, fallback = '—'): string {
  if (value == null || String(value).trim() === '') return fallback;
  return String(value);
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const d = phone.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}

export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '—';
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function getErrorMessage(err: unknown): string {
  const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (apiMsg) return apiMsg;
  if (err instanceof Error) return err.message;
  return 'Ocorreu um erro inesperado.';
}

export function isForbiddenError(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 403;
}
