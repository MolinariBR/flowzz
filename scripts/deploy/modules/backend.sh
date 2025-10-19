#!/bin/bash

# Flowzz Deploy - Backend Setup Module
# Configura o backend da aplicação

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/deploy.config"

echo -e "${BLUE}🔧 Configurando backend...${NC}"
echo -e "${BLUE}========================${NC}"

cd "$PROJECT_DIR/backend"

# Instalar dependências
print_info "Instalando dependências do backend..."
npm install

# Criar arquivo de ambiente de produção
print_info "Criando arquivo de ambiente..."
cat > .env.production << EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
REDIS_URL="$REDIS_URL"
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN="$JWT_EXPIRES_IN"
PORT=$BACKEND_PORT
NODE_ENV=production
CORS_ORIGIN="$CORS_ORIGIN"
EOF

# Carregar variáveis de ambiente
set -a
source .env.production
set +a

# Configurar Prisma
print_info "Configurando banco de dados..."
npx prisma generate
npx prisma db push

# Build da aplicação
print_info "Compilando backend..."
npm run build

# Iniciar aplicação com PM2
print_info "Iniciando backend com PM2..."
pm2 delete "$PM2_BACKEND_NAME" 2>/dev/null || true
pm2 start dist/server.js --name "$PM2_BACKEND_NAME"

print_status "Backend configurado"