# 🔧 Correção da Configuração do Banco de Dados

## 🚨 **Problema Identificado**

O backend está tentando conectar ao PostgreSQL na **porta 5433**, mas o banco está rodando na **porta 5432** (padrão).

### **Logs de Erro**
```
prisma:error
Invalid `prisma.$queryRaw()` invocation:
Can't reach database server at `localhost:5433`
Please make sure your database server is running at `localhost:5432`.
```

## ✅ **Solução**

### **Passo 1: Verificar Configuração Atual**
```bash
# Verificar se PostgreSQL está rodando na porta correta
ps aux | grep postgres
netstat -tlnp | grep 5432
```

### **Passo 2: Corrigir Arquivo de Configuração**
Localizar e editar o arquivo `.env` no diretório `backend/`:

```env
# ❌ ANTES (errado)
DATABASE_URL="postgresql://flowzz:flowzz@localhost:5433/flowzz?schema=public"

# ✅ DEPOIS (correto)
DATABASE_URL="postgresql://flowzz:flowzz@localhost:5432/flowzz?schema=public"
```

### **Passo 3: Verificar Conexão**
```bash
# No diretório backend/
cd backend

# Testar conexão com o banco
npx prisma db push

# Se der erro, verificar se PostgreSQL está rodando
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### **Passo 4: Executar Migrations**
```bash
# Aplicar migrations pendentes
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# Executar seed (dados iniciais)
npx tsx prisma/seed.ts
```

## 🧪 **Teste de Validação**

### **Health Check**
```bash
# Iniciar backend
npm run dev

# Em outro terminal, testar health check
curl http://localhost:4000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2025-10-31T..."
}
```

### **Teste de Login Admin**
```bash
# Testar login do admin
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowzz.com.br","password":"Admin@123"}'
```

**Resposta esperada:**
```json
{
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@flowzz.com.br",
      "role": "ADMIN"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

## 🔍 **Troubleshooting**

### **Erro: "Can't reach database server"**
```bash
# Verificar se PostgreSQL está instalado e rodando
sudo apt list --installed | grep postgresql

# Se não estiver instalado
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **Erro: "Authentication failed"**
```bash
# Verificar credenciais no .env
cat backend/.env | grep DATABASE_URL

# Conectar diretamente ao PostgreSQL
sudo -u postgres psql
# Dentro do psql:
# CREATE DATABASE flowzz;
# CREATE USER flowzz WITH PASSWORD 'flowzz';
# GRANT ALL PRIVILEGES ON DATABASE flowzz TO flowzz;
# \q
```

### **Erro: "Database does not exist"**
```bash
# Criar banco de dados
sudo -u postgres createdb flowzz

# Dar permissões
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE flowzz TO flowzz;"
```

## 📋 **Checklist de Validação**

- [ ] PostgreSQL rodando na porta 5432
- [ ] DATABASE_URL corrigida no .env
- [ ] Conexão com banco estabelecida
- [ ] Migrations aplicadas
- [ ] Seed executado
- [ ] Health check retorna status "ok"
- [ ] Login admin funciona
- [ ] Admin panel acessível

## 🎯 **Próximos Passos**

Após corrigir a configuração do banco, proceder para:
1. **Flow App Integration** - Conectar dados reais
2. **External Integrations** - Implementar webhooks
3. **Payment System** - Sistema de assinaturas

---

**Data:** 31 de outubro de 2025
**Prioridade:** 🔴 Crítica