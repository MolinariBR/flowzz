#!/bin/bash

# 🐳 Script para gerenciar serviços Docker do Flowzz
# PostgreSQL + Redis para desenvolvimento

echo "🐳 Flowzz Docker Services Manager"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório backend
if [ ! -f "docker-compose.yml" ]; then
    print_error "Erro: Execute este script no diretório backend/"
    print_warning "Use: cd backend && ../scripts/docker-services.sh [comando]"
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    print_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

case "$1" in
    "start"|"up")
        echo "🐳 Iniciando serviços Docker..."
        docker-compose up -d

        echo "⏳ Aguardando serviços ficarem prontos..."
        sleep 10

        if docker-compose ps | grep -q "Up"; then
            print_success "Serviços Docker iniciados!"
            echo ""
            echo "📊 Serviços disponíveis:"
            echo "  - PostgreSQL: localhost:5433"
            echo "  - Redis: localhost:6380"
            echo "  - Redis Commander: http://localhost:8081"
        else
            print_error "Falha ao iniciar serviços. Verificando logs..."
            docker-compose logs
            exit 1
        fi
        ;;

    "stop"|"down")
        echo "🛑 Parando serviços Docker..."
        docker-compose down
        print_success "Serviços Docker parados!"
        ;;

    "restart")
        echo "🔄 Reiniciando serviços Docker..."
        docker-compose restart
        print_success "Serviços Docker reiniciados!"
        ;;

    "status"|"ps")
        echo "📊 Status dos serviços Docker:"
        docker-compose ps
        ;;

    "logs")
        echo "📋 Logs dos serviços Docker:"
        docker-compose logs -f
        ;;

    "clean")
        echo "🧹 Limpando volumes e dados..."
        docker-compose down -v
        print_success "Dados limpos!"
        ;;

    *)
        echo "Uso: $0 {start|stop|restart|status|logs|clean}"
        echo ""
        echo "Comandos:"
        echo "  start  - Iniciar serviços Docker"
        echo "  stop   - Parar serviços Docker"
        echo "  restart- Reiniciar serviços Docker"
        echo "  status - Ver status dos serviços"
        echo "  logs   - Ver logs dos serviços"
        echo "  clean  - Limpar volumes e dados"
        exit 1
        ;;
esac