#!/bin/bash

# Flowzz Deploy - Project Setup Module
# Configura o projeto (clone/update do repositório)

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/deploy.config"

echo -e "${BLUE}📦 Configurando projeto...${NC}"
echo -e "${BLUE}========================${NC}"

# Clonar ou atualizar repositório
if [ -d "$PROJECT_DIR" ]; then
    print_info "Diretório do projeto existe, atualizando..."
    cd "$PROJECT_DIR"
    git pull origin main
    print_status "Repositório atualizado"
else
    print_info "Clonando repositório..."
    git clone https://github.com/MolinariBR/flowzz.git "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    print_status "Repositório clonado"
fi

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    print_error "Diretório do projeto não parece correto"
    exit 1
fi

print_status "Projeto configurado"