# 🚀 Flowzz - Deploy na Hostinger VPS

## ⚡ Deploy Rápido

```bash
# 1. Conectar à VPS
ssh usuario@seu-ip-vps

# 2. Executar deploy automático
cd ~
git clone https://github.com/MolinariBR/flowzz.git
cd flowzz
chmod +x deploy.sh
./deploy.sh flowzzoficial.com admin@flowzzoficial.com
```

## 📋 Arquivos de Configuração

- `README_DEPLOY.md` - Documentação completa
- `DEPLOY_HOSTINGER.md` - Tutorial detalhado
- `DEPLOY_CHECKLIST.md` - Checklist de verificação
- `deploy.sh` - Script de deploy automatizado
- `nginx.conf` - Configuração do Nginx
- `ecosystem.config.js` - Configuração PM2
- `config.env.example` - Exemplo de configuração

## 🌐 URLs Após Deploy

## 🌐 URLs Após Deploy

- **Landing Page**: `https://flowzzoficial.com`
- **Aplicação Flow**: `https://app.flowzzoficial.com`
- **Painel Admin**: `https://admin.flowzzoficial.com`
- **API Backend**: `https://api.flowzzoficial.com`

## 🛠️ Comandos Essenciais

```bash
# Status dos serviços
pm2 status

# Ver logs
pm2 logs

# Reiniciar tudo
pm2 restart all

# Atualizar aplicação
~/update_flowzz.sh
```

## 📞 Suporte

Para dúvidas, consulte:
- `README_DEPLOY.md` - Instruções completas
- `DEPLOY_CHECKLIST.md` - Verificações importantes
- [GitHub Issues](https://github.com/MolinariBR/flowzz/issues)

---

**Tempo estimado de deploy: 15-30 minutos**