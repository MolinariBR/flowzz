// src/shared/utils/encryption.ts
// Utilitários de criptografia para armazenar tokens de forma segura

import crypto from 'node:crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(encryptionKey: string) {
    if (!encryptionKey) {
      throw new Error('Encryption key is required');
    }

    // Deriva uma chave de 32 bytes usando scrypt
    this.key = crypto.scryptSync(encryptionKey, 'flowzz-salt', 32);
  }

  /**
   * Criptografa um token
   */
  encryptToken(token: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retorna IV + encrypted data em formato base64
    return Buffer.from(iv.toString('hex') + ':' + encrypted, 'utf8').toString('base64');
  }

  /**
   * Descriptografa um token
   */
  decryptToken(encryptedToken: string): string {
    try {
      // Decodifica do base64
      const data = Buffer.from(encryptedToken, 'base64').toString('utf8');
      const [ivHex, encrypted] = data.split(':');

      if (!ivHex || !encrypted) {
        throw new Error('Invalid encrypted token format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt token');
    }
  }
}

// Instância global do serviço de criptografia
let encryptionService: EncryptionService | null = null;

/**
 * Obtém a instância do serviço de criptografia
 * Usa a variável de ambiente WHATSAPP_ENCRYPTION_KEY
 */
export function getEncryptionService(): EncryptionService {
  if (!encryptionService) {
    const key = process.env.WHATSAPP_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('WHATSAPP_ENCRYPTION_KEY environment variable is required');
    }
    encryptionService = new EncryptionService(key);
  }
  return encryptionService;
}