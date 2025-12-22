/**
 * Wallet Service
 * Cüzdan yönetimi API entegrasyonu
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse, PaginationParams } from '@/types/api.types';

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND';
  amount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface TopupRequest {
  amount: number;
  paymentMethod: string;
  redirectUrl?: string;
}

export interface TopupResponse {
  paymentUrl?: string;
  transactionId: string;
  status: string;
}

export interface TransactionListParams extends PaginationParams {
  type?: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND';
  startDate?: string;
  endDate?: string;
}

export const walletService = {
  /**
   * Cüzdan bakiyesi
   */
  async getBalance(): Promise<ApiResponse<WalletBalance>> {
    const response = await httpClient.get<ApiResponse<WalletBalance>>(
      API_ENDPOINTS.WALLET.BALANCE
    );
    return response.data;
  },

  /**
   * Para yükleme (topup)
   */
  async topup(data: TopupRequest): Promise<ApiResponse<TopupResponse>> {
    const response = await httpClient.post<ApiResponse<TopupResponse>>(
      API_ENDPOINTS.WALLET.TOPUP,
      data
    );
    return response.data;
  },

  /**
   * İşlem geçmişi
   */
  async getTransactions(params?: TransactionListParams): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.WALLET.TRANSACTIONS}?${queryParams.toString()}`
      : API_ENDPOINTS.WALLET.TRANSACTIONS;

    const response = await httpClient.get<ApiResponse<any>>(url);
    return response.data;
  },
};

