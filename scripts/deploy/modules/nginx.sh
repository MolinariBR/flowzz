#!/bin/bash

# Flowzz Deploy - Nginx Setup Module
# Configura o servidor web Nginx

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/deploy.config"

# Parâmetros
DOMAIN=${1:-$DEFAULT_DOMAIN}

echo -e "${BLUE}🌐 Configurando Nginx...${NC}"
echo -e "${BLUE}========================${NC}"

# Validar domínio
print_info "Validando domínio: $DOMAIN"
if ! validate_domain "$DOMAIN"; then
    print_error "Deploy interrompido devido a domínio inválido"
    exit 1
fi

# Criar configuração do Nginx
print_info "Criando configuração do Nginx..."
sudo tee "$NGINX_SITES_AVAILABLE/flowzz" > /dev/null <<EOF
upstream flowzz_api {
    server localhost:$BACKEND_PORT;
}

# Domínio principal - Frontend com login/dashboard integrado
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:$FLOW_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        proxy_pass http://flowzz_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /landing {
        proxy_pass http://localhost:$LANDING_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# Admin Panel
server {
    listen 80;
    server_name admin.$DOMAIN;

    location / {
        proxy_pass http://localhost:$ADMIN_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# API Backend
server {
    listen 80;
    server_name api.$DOMAIN;

    location / {
        proxy_pass http://flowzz_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Habilitar site
print_info "Habilitando site no Nginx..."
sudo ln -sf "$NGINX_SITES_AVAILABLE/flowzz" "$NGINX_SITES_ENABLED/"
sudo rm -f "$NGINX_SITES_ENABLED/default"

# Testar configuração
print_info "Testando configuração do Nginx..."
if sudo nginx -t; then
    sudo systemctl reload nginx
    print_status "Nginx configurado"
else
    print_error "Erro na configuração do Nginx"
    exit 1
fi
