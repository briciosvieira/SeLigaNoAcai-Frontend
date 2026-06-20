import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { env } from '@/config/env';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers() {
  if (!env.googleClientId) {
    console.error('VITE_GOOGLE_CLIENT_ID não configurado. Login com Google desativado.');
  }

  return (
    <GoogleOAuthProvider clientId={env.googleClientId}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}
