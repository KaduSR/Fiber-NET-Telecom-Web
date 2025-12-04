
export interface Cliente {
  id: number;
  nome: string;
  endereco?: string;
  cpn_cnpj?: string;
  fone?: string;
  email?: string;
  numero?: string;
}

export interface Contrato {
  id: number;
  id_cliente: number;
  login: string; 
  plano: string; // Adicionado para compatibilidade
  status: string; // 'A', 'S', 'C'
  desbloqueio_confianca: 'S' | 'N';
  descricao_aux_plano_venda?: string; 
  pdf_link?: string; 
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
}

export interface Fatura {
  id: number;
  id_cliente: number;
  contrato_id?: number;
  documento: string;
  data_emissao?: string;
  data_vencimento: string; 
  vencimento?: string; 
  valor: string;
  status: string; // "pago" | "aberto" | "A" | "B" | "C"
  linha_digitavel: string;
  pix_txid?: string;
  pix_code?: string;
  pix_qrcode?: string; // QR Code completo (CopyPaste)
  pix_imagem?: string; // Novo campo para imagem base64
  boleto?: string;
  descricao?: string;
}

export interface NotaFiscal {
    id: number | string;
    contrato_id?: number;
    numero_nota?: string;
    summary?: string; 
    insights?: any[]; 
    data_emissao?: string;
    valor?: string;
    link_pdf?: string;
}

export interface ConsumoPoint {
  data?: string;     
  mes_ano?: string;
  semana?: string;  
  download_bytes: number;
  upload_bytes: number;
}

export interface HistoryData {
  daily: ConsumoPoint[];
  weekly: ConsumoPoint[];
  monthly: ConsumoPoint[];
}

export interface Login {
  id: number;
  login: string;
  id_cliente: number;
  contrato_id: number;
  online: 'S' | 'N';
  status?: string; 
  uptime?: string; // tempo em segundos ou string formatada
  sinal_ultimo_atendimento: string;
  
  // ONT Details
  ont_modelo?: string;
  ont_sinal_rx?: string;
  ont_sinal_tx?: string;
  ont_temperatura?: string;
  ont_mac?: string;

  tempo_conectado: string;
  upload_atual?: string;
  download_atual?: string;
  ip_privado?: string;
  ip_publico?: string;
  
  history?: HistoryData; 
}

export interface Consumo {
  total_download_bytes: number;
  total_upload_bytes: number;
  total_download: string; 
  total_upload: string;
  history: HistoryData;
}

export interface OrdemServico {
  id: string;
  tipo: string;
  status: string;
  protocolo: string;
  data_abertura: string;
  mensagem: string;
}

export interface OntInfo {
  id: string;
  serial_number?: string;
  status?: string;
  sinal_rx?: string;
  sinal_tx?: string;
  temperatura?: string;
  mac?: string;
  onu_tipo?: string;
  id_login?: number | string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status?: string;
  analysis?: string; 
  createdAt?: string;
}

export interface AiInsight {
  type: 'risk' | 'positive' | 'neutral';
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
  ordensServico: OrdemServico[];
  ontInfo: OntInfo[];
  consumo: Consumo;
  ai_analysis?: AiAnalysis; 
}

export interface LoginResponse {
  token: string;
  user?: {
      id: number;
      nome: string;
      email: string;
  }
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
    sources?: { title: string; url: string }[];
}