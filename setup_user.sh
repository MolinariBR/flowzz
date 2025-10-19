#!/bin/bash

# Flowzz User Setup Script
# Cria um usuário não-root para deploy mais seguro

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

USERNAME="flowzz"
HOME_DIR="/home/$USERNAME"

echo -e "${BLUE}👤 Configurando usuário não-root para Flowzz${NC}"
echo -e "${BLUE}=============================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}✗ Este script deve ser executado como root (sudo)${NC}"
   exit 1
fi

# Check if user already exists
if id "$USERNAME" &>/dev/null; then
    echo -e "${YELLOW}⚠️  Usuário '$USERNAME' já existe${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Criando usuário '$USERNAME'...${NC}"
useradd -m -s /bin/bash "$USERNAME"

echo -e "${YELLOW}🔑 Definindo senha para o usuário...${NC}"
echo "Por favor, defina uma senha forte para o usuário $USERNAME:"
passwd "$USERNAME"

echo -e "${YELLOW}🔧 Configurando sudo sem senha...${NC}"
echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/$USERNAME"

echo -e "${YELLOW}📁 Configurando diretórios...${NC}"
mkdir -p "$HOME_DIR/.ssh"
chmod 700 "$HOME_DIR/.ssh"

# Configure Docker group if Docker is installed
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Adicionando usuário ao grupo docker...${NC}"
    usermod -aG docker "$USERNAME"
fi

# Set proper ownership
chown -R "$USERNAME:$USERNAME" "$HOME_DIR"

echo ""
echo -e "${GREEN}✅ Usuário '$USERNAME' criado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo -e "  1. Faça login como o novo usuário: ${GREEN}su - $USERNAME${NC}"
echo -e "  2. Clone o repositório: ${GREEN}git clone https://github.com/MolinariBR/flowzz.git${NC}"
echo -e "  3. Execute o deploy: ${GREEN}./deploy.sh flowzzoficial.com admin@flowzzoficial.com${NC}"
echo ""
echo -e "${YELLOW}🔒 Para maior segurança, considere:${NC}"
echo -e "  - Configurar autenticação SSH por chave"
echo -e "  - Desabilitar login root via SSH"
echo -e "  - Configurar firewall (ufw)"
echo ""
echo -e "${BLUE}🎉 Setup concluído!${NC}"