# 🚀 Deploy Flowzz - Hostinger VPS

Este guia fornece instruções completas para fazer o deploy do Flowzz em uma VPS da Hostinger.

## 📋 Pré-requisitos

- VPS Ubuntu 22.04+ na Hostinger com pelo menos 2GB RAM
- Acesso SSH à VPS
- Domínio configurado (recomendado)

## ⚠️ Execução como Root

O script de deploy pode ser executado como root, mas para **maior segurança**, recomendamos:

### Opção 1: Criar usuário dedicado (Recomendado)
```bash
# Como root
./scripts/setup_user.sh

# Depois faça login como o novo usuário
su - flowzz
cd ~
git clone https://github.com/MolinariBR/flowzz.git
cd flowzz
./deploy.sh flowzzoficial.com admin@flowzzoficial.com
```

### Opção 2: Executar diretamente como root
```bash
# Como root
./deploy.sh flowzzoficial.com admin@flowzzoficial.com
# O script irá perguntar se deseja continuar
```

### Passo 1: Conectar à VPS
```bash
ssh usuario@seu-ip-vps
```

### Passo 2: Executar deploy automático
```bash
# Para localhost (desenvolvimento)
./deploy.sh

# Para domínio personalizado
./deploy.sh flowzzoficial.com admin@flowzzoficial.com
```

### Passo 3: Configurar DNS (se usar domínio)
Configure os seguintes registros DNS:
- `flowzzoficial.com` → IP da VPS
- `www.flowzzoficial.com` → IP da VPS
- `admin.flowzzoficial.com` → IP da VPS
- `api.flowzzoficial.com` → IP da VPS

## 🔧 Deploy Manual

Se preferir fazer o deploy manual, siga o tutorial completo em [`DEPLOY_HOSTINGER.md`](./DEPLOY_HOSTINGER.md).

## 📁 Estrutura Após Deploy

```
/home/usuario/flowzz/
├── 📁 docs/                    # Documentação organizada
│   └── 📁 deploy/              # Documentação de deploy
├── 📁 scripts/                 # Scripts de automação
│   ├── 📁 deploy/              # Scripts de deploy modularizados
│   │   ├── 📁 config/          # Configurações de deploy
│   │   ├── 📁 modules/         # Módulos de deploy
│   │   └── deploy.sh.backup    # Backup do script antigo
│   ├── setup_user.sh           # Script de criação de usuário
│   └── setup-integration.sh    # Script de integração
├── 📁 backend/                 # API Node.js
├── 📁 flow/                    # Frontend Next.js
├── 📁 admin/                   # Painel Admin Vite
├── 📁 landing/                 # Landing Page Vite
├── 📁 e2e/                     # Testes end-to-end
├── deploy.sh                   # Script principal de deploy
├── update_flowzz.sh            # Script de atualização (criado após deploy)
└── README.md                   # Documentação principal
```

## 🏗️ Arquitetura dos Scripts de Deploy

O sistema de deploy foi refatorado para uma arquitetura modular:

### Script Principal
- **`deploy.sh`** (na raiz): Orquestrador principal que executa todos os módulos em ordem

### Módulos de Deploy
Localizados em `scripts/deploy/modules/`:

- **`setup.sh`** - Configuração básica do sistema (atualizações, dependências, firewall)
- **`project.sh`** - Configuração do projeto (clone/update do repositório)
- **`database.sh`** - Configuração do banco PostgreSQL e Redis
- **`backend.sh`** - Configuração da API Node.js
- **`flow.sh`** - Configuração do frontend Flow (Next.js)
- **`admin.sh`** - Configuração do painel administrativo
- **`landing.sh`** - Configuração da landing page
- **`nginx.sh`** - Configuração do servidor web Nginx
- **`ssl.sh`** - Configuração de certificados SSL
- **`final.sh`** - Configurações finais (PM2, logrotate, scripts de update)

### Configurações Centralizadas
- **`scripts/deploy/config/deploy.config`** - Arquivo central de configurações

### Benefícios da Arquitetura Modular
- ✅ **Manutenibilidade**: Cada módulo tem responsabilidade única
- ✅ **Reutilização**: Módulos podem ser executados individualmente
- ✅ **Debugging**: Fácil identificar e corrigir problemas específicos
- ✅ **Flexibilidade**: Possível customizar ou pular módulos específicos

## 🌐 URLs de Acesso

Após o deploy, suas aplicações estarão disponíveis em:

- **Landing Page**: `https://flowzzoficial.com`
- **Aplicação Flow**: `https://app.flowzzoficial.com`
- **Painel Admin**: `https://admin.flowzzoficial.com`
- **API**: `https://api.flowzzoficial.com`

## 🛠️ Comandos de Gerenciamento

### Verificar status dos serviços
```bash
pm2 status          # Status das aplicações Node.js
sudo docker ps      # Status dos containers
sudo systemctl status nginx  # Status do Nginx
```

### Ver logs
```bash
pm2 logs [nome-do-app]  # Logs de aplicações específicas
pm2 logs               # Todos os logs
sudo docker logs flowzz_postgres  # Logs do PostgreSQL
sudo docker logs flowzz_redis     # Logs do Redis
```

### Reiniciar serviços
```bash
pm2 restart all      # Reiniciar todas as apps
sudo docker-compose restart  # Reiniciar banco
sudo systemctl restart nginx # Reiniciar Nginx
```

### Atualizar aplicação
```bash
~/update_flowzz.sh
```

## 🔧 Configuração Personalizada

### 1. Arquivo de configuração
```bash
cp config.env.example config.env
nano config.env  # Edite as configurações
```

### 2. Variáveis de ambiente
Cada aplicação tem seu próprio arquivo `.env`:
- `backend/.env.production`
- `flow/.env.local`
- `admin/.env.production`

## 🚨 Troubleshooting

### Problemas comuns:

1. **Erro de conexão com banco**
   ```bash
   sudo docker-compose logs postgres
   sudo docker restart flowzz_postgres
   ```

2. **Aplicação não inicia**
   ```bash
   pm2 logs [nome-do-app]
   pm2 restart [nome-do-app]
   ```

3. **SSL não funciona**
   ```bash
   sudo certbot certificates
   sudo certbot renew
   ```

4. **Site lento**
   - Verifique uso de memória: `free -h`
   - Verifique uso de disco: `df -h`
   - Considere upgrade da VPS

### Logs importantes:
```bash
# Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Sistema
sudo journalctl -u nginx -f
sudo journalctl -u docker -f
```

## 🔄 Atualizações

Para atualizar o Flowzz para a versão mais recente:

```bash
cd ~/flowzz
~/update_flowzz.sh
```

Este script irá:
- Baixar as últimas mudanças do GitHub
- Reinstalar dependências
- Rebuild das aplicações
- Reiniciar todos os serviços

## 🔒 Segurança

### Recomendações básicas:
1. **Mude a senha padrão do SSH**
2. **Use chaves SSH ao invés de senha**
3. **Mantenha o sistema atualizado**
4. **Configure fail2ban para proteção SSH**
5. **Use senhas fortes para o banco de dados**

### Configurar Fail2Ban:
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📞 Suporte

- **Documentação completa**: [`DEPLOY_HOSTINGER.md`](./DEPLOY_HOSTINGER.md)
- **Issues do projeto**: [GitHub Issues](https://github.com/MolinariBR/flowzz/issues)
- **Documentação técnica**: [`docs/`](../docs/)

---

**Nota**: Este deploy foi otimizado para VPS da Hostinger com Ubuntu. Para outros provedores, pode ser necessário ajustar alguns comandos.