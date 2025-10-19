#!/bin/bash

# Flowzz Deploy - SSL Setup Module
# Configura certificados SSL com Let's Encrypt

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/deploy.config"

# Parâmetros
DOMAIN=${1:-$DEFAULT_DOMAIN}
EMAIL=${2:-$DEFAULT_EMAIL}

echo -e "${BLUE}🔒 Configurando SSL...${NC}"
echo -e "${BLUE}=====================${NC}"

# Pular se for localhost
if [ "$DOMAIN" = "localhost" ]; then
    print_info "Pulando configuração SSL para localhost"
    exit 0
fi

# Instalar Certbot
print_info "Instalando Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Obter certificados SSL
print_info "Obtendo certificados SSL..."

# Domínio principal
print_info "Configurando SSL para $DOMAIN..."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

# Subdomínio admin
print_info "Configurando SSL para admin.$DOMAIN..."
sudo certbot --nginx -d "admin.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

# Subdomínio API
print_info "Configurando SSL para api.$DOMAIN..."
sudo certbot --nginx -d "api.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

print_status "SSL configurado"