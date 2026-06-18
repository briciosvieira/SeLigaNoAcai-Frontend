import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { RegisterModal } from '@/features/auth/components/RegisterModal';
import { Eye, EyeOff } from 'lucide-react';
import acai1 from '@/assets/acai1.png';
import acai12 from '@/assets/acai12.jpeg';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login, googleLogin, continueAsGuest, isLoading, error, clearError } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await login(data).catch(() => {});
  }

  function handleGoogleSuccess(cr: CredentialResponse) {
    if (cr.credential) {
      googleLogin(cr.credential).catch(() => {});
    }
  }

  function handleOpenRegister() {
    clearError();
    setShowRegister(true);
  }

  return (
    <>
      <div className="login-root">

        {/* ── Mobile: imagem visível no topo ── */}
        <div className="login-img-top">
          <img src={acai12} alt="Se Liga no Açaí" className="login-img-top__img" />
          <div className="login-img-top__fade" />
        </div>

        {/* ── Desktop: imagem cobre todo o fundo (position: fixed) ── */}
        <div
          className="login-bg-desktop"
          style={{ backgroundImage: `url(${acai1})` }}
        />
        <div className="login-bg-overlay" />

        {/* ── Conteúdo ── */}
        <div className="login-content">
          <div className="login-spacer" />

          {/* ── Painel do formulário ── */}
          <main className="login-form-col">
            <div className="login-form-box">

              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: '1.55rem', fontWeight: 800, marginBottom: 6, color: '#fff' }}>
                  Bem-vindo de volta!
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>
                  Entre com sua conta para pedir
                </p>
              </div>

              {/* Formulário email/senha */}
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <AuthField
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <div style={{ position: 'relative' }}>
                  <AuthField
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    style={{ paddingRight: 44 }}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      bottom: errors.password ? 26 : 11,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.45)',
                      padding: 0,
                    }}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && (
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(229,62,62,0.15)',
                    border: '1px solid rgba(229,62,62,0.35)',
                    borderRadius: 'var(--r-sm)',
                    color: '#fc8181',
                    fontSize: '0.82rem',
                    textAlign: 'center',
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '13px',
                    background: isLoading ? 'rgba(91,26,138,0.5)' : 'var(--roxo-v)',
                    border: 'none',
                    borderRadius: 'var(--r-md)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background 0.2s',
                    marginTop: 4,
                  }}
                >
                  {isLoading ? <BtnSpinner /> : 'Entrar'}
                </button>
              </form>

              {/* Divisor */}
              <Divider label="ou continue com" />

              {/* Google Login */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => clearError()}
                  theme="filled_black"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="360"
                />
              </div>

              {/* Continuar sem cadastro */}
              <button
                type="button"
                onClick={continueAsGuest}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 'var(--r-md)',
                  color: 'rgba(255,255,255,0.55)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                }}
              >
                Continuar sem cadastro
              </button>

              {/* Link criar conta */}
              <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)' }}>
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={handleOpenRegister}
                  style={{ background: 'none', border: 'none', color: 'var(--roxo-c)', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit' }}
                >
                  Criar conta grátis
                </button>
              </p>

            </div>
          </main>
        </div>
      </div>

      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}

      <style>{loginStyles}</style>
    </>
  );
}

/* ── Componentes auxiliares ── */

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 14px' }}>
      <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.12)', borderTop: 'none' }} />
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{label}</span>
      <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.12)', borderTop: 'none' }} />
    </div>
  );
}

function BtnSpinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: 18,
      height: 18,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

function AuthField({
  label,
  error,
  style: extraStyle,
  ...props
}: { label: string; error?: string; style?: React.CSSProperties } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 5, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          width: '100%',
          padding: '11px 14px',
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${error ? '#e53e3e' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 'var(--r-md)',
          color: '#fff',
          fontSize: '0.95rem',
          outline: 'none',
          transition: 'border-color 0.2s',
          ...extraStyle,
        }}
      />
      {error && (
        <span style={{ color: '#e53e3e', fontSize: '0.72rem', marginTop: 3, display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
}

/* ── CSS ── */
const loginStyles = `
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ────────────────────────────────────────────
     MOBILE  (padrão)
     Imagem acai1 visível no topo + form abaixo
  ──────────────────────────────────────────── */

  .login-root {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  /* Imagem no topo — mobile only */
  .login-img-top {
    position: relative;
    width: 100%;
    height: 42dvh;
    min-height: 210px;
    flex-shrink: 0;
    overflow: hidden;
  }

  .login-img-top__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 22%;
    display: block;
  }

  /* fade suave na base da imagem → funde com o gradiente do form */
  .login-img-top__fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(13, 5, 28, 0.05) 0%,
      rgba(13, 5, 28, 0.40) 55%,
      rgba(13, 5, 28, 0.96) 85%,
      #0d0507 100%
    );
  }

  /* Desktop bg: oculto no mobile */
  .login-bg-desktop { display: none; }
  .login-bg-overlay  { display: none; }

  /* conteúdo do form no mobile */
  .login-content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .login-spacer { display: none; }

  .login-form-col {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 20px 20px 44px;
    /* gradiente que continua a "descida" da imagem */
    background: linear-gradient(
      to bottom,
      #0d0507 0%,
      #130524 18%,
      #0d0d0d 55%
    );
  }

  .login-form-box {
    width: 100%;
    max-width: 420px;
  }

  /* ────────────────────────────────────────────
     DESKTOP (≥ 1024 px)
     acai1 cobre todo o fundo; form à direita
     com painel semi-transparente
  ──────────────────────────────────────────── */
  @media (min-width: 1024px) {

    .login-root {
      position: relative;
      flex-direction: row;
      min-height: 100dvh;
    }

    /* oculta imagem-topo mobile */
    .login-img-top { display: none; }

    /* fundo fixo: acai1 */
    .login-bg-desktop {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 0;
      background-size: cover;
      background-position: center;
    }

    /* overlay horizontal: esquerda clara, direita escura */
    .login-bg-overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 1;
      background: linear-gradient(
        to right,
        rgba(13, 5, 28, 0.12) 0%,
        rgba(13, 5, 28, 0.12) 46%,
        rgba(13, 5, 28, 0.58) 66%,
        rgba(13, 5, 28, 0.84) 100%
      );
    }

    /* conteúdo acima do fundo */
    .login-content {
      position: relative;
      z-index: 2;
      flex-direction: row;
      align-items: stretch;
      min-height: 100dvh;
      width: 100%;
    }

    /* espaço esquerdo — exibe a imagem */
    .login-spacer { display: block; flex: 1; }

    /* painel direito: semi-transparente */
    .login-form-col {
      flex: 0 0 480px;
      align-items: center;
      justify-content: center;
      padding: 56px 52px;
      background: rgba(10, 4, 22, 0.50);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-left: 1px solid rgba(255, 255, 255, 0.05);
    }

    .login-form-box {
      max-width: 100%;
    }
  }
`;
