# 🚀 Checklist de Deployment - FlowZZ

## 🎯 **Pré-requisitos**

### **Ambiente**
- [ ] Servidor Linux Ubuntu 20.04+ ou similar
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 15+ instalado
- [ ] Redis 7+ instalado
- [ ] Nginx configurado
- [ ] SSL certificate (Let's Encrypt)
- [ ] Domínio configurado (DNS)

### **Credenciais**
- [ ] PagBank token e configurações
- [ ] Coinzz API credentials
- [ ] WhatsApp Business API credentials
- [ ] Facebook Ads API credentials
- [ ] SMTP para emails
- [ ] Monitoring tools (Sentry, DataDog)

---

## 🏗️ **Fase 1: Infraestrutura (1-2 dias)**

### **1.1 Servidor**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Instalar Redis
sudo apt install redis-server

# Instalar Nginx
sudo apt install nginx

# Instalar PM2 para process management
sudo npm install -g pm2
```

### **1.2 Banco de Dados**
```bash
# Configurar PostgreSQL
sudo -u postgres psql

# Dentro do psql:
CREATE DATABASE flowzz;
CREATE USER flowzz WITH PASSWORD 'SUA_SENHA_SECRETA';
GRANT ALL PRIVILEGES ON DATABASE flowzz TO flowzz;
ALTER USER flowzz CREATEDB;
\q

# Criar arquivo .env
cat > /var/www/flowzz/backend/.env << EOF
DATABASE_URL="postgresql://flowzz:SUA_SENHA_SECRETA@localhost:5432/flowzz"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="SUA_JWT_SECRET_SECRETA"
PAGBANK_TOKEN="SUA_PAGBANK_TOKEN"
# ... outras variáveis
EOF
```

### **1.3 Aplicação**
```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www/flowzz
sudo chown -R $USER:$USER /var/www/flowzz

# Clonar repositório
cd /var/www/flowzz
git clone https://github.com/MolinariBR/flowzz.git .
git checkout main

# Instalar dependências
cd backend && npm ci --production=false
cd ../admin && npm ci --production=false
cd ../flow && npm ci --production=false
cd ../landing && npm ci --production=false
```

---

## 🔧 **Fase 2: Configuração (1-2 dias)**

### **2.1 Backend**
```bash
cd /var/www/flowzz/backend

# Build da aplicação
npm run build

# Executar migrations
npm run db:migrate

# Executar seed
npm run db:seed

# Testar aplicação
npm run test

# Configurar PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'flowzz-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/flowzz/api-error.log',
    out_file: '/var/log/flowzz/api-out.log',
    log_file: '/var/log/flowzz/api.log',
    time: true
  }]
}
EOF
```

### **2.2 Admin Panel**
```bash
cd /var/www/flowzz/admin

# Build para produção
npm run build

# Configurar variáveis de ambiente
cat > .env.production << EOF
VITE_API_URL=https://api.flowzz.com.br/api/v1
VITE_APP_ENV=production
EOF
```

### **2.3 Flow App**
```bash
cd /var/www/flow

# Build para produção
npm run build

# Configurar variáveis de ambiente
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.flowzz.com.br/api/v1
NEXT_PUBLIC_APP_ENV=production
EOF
```

### **2.4 Landing Page**
```bash
cd /var/www/flowzz/landing

# Build para produção
npm run build
```

---

## 🌐 **Fase 3: Web Server (Nginx) (1 dia)**

### **3.1 Configuração Nginx**
```bash
# Criar configuração do site
sudo cat > /etc/nginx/sites-available/flowzz << EOF
# Upstream para API
upstream flowzz_api {
    server 127.0.0.1:4000;
    keepalive 32;
}

# HTTPS redirect
server {
    listen 80;
    server_name flowzz.com.br www.flowzz.com.br api.flowzz.com.br admin.flowzz.com.br;
    return 301 https://\$server_name\$request_uri;
}

# API (Backend)
server {
    listen 443 ssl http2;
    server_name api.flowzz.com.br;

    ssl_certificate /etc/letsencrypt/live/flowzz.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flowzz.com.br/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # API routes
    location / {
        proxy_pass http://flowzz_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Webhooks (raw body)
    location /webhooks/ {
        proxy_pass http://flowzz_api;
        proxy_http_version 1.1;
        proxy_set_header Content-Type \$content_type;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Admin Panel
server {
    listen 443 ssl http2;
    server_name admin.flowzz.com.br;

    ssl_certificate /etc/letsencrypt/live/flowzz.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flowzz.com.br/privkey.pem;

    root /var/www/flowzz/admin/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass https://api.flowzz.com.br;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Flow App (Main App)
server {
    listen 443 ssl http2;
    server_name app.flowzz.com.br;

    ssl_certificate /etc/letsencrypt/live/flowzz.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flowzz.com.br/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
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

# Landing Page
server {
    listen 443 ssl http2;
    server_name flowzz.com.br www.flowzz.com.br;

    ssl_certificate /etc/letsencrypt/live/flowzz.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flowzz.com.br/privkey.pem;

    root /var/www/flowzz/landing/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Habilitar site
sudo ln -s /etc/nginx/sites-available/flowzz /etc/nginx/sites-enabled/

# Remover configuração padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### **3.2 SSL Certificate**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d flowzz.com.br -d www.flowzz.com.br -d api.flowzz.com.br -d admin.flowzz.com.br -d app.flowzz.com.br

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🚀 **Fase 4: Deploy (1 dia)**

### **4.1 Backend**
```bash
cd /var/www/flowzz/backend

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Verificar status
pm2 status
pm2 logs flowzz-api --lines 50
```

### **4.2 Admin Panel**
```bash
cd /var/www/flowzz/admin

# Build de produção
npm run build

# Nginx já serve os arquivos estáticos
```

### **4.3 Flow App**
```bash
cd /var/www/flowzz/flow

# Configurar PM2 para Next.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'flowzz-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/flowzz/flow',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Iniciar Flow App
pm2 start ecosystem.config.js
pm2 save
```

### **4.4 Landing Page**
```bash
cd /var/www/flowzz/landing

# Build de produção
npm run build

# Nginx já serve os arquivos estáticos
```

---

## 🔍 **Fase 5: Testes e Validação (1-2 dias)**

### **5.1 Health Checks**
```bash
# Testar API
curl -k https://api.flowzz.com.br/health

# Testar admin panel
curl -k https://admin.flowzz.com.br

# Testar landing page
curl -k https://flowzz.com.br

# Testar flow app
curl -k https://app.flowzz.com.br
```

### **5.2 Funcionalidades**
```bash
# Testar login admin
curl -X POST https://api.flowzz.com.br/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowzz.com.br","password":"Admin@123"}'

# Testar métricas admin
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.flowzz.com.br/api/v1/admin/metrics
```

### **5.3 Performance**
```bash
# Teste de carga básico
ab -n 1000 -c 10 https://api.flowzz.com.br/health

# Verificar logs
pm2 logs

# Monitorar recursos
htop
df -h
free -h
```

---

## 📊 **Fase 6: Monitoramento (1 dia)**

### **6.1 Logs**
```bash
# Configurar logrotate
sudo cat > /etc/logrotate.d/flowzz << EOF
/var/log/flowzz/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### **6.2 Monitoring**
```bash
# Instalar monitoring básico
sudo apt install htop iotop

# PM2 monitoring
pm2 monit

# Configurar alertas (opcional)
# - Sentry para error tracking
# - DataDog para métricas
# - UptimeRobot para monitoring externo
```

### **6.3 Backup**
```bash
# Script de backup
cat > /var/www/flowzz/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/flowzz"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -U flowzz -h localhost flowzz > $BACKUP_DIR/db_$DATE.sql

# Backup de arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/flowzz

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

# Tornar executável
chmod +x /var/www/flowzz/backup.sh

# Agendar backup diário
crontab -e
# Adicionar: 0 2 * * * /var/www/flowzz/backup.sh
```

---

## 🚨 **Fase 7: Rollback Plan**

### **7.1 Estratégia de Rollback**
```bash
# Script de rollback
cat > /var/www/flowzz/rollback.sh << 'EOF'
#!/bin/bash

echo "Starting rollback..."

# Parar serviços
pm2 stop all

# Restaurar backup do banco
BACKUP_FILE=$(ls -t /var/backups/flowzz/db_*.sql | head -1)
psql -U flowzz -h localhost flowzz < $BACKUP_FILE

# Restaurar arquivos
FILES_BACKUP=$(ls -t /var/backups/flowzz/files_*.tar.gz | head -1)
cd /
tar -xzf $FILES_BACKUP

# Reiniciar serviços
cd /var/www/flowzz/backend && pm2 start ecosystem.config.js
cd /var/www/flowzz/flow && pm2 start ecosystem.config.js

echo "Rollback completed"
EOF

chmod +x /var/www/flowzz/rollback.sh
```

### **7.2 Blue-Green Deployment**
```bash
# Para futuras atualizações, considerar:
# - Deploy em ambiente staging primeiro
# - Testes automatizados em staging
# - Swap de blue/green se tudo ok
# - Rollback automático se falhar
```

---

## 📋 **Checklist Final**

### **Pré-deployment**
- [ ] Todos os testes passando
- [ ] Variáveis de ambiente configuradas
- [ ] Backups realizados
- [ ] Domínio e SSL prontos

### **Deployment**
- [ ] Backend deployado e funcionando
- [ ] Admin panel acessível
- [ ] Flow app funcionando
- [ ] Landing page online

### **Pós-deployment**
- [ ] Health checks passando
- [ ] Funcionalidades testadas
- [ ] Logs monitorados
- [ ] Backup configurado

### **Monitoramento**
- [ ] Métricas coletadas
- [ ] Alertas configurados
- [ ] Performance monitorada
- [ ] Usuários notificados

---

## 🎯 **Métricas de Sucesso**

- **Uptime**: 99.9% nos primeiros 30 dias
- **Performance**: < 2s response time médio
- **Errors**: < 0.1% de requests com erro
- **User Satisfaction**: > 95% de usuários satisfeitos

## 🔄 **Próximos Passos**

Após deployment inicial:
1. **Monitoring Avançado** - Métricas detalhadas
2. **Auto-scaling** - Configuração para picos
3. **CDN** - CloudFlare ou similar
4. **Database Optimization** - Read replicas

---

**Data:** 31 de outubro de 2025
**Tempo Estimado:** 1-2 semanas
**Custo Estimado:** R$ 500-1.000/mês (servidor + domínio)