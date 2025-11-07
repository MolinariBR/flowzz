#!/bin/bash

# Flowzz Development Environment Startup Script
# Inicia todos os serviços necessários para desenvolvimento local

set -e  # Parar em caso de erro

# Cores para output (igual ao deploy)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções utilitárias (igual ao deploy)
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

echo -e "${BLUE}🚀 Iniciando serviços FlowZZ (Desenvolvimento)${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Verificar se Docker está rodando
print_info "Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi
print_status "Docker está rodando"

# Verificar e instalar dependências
print_info "Verificando dependências..."
if [ ! -d "node_modules" ]; then
    print_warning "node_modules da raiz não encontrado. Instalando dependências..."
    pnpm install
    print_status "Dependências da raiz instaladas"
else
    print_status "Dependências da raiz OK"
fi

# Verificar dependências de cada subprojeto (seguindo ordem do deploy)
for dir in backend flow admin landing; do
    if [ ! -d "$dir/node_modules" ]; then
        print_warning "Instalando dependências do $dir..."
        (cd "$dir" && pnpm install --frozen-lockfile)
        print_status "Dependências do $dir instaladas"
    else
        print_status "Dependências do $dir OK"
    fi
done

echo ""

# Função para verificar se container está saudável (igual ao deploy)
wait_for_service() {
    local container_name=$1
    local max_attempts=30
    local attempt=1

    print_info "Aguardando $container_name ficar pronto..."
    while [ $attempt -le $max_attempts ]; do
        if docker exec $container_name echo "OK" > /dev/null 2>&1; then
            print_status "$container_name está pronto!"
            return 0
        fi
        echo "   Tentativa $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done

    print_error "$container_name não ficou pronto após $max_attempts tentativas"
    return 1
}

# Parar containers existentes se houver
print_info "Limpando containers Docker existentes..."
docker stop flowzz_postgres flowzz_redis flowzz_redis_commander 2>/dev/null || true
docker rm flowzz_postgres flowzz_redis flowzz_redis_commander 2>/dev/null || true
print_status "Containers limpos"

# Iniciar PostgreSQL
print_info "Iniciando PostgreSQL na porta 5433..."
docker run -d \
    --name flowzz_postgres \
    -e POSTGRES_DB=flowzz_db \
    -e POSTGRES_USER=flowzz_user \
    -e POSTGRES_PASSWORD=flowzz_password \
    -e POSTGRES_HOST_AUTH_METHOD=trust \
    -p 5433:5432 \
    -v flowzz_postgres_data:/var/lib/postgresql/data \
    postgres:16-alpine > /dev/null

if ! wait_for_service flowzz_postgres; then
    print_error "Falha ao iniciar PostgreSQL"
    exit 1
fi

# Iniciar Redis
print_info "Iniciando Redis na porta 6380..."
docker run -d \
    --name flowzz_redis \
    -p 6380:6379 \
    -v flowzz_redis_data:/data \
    redis:7-alpine redis-server --appendonly yes > /dev/null

if ! wait_for_service flowzz_redis; then
    print_error "Falha ao iniciar Redis"
    exit 1
fi

# Iniciar Redis Commander (opcional)
print_info "Iniciando Redis Commander..."
docker run -d \
    --name flowzz_redis_commander \
    -p 8081:8081 \
    --link flowzz_redis:redis \
    -e REDIS_HOSTS=local:redis:6379 \
    rediscommander/redis-commander:latest > /dev/null 2>&1 || print_warning "Redis Commander falhou, mas continuando..."

if docker ps | grep -q flowzz_redis_commander; then
    print_status "Redis Commander iniciado"
fi

echo ""
print_status "Todos os serviços Docker iniciados!"
echo ""
print_info "Serviços de infraestrutura disponíveis:"
echo "  - PostgreSQL:      localhost:5433"
echo "  - Redis:           localhost:6380"
echo "  - Redis Commander: http://localhost:8081"
echo ""

# Criar diretório de logs
mkdir -p logs

# Matar processos anteriores se existirem
print_info "Limpando processos anteriores..."
pkill -f "tsx.*server.ts" 2>/dev/null && print_status "Backend parado" || true
pkill -f "next dev" 2>/dev/null && print_status "Flow parado" || true
pkill -f "vite" 2>/dev/null && print_status "Vite parado" || true
sleep 1
echo ""

# Backend (seguindo ordem do deploy: backend -> flow -> admin -> landing)
print_info "Iniciando Backend API (porta 4000)..."
(cd backend && pnpm run dev > ../logs/backend.log 2>&1) &
BACKEND_PID=$!
sleep 3
print_status "Backend API iniciado (PID: $BACKEND_PID)"

# Flow App (Next.js)
print_info "Iniciando Flow App - Next.js (porta 3000)..."
(cd flow && pnpm run dev > ../logs/flow.log 2>&1) &
FLOW_PID=$!
sleep 3
print_status "Flow App iniciado (PID: $FLOW_PID)"

# Admin Panel (Vite)
print_info "Iniciando Admin Panel - Vite (porta 5173)..."
(cd admin && pnpm run dev > ../logs/admin.log 2>&1) &
ADMIN_PID=$!
sleep 3
print_status "Admin Panel iniciado (PID: $ADMIN_PID)"

# Landing Page (Vite)
print_info "Iniciando Landing Page - Vite (porta 5174)..."
(cd landing && pnpm run dev -- --port 5174 > ../logs/landing.log 2>&1) &
LANDING_PID=$!
sleep 2
print_status "Landing Page iniciada (PID: $LANDING_PID)"

echo ""
print_status "Todos os serviços da aplicação iniciados!"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         FLOWZZ - AMBIENTE DE DESENVOLVIMENTO       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}� URLs da Aplicação:${NC}"
echo -e "  ${BLUE}Backend API:${NC}    http://localhost:4000"
echo -e "  ${BLUE}Flow App:${NC}       http://localhost:3000  ${YELLOW}(Next.js)${NC}"
echo -e "  ${BLUE}Admin Panel:${NC}    http://localhost:5173  ${YELLOW}(Vite)${NC}"
echo -e "  ${BLUE}Landing Page:${NC}   http://localhost:5174  ${YELLOW}(Vite)${NC}"
echo ""
echo -e "${GREEN}🗄️  Serviços de Infraestrutura:${NC}"
echo -e "  ${BLUE}PostgreSQL:${NC}     localhost:5433"
echo -e "  ${BLUE}Redis:${NC}          localhost:6380"
echo -e "  ${BLUE}Redis UI:${NC}       http://localhost:8081"
echo ""
echo -e "${GREEN}� Logs disponíveis em:${NC} ./logs/"
echo -e "  - backend.log  - flow.log  - admin.log  - landing.log"
echo ""
echo -e "${YELLOW}�💡 Dica:${NC} Use ${RED}Ctrl+C${NC} para parar todos os serviços"
echo ""

# Aguardar interrupção e limpar processos
trap "echo ''; echo -e '${YELLOW}🛑 Parando todos os serviços...${NC}'; kill $BACKEND_PID $FLOW_PID $ADMIN_PID $LANDING_PID 2>/dev/null; docker stop flowzz_postgres flowzz_redis flowzz_redis_commander 2>/dev/null; echo -e '${GREEN}✓ Todos os serviços foram parados!${NC}'; exit" INT TERM

# Aguardar e monitorar processos
wait
# Aguardar interrupção e limpar processos
trap "echo ''; echo '🛑 Parando serviços...'; kill $BACKEND_PID $FLOW_PID $ADMIN_PID $LANDING_PID 2>/dev/null; docker stop flowzz_postgres flowzz_redis flowzz_redis_commander 2>/dev/null; echo '✅ Serviços parados!'; exit" INT TERM

# Aguardar e monitorar processos
wait
