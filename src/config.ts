// src/config.ts
// spell: disable

export const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return "/api-proxy/api";
  }

  return "https://api.centralfiber.online/api";
};

export const API_BASE_URL = getApiBaseUrl();

export const ENDPOINTS = {
  LOGIN: `/auth/login`,
  DASHBOARD: `/dashboard`,
  CHANGE_PASSWORD: `/senha/trocar`,
  RECOVERY: `/senha/recuperar`,
  INVOICES: `/faturas`,
  SERVICE_STATUS: `/status`,
  SPEEDTEST_RUN: `/speedtest`,
  GET_PIX: (id: number | string) => `/faturas/${id}/pix`,
  LOGIN_ACTION: (id: string | number, action: string) =>
    `/logins/${id}/${action}`,
};
