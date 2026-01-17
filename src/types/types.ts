
import React from 'react';

export interface Plan {
  id: number;
  speed: string;
  price: string;
  cents: string;
  period: string;
  fullPrice?: string;
  benefits: string[];
  highlight?: boolean;
  description?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

export interface ServiceStatusItem {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'down'; // operational = normal, warning = instability, down = offline
  reports?: number;
  updatedAt: string;
  type: 'social' | 'bank' | 'gaming' | 'streaming';
}

export interface Invoice {
  id: string | number;
  vencimento: string;
  valor: string | number;
  status: 'aberto' | 'vencido' | 'pago' | 'cancelado';
  linha_digitavel?: string; // Barcode line
  pix_code?: string; // Pix copy paste
  link_pdf?: string;
  descricao?: string;
}

export interface ConsumptionPoint {
  label: string;
  download: number; // in GB
  upload: number; // in GB
}

export interface ConsumptionHistory {
  daily: ConsumptionPoint[];
  weekly: ConsumptionPoint[];
  monthly: ConsumptionPoint[];
  annual: ConsumptionPoint[];
}

// === NEW TYPES FOR FULL DASHBOARD ===

export interface Login {
    id: string | number;
    login: string;
    status: 'online' | 'offline';
    sinal_ont?: string; // Ex: -21.5 dBm
    uptime?: string; // Ex: '24d 10h 5m'
    contrato_id: string | number;
}

export interface ContratoInfo {
    id: string | number;
    plano: string;
    status: 'A' | 'S' | 'C'; // Ativo, Suspenso, Cancelado
    pdf_link?: string;
    pago_ate?: string;
    data_contrato?: string;
}

export interface FiscalNote {
    id: string | number;
    status: string; // e.g., 'Autorizada'
    documento: string; // e.g., '000.001.234'
    data_emissao: string;
    data_saida: string;
    valor: string;
    link_pdf?: string;
    link_xml?: string;
}

export interface ClienteInfo {
    id: string | number;
    nome: string;
    endereco: string;
}

export interface DashboardData {
    clientes: ClienteInfo[];
    contratos: ContratoInfo[];
    faturas: Invoice[];
    logins: Login[];
    notas: FiscalNote[];
    consumo: {
        total_download_bytes: number;
        total_upload_bytes: number;
        history: ConsumptionHistory;
    };
}
