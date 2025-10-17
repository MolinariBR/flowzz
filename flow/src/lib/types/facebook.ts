// src/lib/types/facebook.ts
// Tipos para integração Facebook Ads no frontend

export interface FacebookAdAccount {
  id: string;
  name: string;
  account_id: string;
  currency: string;
  timezone_name: string;
  owner?: string;
  role?: string;
}

export interface FacebookCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: string;
  budget_remaining: number;
  daily_budget: number;
  lifetime_budget?: number;
  start_time: string;
  stop_time?: string;
}

export interface FacebookAdInsights {
  campaign_id: string;
  campaign_name: string;
  date_start: string;
  date_stop: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  reach: number;
  frequency: number;
  conversions?: number;
  cost_per_conversion?: number;
  roas?: number;
}

export interface FacebookIntegrationStatus {
  connected: boolean;
  adAccounts: FacebookAdAccount[];
  lastSync?: string;
  error?: string;
}

export interface FacebookInsightsParams {
  adAccountId: string;
  datePreset?: 'today' | 'yesterday' | 'last_7d' | 'last_14d' | 'last_30d' | 'last_90d';
  startDate?: string;
  endDate?: string;
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  timeIncrement?: string;
}

export interface FacebookInsightsResponse {
  adAccount: FacebookAdAccount;
  campaigns: FacebookCampaign[];
  insights: FacebookAdInsights[];
  summary: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    averageCPC: number;
    averageROAS: number;
  };
}

export interface FacebookConnectResponse {
  authorizationUrl: string;
}

export interface FacebookCallbackResponse {
  success: boolean;
  adAccounts: FacebookAdAccount[];
  message?: string;
}

export interface FacebookSyncResponse {
  success: boolean;
  syncedRecords: number;
  message: string;
}