import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  fullName: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(11, 'Telefone inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

type Props = {
  onClose: () => void;
};

export function RegisterModal({ onClose }: Props) {
  const { register: registerUser, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await registerUser({
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      password: data.password,
    }).catch(() => {});
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--c1)',
          borderRadius: 'var(--r-xl)',
          padding: '28px 24px',
          width: '100%',
          maxWidth: 440,
          border: '1px solid var(--c3)',
          position: 'relative',
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Criar conta</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--t2)', marginTop: 2 }}>
              É rápido e gratuito
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)', padding: 4 }}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AuthField
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <AuthField
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <AuthField
            label="WhatsApp / Telefone"
            type="tel"
            placeholder="71999999999"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <AuthField
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />
          <AuthField
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {error && (
            <p style={{ color: '#e53e3e', fontSize: '0.8rem', textAlign: 'center', padding: '8px 12px', background: 'rgba(229,62,62,0.1)', borderRadius: 'var(--r-sm)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '13px',
              background: isLoading ? 'var(--c3)' : 'var(--roxo-v)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
          >
            {isLoading ? <Spinner /> : 'Criar minha conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: 'var(--t3)', lineHeight: 1.5 }}>
          Ao criar sua conta você concorda com nossos{' '}
          <span style={{ color: 'var(--roxo-c)' }}>termos de uso</span>.
        </p>
      </div>
    </div>
  );
}

function AuthField({
  label,
  error,
  ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 5, fontSize: '0.82rem', color: 'var(--t2)', fontWeight: 600 }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          width: '100%',
          padding: '11px 14px',
          background: 'var(--c2)',
          border: `1px solid ${error ? '#e53e3e' : 'var(--c3)'}`,
          borderRadius: 'var(--r-md)',
          color: 'var(--txt)',
          fontSize: '0.95rem',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? '#e53e3e' : 'var(--roxo-v)';
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#e53e3e' : 'var(--c3)';
          props.onBlur?.(e);
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

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: 16,
      height: 16,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}
