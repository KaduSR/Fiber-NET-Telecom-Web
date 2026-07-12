
// src/utils/helpers.ts

export const getStatusColor = (status: string) => {
  const s = String(status ?? "").trim().toLowerCase();

  // Invoice statuses
  if (s === "vencido") return "text-red-400 bg-red-400/10 border-red-400/20";
  if (s === "vence hoje") return "text-orange-400 bg-orange-400/10 border-orange-400/20";
  if (s === "a vencer" || s === "aberto") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
  if (s === "pago" || s === "liquidada") return "text-green-400 bg-green-400/10 border-green-400/20";

  // Contract statuses
  if (["a", "ativo"].includes(s)) return "text-green-400 bg-green-400/10 border-green-400/20";
  if (["i", "inativo"].includes(s)) return "text-gray-400 bg-gray-500/10 border-gray-500/20";
  if (["s", "suspenso"].includes(s)) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  if (["c", "cancelado"].includes(s)) return "text-red-400 bg-red-400/10 border-red-400/20";
  if (["b", "bloqueado"].includes(s)) return "text-red-500 bg-red-500/10 border-red-500/20";

  return "text-gray-500 bg-gray-500/10 border-gray-500/20";
};

export const isOpenInvoice = (status: string | number | null | undefined) =>
  String(status ?? "")
    .trim()
    .toLowerCase()
    .includes("aberto") || String(status ?? "").trim().toLowerCase() === "a";

export const isPaidInvoice = (status: string | number | null | undefined) =>
  String(status ?? "")
    .trim()
    .toLowerCase()
    .includes("pago") ||
  String(status ?? "")
    .trim()
    .toLowerCase()
    .includes("r") ||
  String(status ?? "")
    .trim()
    .toLowerCase()
    .includes("liquidado") ||
  String(status ?? "")
    .trim()
    .toLowerCase()
    .includes("recebido");

export const isCanceledInvoice = (status: string | number | null | undefined) =>
  String(status ?? "")
    .trim()
    .toLowerCase()
    .includes("cancelado") || String(status ?? "").trim().toLowerCase() === "c";

export const normalizeInvoiceStatus = (status: string | number | null | undefined) => {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  if (["a", "aberto", "open", "pending"].includes(normalized)) return "aberto";
  if (["p", "r", "pago", "recebido", "liquidado", "liquidada"].includes(normalized)) return "pago";
  if (["c", "cancelado"].includes(normalized)) return "cancelado";
  if (status === "V") return "vencido";

  return normalized;
};

export const calculateEstimate = (
  valor: number,
  dataVencimento: string,
) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dateStr = dataVencimento || "";
  const safeDateStr = dateStr.includes("T") ? dateStr : dateStr + "T12:00:00";
  const venc = new Date(safeDateStr);
  venc.setHours(0, 0, 0, 0);

  if (hoje <= venc) return null;

  const diffTime = Math.abs(hoje.getTime() - venc.getTime());
  const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const multa = valor * 0.02;
  const juros = valor * (0.00033 * diasAtraso); // 0.033% ao dia
  const total = valor + multa + juros;

  return {
    valorOriginal: valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
    totalAtualizado: total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
    diasAtraso: diasAtraso,
    multa: multa,
    juros: juros,
  };
};
