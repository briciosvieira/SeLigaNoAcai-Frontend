# 🍇 Se Liga no Açaí — Frontend

Interface web/mobile-first do **Se Liga no Açaí**, desenvolvida com **React + Vite + TypeScript**, usando uma estrutura organizada por **services**, **stores Zustand**, **hooks**, **features**, **components** e **layouts**.

O objetivo é construir uma aplicação responsiva para **cliente**, **funcionário** e **administrador**, priorizando o uso em **celular e tablet**, sem abrir mão de uma boa experiência no desktop.

---

## 1. Objetivo

O frontend será responsável por:

### Cliente

```txt
login manual
login com Google
continuar sem cadastro
seleção de bairro
consulta de cardápio
montagem de produtos
carrinho
checkout
pagamento PIX
pagamento dinheiro na entrega
pagamento cartão na entrega
confirmação do pedido
meus pedidos
perfil
endereços
fidelidade
```

### Funcionário / Staff

```txt
visualizar áreas permitidas
gerenciar clientes CUSTOMER
alterar dados de clientes
alterar senha de clientes
acompanhar pedidos, se tiver permissão
atualizar status de pedidos, se tiver permissão
não gerenciar ADMIN
não gerenciar STAFF
não alterar cargos/permissões
```

### Administrador

```txt
dashboard
pedidos
pagamentos
clientes
usuários admin/staff
permissões
produtos
categorias
adicionais
bairros/taxas
loja
fidelidade
uploads
```

---

## 2. Prioridade de Interface

A aplicação deve ser construída com abordagem **mobile-first**.

```txt
1. Celular
2. Tablet
3. Desktop
```

### Mobile

```txt
navegação inferior
cards compactos
scroll horizontal para seções de produtos
bottom sheets para seleção/montagem
botões grandes
checkout direto
poucos campos por etapa
```

### Tablet

```txt
layout ainda próximo do mobile
cards em 2 colunas quando fizer sentido
maior espaçamento
bottom sheets ou modais centrais conforme contexto
```

### Desktop

```txt
cliente com largura máxima controlada
admin com sidebar
tabelas mais completas
filtros laterais/superiores
maior densidade de dados
```

---

## 3. Stack

```txt
React
Vite
TypeScript
React Router DOM
Axios
Zustand
React Hook Form
Zod
@hookform/resolvers
Lucide React
clsx
tailwind-merge
```

### Sobre Zustand e Hooks

O Zustand **não substitui hooks**.

O padrão correto será:

```txt
services  -> chamadas HTTP
stores    -> estado global com Zustand
hooks     -> regras de uso da feature
pages     -> composição das telas
components -> UI reaproveitável
```

Ou seja:

```txt
A page chama o hook.
O hook usa service e store.
O service chama a API.
O store guarda estado global.
```

---

## 4. Instalação

```bash
npm create vite@latest frontend -- --template react-ts

cd frontend

npm install react-router-dom axios zustand
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react clsx tailwind-merge
npm install @react-oauth/google
```

Se usar Tailwind:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 5. Variáveis de Ambiente

Arquivo `.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Se Liga no Açaí
VITE_WHATSAPP_NUMBER=5571999999991
VITE_GOOGLE_CLIENT_ID=SEU_CLIENT_ID_GOOGLE.apps.googleusercontent.com
```

Uso:

```ts
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 6. Estrutura de Pastas

```txt
src/
 ├── app/
 │   ├── App.tsx
 │   ├── router.tsx
 │   └── providers.tsx
 │
 ├── assets/
 │   └── images/
 │
 ├── components/
 │   ├── layout/
 │   │   ├── CustomerLayout.tsx
 │   │   ├── AdminLayout.tsx
 │   │   ├── BottomNav.tsx
 │   │   ├── Header.tsx
 │   │   ├── PageContainer.tsx
 │   │   └── ProtectedRoute.tsx
 │   │
 │   ├── ui/
 │   │   ├── Button.tsx
 │   │   ├── Input.tsx
 │   │   ├── Select.tsx
 │   │   ├── Modal.tsx
 │   │   ├── BottomSheet.tsx
 │   │   ├── Toast.tsx
 │   │   ├── Spinner.tsx
 │   │   ├── Badge.tsx
 │   │   ├── EmptyState.tsx
 │   │   └── ConfirmDialog.tsx
 │   │
 │   ├── product/
 │   │   ├── ProductCard.tsx
 │   │   ├── ProductList.tsx
 │   │   ├── ProductTabs.tsx
 │   │   └── ProductCustomizeSheet.tsx
 │   │
 │   ├── cart/
 │   │   ├── CartItem.tsx
 │   │   ├── CartSummary.tsx
 │   │   └── PaymentMethodSelector.tsx
 │   │
 │   ├── delivery/
 │   │   ├── DeliveryZoneSheet.tsx
 │   │   └── DeliveryZoneList.tsx
 │   │
 │   ├── loyalty/
 │   │   ├── LoyaltyCard.tsx
 │   │   └── LoyaltyBenefits.tsx
 │   │
 │   ├── profile/
 │   │   ├── ProfileHeader.tsx
 │   │   └── ProfileField.tsx
 │   │
 │   └── admin/
 │       ├── AdminSidebar.tsx
 │       ├── AdminHeader.tsx
 │       ├── AdminMobileNav.tsx
 │       ├── AdminStatCard.tsx
 │       ├── AdminTable.tsx
 │       └── PermissionBadge.tsx
 │
 ├── features/
 │   ├── auth/
 │   │   └── pages/
 │   │       ├── LoginPage.tsx
 │   │       └── ChangePasswordPage.tsx
 │   │
 │   ├── location/
 │   │   └── pages/
 │   │       └── LocationPage.tsx
 │   │
 │   ├── catalog/
 │   │   └── pages/
 │   │       └── HomePage.tsx
 │   │
 │   ├── cart/
 │   │   └── pages/
 │   │       └── CartPage.tsx
 │   │
 │   ├── checkout/
 │   │   └── pages/
 │   │       ├── CheckoutPage.tsx
 │   │       ├── PixPage.tsx
 │   │       └── OrderConfirmationPage.tsx
 │   │
 │   ├── orders/
 │   │   └── pages/
 │   │       ├── OrdersPage.tsx
 │   │       ├── OrderDetailPage.tsx
 │   │       └── TrackingPage.tsx
 │   │
 │   ├── profile/
 │   │   └── pages/
 │   │       └── ProfilePage.tsx
 │   │
 │   ├── loyalty/
 │   │   └── pages/
 │   │       └── LoyaltyPage.tsx
 │   │
 │   └── admin/
 │       ├── dashboard/
 │       │   └── pages/AdminDashboardPage.tsx
 │       ├── orders/
 │       │   └── pages/AdminOrdersPage.tsx
 │       ├── customers/
 │       │   └── pages/AdminCustomersPage.tsx
 │       ├── users/
 │       │   └── pages/AdminUsersPage.tsx
 │       ├── products/
 │       │   └── pages/AdminProductsPage.tsx
 │       ├── payments/
 │       │   └── pages/AdminPaymentsPage.tsx
 │       ├── loyalty/
 │       │   └── pages/AdminLoyaltyPage.tsx
 │       └── store/
 │           └── pages/AdminStorePage.tsx
 │
 ├── hooks/
 │   ├── useAuth.ts
 │   ├── useGoogleAuth.ts
 │   ├── useCart.ts
 │   ├── useLocation.ts
 │   ├── useCatalog.ts
 │   ├── useCheckout.ts
 │   ├── useOrders.ts
 │   ├── usePayments.ts
 │   ├── useProfile.ts
 │   ├── useLoyalty.ts
 │   ├── useAdminDashboard.ts
 │   ├── useAdminOrders.ts
 │   ├── useAdminCustomers.ts
 │   ├── useAdminUsers.ts
 │   ├── usePermissions.ts
 │   └── useToast.ts
 │
 ├── services/
 │   ├── api.ts
 │   ├── auth.service.ts
 │   ├── customers.service.ts
 │   ├── store.service.ts
 │   ├── delivery-zones.service.ts
 │   ├── catalog.service.ts
 │   ├── orders.service.ts
 │   ├── payments.service.ts
 │   ├── loyalty.service.ts
 │   ├── uploads.service.ts
 │   └── admin.service.ts
 │
 ├── store/
 │   ├── auth.store.ts
 │   ├── cart.store.ts
 │   ├── location.store.ts
 │   ├── checkout.store.ts
 │   └── ui.store.ts
 │
 ├── types/
 │   ├── api.types.ts
 │   ├── auth.types.ts
 │   ├── customer.types.ts
 │   ├── delivery-zone.types.ts
 │   ├── product.types.ts
 │   ├── cart.types.ts
 │   ├── order.types.ts
 │   ├── payment.types.ts
 │   ├── loyalty.types.ts
 │   └── admin.types.ts
 │
 ├── utils/
 │   ├── currency.util.ts
 │   ├── phone.util.ts
 │   ├── cpf.util.ts
 │   ├── date.util.ts
 │   └── whatsapp.util.ts
 │
 ├── constants/
 │   ├── routes.ts
 │   ├── payment-methods.ts
 │   ├── permissions.ts
 │   └── app.ts
 │
 ├── styles/
 │   ├── globals.css
 │   ├── theme.css
 │   └── responsive.css
 │
 └── main.tsx
```

---

## 7. Padrão Services

Services são responsáveis apenas por chamar a API.

Exemplo:

```ts
// src/services/auth.service.ts
import { api } from './api';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  GoogleLoginPayload,
  ChangeMyPasswordPayload,
} from '@/types/auth.types';

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post('/auth/login', payload);
  return response.data.data;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post('/auth/register', payload);
  return response.data.data;
}

export async function googleLoginRequest(
  payload: GoogleLoginPayload,
): Promise<AuthResponse> {
  const response = await api.post('/auth/google', payload);
  return response.data.data;
}

export async function getMeRequest() {
  const response = await api.get('/auth/me');
  return response.data.data;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}

export async function changeMyPasswordRequest(
  payload: ChangeMyPasswordPayload,
): Promise<{ updated: boolean }> {
  const response = await api.patch('/auth/me/password', payload);
  return response.data.data;
}
```

Regra:

```txt
Service não deve guardar estado.
Service não deve mexer no localStorage.
Service não deve navegar.
Service não deve exibir toast.
```

---

## 8. Padrão Stores Zustand

Stores guardam estado global.

Exemplo:

```ts
// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/auth.types';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (params: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        }),
    }),
    {
      name: 'seliga-auth',
    },
  ),
);
```

Regra:

```txt
Store guarda estado.
Store tem actions simples.
Store não deve chamar API diretamente.
Store não deve conter regra complexa de tela.
```

---

## 9. Padrão Hooks

Hooks são a camada de uso da feature.

Eles podem:

```txt
chamar services
ler/escrever stores
controlar loading
controlar erro
chamar toast
navegar
validar regra de uso
```

Exemplo:

```ts
// src/hooks/useAuth.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loginRequest,
  logoutRequest,
  getMeRequest,
  changeMyPasswordRequest,
} from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import type { ChangeMyPasswordPayload, LoginPayload } from '@/types/auth.types';

export function useAuth() {
  const navigate = useNavigate();
  const { user, accessToken, refreshToken, setAuth, setUser, clearAuth } =
    useAuthStore();

  const [isLoading, setIsLoading] = useState(false);

  async function login(payload: LoginPayload) {
    setIsLoading(true);

    try {
      const auth = await loginRequest(payload);
      setAuth(auth);
      navigate('/');
      return auth;
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMe() {
    const me = await getMeRequest();
    setUser(me);
    return me;
  }

  async function changeMyPassword(payload: ChangeMyPasswordPayload) {
    setIsLoading(true);

    try {
      return await changeMyPasswordRequest(payload);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      clearAuth();
      navigate('/login');
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken),
    isLoading,
    login,
    loadMe,
    changeMyPassword,
    logout,
  };
}
```

Regra:

```txt
Pages usam hooks.
Hooks usam stores e services.
Components recebem props e emitem eventos.
```

---

## 10. API Client

```ts
// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

Futuro recomendado:

```txt
interceptor para refresh token
tratamento global de 401
logout automático quando refresh falhar
```

---

## 11. Rotas do Cliente

```txt
/                     Home
/login                Login
/location             Seleção de bairro
/cart                 Carrinho
/checkout             Checkout
/payment/pix          PIX
/order-confirmation   Confirmação
/orders               Meus pedidos
/orders/:id           Detalhe do pedido
/tracking             Tracking público
/profile              Perfil
/loyalty              Fidelidade
```

---

## 12. Rotas Admin

```txt
/admin                         Dashboard
/admin/orders                  Pedidos
/admin/orders/pending          Fila de pedidos
/admin/payments                Pagamentos
/admin/customers               Clientes
/admin/users                   Usuários admin/staff
/admin/products                Produtos
/admin/categories              Categorias
/admin/options                 Adicionais
/admin/delivery-zones          Bairros e taxas
/admin/store                   Loja
/admin/loyalty                 Fidelidade
/admin/uploads                 Uploads
```

---

## 13. Proteção de Rotas

### Cliente autenticado

```txt
/orders
/orders/:id
/profile
/loyalty
```

### Admin/Staff

```txt
/admin/*
```

Regras:

```txt
CUSTOMER não acessa admin.
STAFF acessa somente áreas permitidas.
ADMIN acessa tudo.
```

Exemplo de hook:

```ts
// src/hooks/usePermissions.ts
import { useAuthStore } from '@/store/auth.store';
import type { AdminPermission } from '@/types/admin.types';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  function isAdmin() {
    return user?.role === 'ADMIN';
  }

  function isStaff() {
    return user?.role === 'STAFF';
  }

  function hasPermission(permission: AdminPermission) {
    if (isAdmin()) return true;
    return user?.permissions?.includes(permission) ?? false;
  }

  return {
    isAdmin,
    isStaff,
    hasPermission,
  };
}
```

---

## 14. Endpoints Auth

```txt
POST  /auth/register
POST  /auth/login
POST  /auth/google
POST  /auth/refresh
POST  /auth/logout
GET   /auth/me
PATCH /auth/me/password
```

Recuperação de senha por e-mail fica para o futuro:

```txt
POST /auth/forgot-password
POST /auth/reset-password
```

---

## 15. Endpoints Admin Customers

```txt
GET   /admin/customers
GET   /admin/customers/:id
PATCH /admin/customers/:id
PATCH /admin/customers/:id/status
PATCH /admin/customers/:id/password
```

Regra:

```txt
ADMIN e STAFF podem acessar.
Apenas usuários CUSTOMER podem ser alterados por essas rotas.
STAFF não altera ADMIN nem STAFF.
```

---

## 16. Endpoints Admin Users

```txt
GET    /admin/users
GET    /admin/users/:id
POST   /admin/users
PATCH  /admin/users/:id
PATCH  /admin/users/:id/role
PATCH  /admin/users/:id/status
PATCH  /admin/users/:id/permissions
DELETE /admin/users/:id
```

Regra:

```txt
Somente ADMIN acessa.
STAFF não acessa.
```

---

## 17. Endpoints de Catálogo

```txt
GET    /store/current

GET    /delivery-zones
GET    /delivery-zones/:id

GET    /categories
GET    /categories/:id

GET    /products
GET    /products/:id
GET    /products/:productId/variants
GET    /products/:productId/option-groups

GET    /options/groups
GET    /options/groups/:id
```

---

## 18. Endpoints de Pedido

```txt
POST  /orders
GET   /orders/my-orders
GET   /orders/my-orders/:id
GET   /orders/tracking/:orderNumber?phone=71999999999

GET   /orders
GET   /orders/:id
PATCH /orders/:id/status
PATCH /orders/:id/payment-status
```

---

## 19. Endpoints de Pagamento

```txt
GET    /payments
GET    /payments/:id
GET    /payments/order/:orderId
POST   /payments/order/:orderId/pix
GET    /payments/:id/pix
POST   /payments/order/:orderId/manual
PATCH  /payments/:id/status
POST   /payments/webhook/inter
```

---

## 20. Fluxo do Cliente

```txt
1. Acessa o app.
2. Faz login ou continua como visitante.
3. Seleciona bairro.
4. Consulta cardápio.
5. Monta produto.
6. Adiciona ao carrinho.
7. Escolhe forma de pagamento.
8. Cria pedido no backend.
9. Gera PIX ou cria pagamento manual.
10. Visualiza confirmação.
11. Acompanha por histórico ou tracking.
```

---

## 21. Fluxo PIX

```txt
1. Criar pedido com paymentMethod PIX.
2. Receber orderId.
3. Chamar POST /payments/order/:orderId/pix.
4. Exibir QR Code e copia e cola.
5. Chamar GET /payments/:paymentId/pix para sincronizar.
6. Exibir status ao cliente.
```

---

## 22. Carrinho

O carrinho fica no frontend:

```txt
Zustand + persist
localStorage
sem tabela no banco
backend recalcula tudo no checkout
```

Item mínimo no carrinho:

```ts
export type CartItem = {
  productId: string;
  productVariantId?: string;
  quantity: number;
  selectedOptions: {
    optionGroupId: string;
    optionId: string;
  }[];
  notes?: string;
  unitPrice: number;
  totalAmount: number;
};
```

---

## 23. Design System

As cores vêm do protótipo HTML.

```css
:root {
  --roxo: #5b1a8a;
  --roxo-v: #8b2fc9;
  --roxo-c: #c084fc;

  --am: #f5c800;
  --am-c: #ffe566;

  --vd: #2d7a2d;
  --vd-v: #38a838;
  --vd-c: #7ed957;

  --bg: #0d0d0d;
  --c1: #1a1a1a;
  --c2: #222222;
  --c3: #333333;
  --c4: #444444;

  --txt: #ffffff;
  --t2: rgba(255,255,255,.55);
  --t3: rgba(255,255,255,.28);

  --card: #1e1e1e;
  --bnav: 64px;
  --max: 480px;
}
```

Fontes:

```txt
Pacifico
Nunito
```

---

## 24. Ordem de Desenvolvimento

```txt
1. Configurar estrutura de pastas.
2. Criar theme.css e globals.css.
3. Criar api.ts.
4. Criar auth.store.
5. Criar cart.store.
6. Criar location.store.
7. Criar hooks principais.
8. Criar router.tsx.
9. Criar layouts.
10. Criar componentes UI base.
11. Criar LoginPage.
12. Integrar Google Login.
13. Criar HomePage.
14. Criar DeliveryZoneSheet.
15. Criar ProductCustomizeSheet.
16. Criar CartPage.
17. Criar Checkout.
18. Criar PixPage.
19. Criar ConfirmationPage.
20. Criar OrdersPage.
21. Criar ProfilePage.
22. Criar LoyaltyPage.
23. Criar AdminLayout.
24. Criar AdminDashboard.
25. Criar AdminOrders.
26. Criar AdminCustomers.
27. Criar AdminUsers.
28. Criar demais telas administrativas.
```

---

## 25. Primeira Entrega

A primeira versão do frontend deve conter:

```txt
Cliente:
- login manual
- login Google
- visitante
- seleção de bairro
- home/cardápio
- montagem de produto
- carrinho
- checkout
- PIX
- confirmação
- pedidos
- perfil
- fidelidade básica

Admin:
- dashboard básico
- fila de pedidos
- clientes
- usuários admin/staff
```

---

## 26. Scripts

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
}
```

---

## 27. Licença

Projeto privado pertencente ao **Se Liga no Açaí**.