// src/lib/api/facebook.ts
// Funções API para integração Facebook Ads

import type {
  FacebookIntegrationStatus,
  FacebookInsightsParams,
  FacebookInsightsResponse,
  FacebookConnectResponse,
  FacebookCallbackResponse,
  FacebookSyncResponse,
} from '../types/facebook';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const API_PREFIX = '/api/v1/integrations/facebook';
const API_BASE = `${API_BASE_URL}${API_PREFIX}`;

export const facebookApi = {
  // Verificar status da integração
  async getStatus(): Promise<FacebookIntegrationStatus> {
    const response = await fetch(`${API_BASE}/status`);
    if (!response.ok) {
      throw new Error('Failed to get Facebook integration status');
    }
    return response.json();
  },

  // Iniciar conexão OAuth
  async connect(): Promise<FacebookConnectResponse> {
    const response = await fetch(`${API_BASE}/connect`);
    if (!response.ok) {
      throw new Error('Failed to initiate Facebook connection');
    }
    return response.json();
  },

  // Processar callback OAuth
  async callback(code: string, state: string): Promise<FacebookCallbackResponse> {
    const response = await fetch(`${API_BASE}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process Facebook callback');
    }
    return response.json();
  },

  // Buscar insights
  async getInsights(params: FacebookInsightsParams): Promise<FacebookInsightsResponse> {
    const response = await fetch(`${API_BASE}/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch Facebook insights');
    }

    return response.json();
  },

  // Sincronizar dados
  async sync(): Promise<FacebookSyncResponse> {
    const response = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to sync Facebook data');
    }

    return response.json();
  },

  // Desconectar integração
  async disconnect(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/disconnect`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect Facebook integration');
    }

    return response.json();
  },
};