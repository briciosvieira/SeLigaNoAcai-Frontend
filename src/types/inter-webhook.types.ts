export type InterPixWebhookInfo = {
  expectedWebhookUrl?: string | null;
  registeredWebhookUrl?: string | null;
  webhookUrl?: string | null;
  url?: string | null;
  success?: boolean;
  message?: string;
  [key: string]: unknown;
};
