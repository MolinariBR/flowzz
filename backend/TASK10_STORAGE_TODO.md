# Task 10.1.5 - Storage Service (S3/R2) - Implementação Pendente

**Status**: 🔄 DEFERRED (Placeholder ativo - aguardando credenciais)

**Referências**:
- design.md: §Cloud Storage - S3/R2 para arquivos de relatório
- tasks.md: Task 10.1.5 - Storage com signed URLs
- user-stories.md: Story 6.1 - Download seguro de relatórios

---

## 📦 Dependências

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## 🔧 Configuração

### Environment Variables

Adicionar ao `.env`:

**AWS S3**:
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=flowzz-reports
AWS_S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
```

**Cloudflare R2** (alternativa):
```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=flowzz-reports
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-your-id.r2.dev
```

### Env Schema (src/shared/config/env.ts)

Adicionar ao schema:
```typescript
const envSchema = z.object({
  // ... campos existentes
  
  // Storage (AWS S3 ou Cloudflare R2)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().optional(),
  
  // Cloudflare R2 (alternativa)
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),
});
```

---

## 💻 Implementação

### 1. Criar StorageService.ts

**Arquivo**: `src/services/StorageService.ts`

```typescript
/**
 * StorageService
 * 
 * Serviço para upload/download de arquivos em AWS S3 ou Cloudflare R2
 * 
 * Referências:
 * - design.md: §Cloud Storage
 * - tasks.md: Task 10.1.5
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../shared/config/env';
import { logger } from '../shared/utils/logger';

export class StorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    // Detectar se é AWS S3 ou Cloudflare R2
    const isR2 = !!env.R2_ENDPOINT;

    if (isR2) {
      // Cloudflare R2
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: env.R2_ENDPOINT,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID!,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
        },
      });
      this.bucket = env.R2_BUCKET!;
      logger.info('StorageService initialized with Cloudflare R2');
    } else {
      // AWS S3
      this.s3Client = new S3Client({
        region: env.AWS_REGION,
        endpoint: env.AWS_S3_ENDPOINT,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      this.bucket = env.AWS_S3_BUCKET!;
      logger.info('StorageService initialized with AWS S3');
    }
  }

  /**
   * Faz upload de um arquivo
   * 
   * @param buffer - Buffer do arquivo
   * @param filename - Nome do arquivo (ex: report-uuid.pdf)
   * @param contentType - MIME type (ex: application/pdf)
   * @returns URL da chave no S3/R2
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType?: string
  ): Promise<string> {
    try {
      const key = `reports/${filename}`;

      const params: PutObjectCommandInput = {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType || 'application/octet-stream',
        // ACL: 'private', // Apenas signed URLs podem acessar
        Metadata: {
          uploadedAt: new Date().toISOString(),
        },
      };

      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      logger.info('File uploaded successfully', {
        key,
        size: buffer.length,
        contentType,
      });

      return key; // Retorna chave S3
    } catch (error) {
      logger.error('Error uploading file to S3/R2', {
        filename,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gera URL assinada para download
   * 
   * @param key - Chave do arquivo no S3/R2
   * @param expiresIn - Tempo de expiração em segundos (padrão: 7 dias)
   * @returns URL assinada válida por N segundos
   */
  async getSignedUrl(key: string, expiresIn: number = 604800): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn, // 7 dias padrão (604800 segundos)
      });

      logger.info('Signed URL generated', {
        key,
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed URL', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Deleta um arquivo
   * 
   * @param key - Chave do arquivo no S3/R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);

      logger.info('File deleted successfully', { key });
    } catch (error) {
      logger.error('Error deleting file from S3/R2', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Remove arquivos antigos (cleanup automático)
   * 
   * @param olderThanDays - Deletar arquivos mais antigos que N dias
   * @returns Número de arquivos deletados
   */
  async cleanupOldFiles(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Listar arquivos
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: 'reports/',
      });

      const { Contents } = await this.s3Client.send(listCommand);

      if (!Contents || Contents.length === 0) {
        logger.info('No files to cleanup');
        return 0;
      }

      // Filtrar arquivos antigos
      const oldFiles = Contents.filter((file) => {
        const lastModified = file.LastModified || new Date();
        return lastModified < cutoffDate;
      });

      // Deletar arquivos
      let deletedCount = 0;
      for (const file of oldFiles) {
        if (file.Key) {
          await this.deleteFile(file.Key);
          deletedCount++;
        }
      }

      logger.info('Cleanup completed', {
        olderThanDays,
        deletedCount,
        totalFiles: Contents.length,
      });

      return deletedCount;
    } catch (error) {
      logger.error('Error during cleanup', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Failed to cleanup old files: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verifica se conexão com S3/R2 está funcionando
   */
  async healthCheck(): Promise<boolean> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        MaxKeys: 1,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      logger.error('Storage health check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
```

---

### 2. Integrar em ReportService.ts

**Substituir placeholder**:

```typescript
import { StorageService } from './StorageService';

export class ReportService implements IReportService {
  // ... campos existentes
  private storageService: StorageService;

  constructor() {
    // ... inicializações existentes
    this.storageService = new StorageService();
  }

  /**
   * Faz upload do arquivo para S3/R2
   * 
   * @param buffer - Buffer do arquivo gerado
   * @param filename - Nome do arquivo (report-uuid.pdf)
   * @returns URL da chave S3 ou signed URL
   */
  async uploadFile(buffer: Buffer, filename: string): Promise<string> {
    // Detectar content type
    const contentType = filename.endsWith('.pdf')
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // Upload para S3/R2
    const key = await this.storageService.uploadFile(buffer, filename, contentType);

    // Gerar signed URL válida por 7 dias
    const signedUrl = await this.storageService.getSignedUrl(key, 604800);

    logger.info('File uploaded and signed URL generated', {
      filename,
      key,
      expiresIn: '7 days',
    });

    return signedUrl;
  }

  // ... resto do código
}
```

---

### 3. Atualizar ReportController.ts (Download)

**Modificar getDownloadUrl**:

```typescript
async getDownloadUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    const { id } = reportIdParamSchema.parse(req.params);
    const report = await reportService.getReportById(id, userId);

    if (!report) {
      res.status(404).json({
        success: false,
        error: 'Relatório não encontrado',
      });
      return;
    }

    const reportData = report as unknown as { data?: { status?: string } };
    if (reportData?.data?.status !== 'READY') {
      res.status(400).json({
        success: false,
        error: 'Relatório ainda não está pronto para download',
        status: reportData?.data?.status || 'UNKNOWN',
      });
      return;
    }

    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      res.status(410).json({
        success: false,
        error: 'Relatório expirado',
      });
      return;
    }

    if (!report.file_url) {
      res.status(404).json({
        success: false,
        error: 'Arquivo do relatório não encontrado',
      });
      return;
    }

    // Se file_url já é signed URL (começa com https), retornar direto
    if (report.file_url.startsWith('https://')) {
      res.status(200).json({
        success: true,
        data: {
          downloadUrl: report.file_url,
          expiresAt: report.expires_at,
        },
      });
      return;
    }

    // Se é chave S3, gerar nova signed URL
    const signedUrl = await reportService.storageService.getSignedUrl(report.file_url, 3600); // 1 hora

    logger.info('Download URL generated', {
      userId,
      reportId: id,
      expiresIn: '1 hour',
    });

    res.status(200).json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // +1 hora
      },
    });
  } catch (error) {
    // ... error handling
  }
}
```

---

### 4. Cleanup Automático (Cron Job)

**Arquivo**: `src/jobs/storageCleanup.ts`

```typescript
import { CronJob } from 'cron';
import { StorageService } from '../services/StorageService';
import { logger } from '../shared/utils/logger';

const storageService = new StorageService();

/**
 * Job que roda diariamente às 3h da manhã
 * Remove arquivos de relatórios com mais de 30 dias
 */
export const storageCleanupJob = new CronJob(
  '0 3 * * *', // 3h AM todos os dias
  async () => {
    try {
      logger.info('Starting storage cleanup job');
      const deletedCount = await storageService.cleanupOldFiles(30);
      logger.info('Storage cleanup completed', { deletedCount });
    } catch (error) {
      logger.error('Storage cleanup failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  null, // onComplete
  true, // start now
  'America/Sao_Paulo' // timezone
);
```

**Registrar em server.ts**:

```typescript
import { storageCleanupJob } from './jobs/storageCleanup';

// ... após startAllWorkers()
storageCleanupJob.start();
logger.info('Storage cleanup job scheduled (daily at 3 AM)');
```

**Dependência**:
```bash
npm install cron
npm install --save-dev @types/cron
```

---

### 5. Health Check

**Adicionar em health.routes.ts**:

```typescript
import { StorageService } from '../services/StorageService';

const storageService = new StorageService();

router.get('/storage', async (req, res) => {
  const healthy = await storageService.healthCheck();
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
  });
});
```

---

## 🧪 Testes

### Teste 1: Upload
```typescript
const buffer = Buffer.from('test content');
const filename = 'test-report.pdf';
const url = await storageService.uploadFile(buffer, filename, 'application/pdf');

console.log(url); // https://bucket.s3.region.amazonaws.com/reports/test-report.pdf
```

### Teste 2: Signed URL
```typescript
const key = 'reports/test-report.pdf';
const signedUrl = await storageService.getSignedUrl(key, 3600); // 1h

console.log(signedUrl); // https://bucket.s3...?X-Amz-Signature=...
```

### Teste 3: Cleanup
```typescript
const deletedCount = await storageService.cleanupOldFiles(30);
console.log(`Deleted ${deletedCount} old files`);
```

### Teste 4: Health Check
```typescript
const healthy = await storageService.healthCheck();
console.log(`Storage health: ${healthy ? 'OK' : 'FAIL'}`);
```

---

## 🔒 Segurança

### Políticas S3/R2

**Bucket Policy (apenas signed URLs)**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::flowzz-reports/*",
      "Condition": {
        "StringNotLike": {
          "aws:Referer": "https://app.flowzz.com.br/*"
        }
      }
    }
  ]
}
```

**CORS Configuration**:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://app.flowzz.com.br"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### Permissions IAM (AWS)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::flowzz-reports",
        "arn:aws:s3:::flowzz-reports/*"
      ]
    }
  ]
}
```

---

## ✅ Checklist de Implementação

- [ ] Instalar `@aws-sdk/client-s3` e `@aws-sdk/s3-request-presigner`
- [ ] Adicionar variáveis de ambiente ao `.env`
- [ ] Atualizar `env.ts` schema
- [ ] Criar `StorageService.ts`
- [ ] Substituir placeholder em `ReportService.uploadFile()`
- [ ] Atualizar `ReportController.getDownloadUrl()`
- [ ] Criar `storageCleanup.ts` job (opcional)
- [ ] Adicionar health check endpoint
- [ ] Configurar bucket S3/R2 (políticas, CORS)
- [ ] Testar upload/download com signed URLs
- [ ] Validar segurança (URLs expiram?)
- [ ] Monitorar custos (CloudWatch, R2 Dashboard)

---

## 💰 Estimativa de Custos

### AWS S3
- **Storage**: $0.023/GB/mês (primeiros 50TB)
- **Transfer OUT**: $0.09/GB (primeiros 10TB/mês)
- **Requests PUT**: $0.005/1000 requisições
- **Requests GET**: $0.0004/1000 requisições

**Exemplo (1000 relatórios/mês, 500KB cada)**:
- Storage: 0.5GB * $0.023 = **$0.01/mês**
- Uploads: 1000 * $0.005/1000 = **$0.005/mês**
- Downloads: 1000 * $0.0004/1000 = **$0.0004/mês**
- **Total: ~$0.02/mês**

### Cloudflare R2 (mais barato)
- **Storage**: $0.015/GB/mês
- **Transfer OUT**: **GRÁTIS** (sem custo de egress)
- **Class A (write)**: $4.50/milhão
- **Class B (read)**: $0.36/milhão

**Exemplo (1000 relatórios/mês, 500KB cada)**:
- Storage: 0.5GB * $0.015 = **$0.0075/mês**
- Uploads: 1000 * $4.50/1M = **$0.0045/mês**
- Downloads: **$0** (grátis)
- **Total: ~$0.01/mês**

> 💡 **Recomendação**: Cloudflare R2 (mais barato e sem custo de egress)

---

**Status**: 📋 Pronto para implementação quando credenciais disponíveis
**Prioridade**: Média (placeholder funciona localmente, mas não escala)
**Complexidade**: Baixa (AWS SDK bem documentado)
