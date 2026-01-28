// src/services/apiService.ts
// cspell: disable
import { API_BASE_URL, ENDPOINTS } from "../config";
import { DashboardResponse, LoginResponse } from "../types/api";

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cleanBase = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${cleanBase}${cleanEndpoint}`;

    try {
      // console.log(`[Frontend] Requesting: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const text = await response.text();
      let data: any;

      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Erro ao parsear JSON:", text);
        throw new Error(`Erro de comunicação (Status ${response.status}).`);
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logout();
        }
        const errorMessage =
          data.error || data.message || `Erro ${response.status}`;
        throw new Error(errorMessage);
      }

      return data as T;
    } catch (error: any) {
      console.error(`[ApiService] Erro:`, error);
      throw error;
    }
  }

  // === MÉTODOS DE AUTH ===

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>(ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      localStorage.setItem("authToken", data.token);
      window.dispatchEvent(new Event("auth-change"));
    }
    return data;
  }

  logout() {
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event("auth-change"));
  }

  // === MÉTODOS DO DASHBOARD ===

  async getDashboard(): Promise<DashboardResponse> {
    const rawData = await this.request<any>(ENDPOINTS.DASHBOARD, {
      method: "GET",
    });

    // 1. Normalizar Clientes
    const clientes = rawData.clientes || [];

    // 2. Normalizar Contratos
    const contratos = (rawData.contratos || []).map((c: any) => ({
      ...c,
      plano: c.plano || c.descricao_aux_plano_venda || "Plano Fiber",
      endereco: c.endereco || clientes[0]?.endereco || "",
    }));

    // 3. Normalizar Logins
    const logins = (rawData.logins || []).map((l: any) => {
      const ont = (rawData.ontInfo || []).find(
        (o: any) => String(o.id_login) === String(l.id)
      );

      return {
        ...l,
        contrato_id: l.contrato_id || contratos[0]?.id,
        online: l.status === "online" || l.online === "S" ? "S" : "N",
        tempo_conectado: l.uptime ? this.formatUptime(l.uptime) : "Recente",
        sinal_ultimo_atendimento:
          ont?.sinal_rx || l.sinal_ultimo_atendimento || "- dBm",
        ont_modelo: ont?.onu_tipo || ont?.modelo || "ONU Padrão",
        ont_sinal_rx: ont?.sinal_rx,
        ont_sinal_tx: ont?.sinal_tx,
        ont_temperatura: ont?.temperatura,
        ont_mac: ont?.mac,
        ip_publico: l.ip_publico || "Automático",
      };
    });

    // 4. Normalizar Faturas (CORRIGIDO PARA O HISTÓRICO)
    const faturas = (rawData.faturas || []).map((f: any) => {
      const statusLower = f.status ? String(f.status).toLowerCase() : "";

      // Lógica de Status: "A" (Aberto), "P" (Pago/Parcial), "C" (Cancelado)
      let statusNormalizado = "A";

      // Se tiver 'recebido', 'pago' ou 'liquidado', marcamos como "P" (Pago)
      // para aparecer no Histórico corretamente.
      if (["r", "p", "pago", "recebido", "liquidado"].includes(statusLower)) {
        statusNormalizado = "P";
      }

      if (statusLower === "c" || statusLower === "cancelado") {
        statusNormalizado = "C";
      }

      return {
        ...f,
        data_vencimento: f.vencimento || f.data_vencimento,
        status: statusNormalizado,
        // Garante que o valor recebido seja repassado para o frontend calcular
        valor_recebido: f.valor_recebido || f.valor_pago || 0,
        pix_code: f.pix_code || null,
        pix_qrcode: f.pix_qrcode || null,
      };
    });

    return {
      clientes,
      contratos,
      faturas,
      logins,
      notas: rawData.notas || [],
      ordensServico: rawData.ordensServico || [],
      tickets: rawData.tickets || [],
      ontInfo: rawData.ontInfo || [],
      consumo: rawData.consumo || {
        total_download: "0 GB",
        total_upload: "0 GB",
        total_download_bytes: 0,
        total_upload_bytes: 0,
        history: { daily: [], weekly: [], monthly: [] },
      },
      ai_analysis:
        rawData.notas?.find((n: any) => n.id === "ai-insights") ||
        rawData.ai_analysis,
    };
  }

  // === MÉTODOS DE BOLETOS E PIX ===

  async getPixCode(
    faturaId: string | number
  ): Promise<{ qrcode: string; imagem: string }> {
    try {
      // @ts-ignore
      const url =
        typeof ENDPOINTS.GET_PIX === "function"
          ? ENDPOINTS.GET_PIX(faturaId)
          : `/faturas/${faturaId}/pix`;
      const response = await this.request<any>(url, { method: "GET" });

      if (response.pix && response.pix.qrCode) {
        return {
          qrcode: response.pixCopiaECola,
          imagem: response.pixImage || "",
        };
      }

      if (response.pix_code && response.pix_qrcode) {
        return {
          qrcode: response.pix_code,
          imagem: response.pix_qrcode || "",
        };
      }

      return {
        qrcode: "",
        imagem: "",
      };
    } catch (error) {
      console.error(`[ApiService] Erro PIX ${faturaId}:`, error);
      throw error;
    }
  }

  // 🔥 CORREÇÃO PRINCIPAL: Adicionado 'getSegundaVia' que faltava
  async getSegundaVia(
    id: number | string
  ): Promise<{ base64_document: string }> {
    // Aponta para a rota correta do seu backend
    const url = `/boletos/${id}/segunda-via`;
    return this.request<{ base64_document: string }>(url, {
      method: "GET",
    });
  }

  // Mantemos 'imprimirBoleto' como apelido para compatibilidade com códigos antigos
  async imprimirBoleto(id: number | string) {
    return this.getSegundaVia(id);
  }

  async imprimirNotaFiscal(
    id: number | string
  ): Promise<{ base64_document: string }> {
    const url = `/notas/${id}/imprimir`;
    return this.request<{ base64_document: string }>(url, {
      method: "GET",
    });
  }

  // === MÉTODOS DE AÇÃO ===

  async performLoginAction(loginId: number, action: string): Promise<any> {
    // @ts-ignore
    const url =
      typeof ENDPOINTS.LOGIN_ACTION === "function"
        ? ENDPOINTS.LOGIN_ACTION(loginId, action)
        : `/logins/${loginId}/${action}`;
    return this.request<any>(url, { method: "POST" });
  }

  async recoverPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(ENDPOINTS.RECOVERY, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async changePassword(newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(ENDPOINTS.CHANGE_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
  }

  // === UTILITÁRIOS ===

  private formatUptime(seconds: string | number): string {
    const sec = Number(seconds);
    if (isNaN(sec)) return String(seconds);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${Math.floor((sec % 3600) / 60)}m`;
  }
}

export const apiService = new ApiService();
