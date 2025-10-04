#!/bin/bash

# 🚀 Script de Setup da Integração Frontend-Backend - Flowzz Platform
# Este script instala todas as dependências necessárias para integração

echo "=================================================="
echo "🚀 FLOWZZ PLATFORM - INTEGRATION SETUP"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para printar com cor
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -d "backend" ] || [ ! -d "admin" ] || [ ! -d "flow" ]; then
    print_error "Erro: Execute este script na raiz do projeto flowzz"
    exit 1
fi

print_success "Diretório correto detectado!"
echo ""

# ============================================
# 1. ADMIN PANEL - Instalar dependências
# ============================================
echo "📦 Instalando dependências do Admin Panel..."
cd admin

if [ ! -f "package.json" ]; then
    print_error "package.json não encontrado em admin/"
    exit 1
fi

# Verificar se axios e zustand já estão instalados
if npm list axios &>/dev/null && npm list zustand &>/dev/null; then
    print_warning "axios e zustand já estão instalados no admin"
else
    npm install axios zustand
    if [ $? -eq 0 ]; then
        print_success "Dependências instaladas no admin: axios, zustand"
    else
        print_error "Falha ao instalar dependências do admin"
        exit 1
    fi
fi

# Criar .env se não existir
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Arquivo .env criado a partir de .env.example"
    else
        print_warning ".env.example não encontrado, criando .env padrão..."
        cat > .env << EOF
VITE_API_URL=http://localhost:4000/api/v1
VITE_APP_NAME=Flowzz Admin
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
EOF
        print_success "Arquivo .env criado com valores padrão"
    fi
else
    print_warning ".env já existe no admin"
fi

cd ..
echo ""

# ============================================
# 2. FLOW (User Frontend) - Instalar dependências
# ============================================
echo "📦 Instalando dependências do Flow (Frontend do Usuário)..."
cd flow

if [ ! -f "package.json" ]; then
    print_error "package.json não encontrado em flow/"
    exit 1
fi

# Verificar se axios já está instalado
if npm list axios &>/dev/null; then
    print_warning "axios já está instalado no flow"
else
    npm install axios
    if [ $? -eq 0 ]; then
        print_success "Dependências instaladas no flow: axios"
    else
        print_error "Falha ao instalar dependências do flow"
        exit 1
    fi
fi

# Criar .env.local se não existir
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        print_success "Arquivo .env.local criado a partir de .env.local.example"
    else
        print_warning ".env.local.example não encontrado, criando .env.local padrão..."
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_NAME=Flowzz
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF
        print_success "Arquivo .env.local criado com valores padrão"
    fi
else
    print_warning ".env.local já existe no flow"
fi

cd ..
echo ""

# ============================================
# 3. BACKEND - Verificar .env
# ============================================
echo "🔧 Verificando configuração do Backend..."
cd backend

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Arquivo .env criado a partir de .env.example"
        print_warning "⚠️  IMPORTANTE: Edite backend/.env com suas credenciais!"
        print_warning "    - DATABASE_URL"
        print_warning "    - JWT_SECRET"
        print_warning "    - REDIS_URL (se usar Redis)"
    else
        print_error ".env.example não encontrado no backend"
        exit 1
    fi
else
    print_success ".env já existe no backend"
fi

cd ..
echo ""

# ============================================
# RESUMO FINAL
# ============================================
echo "=================================================="
echo "✅ SETUP CONCLUÍDO COM SUCESSO!"
echo "=================================================="
echo ""
echo "📋 Próximos Passos:"
echo ""
echo "1️⃣  Configure as variáveis de ambiente (se necessário):"
echo "   - backend/.env (DATABASE_URL, JWT_SECRET, etc.)"
echo "   - admin/.env (URLs já configuradas)"
echo "   - flow/.env.local (URLs já configuradas)"
echo ""
echo "2️⃣  Inicie os serviços na seguinte ordem:"
echo ""
echo "   # Terminal 1 - Backend"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "   # Terminal 2 - Flow (Frontend do Usuário)"
echo "   cd flow"
echo "   npm run dev"
echo ""
echo "   # Terminal 3 - Admin Panel"
echo "   cd admin"
echo "   npm run dev"
echo ""
echo "3️⃣  Acesse as aplicações:"
echo "   - Backend:  http://localhost:4000"
echo "   - Flow:     http://localhost:3000"
echo "   - Admin:    http://localhost:5173"
echo ""
echo "📚 Documentação completa: /INTEGRATION.md"
echo ""
echo "=================================================="
print_success "Integração pronta para uso! 🎉"
echo "=================================================="
