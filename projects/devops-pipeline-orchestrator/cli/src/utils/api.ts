import axios, { AxiosInstance } from 'axios';
import { ApiResponse } from '@dpo/shared';
import { loadConfig } from './config';

let client: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (client) return client;

  const config = loadConfig();
  const baseURL = config.apiUrl || 'http://localhost:3001/api';

  client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.code === 'ECONNREFUSED') {
        throw new Error(
          `Cannot connect to DPO server at ${baseURL}.\nRun the dashboard server or check your config.`
        );
      }
      throw err;
    }
  );

  return client;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await getApiClient().get<ApiResponse<T>>(path);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error || 'API request failed');
  }
  return res.data.data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await getApiClient().post<ApiResponse<T>>(path, body);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error || 'API request failed');
  }
  return res.data.data;
}
