# 🚀 Flowzz Deploy - Guia de Uso Correto

## ⚠️ Problemas Comuns e Soluções

### ❌ Problema: Domínios Inválidos
**Erro:** `Cannot issue for "ssl": Domain name needs at least one dot`

**Causa:** Tentativa de usar domínios inválidos como `ssl` ou `www.ssl`

**✅ Solução:**
```bash
# ✅ USAR (domínios válidos)
./deploy.sh flowzzoficial.com mauricior.contato@gmail.com

# ❌ NÃO USAR (domínios inválidos)
./deploy.sh ssl mauricior.contato@gmail.com
```

## 📋 Scripts Disponíveis

### 1. **Deploy Completo (RECOMENDADO)**
```bash
./scripts/deploy.sh flowzzoficial.com mauricior.contato@gmail.com
```

### 2. **Apenas SSL (se deploy já foi executado)**
```bash
./ssl-certificates.sh mauricior.contato@gmail.com
```

### 3. **Limpeza de Configurações Inválidas**
```bash
./clean-invalid-config.sh
```

## 🔧 Ordem de Execução Correta

O deploy script executa os módulos na seguinte ordem:

1. **setup** - Configura sistema básico
2. **project** - Clona/atualiza código
3. **database** - Configura PostgreSQL e Redis
4. **backend** - Instala e configura API
5. **flow** - Instala frontend do usuário
6. **admin** - Instala painel administrativo
7. **landing** - Instala landing page
8. **nginx** - Configura proxy reverso
9. **ssl** - Gera certificados SSL ✅
10. **final** - Configurações finais

## ⚡ Uso Rápido

```bash
# 1. No ambiente local (para desenvolvimento)
./scripts/deploy.sh localhost admin@localhost

# 2. No servidor de produção
./scripts/deploy.sh flowzzoficial.com mauricior.contato@gmail.com
```

## 🚨 Validações Automáticas

Todos os scripts agora incluem validações automáticas:

- ✅ **Domínio válido** (deve conter ponto)
- ✅ **Não usar "ssl"** como domínio
- ✅ **Email válido** para certificados
- ✅ **Estrutura de arquivos correta**

## 📊 Status do Projeto

**Configurações Corrigidas:**
- ✅ nginx.conf - Domínio principal correto
- ✅ config.env - CORS atualizado
- ✅ deploy.config - Configurações consistentes
- ✅ pnpm-lock.yaml - Disponível no repositório

**Scripts Funcionais:**
- ✅ deploy.sh - Deploy completo
- ✅ ssl-certificates.sh - Apenas SSL
- ✅ clean-invalid-config.sh - Limpeza

## 🎯 Próximos Passos

1. **Configure o DNS** para apontar `flowzzoficial.com` → IP do servidor
2. **Execute o deploy**: `./scripts/deploy.sh flowzzoficial.com mauricior.contato@gmail.com`
3. **Teste**: Acesse `https://flowzzoficial.com`

---

**💡 Dica:** Sempre use o deploy script completo ao invés de executar módulos individuais para evitar problemas de dependência!
