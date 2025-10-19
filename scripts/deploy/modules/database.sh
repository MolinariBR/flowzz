#!/bin/bash

# Flowzz Deploy - Database Setup Module
# Configura banco de dados PostgreSQL e Redis

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/deploy.config"

echo -e "${BLUE}🗄️ Configurando banco de dados...${NC}"
echo -e "${BLUE}==============================${NC}"

cd "$PROJECT_DIR/backend"

# Verificar se docker-compose existe
if [ ! -f "docker-compose.yml" ]; then
    print_error "Arquivo docker-compose.yml não encontrado"
    exit 1
fi

# Iniciar serviços de banco de dados
print_info "Iniciando PostgreSQL e Redis..."
sudo docker-compose up -d postgres redis

# Aguardar banco de dados ficar pronto
print_info "Aguardando PostgreSQL..."
wait_for_service "PostgreSQL" "$POSTGRES_PORT" 60

print_info "Aguardando Redis..."
wait_for_service "Redis" "$REDIS_PORT" 30

print_status "Banco de dados configurado"