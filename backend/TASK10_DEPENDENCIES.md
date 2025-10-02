# Dependências para Task 10 - Sistema de Relatórios

## Instalação necessária:

```bash
cd /home/mau/projetos/flowzz/backend

# Task 3: Puppeteer para PDF
npm install puppeteer
npm install --save-dev @types/puppeteer

# Task 4: XLSX para Excel  
npm install xlsx
npm install --save-dev @types/node

# Task 6: AWS SDK para S3/R2 (escolher uma opção)
# Opção 1: AWS S3
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Opção 2: Cloudflare R2 (compatível com S3)
# npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Variáveis de ambiente necessárias (.env):
# AWS_ACCESS_KEY_ID=<your-key>
# AWS_SECRET_ACCESS_KEY=<your-secret>
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=flowzz-reports
# 
# OU para Cloudflare R2:
# R2_ACCESS_KEY_ID=<your-key>
# R2_SECRET_ACCESS_KEY=<your-secret>
# R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
# R2_BUCKET=flowzz-reports
```

## Nota:
Puppeteer baixa automaticamente o Chromium (~170MB). 
Em produção, considere usar puppeteer-core e fornecer o Chrome externamente para reduzir tamanho do container.
