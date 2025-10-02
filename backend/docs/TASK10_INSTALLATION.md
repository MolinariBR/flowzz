# Task 10 - Sistema de Relatórios PDF/Excel - Instalação de Dependências

## Dependências Necessárias

### 1. Puppeteer (Geração de PDF)
```bash
npm install puppeteer
```

### 2. XLSX (Geração de Excel)
```bash
npm install xlsx
```

### 3. Express Rate Limit (Rate limiting de requisições)
```bash
npm install express-rate-limit
npm install --save-dev @types/express-rate-limit
```

### 4. AWS S3 SDK (Storage - Quando credenciais disponíveis)
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Instalação Completa

Para instalar todas as dependências de uma vez:

```bash
cd backend
npm install puppeteer xlsx express-rate-limit
npm install --save-dev @types/express-rate-limit
```

## Configuração do Rate Limiter

Após instalar `express-rate-limit`, substitua o placeholder em `server.ts`:

```typescript
import rateLimit from 'express-rate-limit';

# Task 10 - Sistema de Relatórios - Instalação Completa

## 📦 Dependências Obrigatórias

### 1. Generators (PDF e Excel)

```bash
# Puppeteer (geração de PDFs)
npm install puppeteer

# XLSX (geração de Excel multi-sheet)
npm install xlsx
```

### 2. Rate Limiting

```bash
# Express Rate Limit
npm install express-rate-limit
npm install --save-dev @types/express-rate-limit
```

### 3. Storage (S3/R2) - ✅ IMPLEMENTADO

```bash
# AWS SDK v3 para S3/R2
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 4. Cron Jobs (Cleanup Automático) - ✅ IMPLEMENTADO

```bash
# Cron para agendamento de jobs
npm install cron
npm install --save-dev @types/cron
```

## 🔧 Configuração

### 1. Variáveis de Ambiente (.env)

Adicione ao arquivo `.env`:

```env
# ==================== STORAGE (S3/R2) ====================
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=flowzz-reports

# OU

# Cloudflare R2 Configuration (alternativa mais barata)
AWS_ACCESS_KEY_ID=...  # R2 Access Key
AWS_SECRET_ACCESS_KEY=...  # R2 Secret Key
AWS_REGION=auto  # R2 sempre usa 'auto'
AWS_S3_BUCKET=flowzz-reports  # Nome do bucket R2
```

**Observação**: O StorageService detecta automaticamente se é AWS S3 ou Cloudflare R2 baseado na configuração.

### 2. Configurar Rate Limiter (server.ts)

**Substituir placeholder** em `src/server.ts`:

```typescript
// REMOVER placeholder temporário:
const reportGenerateLimiter = (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
  next();
};

// ADICIONAR implementação real:
import rateLimit from 'express-rate-limit';

const reportGenerateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: {
    success: false,
    error: 'Limite de geração de relatórios excedido. Você pode gerar até 10 relatórios por hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: express.Request, res: express.Response) => {
    logger.warn('Rate limit exceeded for report generation', {
      ip: req.ip,
      userId: (req as any).user?.userId,
    });
    res.status(429).json({
      success: false,
      error: 'Limite de geração de relatórios excedido. Aguarde 1 hora.',
    });
  },
});
```
```

## Variáveis de Ambiente (Para S3/R2 Storage)

Adicionar ao `.env`:

```env
# AWS S3 / Cloudflare R2 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=flowzz-reports

# OU para Cloudflare R2
# R2_ACCESS_KEY_ID=your_r2_access_key
# R2_SECRET_ACCESS_KEY=your_r2_secret_key
# R2_BUCKET=flowzz-reports
# R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

## Verificação da Instalação

Execute para verificar se todas as dependências foram instaladas:

```bash
npm ls puppeteer xlsx express-rate-limit
```

## Notas

- **Puppeteer**: Baixa uma versão do Chromium (~170MB). Pode demorar na primeira instalação.
- **XLSX**: Biblioteca leve, instalação rápida.
- **express-rate-limit**: Adiciona cabeçalhos `RateLimit-*` nas respostas HTTP.
- **AWS SDK**: Só instalar quando houver credenciais S3/R2 disponíveis.

## Arquivos Afetados

Após instalação do rate limiter, editar:
- `backend/src/server.ts` (linha ~55-60): Remover placeholder, adicionar implementação real
