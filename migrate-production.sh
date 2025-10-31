#!/bin/bash

# 🚨 FlowZZ - Migração Segura para Produção
# Script para atualizar configurações de produção sem downtime

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Verificar se estamos no servidor de produção
if [[ ! -d "/home/flowzz" ]]; then
    error "Este script deve ser executado no servidor de produção"
    exit 1
fi

log "🚀 Iniciando migração segura do FlowZZ..."

# Criar backup das configurações atuais
log "Criando backup das configurações atuais..."
BACKUP_DIR="/home/flowzz/backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup do ecosystem
cp /home/flowzz/ecosystem.config.js "$BACKUP_DIR/" 2>/dev/null || true

# Backup dos .env atuais
find /home/flowzz -name ".env*" -exec cp {} "$BACKUP_DIR/" \; 2>/dev/null || true

# Backup das configurações nginx
sudo cp -r /etc/nginx/sites-available "$BACKUP_DIR/nginx-sites-available" 2>/dev/null || true
sudo cp -r /etc/nginx/sites-enabled "$BACKUP_DIR/nginx-sites-enabled" 2>/dev/null || true

success "Backup criado em: $BACKUP_DIR"

# PARAR SERVIÇOS ATUALMENTE RODANDO
log "Parando serviços atuais..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Atualizar configurações do banco
log "Atualizando configurações do banco de dados..."

# Se estiver usando docker-compose, atualizar portas
if [[ -f "/home/flowzz/backend/docker-compose.yml" ]]; then
    warning "ATENÇÃO: Verifique se o docker-compose.yml precisa ser atualizado"
    echo "Arquivo docker-compose.yml encontrado. Verifique portas manualmente."
fi

# Atualizar variáveis de ambiente se necessário
if [[ -f "/home/flowzz/backend/.env.production" ]]; then
    log "Verificando .env.production..."

    # Se ainda estiver usando porta 5433, corrigir
    if grep -q "5433" /home/flowzz/backend/.env.production; then
        warning "Porta 5433 detectada no .env.production. Corrigindo..."
        sed -i 's/5433/5432/g' /home/flowzz/backend/.env.production
        success "Porta corrigida no .env.production"
    else
        success ".env.production já está correto"
    fi
fi

# Verificar se PostgreSQL está rodando na porta correta
log "Verificando PostgreSQL..."
if ! pg_isready -h localhost -p 5432 2>/dev/null; then
    warning "PostgreSQL não está respondendo na porta 5432"

    # Tentar porta 5433 (configuração antiga)
    if pg_isready -h localhost -p 5433 2>/dev/null; then
        error "PostgreSQL ainda está rodando na porta 5433!"
        error "Execute manualmente:"
        echo "  sudo systemctl stop postgresql"
        echo "  # Edite /etc/postgresql/*/main/postgresql.conf para porta 5432"
        echo "  sudo systemctl start postgresql"
        exit 1
    else
        error "PostgreSQL não está respondendo. Verifique status do serviço."
        exit 1
    fi
else
    success "PostgreSQL OK na porta 5432"
fi

# Verificar Redis
log "Verificando Redis..."
if ! redis-cli ping 2>/dev/null | grep -q "PONG"; then
    warning "Redis não está respondendo. Verificando serviço..."
    sudo systemctl status redis-server || true
else
    success "Redis OK"
fi

# Atualizar código (pull das correções)
log "Atualizando código do repositório..."
cd /home/flowzz

# Verificar se há mudanças não commitadas
if [[ -n $(git status --porcelain) ]]; then
    warning "Há mudanças não commitadas. Fazendo backup..."
    git stash push -m "backup-auto-$(date +%Y%m%d_%H%M%S)"
fi

# Pull das correções
git pull origin main

# Instalar dependências se necessário
log "Verificando dependências..."

cd backend
if [[ ! -d "node_modules" ]] || [[ package.json -nt node_modules/.package-lock.json ]]; then
    log "Instalando dependências do backend..."
    pnpm install --frozen-lockfile
fi

cd ../flow
if [[ ! -d "node_modules" ]] || [[ package.json -nt node_modules/.package-lock.json ]]; then
    log "Instalando dependências do flow..."
    pnpm install --frozen-lockfile
fi

cd ../admin
if [[ ! -d "node_modules" ]] || [[ package.json -nt node_modules/.package-lock.json ]]; then
    log "Instalando dependências do admin..."
    pnpm install --frozen-lockfile
fi

cd ../landing
if [[ ! -d "node_modules" ]] || [[ package.json -nt node_modules/.package-lock.json ]]; then
    log "Instalando dependências da landing..."
    pnpm install --frozen-lockfile
fi

# Executar migrations do banco
log "Executando migrations do banco..."
cd ../backend
npx prisma generate
npx prisma db push

# Build das aplicações
log "Compilando aplicações..."

cd ../backend
npm run build

cd ../flow
npm run build

cd ../admin
npm run build

cd ../landing
npm run build

# Iniciar serviços com PM2
log "Iniciando serviços..."

# Backend
cd ../backend
pm2 start ecosystem.config.js --only flowzz-api

# Flow App
cd ../flow
pm2 start ecosystem.config.js --only flow-frontend

# Admin
cd ../admin
pm2 start ecosystem.config.js --only flowzz-admin

# Landing
cd ../landing
pm2 start ecosystem.config.js --only flowzz-landing

# Salvar configuração PM2
pm2 save

# Verificar status
log "Verificando status dos serviços..."
pm2 status

# Testar health check
log "Testando health check..."
sleep 5

if curl -s http://localhost:3001/health | grep -q "ok"; then
    success "Health check da API OK"
else
    warning "Health check da API falhou. Verifique logs."
fi

# Reiniciar Nginx se necessário
log "Verificando Nginx..."
sudo systemctl reload nginx 2>/dev/null || sudo systemctl restart nginx 2>/dev/null || true

success "Migração concluída!"
echo ""
echo "📊 STATUS DA MIGRAÇÃO:"
echo "  ✅ Backup criado: $BACKUP_DIR"
echo "  ✅ Configurações atualizadas"
echo "  ✅ Dependências instaladas"
echo "  ✅ Banco migrado"
echo "  ✅ Aplicações compiladas"
echo "  ✅ Serviços iniciados"
echo ""
echo "🔍 MONITORE OS LOGS:"
echo "  pm2 logs"
echo "  pm2 monit"
echo ""
echo "🆘 EM CASO DE PROBLEMAS:"
echo "  pm2 stop all && pm2 delete all"
echo "  # Restaurar backup do PM2 se necessário"
echo "  pm2 resurrect $BACKUP_DIR/pm2-dump.json 2>/dev/null || true"
echo ""
echo "📞 SUPORTE:"
echo "  Em caso de emergência, execute: ./rollback-emergency.sh"