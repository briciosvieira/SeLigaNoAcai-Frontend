export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  appName: import.meta.env.VITE_APP_NAME || 'Se Liga no Açaí',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '',
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  uploadsBaseUrl: import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:3000/uploads',
  enableGoogleLogin: import.meta.env.VITE_ENABLE_GOOGLE_LOGIN === 'true',
  enableCardOnline: import.meta.env.VITE_ENABLE_CARD_ONLINE === 'true',
  enableWhatsappFloat: import.meta.env.VITE_ENABLE_WHATSAPP_FLOAT === 'true',
  isDev: import.meta.env.VITE_APP_ENV === 'development',
} as const;
