// web/src/types/api.ts

export interface Cliente {
  id: number;
  nome: string;
  endereco?: string;
  cpn_cnpj?: string;
  fone?: string;
  email?: string;
}

export interface Contrato {
  id: number;
  id_cliente: number;
  login: string;
  plano: string;
  status: string;
  descricao_aux_plano_venda?: string;
  pdf_link?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
}

export interface Fatura {
  id: number;
  id_cliente: number;
  contrato_id?: number;
  data_vencimento: string;
  valor: string;
  status: string; // 'A' (Aberto), 'C' (Pago/Cancelado)
  linha_digitavel?: string;
  pix_txid?: string;
  pix_code?: string;
  boleto?: string;
}

export interface Login {
  id: number;
  login: string;
  contrato_id: number;
  online: "S" | "N";
  tempo_conectado: string;
  sinal_ultimo_atendimento: string;
  ip_privado?: string;
  ont_modelo?: string;
  download_atual?: string;
  upload_atual?: string;
}

export interface NotaFiscal {
  id: number;
  contrato_id?: number;
  numero_nota: string;
  data_emissao: string;
  valor: string;
  link_pdf?: string;
}

export interface ConsumoDaily {
  data: string;
  download_bytes: number;
  upload_bytes: number;
}

export interface ConsumoMonthly {
  mes_ano: string;
  download_bytes: number;
  upload_bytes: number;
}

export interface ConsumoHistory {
  daily: ConsumoDaily[];
  monthly: ConsumoMonthly[];
  weekly?: ConsumoDaily[];
}

export interface Consumo {
  total_download_bytes: number;
  total_upload_bytes: number;
  history: ConsumoHistory;
}

export interface AiInsight {
  type: "risk" | "positive" | "neutral";
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
}

export interface AiAnalysis {
  summary: string;
  insights: AiInsight[];
}

export interface DashboardResponse {
  clientes: Cliente[];
  contratos: Contrato[];
  faturas: Fatura[];
  logins: Login[];
  notas: NotaFiscal[];
  consumo: Consumo;
  ai_analysis?: AiAnalysis;
  ontInfo?: any[];
  ordensServico?: any[];
}

export interface LoginResponse {
  token: string;
  user?: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}
