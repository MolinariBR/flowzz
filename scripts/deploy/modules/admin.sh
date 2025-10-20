#!/bin/bash

# Flowzz Deploy - Admin Panel Setup Module
# Configura o painel administrativo

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/deploy.config"

echo -e "${BLUE}👨‍💼 Configurando painel admin...${NC}"
echo -e "${BLUE}==============================${NC}"

cd "$PROJECT_DIR/admin"

# Instalar dependências
print_info "Instalando dependências do admin..."
pnpm install --frozen-lockfile

# Criar arquivo de ambiente
print_info "Criando arquivo de ambiente..."
cat > .env.production << EOF
VITE_API_URL=http://api.$DEFAULT_DOMAIN
VITE_APP_URL=http://admin.$DEFAULT_DOMAIN
EOF

# Build da aplicação
print_info "Compilando painel admin..."
npm run build

# Iniciar aplicação com PM2
print_info "Iniciando painel admin com PM2..."
pm2 delete "$PM2_ADMIN_NAME" 2>/dev/null || true
pm2 serve dist "$ADMIN_PORT" --name "$PM2_ADMIN_NAME" --spa

print_status "Painel admin configurado"