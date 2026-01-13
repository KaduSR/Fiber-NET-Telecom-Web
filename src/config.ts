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
  INVOICES: `/boletos/buscar-cpf`, // <--- CORRIGIDO (Rota real do Backend)
  SERVICE_STATUS: `/status`,
  SPEEDTEST_RUN: `/speedtest`,
  // Nova rota dinâmica para PIX
  GET_PIX: (id: number | string) => `/boletos/${id}/pix`, // <--- GARANTA QUE ESTEJA ASSIM TAMBÉM
  LOGIN_ACTION: (id: string | number, action: string) =>
    `/logins/${id}/${action}`,
};
