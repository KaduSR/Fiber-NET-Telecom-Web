// config.ts (Root)
// spell: disable

export const getApiBaseUrl = () => {
  // Em desenvolvimento e produção, usa o proxy /api-proxy
  // O Vite (dev) e Vercel (prod) farão o redirect para backend.fibernettelecom.com
  return "/api-proxy";
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
