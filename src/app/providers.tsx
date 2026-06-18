import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { env } from '@/config/env';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers() {
  return (
    <GoogleOAuthProvider clientId={env.googleClientId}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}
