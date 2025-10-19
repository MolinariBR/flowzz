#!/bin/bash

# Flowzz Deploy - System Setup Module
# Configura o sistema básico (atualizações, dependências, firewall)

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/deploy.config"

echo -e "${BLUE}🔧 Configurando sistema básico...${NC}"
echo -e "${BLUE}==============================${NC}"

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
    print_warning "Executando como root - considere usar usuário não-root para maior segurança"
else
    print_info "Executando como usuário não-root"
fi

# Atualizar sistema
print_info "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_status "Sistema atualizado"

# Instalar dependências básicas
print_info "Instalando dependências básicas..."
sudo apt install -y curl wget git htop ufw software-properties-common netcat-openbsd
print_status "Dependências básicas instaladas"

# Configurar firewall
print_info "Configurando firewall..."
sudo ufw --force enable

# Abrir portas necessárias
for port in "${FIREWALL_PORTS[@]}"; do
    sudo ufw allow "$port"
done

print_status "Firewall configurado"

# Instalar Node.js
print_info "Instalando Node.js $NODE_VERSION..."
if ! command_exists node; then
    curl -fsSL "https://deb.nodesource.com/setup_$NODE_VERSION.x" | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js $NODE_VERSION instalado"
else
    print_info "Node.js já está instalado"
fi

# Instalar PM2
print_info "Instalando PM2..."
if ! command_exists pm2; then
    sudo npm install -g pm2
    print_status "PM2 instalado"
else
    print_info "PM2 já está instalado"
fi

# Instalar Nginx
print_info "Instalando Nginx..."
if ! command_exists nginx; then
    sudo apt install -y nginx
    print_status "Nginx instalado"
else
    print_info "Nginx já está instalado"
fi

# Instalar Docker
print_info "Instalando Docker..."
if ! command_exists docker; then
    sudo apt install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker

    # Adicionar usuário ao grupo docker (se não for root)
    if [[ $EUID -ne 0 ]]; then
        sudo usermod -aG docker "$USER"
        print_warning "Reinicie a sessão ou execute 'newgrp docker' para usar Docker sem sudo"
    fi

    print_status "Docker instalado"
else
    print_info "Docker já está instalado"
fi

print_status "Setup do sistema concluído"