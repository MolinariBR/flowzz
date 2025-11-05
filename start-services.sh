#!/bin/bash
echo "🚀 Iniciando serviços FlowZZ..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Função para verificar se container está saudável
wait_for_service() {
    local container_name=$1
    local max_attempts=30
    local attempt=1

    echo "⏳ Aguardando $container_name ficar pronto..."
    while [ $attempt -le $max_attempts ]; do
        if docker exec $container_name echo "OK" > /dev/null 2>&1; then
            echo "✅ $container_name está pronto!"
            return 0
        fi
        echo "   Tentativa $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done

    echo "❌ $container_name não ficou pronto após $max_attempts tentativas"
    return 1
}

# Parar containers existentes se houver
echo "🧹 Limpando containers existentes..."
docker stop flowzz_postgres flowzz_redis flowzz_redis_commander 2>/dev/null || true
docker rm flowzz_postgres flowzz_redis flowzz_redis_commander 2>/dev/null || true

# Iniciar PostgreSQL
echo "🐘 Iniciando PostgreSQL..."
docker run -d \
    --name flowzz_postgres \
    -e POSTGRES_DB=flowzz_db \
    -e POSTGRES_USER=flowzz_user \
    -e POSTGRES_PASSWORD=flowzz_password \
    -e POSTGRES_HOST_AUTH_METHOD=trust \
    -p 5433:5432 \
    -v flowzz_postgres_data:/var/lib/postgresql/data \
    postgres:16-alpine

if ! wait_for_service flowzz_postgres; then
    echo "❌ Falha ao iniciar PostgreSQL"
    exit 1
fi

# Iniciar Redis
echo "🔴 Iniciando Redis..."
docker run -d \
    --name flowzz_redis \
    -p 6380:6379 \
    -v flowzz_redis_data:/data \
    redis:7-alpine redis-server --appendonly yes

if ! wait_for_service flowzz_redis; then
    echo "❌ Falha ao iniciar Redis"
    exit 1
fi

# Iniciar Redis Commander (opcional)
echo "📊 Iniciando Redis Commander..."
docker run -d \
    --name flowzz_redis_commander \
    -p 8081:8081 \
    --link flowzz_redis:redis \
    -e REDIS_HOSTS=local:redis:6379 \
    rediscommander/redis-commander:latest || echo "⚠️  Redis Commander falhou, mas continuando..."

echo ""
echo "✅ Serviços Docker iniciados com sucesso!"
echo "📊 Serviços disponíveis:"
echo "  - PostgreSQL: localhost:5433"
echo "  - Redis: localhost:6380"
echo "  - Redis Commander: http://localhost:8081"
echo ""

# Backend
echo "Iniciando backend..."
(cd backend && pnpm run dev) &
BACKEND_PID=$!

# Flow App
echo "Iniciando Flow App..."
(cd flow && pnpm run dev) &
FLOW_PID=$!

# Admin Panel (modo desenvolvimento com hot reload)
echo "Iniciando Admin Panel em modo dev..."
(cd admin && pnpm run dev) &
ADMIN_PID=$!

# Landing Page (modo desenvolvimento com hot reload)
echo "Iniciando Landing Page em modo dev..."
(cd landing && pnpm run dev) &
LANDING_PID=$!

echo ""
echo "✅ Todos os serviços iniciados!"
echo "📊 URLs de acesso:"
echo "  - Backend API: http://localhost:4000"
echo "  - Flow App:    http://localhost:3000"
echo "  - Landing:       http://localhost:4173"
echo "  - Admin:     http://localhost:4174"
echo ""
echo "🛑 Para parar todos os serviços: kill $BACKEND_PID $FLOW_PID $ADMIN_PID $LANDING_PID"
echo "🛑 Para parar serviços Docker: docker stop flowzz_postgres flowzz_redis flowzz_redis_commander"

# Aguardar interrupção
trap "echo 'Parando serviços...'; kill $BACKEND_PID $FLOW_PID $ADMIN_PID $LANDING_PID 2>/dev/null; docker stop flowzz_postgres flowzz_redis flowzz_redis_commander 2>/dev/null; exit" INT
wait
