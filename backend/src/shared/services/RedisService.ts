// Referência: tasks.md Task 3.3.2, design.md §Cache Layer, user-stories.md Story 2.1
// Serviço de cache Redis para dashboard metrics com TTL 5min

import { createClient, type RedisClientType } from 'redis'
import { env } from '../config/env'
import { logger } from '../utils/logger'

export class RedisService {
  private static instance: RedisService
  private client: RedisClientType
  private isConnected: boolean = false

  constructor() {
    const redisOptions: {
      url: string
      password?: string
    } = {
      url: env.REDIS_URL,
    }

    if (env.REDIS_PASSWORD) {
      redisOptions.password = env.REDIS_PASSWORD
    }

    this.client = createClient(redisOptions)

    this.setupEventListeners()
  }

  /**
   * Singleton pattern para garantir uma única instância
   */
  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService()
    }
    return RedisService.instance
  }

  /**
   * Configura event listeners para o Redis
   */
  private setupEventListeners(): void {
    this.client.on('connect', () => {
      logger.info('🔗 Redis: Conectando...')
    })

    this.client.on('ready', () => {
      this.isConnected = true
      logger.info('✅ Redis: Conectado e pronto para uso')
    })

    this.client.on('error', (error) => {
      this.isConnected = false
      logger.error('❌ Redis: Erro de conexão', { error: error.message })
    })

    this.client.on('end', () => {
      this.isConnected = false
      logger.info('🔌 Redis: Conexão encerrada')
    })
  }

  /**
   * Conecta ao Redis
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect()
        logger.info('✅ Redis: Conectado com sucesso')
      } catch (error) {
        logger.error('❌ Redis: Falha na conexão', { error })
        throw error
      }
    }
  }

  /**
   * Desconecta do Redis
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.disconnect()
        this.isConnected = false
        logger.info('🔌 Redis: Desconectado com sucesso')
      } catch (error) {
        logger.error('❌ Redis: Erro ao desconectar', { error })
        throw error
      }
    }
  }

  /**
   * Verifica se está conectado
   */
  isReady(): boolean {
    return this.isConnected && this.client.isReady
  }

  /**
   * Armazena dados no cache com TTL
   */
  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    if (!this.isReady()) {
      logger.warn('⚠️  Redis: Tentativa de escrita sem conexão ativa')
      return
    }

    try {
      const serializedValue = JSON.stringify(value)
      await this.client.setEx(key, ttlSeconds, serializedValue)
      logger.debug('📝 Redis: Dados armazenados', { key, ttl: ttlSeconds })
    } catch (error) {
      logger.error('❌ Redis: Erro ao armazenar dados', { key, error })
    }
  }

  /**
   * Recupera dados do cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isReady()) {
      logger.warn('⚠️  Redis: Tentativa de leitura sem conexão ativa')
      return null
    }

    try {
      const value = await this.client.get(key)
      if (!value) {
        logger.debug('🔍 Redis: Cache miss', { key })
        return null
      }

      const parsedValue = JSON.parse(value)
      logger.debug('✅ Redis: Cache hit', { key })
      return parsedValue
    } catch (error) {
      logger.error('❌ Redis: Erro ao recuperar dados', { key, error })
      return null
    }
  }

  /**
   * Remove dados do cache
   */
  async delete(key: string): Promise<void> {
    if (!this.isReady()) {
      logger.warn('⚠️  Redis: Tentativa de remoção sem conexão ativa')
      return
    }

    try {
      await this.client.del(key)
      logger.debug('🗑️  Redis: Dados removidos', { key })
    } catch (error) {
      logger.error('❌ Redis: Erro ao remover dados', { key, error })
    }
  }

  /**
   * Remove múltiplas chaves por padrão
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!this.isReady()) {
      logger.warn('⚠️  Redis: Tentativa de remoção por padrão sem conexão ativa')
      return
    }

    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
        logger.debug('🗑️  Redis: Múltiplas chaves removidas', {
          pattern,
          count: keys.length,
        })
      }
    } catch (error) {
      logger.error('❌ Redis: Erro ao remover por padrão', { pattern, error })
    }
  }

  /**
   * Verifica se uma chave existe
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isReady()) {
      return false
    }

    try {
      const exists = await this.client.exists(key)
      return exists === 1
    } catch (error) {
      logger.error('❌ Redis: Erro ao verificar existência', { key, error })
      return false
    }
  }

  /**
   * Obtém TTL de uma chave
   */
  async getTTL(key: string): Promise<number> {
    if (!this.isReady()) {
      return -1
    }

    try {
      return await this.client.ttl(key)
    } catch (error) {
      logger.error('❌ Redis: Erro ao obter TTL', { key, error })
      return -1
    }
  }

  /**
   * Operações específicas para Dashboard Metrics
   */

  /**
   * Chave padrão para métricas do dashboard
   */
  private getDashboardMetricsKey(userId: string): string {
    return `dashboard:metrics:${userId}`
  }

  /**
   * Armazena métricas do dashboard com TTL de 5 minutos
   */
  async setDashboardMetrics(userId: string, metrics: unknown): Promise<void> {
    const key = this.getDashboardMetricsKey(userId)
    await this.set(key, metrics, 300) // 5 minutos
  }

  /**
   * Recupera métricas do dashboard
   */
  async getDashboardMetrics<T>(userId: string): Promise<T | null> {
    const key = this.getDashboardMetricsKey(userId)
    return await this.get<T>(key)
  }

  /**
   * Remove cache de métricas do dashboard
   */
  async invalidateDashboardMetrics(userId: string): Promise<void> {
    const key = this.getDashboardMetricsKey(userId)
    await this.delete(key)
  }

  /**
   * Remove cache de métricas de todos os usuários
   */
  async invalidateAllDashboardMetrics(): Promise<void> {
    await this.deletePattern('dashboard:metrics:*')
  }

  /**
   * Obtém estatísticas do cache do dashboard
   */
  async getDashboardCacheStats(): Promise<{
    totalKeys: number
    avgTTL: number
  }> {
    if (!this.isReady()) {
      return { totalKeys: 0, avgTTL: 0 }
    }

    try {
      const keys = await this.client.keys('dashboard:metrics:*')
      if (keys.length === 0) {
        return { totalKeys: 0, avgTTL: 0 }
      }

      const ttls = await Promise.all(keys.map((key) => this.getTTL(key)))
      const validTTLs = ttls.filter((ttl) => ttl > 0)
      const avgTTL =
        validTTLs.length > 0
          ? Math.round(validTTLs.reduce((sum, ttl) => sum + ttl, 0) / validTTLs.length)
          : 0

      return {
        totalKeys: keys.length,
        avgTTL,
      }
    } catch (error) {
      logger.error('❌ Redis: Erro ao obter estatísticas do cache', { error })
      return { totalKeys: 0, avgTTL: 0 }
    }
  }
}

// Instância singleton
export const redisService = RedisService.getInstance()
