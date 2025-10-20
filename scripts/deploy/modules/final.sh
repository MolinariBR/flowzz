#!/bin/bash

# Flowzz Deploy - Final Setup Module
# Configurações finais (logrotate, PM2, scripts de update)

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/deploy.config"

# Parâmetros
DOMAIN=${1:-$DEFAULT_DOMAIN}

echo -e "${BLUE}📊 Configurando finalizações...${NC}"
echo -e "${BLUE}==============================${NC}"

# Salvar configuração do PM2
print_info "Salvando configuração do PM2..."
pm2 save
pm2 startup
print_status "PM2 configurado"

# Configurar logrotate para PM2
print_info "Configurando rotação de logs..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size "$LOGROTATE_MAX_SIZE"
pm2 set pm2-logrotate:retain "$LOGROTATE_RETAIN"
print_status "Logrotate configurado"

# Criar script de atualização
print_info "Criando script de atualização..."
cat > ~/update_flowzz.sh << 'EOF'
#!/bin/bash
cd ~/flowzz

echo "🔄 Atualizando Flowzz..."

# Pull latest changes
git pull origin main

# Update backend
cd backend
pnpm install --frozen-lockfile
npm run build
pm2 restart flowzz-api

# Update flow frontend
cd ../flow
pnpm install --frozen-lockfile
npm run build
pm2 restart flow-frontend

# Update admin panel
cd ../admin
pnpm install --frozen-lockfile
npm run build
pm2 restart flowzz-admin

# Update landing page
cd ../landing
pnpm install --frozen-lockfile
npm run build
pm2 restart flowzz-landing

echo "✅ Flowzz atualizado com sucesso!"
EOF

chmod +x ~/update_flowzz.sh
print_status "Script de atualização criado"

# Status final
echo -e "${BLUE}📊 Status final dos serviços:${NC}"
pm2 status
echo ""
sudo docker ps

echo ""
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 URLs de acesso:${NC}"
if [ "$DOMAIN" = "localhost" ]; then
    echo -e "  Frontend: http://localhost:$FLOW_PORT"
    echo -e "  Admin:    http://localhost:$ADMIN_PORT"
    echo -e "  API:      http://localhost:$BACKEND_PORT"
    echo -e "  Landing:  http://localhost:$LANDING_PORT"
else
    echo -e "  Frontend: https://$DOMAIN"
    echo -e "  Admin:    https://admin.$DOMAIN"
    echo -e "  API:      https://api.$DOMAIN"
    echo -e "  Landing:  https://$DOMAIN (porta $LANDING_PORT)"
fi
echo ""
echo -e "${BLUE}🛠️ Comandos úteis:${NC}"
echo -e "  Ver logs: pm2 logs"
echo -e "  Reiniciar serviços: pm2 restart all"
echo -e "  Atualizar: ~/update_flowzz.sh"
echo ""
echo -e "${YELLOW}⚠️ Importante: Configure os registros DNS para apontar para o IP da VPS${NC}"

print_status "Finalizações concluídas"