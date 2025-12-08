export const getApiBaseUrl = () => {
  // Safe check for development environment to avoid runtime errors
  let isDev = false;
  
  try {
    // 1. Check if running on localhost (fallback)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            isDev = true;
        }
    }

    // 2. Check Vite specific env safely
    // Using type assertion to any to prevent crash if import.meta.env is undefined or untyped
    const meta = import.meta as any;
    if (meta.env && meta.env.DEV) {
        isDev = true;
    }
  } catch (e) {
    // If anything fails, we assume production
  }

  if (isDev) {
     return '/api-proxy/api';
  }
  
  // Em produção (Build final na UOLHost), usamos a URL completa do backend.
  return 'https://localhost:3333/api'; 
};

export const API_BASE_URL = getApiBaseUrl();

export const ENDPOINTS = {
  LOGIN: `/auth/login`,
  DASHBOARD: `/dashboard`,
  CHANGE_PASSWORD: `/auth/trocar-senha`,
  RECOVERY: `/auth/recuperar-senha`, 
  INVOICES: `/faturas`,
  SERVICE_STATUS: `/status`,
  SPEEDTEST_RUN: `/speedtest`,
  // Nova rota dinâmica para PIX
  GET_PIX: (id: number | string) => `/faturas/${id}/pix`, 
  LOGIN_ACTION: (id: string | number, action: string) => `/logins/${id}/${action}`,
};