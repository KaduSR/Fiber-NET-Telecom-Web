// src/config.ts
// spell: disable

export const getApiBaseUrl = () => {
  // 1. Prioridade para variáveis de ambiente (se houver)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Modo Desenvolvimento (npm run dev)
  if (import.meta.env.DEV) {
    // Tenta usar o proxy local do Vite
    return "/api-proxy/api";
  }

  // 3. Fallback Produção
  return "https://api.centralfiber.online/api";
};

export const API_BASE_URL = getApiBaseUrl();

export const ENDPOINTS = {
  LOGIN: `/auth/login`,
  DASHBOARD: `/dashboard`,
  CHANGE_PASSWORD: `/auth/trocar-senha`,
  RECOVERY: `/auth/recuperar-senha`,
  INVOICES: `/faturas`,
  PRINT_INVOICE: `/faturas/imprimir`,
  SERVICE_STATUS: `/status`,
  SPEEDTEST_RUN: `/speedtest`,
  GET_PIX: (id: number | string) => `/faturas/${id}/pix`,
  LOGIN_ACTION: (id: string | number, action: string) =>
    `/logins/${id}/${action}`,
};
