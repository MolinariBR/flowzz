# 🚀 Guia de Deploy Seguro - FlowZZ

## 🎯 **Visão Geral**

Este guia garante que as correções críticas implementadas **não quebrem o código de produção**. O sistema de deploy do FlowZZ não é automático via git push, mas usa scripts manuais de deploy.

## 🔍 **Análise do Sistema Atual**

### **Como Funciona o Deploy Atual:**
1. **Não Automático**: Não há hooks de git ou CI/CD
2. **Manual**: Deploy feito via `./deploy.sh` ou `./scripts/deploy/deploy.sh`
3. **Configurado**: Produção usa porta PostgreSQL **5433**
4. **PM2**: Serviços gerenciados pelo PM2 com caminhos absolutos

### **Arquivos Críticos Identificados:**
- `scripts/deploy/config/deploy.config` → Porta 5433 (PROBLEMA)
- `ecosystem.config.js` → Caminhos absolutos `/home/flowzz/*`
- `.env.production` → Variáveis específicas de produção

## 🚨 **Problema Identificado**

O código de produção está configurado para usar **porta PostgreSQL 5433**, mas nossas correções mudam para **porta 5432**. Deploy direto quebraria o sistema.

## ✅ **Solução Implementada**

### **1. Correção da Configuração de Produção**
```bash
# ANTES (quebrado):
POSTGRES_PORT="5433"

# DEPOIS (correto):
POSTGRES_PORT="5432"
```

**Arquivo corrigido:** `scripts/deploy/config/deploy.config`

### **2. Scripts de Migração Segura**
- `migrate-production.sh` → Migração gradual com backup
- `rollback-emergency.sh` → Rollback completo em caso de falha

## 📋 **Plano de Deploy Seguro**

### **Pré-Deploy (Local)**
```bash
# 1. Criar branch segura
git checkout -b fix-critical-issues

# 2. Implementar correções
# (Já implementado na pasta update/)

# 3. Testar localmente
./fix-critical-issues.sh
./start-services.sh

# 4. Commit das correções
git add .
git commit -m "fix: Correções críticas - PostgreSQL porta e Flow App integration"
```

### **Deploy em Produção (Servidor)**

#### **Opção 1: Migração Automática (Recomendada)**
```bash
# No servidor de produção:
cd /home/flowzz

# Executar migração segura
./migrate-production.sh
```

#### **Opção 2: Deploy Manual Passo-a-Passo**
```bash
# 1. Backup completo
mkdir -p backup-$(date +%Y%m%d_%H%M%S)
cp ecosystem.config.js backup-*/
cp -r /etc/nginx/sites-* backup-*/

# 2. Parar serviços
pm2 stop all && pm2 delete all

# 3. Atualizar código
git pull origin main

# 4. Corrigir PostgreSQL (se necessário)
# Editar postgresql.conf para porta 5432
sudo systemctl restart postgresql

# 5. Instalar dependências
cd backend && pnpm install --frozen-lockfile
cd ../flow && pnpm install --frozen-lockfile
cd ../admin && pnpm install --frozen-lockfile
cd ../landing && pnpm install --frozen-lockfile

# 6. Build aplicações
cd ../backend && npm run build
cd ../flow && npm run build
cd ../admin && npm run build
cd ../landing && npm run build

# 7. Executar migrations
cd ../backend
npx prisma generate
npx prisma db push

# 8. Iniciar serviços
pm2 start ecosystem.config.js
pm2 save

# 9. Testar
curl http://localhost:3001/health
```

## 🔄 **Monitoramento Pós-Deploy**

### **Verificações Imediatas**
```bash
# Status dos serviços
pm2 status
pm2 logs --lines 50

# Health checks
curl http://localhost:3001/health
curl http://localhost:3000
curl http://localhost:3002

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### **Monitoramento Contínuo**
```bash
# Monitor em tempo real
pm2 monit

# Logs detalhados
pm2 logs flowzz-api --lines 100
```

## 🆘 **Plano de Rollback**

### **Rollback Automático**
```bash
# Em caso de emergência:
./rollback-emergency.sh
```

### **Rollback Manual**
```bash
# Parar tudo
pm2 stop all && pm2 delete all

# Restaurar backup
cp backup-*/ecosystem.config.js .
pm2 resurrect

# Reverter código
git checkout HEAD~1

# Rebuild e restart
# (seguir passos do deploy manual)
```

## 📊 **Checklist de Deploy**

### **Pré-Deploy**
- [ ] Branch `fix-critical-issues` criada
- [ ] Correções testadas localmente
- [ ] Scripts de backup e rollback prontos
- [ ] Comunicação com stakeholders

### **Durante Deploy**
- [ ] Backup completo realizado
- [ ] Serviços parados graceful
- [ ] Código atualizado
- [ ] Dependências instaladas
- [ ] Aplicações compiladas
- [ ] Migrations executadas
- [ ] Serviços iniciados

### **Pós-Deploy**
- [ ] Health checks passando
- [ ] Funcionalidades testadas
- [ ] Logs monitorados
- [ ] Usuários notificados

## 🎯 **Métricas de Sucesso**

- **Uptime**: Manter 99%+ durante deploy
- **Response Time**: < 2s médio
- **Error Rate**: < 1% de requests
- **Rollback Time**: < 5 minutos se necessário

## 🔐 **Segurança**

- **Backup**: Sempre antes de qualquer mudança
- **Testes**: Ambiente staging primeiro quando possível
- **Monitoramento**: Logs em tempo real durante deploy
- **Rollback**: Plano testado e documentado

## 📞 **Contatos de Emergência**

- **Responsável Técnico**: [Nome/Contato]
- **Hospedagem**: Hostinger VPS
- **Monitoramento**: PM2 + Nginx logs

---

## 🚀 **Execução Recomendada**

1. **Hoje**: Testar correções localmente
2. **Amanhã**: Deploy em horário de baixo tráfego
3. **Monitorar**: 24-48h após deploy
4. **Comunicar**: Sucesso para stakeholders

**Tempo Estimado**: 2-4 horas de deploy + 24h monitoramento

---

**Data:** 31 de outubro de 2025
**Versão:** 1.0
**Status:** ✅ Pronto para Deploy Seguro