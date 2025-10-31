#!/bin/bash

# 🚀 FlowZZ - Script de Correções Críticas
# Executa correções automáticas para transformar MVP em produto viável

set -e  # Parar em caso de erro

echo "🚀 Iniciando correções críticas do FlowZZ..."
echo "==============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -d "backend" ] || [ ! -d "flow" ] || [ ! -d "admin" ]; then
    error "Diretório incorreto. Execute este script na raiz do projeto FlowZZ."
    exit 1
fi

log "Verificando pré-requisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js versão $NODE_VERSION detectada. Necessário Node.js 18+."
    exit 1
fi
success "Node.js $(node -v) OK"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    error "pnpm não encontrado. Instale pnpm primeiro."
    exit 1
fi
success "pnpm $(pnpm -v) OK"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    warning "PostgreSQL não encontrado localmente. Verificando se está rodando..."
    if ! pg_isready -h localhost -p 5432 &> /dev/null; then
        error "PostgreSQL não está acessível na porta 5432."
        error "Configure PostgreSQL primeiro ou ajuste DATABASE_URL."
        exit 1
    fi
else
    success "PostgreSQL OK"
fi

echo ""
log "🔧 FASE 1: Correção do Banco de Dados"
echo "======================================="

cd backend

# Backup do .env atual
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    success "Backup do .env criado"
fi

# Corrigir DATABASE_URL se necessário
if [ -f ".env" ] && grep -q "5433" .env; then
    warning "Porta 5433 detectada no .env. Corrigindo para 5432..."
    sed -i 's/5433/5432/g' .env
    success "DATABASE_URL corrigida para porta 5432"
elif [ -f ".env" ]; then
    success "DATABASE_URL já está correta"
else
    warning ".env não encontrado. Criando template..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://flowzz:password@localhost:5432/flowzz"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# External APIs
PAGBANK_TOKEN="your-pagbank-token"
COINZZ_API_KEY="your-coinzz-api-key"
WHATSAPP_TOKEN="your-whatsapp-token"

# Environment
NODE_ENV="development"
PORT=4000
EOF
    success "Arquivo .env criado. Configure as credenciais!"
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    log "Instalando dependências do backend..."
    pnpm install
    success "Dependências instaladas"
fi

# Executar migrations
log "Executando migrations do banco..."
if pnpm run db:migrate 2>/dev/null; then
    success "Migrations executadas com sucesso"
else
    error "Falha nas migrations. Verifique conexão com banco."
    exit 1
fi

# Executar seed se existir
if pnpm run db:seed 2>/dev/null; then
    success "Dados iniciais inseridos"
else
    warning "Seed não executado (pode não existir)"
fi

# Testar conexão
log "Testando conexão com banco..."
if pnpm run test:db 2>/dev/null; then
    success "Conexão com banco OK"
else
    warning "Teste de banco falhou. Verifique configuração."
fi

echo ""
log "🔧 FASE 2: Correção da Flow App"
echo "==============================="

cd ../flow

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    log "Instalando dependências da Flow App..."
    pnpm install
    success "Dependências instaladas"
fi

# Verificar se .env existe
if [ ! -f ".env.local" ]; then
    warning "Arquivo .env.local não encontrado. Criando..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_ENV=development
EOF
    success "Arquivo .env.local criado"
fi

# Build da aplicação
log "Compilando Flow App..."
if pnpm run build; then
    success "Flow App compilada com sucesso"
else
    error "Falha na compilação da Flow App"
    exit 1
fi

echo ""
log "🔧 FASE 3: Correção do Admin Panel"
echo "==================================="

cd ../admin

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    log "Instalando dependências do Admin Panel..."
    pnpm install
    success "Dependências instaladas"
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    warning "Arquivo .env não encontrado. Criando..."
    cat > .env << EOF
VITE_API_URL=http://localhost:4000/api/v1
VITE_APP_ENV=development
EOF
    success "Arquivo .env criado"
fi

# Build da aplicação
log "Compilando Admin Panel..."
if pnpm run build; then
    success "Admin Panel compilado com sucesso"
else
    error "Falha na compilação do Admin Panel"
    exit 1
fi

echo ""
log "🔧 FASE 4: Correção da Landing Page"
echo "===================================="

cd ../landing

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    log "Instalando dependências da Landing Page..."
    pnpm install
    success "Dependências instaladas"
fi

# Build da aplicação
log "Compilando Landing Page..."
if pnpm run build; then
    success "Landing Page compilada com sucesso"
else
    error "Falha na compilação da Landing Page"
    exit 1
fi

echo ""
log "🚀 FASE 5: Inicialização dos Serviços"
echo "======================================"

cd ..

# Criar script de inicialização
cat > start-services.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando serviços FlowZZ..."

# Backend
echo "Iniciando backend..."
cd backend && pnpm run dev &
BACKEND_PID=$!

# Flow App
echo "Iniciando Flow App..."
cd ../flow && pnpm run dev &
FLOW_PID=$!

# Admin Panel (servir build)
echo "Iniciando Admin Panel..."
cd ../admin && pnpm run preview &
ADMIN_PID=$!

# Landing Page (servir build)
echo "Iniciando Landing Page..."
cd ../landing && pnpm run preview &
LANDING_PID=$!

echo ""
echo "✅ Serviços iniciados!"
echo "📊 URLs de acesso:"
echo "  - Backend API: http://localhost:4000"
echo "  - Flow App:    http://localhost:3000"
echo "  - Admin:       http://localhost:4173"
echo "  - Landing:     http://localhost:4174"
echo ""
echo "🛑 Para parar todos os serviços: kill $BACKEND_PID $FLOW_PID $ADMIN_PID $LANDING_PID"

# Aguardar interrupção
trap "echo 'Parando serviços...'; kill $BACKEND_PID $FLOW_PID $ADMIN_PID $LANDING_PID 2>/dev/null; exit" INT
wait
EOF

chmod +x start-services.sh
success "Script de inicialização criado (start-services.sh)"

echo ""
log "🧪 FASE 6: Testes de Validação"
echo "=============================="

cd backend

# Executar testes se existirem
if pnpm run test 2>/dev/null; then
    success "Testes do backend passaram"
else
    warning "Testes do backend falharam ou não existem"
fi

# Testar health check
log "Testando health check da API..."
if curl -s http://localhost:4000/health | grep -q "ok"; then
    success "Health check OK"
else
    warning "Health check falhou (serviços podem não estar rodando)"
fi

echo ""
echo "🎉 CORREÇÕES CRÍTICAS CONCLUÍDAS!"
echo "=================================="
success "Banco de dados corrigido e migrations executadas"
success "Flow App compilada e configurada"
success "Admin Panel compilado e configurado"
success "Landing Page compilada e configurada"
success "Script de inicialização criado"

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Configure as credenciais no arquivo .env do backend"
echo "2. Execute: ./start-services.sh"
echo "3. Teste o acesso aos serviços"
echo "4. Implemente as integrações externas (veja documentação em update/)"
echo "5. Configure deployment em produção"

echo ""
echo "📚 DOCUMENTAÇÃO COMPLETA:"
echo "   update/README.md - Visão geral"
echo "   update/database-fix.md - Correções do banco"
echo "   update/flow-app-integration.md - Integração da Flow App"
echo "   update/deployment-checklist.md - Guia de produção"

echo ""
log "Script concluído em $(date +'%Y-%m-%d %H:%M:%S')"