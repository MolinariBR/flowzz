/**
 * StorageService
 * 
 * Serviço para upload/download de arquivos em AWS S3 ou Cloudflare R2
 * 
 * Referências:
 * - design.md: §Cloud Storage - Armazenamento escalável de relatórios
 * - tasks.md: Task 10.1.5 - Storage Service com signed URLs
 * - user-stories.md: Story 6.1 - Download seguro de relatórios
 * - TASK10_STORAGE_TODO.md: Especificação completa
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

/**
 * Interface para configuração de Storage
 */
interface StorageConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

/**
 * Service para gerenciamento de arquivos em S3/R2
 * 
 * Features:
 * - Upload de arquivos com metadata
 * - Signed URLs para download seguro (expiração configurável)
 * - Deleção de arquivos
 * - Cleanup automático de arquivos antigos
 * - Health check de conectividade
 * - Suporte dual: AWS S3 ou Cloudflare R2
 */
export class StorageService {
  private s3Client: S3Client;
  private bucket: string = '';
  private isConfigured: boolean;

  constructor() {
    this.s3Client = new S3Client({ region: 'us-east-1' }); // Initialize com defaults
    this.isConfigured = this.initializeClient();
  }

  /**
   * Inicializa cliente S3 com configurações do ambiente
   * Detecta automaticamente se é AWS S3 ou Cloudflare R2
   */
  private initializeClient(): boolean {
    try {
      // Verificar se credenciais estão configuradas
      if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
        logger.warn('Storage credentials not configured - uploads will fail', {
          hasAccessKey: !!env.AWS_ACCESS_KEY_ID,
          hasSecretKey: !!env.AWS_SECRET_ACCESS_KEY,
        });
        return false;
      }

      if (!env.AWS_S3_BUCKET) {
        logger.warn('S3 bucket not configured - uploads will fail');
        return false;
      }

      // Configurar cliente S3
      const config: StorageConfig = {
        bucket: env.AWS_S3_BUCKET,
        region: env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      };

      // Cloudflare R2 usa endpoint customizado
      // R2 endpoint format: https://<account_id>.r2.cloudflarestorage.com
      const isR2 = env.AWS_S3_BUCKET.includes('.r2.') || env.AWS_REGION === 'auto';

      if (isR2) {
        // Para R2, região deve ser 'auto'
        config.region = 'auto';
        logger.info('StorageService initialized with Cloudflare R2', {
          bucket: config.bucket,
        });
      } else {
        logger.info('StorageService initialized with AWS S3', {
          bucket: config.bucket,
          region: config.region,
        });
      }

      this.s3Client = new S3Client({
        region: config.region,
        credentials: config.credentials,
      });

      this.bucket = config.bucket;
      return true;
    } catch (error) {
      logger.error('Failed to initialize StorageService', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Faz upload de um arquivo para S3/R2
   * 
   * @param buffer - Buffer do arquivo
   * @param filename - Nome do arquivo (ex: report-uuid.pdf)
   * @param contentType - MIME type (ex: application/pdf)
   * @returns Chave S3 do arquivo (ex: reports/report-uuid.pdf)
   * 
   * @throws Error se storage não estiver configurado ou upload falhar
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType?: string
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new Error(
        'Storage service not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET environment variables.'
      );
    }

    try {
      // Definir chave do arquivo (path no S3)
      const key = `reports/${filename}`;

      // Detectar content type se não fornecido
      const detectedContentType =
        contentType || this.detectContentType(filename);

      const params: PutObjectCommandInput = {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: detectedContentType,
        // ACL não é usado - segurança via signed URLs
        Metadata: {
          uploadedAt: new Date().toISOString(),
          originalFilename: filename,
        },
      };

      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      logger.info('File uploaded successfully to S3/R2', {
        key,
        size: buffer.length,
        contentType: detectedContentType,
        bucket: this.bucket,
      });

      return key;
    } catch (error) {
      logger.error('Error uploading file to S3/R2', {
        filename,
        bucket: this.bucket,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to upload file to S3/R2: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gera URL assinada para download seguro
   * 
   * @param key - Chave do arquivo no S3 (ex: reports/report-uuid.pdf)
   * @param expiresIn - Tempo de expiração em segundos (padrão: 7 dias)
   * @returns URL assinada válida pelo período especificado
   * 
   * @throws Error se storage não estiver configurado ou geração falhar
   */
  async getSignedUrl(key: string, expiresIn: number = 604800): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Storage service not configured');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn, // Default: 7 dias (604800 segundos)
      });

      logger.info('Signed URL generated successfully', {
        key,
        expiresIn,
        expiresInHours: Math.floor(expiresIn / 3600),
      });

      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed URL', {
        key,
        bucket: this.bucket,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to generate signed URL: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Deleta um arquivo do S3/R2
   * 
   * @param key - Chave do arquivo (ex: reports/report-uuid.pdf)
   * 
   * @throws Error se storage não estiver configurado ou deleção falhar
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Storage service not configured');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);

      logger.info('File deleted successfully from S3/R2', {
        key,
        bucket: this.bucket,
      });
    } catch (error) {
      logger.error('Error deleting file from S3/R2', {
        key,
        bucket: this.bucket,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Remove arquivos antigos do bucket (cleanup automático)
   * 
   * @param olderThanDays - Deletar arquivos mais antigos que N dias (padrão: 30)
   * @returns Número de arquivos deletados
   * 
   * @throws Error se storage não estiver configurado ou cleanup falhar
   */
  async cleanupOldFiles(olderThanDays: number = 30): Promise<number> {
    if (!this.isConfigured) {
      throw new Error('Storage service not configured');
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      logger.info('Starting storage cleanup', {
        olderThanDays,
        cutoffDate: cutoffDate.toISOString(),
        bucket: this.bucket,
      });

      // Listar arquivos no prefixo reports/
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: 'reports/',
      });

      const { Contents } = await this.s3Client.send(listCommand);

      if (!Contents || Contents.length === 0) {
        logger.info('No files found for cleanup');
        return 0;
      }

      // Filtrar arquivos antigos
      type S3Object = NonNullable<typeof Contents>[number];
      const oldFiles = Contents.filter((file: S3Object): boolean => {
        const lastModified = file.LastModified || new Date();
        return lastModified < cutoffDate;
      });

      if (oldFiles.length === 0) {
        logger.info('No old files to cleanup', {
          totalFiles: Contents.length,
          olderThanDays,
        });
        return 0;
      }

      // Deletar arquivos em batch
      let deletedCount = 0;
      for (const file of oldFiles) {
        if (file.Key) {
          try {
            await this.deleteFile(file.Key);
            deletedCount++;
          } catch (error) {
            logger.error('Failed to delete file during cleanup', {
              key: file.Key,
              error: error instanceof Error ? error.message : String(error),
            });
            // Continua cleanup mesmo se um arquivo falhar
          }
        }
      }

      logger.info('Storage cleanup completed', {
        olderThanDays,
        totalFiles: Contents.length,
        oldFiles: oldFiles.length,
        deletedCount,
        bucket: this.bucket,
      });

      return deletedCount;
    } catch (error) {
      logger.error('Error during storage cleanup', {
        olderThanDays,
        bucket: this.bucket,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to cleanup old files: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Verifica se conexão com S3/R2 está funcionando
   * 
   * @returns true se conectado, false caso contrário
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn('Storage health check failed - not configured');
      return false;
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        MaxKeys: 1, // Apenas 1 objeto para teste rápido
      });

      await this.s3Client.send(command);

      logger.debug('Storage health check passed', {
        bucket: this.bucket,
      });

      return true;
    } catch (error) {
      logger.error('Storage health check failed', {
        bucket: this.bucket,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Detecta content type baseado na extensão do arquivo
   * 
   * @param filename - Nome do arquivo
   * @returns MIME type correspondente
   */
  private detectContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      csv: 'text/csv',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      zip: 'application/zip',
      json: 'application/json',
    };

    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Retorna se o serviço está configurado corretamente
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Retorna nome do bucket configurado
   */
  getBucket(): string | null {
    return this.isConfigured ? this.bucket : null;
  }
}
