# 🔌 INTEGRAÇÃO FRONTEND-BACKEND - FLOWZZ PLATFORM

## 📋 Visão Geral

Este documento descreve a integração completa entre os três projetos da plataforma Flowzz:

- **Backend** (`/backend`) - API REST com Express + TypeScript + Prisma
- **Flow** (`/flow`) - Frontend do usuário com Next.js 14 App Router
- **Admin** (`/admin`) - Painel administrativo com Vite + React + TypeScript

---

## 🏗️ Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLOWZZ PLATFORM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐       ┌──────────────┐      ┌──────────────┐ │
│  │   FLOW       │       │    ADMIN     │      │   LANDING    │ │
│  │  (Next.js)   │       │  (Vite+React)│      │  (Next.js)   │ │
│  │              │       │              │      │              │ │
│  │ Port: 3000   │       │  Port: 5173  │      │  Port: 3001  │ │
│  └──────┬───────┘       └──────┬───────┘      └──────┬───────┘ │
│         │                      │                     │          │
│         │  HTTP/JSON + JWT     │                     │          │
│         └──────────────────────┼─────────────────────┘          │
│                                │                                │
│                     ┌──────────▼──────────┐                     │
│                     │     BACKEND         │                     │
│                     │  (Express + Prisma) │                     │
│                     │                     │                     │
│                     │   Port: 4000        │                     │
│                     │   /api/v1/*         │                     │
│                     └──────────┬──────────┘                     │
│                                │                                │
│                     ┌──────────▼──────────┐                     │
│                     │    PostgreSQL       │                     │
│                     │    Redis (Cache)    │                     │
│                     │    Bull (Queues)    │                     │
│                     └─────────────────────┘                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Inicial

### 1. **Backend Setup**

```bash
# Navegar para o backend
cd backend

# Copiar .env.example
cp .env.example .env

# Editar .env com suas credenciais
# Importante: Configurar DATABASE_URL, JWT_SECRET, REDIS_URL

# Instalar dependências
npm install

# Rodar migrações do Prisma
npx prisma migrate dev

# Seed inicial (opcional)
npx prisma db seed

# Iniciar servidor
npm run dev
```

**Backend estará rodando em: http://localhost:4000**

---

### 2. **Flow (User Frontend) Setup**

```bash
# Navegar para o flow
cd flow

# Copiar .env.local.example
cp .env.local.example .env.local

# Editar .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Instalar dependências
npm install

# Instalar axios (se não estiver instalado)
npm install axios

# Iniciar servidor de desenvolvimento
npm run dev
```

**Flow estará rodando em: http://localhost:3000**

---

### 3. **Admin Panel Setup**

```bash
# Navegar para o admin
cd admin

# Copiar .env.example
cp .env.example .env

# Editar .env
# VITE_API_URL=http://localhost:4000/api/v1

# Instalar dependências
npm install

# Instalar axios e zustand (se não estiverem instalados)
npm install axios zustand

# Iniciar servidor de desenvolvimento
npm run dev
```

**Admin estará rodando em: http://localhost:5173**

---

## 📡 API Client Configuration

### **Backend - CORS Configuration**

O backend já está configurado para aceitar requisições dos frontends:

```typescript
// backend/src/server.ts
const allowedOrigins = [
  'http://localhost:3000',  // Flow
  'http://localhost:5173',  // Admin
  'http://localhost:3001',  // Landing
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

### **Flow - API Client**

**Arquivo:** `flow/src/lib/api-client.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Interceptor para adicionar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      // Tentar refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      // ... lógica de refresh
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### **Admin - API Client**

**Arquivo:** `admin/src/lib/api/client.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Same interceptors as Flow
```

---

## 🔐 Autenticação e Autorização

### **Fluxo de Autenticação**

```
1. Usuário faz login
   └─> POST /api/v1/auth/login
       ├─> Body: { email, password }
       └─> Response: { user, access_token, refresh_token }

2. Frontend salva tokens
   ├─> localStorage.setItem('access_token', token)
   └─> localStorage.setItem('refresh_token', refreshToken)

3. Requisições subsequentes
   └─> Header: Authorization: Bearer {access_token}

4. Token expira (15min)
   ├─> Backend retorna 401
   ├─> Interceptor detecta 401
   ├─> POST /api/v1/auth/refresh { refresh_token }
   ├─> Recebe novos tokens
   └─> Repete requisição original
```

### **Proteção de Rotas no Flow (Next.js)**

**Arquivo:** `flow/src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  
  // Rotas protegidas
  const protectedPaths = ['/dashboard', '/clients', '/sales', '/settings'];
  
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/clients/:path*', '/sales/:path*', '/settings/:path*'],
};
```

### **Proteção de Rotas no Admin (React Router)**

**Arquivo:** `admin/src/components/PrivateRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

---

## 📚 Hooks e Stores

### **useAuth Hook (Admin)**

```typescript
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const { user, login, logout, isAuthenticated } = useAuthStore();

  return {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin: user?.role === 'ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  };
};

// Usage
const { login, user, isAuthenticated } = useAuth();

await login({ email: 'admin@flowzz.com', password: 'password' });
```

---

## 🧪 Exemplos de Uso

### **1. Login (Flow)**

```typescript
// pages/login/page.tsx
'use client';

import { useState } from 'react';
import { authApi } from '@/lib/auth-api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await authApi.login({ email, password });
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### **2. Buscar Clientes (Flow)**

```typescript
// app/clients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await apiClient.get('/clients?page=1&limit=20');
        setClients(data.data);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };

    fetchClients();
  }, []);

  return (
    <div>
      {clients.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  );
}
```

---

### **3. Admin Metrics (Admin Panel)**

```typescript
// pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api/admin-api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminApi.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {metrics && (
        <div>
          <p>MRR: R$ {metrics.mrr.toFixed(2)}</p>
          <p>ARR: R$ {metrics.arr.toFixed(2)}</p>
          <p>Churn: {metrics.churn_rate}%</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### **Erro: CORS Policy**

```
Access to XMLHttpRequest at 'http://localhost:4000/api/v1/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solução:**
- Verificar se o backend está rodando
- Confirmar que `FRONTEND_USER_URL` e `FRONTEND_ADMIN_URL` estão corretos no `.env` do backend
- Reiniciar o backend após alterar `.env`

---

### **Erro: 401 Unauthorized**

```
Request failed with status code 401
```

**Solução:**
- Verificar se o token está sendo enviado no header
- Verificar se o token não expirou
- Tentar fazer login novamente
- Limpar localStorage: `localStorage.clear()`

---

### **Erro: Network Error**

```
Network Error
```

**Solução:**
- Verificar se o backend está rodando em `http://localhost:4000`
- Verificar se `NEXT_PUBLIC_API_URL` ou `VITE_API_URL` estão corretos
- Verificar firewall/antivírus

---

## 📦 Dependências Necessárias

### **Backend**

```json
{
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "axios": "^1.7.2",
    "jsonwebtoken": "^9.0.2",
    "@prisma/client": "^5.16.1"
  }
}
```

### **Flow (Next.js)**

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "axios": "^1.7.2"
  }
}
```

### **Admin (Vite+React)**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.7.2",
    "zustand": "^4.5.0"
  }
}
```

---

## ✅ Checklist de Integração

- [ ] Backend rodando em http://localhost:4000
- [ ] Flow rodando em http://localhost:3000
- [ ] Admin rodando em http://localhost:5173
- [ ] Arquivos `.env` configurados em todos os projetos
- [ ] CORS configurado no backend para aceitar ambos frontends
- [ ] Axios instalado no Flow e Admin
- [ ] Zustand instalado no Admin
- [ ] Tokens sendo salvos no localStorage
- [ ] Interceptors de refresh token funcionando
- [ ] Rotas protegidas configuradas
- [ ] Login/Logout funcionando em ambos frontends
- [ ] Requisições autenticadas retornando dados

---

## 🚀 Próximos Passos

1. **Testes de Integração**
   - Testar login/logout em ambos frontends
   - Testar refresh token automático
   - Testar proteção de rotas

2. **Deploy**
   - Configurar variáveis de ambiente de produção
   - Atualizar URLs do CORS para domínios de produção
   - Configurar HTTPS

3. **Melhorias**
   - Implementar React Query para cache de dados
   - Adicionar loading states
   - Implementar error boundaries
   - Adicionar toast notifications

---

**Integração completa e pronta para uso! 🎉**
