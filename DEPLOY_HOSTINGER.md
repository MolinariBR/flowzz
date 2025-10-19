# Tutorial: Deploy do Flowzz na VPS Hostinger

## 📋 Pré-requisitos

- VPS Ubuntu 22.04+ na Hostinger
- Pelo menos 2GB RAM (recomendado 4GB+)
- Acesso SSH à VPS
- Domínio configurado (opcional, mas recomendado)

## 🚀 Passo 1: Preparação da VPS

### 1.1 Atualizar o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar dependências básicas
```bash
sudo apt install -y curl wget git htop ufw
```

### 1.3 Configurar firewall
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### 1.4 Instalar Node.js 18+ (usando NodeSource)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1.5 Instalar PM2 globalmente
```bash
sudo npm install -g pm2
```

### 1.6 Instalar Nginx
```bash
sudo apt install -y nginx
```

### 1.7 Instalar Docker e Docker Compose
```bash
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

## 🗄️ Passo 2: Configuração do Banco de Dados

### 2.1 Criar diretório para o projeto
```bash
mkdir -p ~/flowzz
cd ~/flowzz
```

### 2.2 Clonar o repositório
```bash
git clone https://github.com/MolinariBR/flowzz.git .
```

### 2.3 Configurar banco de dados
```bash
cd backend
sudo docker-compose up -d postgres redis
```

### 2.4 Verificar se os containers estão rodando
```bash
sudo docker ps
```

### 2.5 Configurar Prisma
```bash
npm install
npx prisma generate
npx prisma db push
```

## 🔧 Passo 3: Configuração do Backend

### 3.1 Instalar dependências
```bash
cd ~/flowzz/backend
npm install
```

### 3.2 Criar arquivo de configuração de produção
```bash
nano .env.production
```

Conteúdo do `.env.production`:
```env
# Database
DATABASE_URL="postgresql://flowzz_user:flowzz_password@localhost:5433/flowzz_db"

# Redis
REDIS_URL="redis://localhost:6380"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN="https://flowzzoficial.com,https://admin.flowzzoficial.com"

# AWS S3 (se usar)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""

# Email (se usar)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
```

### 3.3 Build do backend
```bash
npm run build
```

### 3.4 Iniciar backend com PM2
```bash
pm2 start dist/server.js --name "flowzz-api"
pm2 save
pm2 startup
```

## 🎨 Passo 4: Deploy do Frontend Flow

### 4.1 Instalar dependências
```bash
cd ~/flowzz/flow
npm install
```

### 4.2 Criar arquivo de configuração de produção
```bash
nano .env.local
```

Conteúdo do `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.flowzzoficial.com
NEXT_PUBLIC_APP_URL=https://app.flowzzoficial.com
```

### 4.3 Build do frontend
```bash
npm run build
```

### 4.4 Iniciar com PM2
```bash
pm2 start npm --name "flow-frontend" -- start
pm2 save
```

## 👨‍💼 Passo 5: Deploy do Admin Panel

### 5.1 Instalar dependências
```bash
cd ~/flowzz/admin
npm install
```

### 5.2 Criar arquivo de configuração de produção
```bash
nano .env.production
```

Conteúdo do `.env.production`:
```env
VITE_API_URL=https://api.flowzzoficial.com
VITE_APP_URL=https://admin.flowzzoficial.com
```

### 5.3 Build do admin panel
```bash
npm run build
```

### 5.4 Servir arquivos estáticos com PM2
```bash
pm2 serve dist 3002 --name "flowzz-admin" --spa
pm2 save
```

## 🏠 Passo 6: Deploy da Landing Page

### 6.1 Instalar dependências
```bash
cd ~/flowzz/landing
npm install
```

### 6.2 Build da landing page
```bash
npm run build
```

### 6.3 Servir com PM2
```bash
pm2 serve dist 3003 --name "flowzz-landing" --spa
pm2 save
```

## 🌐 Passo 6: Configuração do Nginx

### 6.1 Criar configuração do Nginx
```bash
sudo nano /etc/nginx/sites-available/flowzz
```

Conteúdo do arquivo de configuração:
```nginx
# Upstream para o backend
upstream flowzz_api {
    server localhost:3001;
}

# Landing Page - main domain
server {
    listen 80;
    server_name flowzzoficial.com www.flowzzoficial.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name flowzzoficial.com www.flowzzoficial.com;

    # SSL Configuration (managed by Certbot)
    # ssl_certificate /etc/letsencrypt/live/flowzzoficial.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/flowzzoficial.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req zone=frontend burst=20 nodelay;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @landing;
    }

    # Landing page
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Frontend Flow (Next.js) - app subdomain
server {
    listen 80;
    server_name app.flowzzoficial.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.flowzzoficial.com;

# Admin Panel (porta 3002)
server {
    listen 80;
    server_name admin.flowzzoficial.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Backend (porta 3001)
server {
    listen 80;
    server_name api.flowzzoficial.com;

    location / {
        proxy_pass http://flowzz_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.2 Habilitar o site
```bash
sudo ln -s /etc/nginx/sites-available/flowzz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Passo 7: Configuração de SSL (Let's Encrypt)

### 7.1 Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Gerar certificados SSL
```bash
sudo certbot --nginx -d flowzzoficial.com -d www.flowzzoficial.com
sudo certbot --nginx -d app.flowzzoficial.com
sudo certbot --nginx -d admin.flowzzoficial.com
sudo certbot --nginx -d api.flowzzoficial.com
```

### 7.3 Verificar renovação automática
```bash
sudo certbot renew --dry-run
```

## 📊 Passo 8: Monitoramento e Logs

### 8.1 Verificar status dos serviços
```bash
pm2 status
sudo docker ps
sudo systemctl status nginx
```

### 8.2 Ver logs
```bash
pm2 logs
sudo docker logs flowzz_postgres
sudo docker logs flowzz_redis
```

### 8.3 Configurar logrotate para PM2
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🔄 Passo 9: Atualizações e Manutenção

### 9.1 Script de atualização
```bash
nano ~/update_flowzz.sh
```

Conteúdo do script:
```bash
#!/bin/bash
cd ~/flowzz

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

echo "Flowzz updated successfully!"
```

```bash
chmod +x ~/update_flowzz.sh
```

## 🚨 Troubleshooting

### Problemas comuns:

1. **Portas ocupadas**: Verifique se as portas 3000, 3001, 3002 estão livres
2. **Banco não conecta**: Verifique se Docker containers estão rodando
3. **Build falha**: Verifique se Node.js versão é compatível (18+)
4. **SSL falha**: Certifique-se de que os domínios apontam para o IP da VPS

### Comandos úteis:
```bash
# Verificar portas abertas
sudo netstat -tlnp | grep :300

# Verificar uso de disco
df -h

# Verificar uso de memória
free -h

# Reiniciar todos os serviços
pm2 restart all
sudo docker-compose restart
sudo systemctl restart nginx
```

## 📞 Suporte

Para dúvidas específicas sobre o código do Flowzz, consulte:
- Documentação: `docs/`
- Issues do GitHub: https://github.com/MolinariBR/flowzz/issues

---

**Nota**: Este tutorial está configurado para o domínio `flowzzoficial.com`. Para desenvolvimento local, use `localhost` ou o IP da VPS.