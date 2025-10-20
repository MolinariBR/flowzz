#!/bin/bash

# Flowzz Deploy - Landing Page Setup Module
# Configura a landing page

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/deploy.config"

echo -e "${BLUE}🏠 Configurando landing page...${NC}"
echo -e "${BLUE}=============================${NC}"

cd "$PROJECT_DIR/landing"

# Instalar dependências
print_info "Instalando dependências da landing..."
pnpm install --frozen-lockfile

# Build da aplicação
print_info "Compilando landing page..."
npm run build

# Iniciar aplicação com PM2
print_info "Iniciando landing page com PM2..."
pm2 delete "$PM2_LANDING_NAME" 2>/dev/null || true
pm2 serve dist "$LANDING_PORT" --name "$PM2_LANDING_NAME" --spa

print_status "Landing page configurada"