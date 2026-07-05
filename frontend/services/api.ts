import axios, { AxiosError, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveBaseUrl(): string {
  if (!__DEV__) return 'https://api.gonggangmate.com/api/v1';

  // 웹 브라우저 환경 — localhost 직접 사용
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api/v1';
  }

  // 모바일 환경 — Expo 디버거 호스트 IP 자동 감지
  const debuggerHost =
    (Constants.expoConfig as any)?.hostUri ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as any).manifest?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    return `http://${host}:8080/api/v1`;
  }

  return 'http://localhost:8080/api/v1';
}

export const BASE_URL = resolveBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    if (__DEV__) console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      if (__DEV__) console.warn(`[API] Error ${error.response.status}:`, error.response.data);
    } else {
      console.error('[API] 네트워크 오류:', BASE_URL);
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T>(url: string, params?: object) =>
    apiClient.get<{ success: boolean; data: T; message: string }>(url, { params }),
  post: <T>(url: string, data?: object) =>
    apiClient.post<{ success: boolean; data: T; message: string }>(url, data),
  put: <T>(url: string, data?: object) =>
    apiClient.put<{ success: boolean; data: T; message: string }>(url, data),
  patch: <T>(url: string, data?: object) =>
    apiClient.patch<{ success: boolean; data: T; message: string }>(url, data),
  delete: <T>(url: string) =>
    apiClient.delete<{ success: boolean; data: T; message: string }>(url),
};
