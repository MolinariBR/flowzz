#!/bin/bash

# Script de correção para resolver problemas de configuração antiga
# Remove configurações inválidas e prepara para deploy correto

set -e

echo "🧹 Limpando configurações antigas inválidas..."

# Parar serviços
sudo systemctl stop nginx || true

# Remover certificados inválidos (se existirem)
echo "🔒 Removendo certificados SSL inválidos..."
for cert in $(sudo certbot certificates 2>/dev/null | grep -E "(ssl|www\.ssl)" | awk '{print $1}' || true); do
    echo "Removendo certificado: $cert"
    sudo certbot delete --cert-name "$cert" --non-interactive || true
done

# Limpar arquivos de configuração nginx antigos
echo "🌐 Limpando configurações Nginx antigas..."
sudo rm -f /etc/nginx/sites-available/flowzz*
sudo rm -f /etc/nginx/sites-enabled/flowzz*

# Reiniciar nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl start nginx || true

echo "✅ Limpeza concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: ./scripts/deploy.sh flowzzoficial.com mauricior.contato@gmail.com"
echo "2. Ou use: ./ssl-certificates.sh mauricior.contato@gmail.com"
echo ""
echo "🎯 Agora o deploy funcionará corretamente com domínios válidos!"
