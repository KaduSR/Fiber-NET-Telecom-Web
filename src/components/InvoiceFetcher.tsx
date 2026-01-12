// spell:disable
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Copy,
  CreditCard,
  Download,
  FileText,
  Loader2,
  QrCode,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Invoice } from "../../types";
import { ENDPOINTS } from "../config";
import Button from "./Button";

// --- FUNÇÃO AUXILIAR DE DATA CORRIGIDA ---
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  try {
    // 1. Tenta criar data direta (ISO padrão)
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    // 2. Limpeza: remove horário se houver (pega só a parte antes do espaço ou T)
    const cleanDateStr = dateStr.split(" ")[0].split("T")[0];

    // 3. Tenta formato YYYY-MM-DD
    if (cleanDateStr.includes("-")) {
      const parts = cleanDateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    }

    // 4. Tenta formato DD/MM/YYYY
    if (cleanDateStr.includes("/")) {
      const parts = cleanDateStr.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    }

    return null;
  } catch (e) {
    console.error("Erro ao converter data:", dateStr, e);
    return null;
  }
};

const InvoiceFetcher: React.FC = () => {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePixCode, setActivePixCode] = useState<string | null>(null);
  const [isPixCopied, setIsPixCopied] = useState(false);

  // Format CPF (000.000.000-00)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(value);
  };

  const fetchInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, "");

    if (cleanCpf.length !== 11) {
      setError("Por favor, digite um CPF válido com 11 dígitos.");
      return;
    }

    setLoading(true);
    setError(null);
    setInvoices(null);

    try {
      const response = await fetch(ENDPOINTS.INVOICES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: cleanCpf }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Cliente não encontrado.");
      }

      const data = await response.json();
      const allBoletos = Array.isArray(data)
        ? data
        : data.faturas || data.boletos || [];

      // === FILTRAGEM RIGOROSA ===
      const now = new Date();
      // Zera a hora atual para comparar apenas datas
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const boletosFiltrados = allBoletos.filter((invoice: any) => {
        const vencimentoRaw = invoice.vencimento || invoice.data_vencimento;
        const dataVencimento = parseDate(vencimentoRaw);
        const status = invoice.status ? invoice.status.toLowerCase() : "";

        // Log para depuração (Abra o F12 Console para ver)
        console.log(`Analisando fatura: ${vencimentoRaw} | Status: ${status}`);

        // 1. Se estiver pago, ESCONDE.
        if (["pago", "baixado", "liquidado", "c"].includes(status)) {
          return false;
        }

        // 2. Se a data for inválida, ESCONDE (Segurança para não mostrar lixo)
        if (!dataVencimento) {
          console.warn("Data inválida ignorada:", vencimentoRaw);
          return false;
        }

        // Normaliza a data de vencimento para meia-noite
        const vcto = new Date(
          dataVencimento.getFullYear(),
          dataVencimento.getMonth(),
          dataVencimento.getDate()
        );

        // Regra 1: É do Mês Atual?
        const isSameMonth =
          vcto.getMonth() === today.getMonth() &&
          vcto.getFullYear() === today.getFullYear();

        // Regra 2: Está Vencida? (Data menor que hoje)
        const isOverdue = vcto < today;

        // Retorna TRUE se for do mês atual OU estiver vencida
        return isSameMonth || isOverdue;
      });

      const boletosNormalizados: Invoice[] = boletosFiltrados.map((b: any) => ({
        ...b,
        vencimento: b.vencimento || b.data_vencimento,
      }));

      // Ordenar: Vencidas (mais antigas) primeiro
      boletosFiltrados.sort((a: any, b: any) => {
        const dA = parseDate(a.vencimento || a.data_vencimento)?.getTime() || 0;
        const dB = parseDate(b.vencimento || b.data_vencimento)?.getTime() || 0;
        return dA - dB;
      });

      if (boletosFiltrados.length === 0) {
        // Verifica se o motivo foi filtro ou se realmente não tinha nada
        if (allBoletos.length > 0) {
          setError("Você não possui faturas pendentes ou do mês atual.");
        } else {
          setError("Nenhuma fatura encontrada para este CPF.");
        }
      } else {
        setInvoices(boletosNormalizados);
      }
    } catch (err: any) {
      console.error("API Error:", err);
      setError("Não foi possível localizar faturas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getDaysOverdue = (dateStr: string) => {
    const date = parseDate(dateStr);
    if (!date) return 0;

    const today = new Date();
    // Normalizar para meia-noite
    const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = d1.getTime() - d2.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const openPixModal = (code: string) => {
    setActivePixCode(code);
    setIsPixCopied(false);
  };

  const closePixModal = () => {
    setActivePixCode(null);
    setIsPixCopied(false);
  };

  const copyPixCode = () => {
    if (activePixCode) {
      navigator.clipboard.writeText(activePixCode);
      setIsPixCopied(true);
      setTimeout(() => setIsPixCopied(false), 3000);
    }
  };

  return (
    <section
      id="segunda-via"
      className="py-20 bg-fiber-card border-t border-white/5 relative"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-fiber-orange/10 rounded-full text-fiber-orange mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            2ª Via de Boleto
          </h2>
          <p className="text-gray-400">
            Digite seu CPF para acessar suas faturas.
          </p>
        </div>

        <div className="bg-neutral-900 p-6 md:p-10 rounded-2xl border border-white/10 shadow-xl">
          <form
            onSubmit={fetchInvoices}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="flex-grow relative">
              <input
                type="text"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="Digite seu CPF (apenas números)"
                className="w-full h-14 pl-5 pr-4 bg-fiber-dark border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all placeholder-gray-600"
                maxLength={14}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <CreditCard size={20} />
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              className="h-14 md:w-48 text-lg"
              disabled={loading || cpf.length < 14}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Buscar Faturas"
              )}
            </Button>
          </form>

          {loading && (
            <div className="space-y-4 animate-fadeIn mt-6">
              <div className="flex items-center mb-4 opacity-50">
                <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse mr-2"></div>
                <div className="h-5 w-48 bg-white/10 rounded animate-pulse"></div>
              </div>
              {[1].map((i) => (
                <div
                  key={i}
                  className="bg-fiber-dark border border-white/5 rounded-xl p-6 h-32 animate-pulse"
                ></div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center text-red-400 animate-fadeIn">
              <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              {error}
            </div>
          )}

          {invoices && !loading && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                <CheckCircle className="text-fiber-green w-5 h-5 mr-2" />
                Faturas Encontradas
              </h3>

              {invoices.map((invoice, idx) => {
                const daysOverdue = getDaysOverdue(invoice.vencimento);
                const isOverdue = daysOverdue > 0;

                return (
                  <div
                    key={idx}
                    className={`bg-fiber-dark border rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-all ${
                      isOverdue
                        ? "border-red-500/30 hover:border-red-500/50 bg-red-950/10"
                        : "border-white/10 hover:border-fiber-orange/30"
                    }`}
                  >
                    <div className="flex-1 w-full md:w-auto text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                        <div className="flex flex-col items-center md:items-start">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${
                              isOverdue
                                ? "bg-red-500/10 text-red-500"
                                : "bg-fiber-green/10 text-fiber-green"
                            }`}
                          >
                            {isOverdue
                              ? "Vencido"
                              : invoice.status || "Em Aberto"}
                          </span>

                          {isOverdue && (
                            <span className="flex items-center text-red-400 text-xs font-bold mt-1 animate-pulse">
                              <AlertTriangle size={12} className="mr-1" />
                              Vencida há {daysOverdue} dias
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500 text-sm hidden md:inline">
                          |
                        </span>
                        <span className="text-gray-500 text-sm">
                          {invoice.descricao || "Fatura Internet"}
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 mt-3">
                        <div>
                          <span className="text-gray-400 text-xs block uppercase tracking-wider mb-1">
                            Vencimento
                          </span>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Calendar
                              size={16}
                              className={
                                isOverdue ? "text-red-400" : "text-gray-400"
                              }
                            />
                            <span
                              className={`text-xl font-bold ${
                                isOverdue ? "text-red-400" : "text-white"
                              }`}
                            >
                              {invoice.vencimento}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block uppercase tracking-wider mb-1">
                            Valor
                          </span>
                          <span className="text-xl font-bold text-white">
                            R$ {invoice.valor}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-wrap justify-center md:justify-end">
                      {invoice.linha_digitavel && (
                        <button
                          onClick={() =>
                            copyToClipboard(
                              invoice.linha_digitavel!,
                              `bar-${idx}`
                            )
                          }
                          className="flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/5 focus:outline-none focus:ring-2 focus:ring-fiber-orange whitespace-nowrap"
                          title="Copiar Código de Barras"
                        >
                          {copiedId === `bar-${idx}` ? (
                            <CheckCircle
                              size={16}
                              className="mr-2 text-fiber-green"
                            />
                          ) : (
                            <Copy size={16} className="mr-2" />
                          )}
                          {copiedId === `bar-${idx}`
                            ? "Copiado!"
                            : "Copiar Código"}
                        </button>
                      )}

                      {invoice.pix_code && (
                        <button
                          onClick={() => openPixModal(invoice.pix_code!)}
                          className="flex items-center justify-center px-4 py-2 bg-fiber-green/10 hover:bg-fiber-green/20 text-fiber-green rounded-lg text-sm font-medium transition-colors border border-fiber-green/30 focus:outline-none focus:ring-2 focus:ring-fiber-green whitespace-nowrap"
                        >
                          <QrCode size={16} className="mr-2" />
                          Pix Copia e Cola
                        </button>
                      )}

                      {invoice.link_pdf ? (
                        <Button
                          variant="outline"
                          className="!py-2 !px-4 whitespace-nowrap"
                          onClick={() =>
                            window.open(invoice.link_pdf, "_blank")
                          }
                        >
                          <Download size={16} className="mr-2" />
                          PDF
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="!py-2 !px-4 opacity-50 cursor-not-allowed whitespace-nowrap"
                          disabled
                        >
                          Indisponível
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {activePixCode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closePixModal}
          ></div>
          <div className="relative bg-fiber-card border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-float">
            <button
              onClick={closePixModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-fiber-green/10 rounded-full text-fiber-green mb-3">
                <QrCode size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">
                Pagamento via PIX
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Copie o código abaixo e cole no seu app bancário.
              </p>
            </div>
            <div className="bg-neutral-900 p-3 rounded-lg border border-white/5 mb-6">
              <p className="text-gray-500 text-xs break-all font-mono line-clamp-6">
                {activePixCode}
              </p>
            </div>
            <button
              onClick={copyPixCode}
              className="w-full py-3 px-4 bg-fiber-green text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center"
            >
              {isPixCopied ? (
                <CheckCircle size={20} className="mr-2" />
              ) : (
                <Copy size={20} className="mr-2" />
              )}
              {isPixCopied ? "Copiado!" : "Copiar Chave PIX"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default InvoiceFetcher;
