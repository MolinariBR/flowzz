# 📋 Checklist de Deploy - Flowzz Hostinger VPS

## ✅ Pré-deploy

- [ ] VPS Ubuntu 22.04+ contratada na Hostinger
- [ ] Acesso SSH configurado
- [ ] Pelo menos 2GB RAM (4GB+ recomendado)
- [ ] Domínio registrado e DNS configurado
- [ ] Backup dos dados locais (se necessário)

## 🚀 Durante o Deploy

### Sistema Operacional
- [ ] Sistema atualizado (`apt update && apt upgrade`)
- [ ] Dependências básicas instaladas (curl, wget, git, htop, ufw)
- [ ] Firewall configurado (SSH, HTTP, HTTPS)
- [ ] Node.js 18+ instalado
- [ ] PM2 instalado globalmente
- [ ] Nginx instalado
- [ ] Docker e Docker Compose instalados

### Banco de Dados
- [ ] PostgreSQL container rodando na porta 5433
- [ ] Redis container rodando na porta 6380
- [ ] Conexão com banco testada
- [ ] Prisma migrations executadas
- [ ] Dados iniciais populados (se necessário)

### Backend API
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env.production` criado
- [ ] Build executado (`npm run build`)
- [ ] Aplicação rodando na porta 3001 via PM2
- [ ] Endpoint de saúde testado (`curl http://localhost:3001/health`)

### Frontend Flow (Next.js)
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env.local` criado
- [ ] Build executado (`npm run build`)
- [ ] Aplicação rodando na porta 3000 via PM2
- [ ] Página inicial acessível (`curl http://localhost:3000`)

### Admin Panel (Vite)
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env.production` criado
- [ ] Build executado (`npm run build`)
- [ ] Aplicação servida na porta 3002 via PM2
- [ ] Interface admin acessível (`curl http://localhost:3002`)

### Landing Page (Vite)
- [ ] Dependências instaladas (`npm install`)
- [ ] Build executado (`npm run build`)
- [ ] Aplicação servida na porta 3003 via PM2
- [ ] Landing page acessível (`curl http://localhost:3003`)

### Nginx
- [ ] Arquivo de configuração criado
- [ ] Configuração testada (`nginx -t`)
- [ ] Serviço recarregado (`systemctl reload nginx`)
- [ ] Proxy reverso configurado para todas as aplicações
- [ ] Headers CORS configurados

## 🔒 SSL e Segurança

- [ ] Certbot instalado
- [ ] Certificados SSL gerados para todos os domínios
- [ ] Renovação automática configurada
- [ ] HTTPS forçado nas configurações
- [ ] Headers de segurança adicionados (opcional)

## 📊 Monitoramento

- [ ] PM2 logrotate configurado
- [ ] Status de todos os serviços verificado
- [ ] Logs de erro checados
- [ ] Monitoramento básico configurado

## 🔄 Pós-deploy

- [ ] Script de atualização criado (`update_flowzz.sh`)
- [ ] Permissões dos arquivos verificadas
- [ ] Backup inicial realizado
- [ ] Documentação de acesso criada

## 🌐 Testes Finais

### Funcionalidades
- [ ] Landing page carrega corretamente em flowzzoficial.com
- [ ] Aplicação Flow acessível em app.flowzzoficial.com
- [ ] Admin panel acessível e funcional
- [ ] API responde corretamente
- [ ] Banco de dados acessível
- [ ] Autenticação funciona
- [ ] CRUD básico testado

### Performance
- [ ] Tempo de resposta aceitável (< 2s)
- [ ] Memória utilizada dentro dos limites
- [ ] CPU não sobrecarregada
- [ ] Conexões simultâneas suportadas

### Segurança
- [ ] HTTPS funcionando em todos os domínios
- [ ] Portas desnecessárias fechadas
- [ ] Credenciais seguras configuradas
- [ ] Firewall ativo

## 📞 Documentação

- [ ] URLs de acesso documentadas
- [ ] Credenciais de acesso salvas
- [ ] Comandos de gerenciamento documentados
- [ ] Procedimentos de backup definidos
- [ ] Plano de contingência criado

## 🎯 Próximos Passos

- [ ] Configurar monitoramento avançado (opcional)
- [ ] Configurar CDN (opcional)
- [ ] Configurar backup automático (recomendado)
- [ ] Otimizar performance (opcional)
- [ ] Configurar alertas (opcional)

---

## 📝 Notas Importantes

- **Domínios**: Não esqueça de configurar os registros DNS
- **SSL**: Pode levar até 24h para propagar
- **Backup**: Sempre faça backup antes de atualizações
- **Monitoramento**: Configure alertas para downtime
- **Segurança**: Mude senhas padrão imediatamente

## 🚨 Em Caso de Problemas

1. Verifique logs: `pm2 logs`
2. Teste conectividade: `curl -I http://localhost:3000`
3. Verifique serviços: `pm2 status && sudo docker ps`
4. Reinicie serviços: `pm2 restart all`
5. Consulte documentação completa em `DEPLOY_HOSTINGER.md`