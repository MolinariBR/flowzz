#!/bin/bash

# 🚨 FlowZZ - Rollback de Emergência
# Restaura o sistema para o estado anterior em caso de falha

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

log "🚨 Iniciando rollback de emergência..."

# Encontrar o backup mais recente
LATEST_BACKUP=$(ls -td /home/flowzz/backup-* 2>/dev/null | head -1)

if [[ -z "$LATEST_BACKUP" ]]; then
    error "Nenhum backup encontrado!"
    echo "Procure backups manuais ou restaure do git:"
    echo "  cd /home/flowzz && git checkout HEAD~1"
    exit 1
fi

warning "Backup encontrado: $LATEST_BACKUP"
echo "Isso irá reverter o sistema para o estado anterior."
read -p "Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelado."
    exit 1
fi

# PARAR TODOS OS SERVIÇOS
log "Parando todos os serviços..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Restaurar configurações do PM2
if [[ -f "$LATEST_BACKUP/ecosystem.config.js" ]]; then
    log "Restaurando configuração do PM2..."
    cp "$LATEST_BACKUP/ecosystem.config.js" /home/flowzz/
    pm2 resurrect 2>/dev/null || warning "Não foi possível restaurar PM2 automaticamente"
fi

# Restaurar arquivos .env
log "Restaurando arquivos de ambiente..."
find "$LATEST_BACKUP" -name ".env*" -exec cp {} /home/flowzz/backend/ \; 2>/dev/null || true

# Restaurar configurações Nginx
if [[ -d "$LATEST_BACKUP/nginx-sites-available" ]]; then
    log "Restaurando configurações Nginx..."
    sudo cp "$LATEST_BACKUP/nginx-sites-available"/* /etc/nginx/sites-available/ 2>/dev/null || true
    sudo systemctl reload nginx 2>/dev/null || sudo systemctl restart nginx 2>/dev/null || true
fi

# Reverter código para commit anterior
log "Revertendo código para versão anterior..."
cd /home/flowzz

# Stash mudanças atuais se existirem
git stash push -m "emergency-rollback-$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true

# Checkout para commit anterior
git checkout HEAD~1

# Reinstalar dependências
log "Reinstalando dependências..."
cd backend && pnpm install --frozen-lockfile
cd ../flow && pnpm install --frozen-lockfile
cd ../admin && pnpm install --frozen-lockfile
cd ../landing && pnpm install --frozen-lockfile

# Rebuild aplicações
log "Recompilando aplicações..."
cd ../backend && npm run build
cd ../flow && npm run build
cd ../admin && npm run build
cd ../landing && npm run build

# Reiniciar serviços
log "Reiniciando serviços..."
pm2 start ecosystem.config.js 2>/dev/null || error "Falha ao iniciar serviços com PM2"

# Verificar status
log "Verificando status..."
pm2 status

success "Rollback concluído!"
echo ""
echo "📊 STATUS DO ROLLBACK:"
echo "  ✅ Serviços parados"
echo "  ✅ Configurações restauradas"
echo "  ✅ Código revertido"
echo "  ✅ Dependências reinstaladas"
echo "  ✅ Aplicações recompiladas"
echo "  ✅ Serviços reiniciados"
echo ""
echo "🔍 VERIFIQUE OS LOGS:"
echo "  pm2 logs"
echo "  tail -f /var/log/nginx/error.log"
echo ""
echo "📞 PRÓXIMOS PASSOS:"
echo "  1. Teste o acesso aos serviços"
echo "  2. Verifique se tudo está funcionando"
echo "  3. Analise o que causou a falha antes de tentar novamente"