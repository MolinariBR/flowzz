#!/bin/bash

# Script auxiliar para gerar certificados SSL corretos
# Uso: ./ssl-certificates.sh seu-email@dominio.com

EMAIL=${1:-admin@flowzzoficial.com}
DOMAIN="flowzzoficial.com"

echo "🔒 Gerando certificados SSL para $DOMAIN..."

# Instalar Certbot se necessário
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Parar Nginx temporariamente
sudo systemctl stop nginx

echo "🔑 Gerando certificado para domínio principal..."
sudo certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --no-eff-email --register-unsafely-without-email

echo "🔑 Gerando certificado para admin..."
sudo certbot certonly --standalone -d "admin.$DOMAIN" --email "$EMAIL" --agree-tos --no-eff-email --register-unsafely-without-email

echo "🔑 Gerando certificado para API..."
sudo certbot certonly --standalone -d "api.$DOMAIN" --email "$EMAIL" --agree-tos --no-eff-email --register-unsafely-without-email

# Reiniciar Nginx
sudo systemctl start nginx

echo "✅ Certificados SSL gerados com sucesso!"
echo ""
echo "📋 Para renovar automaticamente:"
echo "sudo certbot renew"
