#!/bin/bash

# Flowzz Deploy - Flow Frontend Setup Module
# Configura o frontend Flow (Next.js)

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/deploy.config"

echo -e "${BLUE}🎨 Configurando frontend Flow...${NC}"
echo -e "${BLUE}==============================${NC}"

cd "$PROJECT_DIR/flow"

# Instalar dependências
print_info "Instalando dependências do Flow..."
npm install

# Criar arquivo de ambiente
print_info "Criando arquivo de ambiente..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://api.$DEFAULT_DOMAIN
NEXT_PUBLIC_APP_URL=http://app.$DEFAULT_DOMAIN
EOF

# Build da aplicação
print_info "Compilando Flow..."
npm run build

# Iniciar aplicação com PM2
print_info "Iniciando Flow com PM2..."
pm2 delete "$PM2_FLOW_NAME" 2>/dev/null || true
pm2 start npm --name "$PM2_FLOW_NAME" -- start

print_status "Frontend Flow configurado"