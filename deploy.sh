#!/bin/bash

# Flowzz Auto Deploy Script for Hostinger VPS
# Usage: ./deploy.sh [domain] [email]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-"flowzzoficial.com"}
EMAIL=${2:-"admin@$DOMAIN"}
PROJECT_DIR="$HOME/flowzz"

echo -e "${BLUE}🚀 Flowzz Auto Deploy para Hostinger VPS${NC}"
echo -e "${BLUE}============================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${YELLOW}⚠️  AVISO: Você está executando como root.${NC}"
   echo -e "${YELLOW}   Para maior segurança, considere criar um usuário não-root.${NC}"
   echo -e "${YELLOW}   No entanto, o script pode continuar normalmente.${NC}"
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

# Update system
echo -e "${YELLOW}📦 Atualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y
print_status "Sistema atualizado"

# Install basic dependencies
echo -e "${YELLOW}📦 Instalando dependências básicas...${NC}"
sudo apt install -y curl wget git htop ufw software-properties-common
print_status "Dependências básicas instaladas"

# Configure firewall
echo -e "${YELLOW}🔥 Configurando firewall...${NC}"
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
print_status "Firewall configurado"

# Install Node.js 18
echo -e "${YELLOW}📦 Instalando Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
print_status "Node.js instalado"

# Install PM2
echo -e "${YELLOW}📦 Instalando PM2...${NC}"
sudo npm install -g pm2
print_status "PM2 instalado"

# Install Nginx
echo -e "${YELLOW}📦 Instalando Nginx...${NC}"
sudo apt install -y nginx
print_status "Nginx instalado"

# Install Docker
echo -e "${YELLOW}📦 Instalando Docker...${NC}"
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
print_status "Docker instalado"

# Clone or update repository
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}📦 Atualizando repositório...${NC}"
    cd "$PROJECT_DIR"
    git pull origin main
else
    echo -e "${YELLOW}📦 Clonando repositório...${NC}"
    git clone https://github.com/MolinariBR/flowzz.git "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi
print_status "Repositório configurado"

# Setup database
echo -e "${YELLOW}🗄️ Configurando banco de dados...${NC}"
cd backend
sudo docker-compose up -d postgres redis

# Wait for database to be ready
echo -e "${YELLOW}⏳ Aguardando banco de dados...${NC}"
sleep 30

# Setup backend
echo -e "${YELLOW}🔧 Configurando backend...${NC}"
npm install

# Create production env file
cat > .env.production << EOF
DATABASE_URL="postgresql://flowzz_user:flowzz_password@localhost:5433/flowzz_db"
REDIS_URL="redis://localhost:6380"
JWT_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=production
CORS_ORIGIN="http://$DOMAIN,http://admin.$DOMAIN"
EOF

npx prisma generate
npx prisma db push
npm run build
pm2 delete flowzz-api 2>/dev/null || true
pm2 start dist/server.js --name "flowzz-api"
print_status "Backend configurado"

# Setup Flow frontend
echo -e "${YELLOW}🎨 Configurando frontend Flow...${NC}"
cd ../flow
npm install

cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://api.$DOMAIN
NEXT_PUBLIC_APP_URL=http://app.$DOMAIN
EOF

npm run build
pm2 delete flow-frontend 2>/dev/null || true
pm2 start npm --name "flow-frontend" -- start
print_status "Frontend Flow configurado"

# Setup Landing page
echo -e "${YELLOW}🏠 Configurando landing page...${NC}"
cd ../landing
npm install

npm run build
pm2 delete flowzz-landing 2>/dev/null || true
pm2 serve dist 3003 --name "flowzz-landing" --spa
print_status "Landing page configurada"

# Setup Admin panel
echo -e "${YELLOW}👨‍💼 Configurando painel admin...${NC}"
cd ../admin
npm install

cat > .env.production << EOF
VITE_API_URL=http://api.$DOMAIN
VITE_APP_URL=http://admin.$DOMAIN
EOF

npm run build
pm2 delete flowzz-admin 2>/dev/null || true
pm2 serve dist 3002 --name "flowzz-admin" --spa
print_status "Painel admin configurado"

# Save PM2 configuration
pm2 save
pm2 startup

# Configure Nginx
echo -e "${YELLOW}🌐 Configurando Nginx...${NC}"
sudo tee /etc/nginx/sites-available/flowzz > /dev/null <<EOF
upstream flowzz_api {
    server localhost:3001;
}

server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
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
}

server {
    listen 80;
    server_name admin.$DOMAIN;

    location / {
        proxy_pass http://localhost:3002;
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

sudo ln -sf /etc/nginx/sites-available/flowzz /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
print_status "Nginx configurado"

# SSL Configuration (if domain is not localhost)
if [ "$DOMAIN" != "localhost" ]; then
    echo -e "${YELLOW}🔒 Configurando SSL...${NC}"
    sudo apt install -y certbot python3-certbot-nginx

    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    sudo certbot --nginx -d admin.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    sudo certbot --nginx -d api.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    print_status "SSL configurado"
fi

# Setup logrotate for PM2
echo -e "${YELLOW}📊 Configurando rotação de logs...${NC}"
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Create update script
echo -e "${YELLOW}📝 Criando script de atualização...${NC}"
cat > ~/update_flowzz.sh << 'EOF'
#!/bin/bash
cd ~/flowzz

echo "🔄 Atualizando Flowzz..."

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install
npm run build
pm2 restart flowzz-api

# Update flow frontend
cd ../flow
npm install
npm run build
pm2 restart flow-frontend

# Update admin panel
cd ../admin
npm install
npm run build
pm2 restart flowzz-admin

echo "✅ Flowzz atualizado com sucesso!"
EOF

chmod +x ~/update_flowzz.sh
print_status "Script de atualização criado"

# Final status check
echo -e "${BLUE}📊 Status final dos serviços:${NC}"
pm2 status
echo ""
sudo docker ps

echo ""
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 URLs de acesso:${NC}"
if [ "$DOMAIN" = "localhost" ]; then
    echo -e "  Frontend: http://localhost:3000"
    echo -e "  Admin:    http://localhost:3002"
    echo -e "  API:      http://localhost:3001"
else
    echo -e "  Frontend: https://$DOMAIN"
    echo -e "  Admin:    https://admin.$DOMAIN"
    echo -e "  API:      https://api.$DOMAIN"
fi
echo ""
echo -e "${BLUE}🛠️ Comandos úteis:${NC}"
echo -e "  Ver logs: pm2 logs"
echo -e "  Reiniciar serviços: pm2 restart all"
echo -e "  Atualizar: ~/update_flowzz.sh"
echo ""
echo -e "${YELLOW}⚠️ Importante: Configure os registros DNS para apontar para o IP da VPS${NC}"