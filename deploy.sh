#!/bin/bash

# Flowzz Auto Deploy Script for Hostinger VPS
# Usage: ./deploy.sh [domain] [email]

set -e

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_MODULES_DIR="$SCRIPT_DIR/scripts/deploy/modules"
DEPLOY_CONFIG_DIR="$SCRIPT_DIR/scripts/deploy/config"

source "$DEPLOY_CONFIG_DIR/deploy.config"

# Parâmetros
DOMAIN=${1:-$DEFAULT_DOMAIN}
EMAIL=${2:-$DEFAULT_EMAIL}

echo -e "${BLUE}🚀 Flowzz Auto Deploy para Hostinger VPS${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}Domínio: $DOMAIN${NC}"
echo -e "${YELLOW}Email: $EMAIL${NC}"
echo ""

# Validar domínio antes de continuar
print_info "Validando domínio: $DOMAIN"
if ! validate_domain "$DOMAIN"; then
    print_error "Deploy interrompido devido a domínio inválido"
    print_error "Use um domínio válido como: flowzzoficial.com"
    exit 1
fi

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   print_warning "AVISO: Você está executando como root."
   echo -e "${YELLOW}   Para maior segurança, considere criar um usuário não-root.${NC}"
   echo -e "${YELLOW}   Execute: ./scripts/setup_user.sh${NC}"
   echo ""
   read -p "Deseja continuar como root? (y/N): " -n 1 -r
   echo
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
       echo -e "${BLUE}Execução cancelada. Considere executar como usuário não-root.${NC}"
       exit 1
   fi
   echo -e "${GREEN}Continuando como root...${NC}"
   echo ""
fi

# Função para executar módulo
run_module() {
    local module=$1
    shift # Remove o nome do módulo dos parâmetros
    local module_path="$DEPLOY_MODULES_DIR/$module.sh"

    if [ ! -f "$module_path" ]; then
        print_error "Módulo $module não encontrado: $module_path"
        exit 1
    fi

    print_info "Executando módulo: $module"
    bash "$module_path" "$@"
}

# Executar módulos em ordem
run_module "setup"
run_module "project"
run_module "database"
run_module "backend"
run_module "flow"
run_module "admin"
run_module "landing"
run_module "nginx" "$DOMAIN"
run_module "ssl" "$DOMAIN" "$EMAIL"
run_module "final" "$DOMAIN"