export function getApiErrorMessage(error: unknown): string {
  const anyError = error as Record<string, unknown>;
  const responseData = (anyError?.response as Record<string, unknown>)?.data as
    | Record<string, unknown>
    | undefined;

  if (Array.isArray(responseData?.message)) {
    return (responseData.message as string[]).join(', ');
  }

  if (typeof responseData?.message === 'string') {
    return responseData.message;
  }

  if (typeof responseData?.error === 'string') {
    return responseData.error;
  }

  return 'Não foi possível concluir a operação. Tente novamente.';
}
