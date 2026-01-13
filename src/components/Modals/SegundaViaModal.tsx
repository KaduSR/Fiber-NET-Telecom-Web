// spell:disable
import {
  AlertCircle,
  Check,
  Copy,
  CreditCard,
  Download,
  FileText,
  Loader2,
  QrCode,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { API_BASE_URL, ENDPOINTS } from "../../config";
import { apiService } from "../../services/apiService";
import { Fatura as DashboardFatura } from "../../types/api";
import Button from "../Button";

interface SegundaViaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fatura?: DashboardFatura | null; // Agora opcional
  initialViewMode?: "boleto" | "pix";
}

interface BoletoPublico {
  id: number;
  documento: string;
  valor: string;
  data_vencimento: string;
  status: string;
  linha_digitavel?: string;
  pix_txid?: string;
  pix_qrcode?: string;
  boleto_pdf_link?: string;
  clienteNome?: string;
  diasVencimento?: number;
}

export function SegundaViaModal({
  isOpen,
  onClose,
  fatura,
  initialViewMode = "boleto",
}: SegundaViaModalProps) {
  // Estado Geral
  const [mode, setMode] = useState<"search" | "detail">("search");

  // Estado Busca Pública
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [boletosPublicos, setBoletosPublicos] = useState<BoletoPublico[]>([]);
  const [errorSearch, setErrorSearch] = useState("");
  const [resumo, setResumo] = useState<any>(null);

  // Estado Detalhe (Pagamento)
  const [selectedFatura, setSelectedFatura] = useState<DashboardFatura | null>(
    null
  );
  const [viewTab, setViewTab] = useState<"boleto" | "pix">("boleto");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Inicialização
  useEffect(() => {
    if (isOpen) {
      if (fatura) {
        // Se veio fatura via prop, vai direto pro detalhe
        handleSelectFatura(fatura, initialViewMode);
      } else {
        // Se não, vai pra busca
        setMode("search");
        setBoletosPublicos([]);
        setResumo(null);
        setErrorSearch("");
        setCpfCnpj("");
      }
    }
  }, [isOpen, fatura, initialViewMode]);

  // --- Lógica de Busca Pública ---
  const formatarCpfCnpj = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return numeros
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeros = cpfCnpj.replace(/\D/g, "");
    if (numeros.length !== 11 && numeros.length !== 14) {
      setErrorSearch("Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }

    setLoadingSearch(true);
    setErrorSearch("");
    setBoletosPublicos([]);
    setResumo(null);

    try {
      // Usando fetch direto para endpoint público
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.INVOICES}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpfCnpj: numeros }),
      });

      if (!response.ok) throw new Error("Erro ao buscar boletos");
      const data = await response.json();

      if (data.boletos && data.boletos.length > 0) {
        setBoletosPublicos(data.boletos);
        setResumo(data.resumo);
      } else {
        setErrorSearch("Nenhuma fatura em aberto encontrada.");
      }
    } catch (err: any) {
      setErrorSearch(
        "Erro ao buscar faturas. Verifique o documento e tente novamente."
      );
    } finally {
      setLoadingSearch(false);
    }
  };

  // --- Lógica de Seleção/Detalhe ---
  const handleSelectFatura = (
    faturaData: any,
    initialTab: "boleto" | "pix" = "boleto"
  ) => {
    // Normaliza os dados se vierem da busca pública para o formato DashboardFatura
    const normalizedFatura: DashboardFatura = {
      id: faturaData.id,
      id_cliente: 0, // Não relevante aqui
      valor: faturaData.valor,
      data_vencimento: faturaData.data_vencimento,
      status: faturaData.status === "Vencido" ? "V" : "A",
      boleto: faturaData.boleto_pdf_link, // Link direto se existir
    };

    setSelectedFatura(normalizedFatura);
    setViewTab(initialTab);
    setMode("detail");

    // Limpa estados anteriores
    setPdfBase64(null);
    setPixCode(null);

    // Carrega dados iniciais
    if (initialTab === "pix") loadPix(normalizedFatura.id);
    else loadBoleto(normalizedFatura.id);
  };

  const loadBoleto = async (id: number) => {
    try {
      setLoadingPayment(true);
      const data = await apiService.imprimirBoleto(id);
      setPdfBase64(data.base64_document);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPayment(false);
    }
  };

  const loadPix = async (id: number) => {
    try {
      setLoadingPayment(true);
      const data = await apiService.getPixCode(id);
      if (data.qrcode) setPixCode(data.qrcode);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-neutral-900 text-white shrink-0">
          <h3 className="text-lg font-bold flex items-center gap-2">
            {mode === "search" ? (
              <>
                <Search className="w-5 h-5 text-fiber-orange" /> Buscar Faturas
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 text-fiber-orange" /> Detalhes do
                Pagamento
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="overflow-y-auto p-6">
          {/* MODO BUSCA */}
          {mode === "search" && (
            <div className="space-y-6">
              <form
                onSubmit={handleSearch}
                className="flex flex-col md:flex-row gap-4"
              >
                <div className="flex-grow relative">
                  <CreditCard
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={cpfCnpj}
                    onChange={(e) =>
                      setCpfCnpj(formatarCpfCnpj(e.target.value))
                    }
                    placeholder="Digite CPF ou CNPJ"
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange"
                    maxLength={18}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loadingSearch}
                  className="md:w-32"
                >
                  {loadingSearch ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </form>

              {errorSearch && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm">
                  <AlertCircle size={16} /> {errorSearch}
                </div>
              )}

              {/* Lista de Boletos Encontrados */}
              {boletosPublicos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900">
                    Faturas Encontradas:
                  </h4>
                  {boletosPublicos.map((b) => (
                    <div
                      key={b.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-fiber-orange/50 transition-all bg-gray-50 flex justify-between items-center gap-4"
                    >
                      <div>
                        <div className="text-sm text-gray-500">
                          Vencimento: {b.data_vencimento}
                        </div>
                        <div className="font-bold text-gray-900">
                          R$ {b.valor}
                        </div>
                        <div
                          className={`text-xs font-bold mt-1 ${
                            b.status === "Vencido"
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          {b.status}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSelectFatura(b, "pix")}
                          className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                          title="Pagar com Pix"
                        >
                          <QrCode size={20} />
                        </button>
                        <button
                          onClick={() => handleSelectFatura(b, "boleto")}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                          title="Boleto PDF"
                        >
                          <FileText size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODO DETALHE (PAGAMENTO) */}
          {mode === "detail" && selectedFatura && (
            <div className="space-y-6">
              {/* Botão Voltar (só se veio da busca) */}
              {!fatura && (
                <button
                  onClick={() => setMode("search")}
                  className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                >
                  ← Voltar para busca
                </button>
              )}

              {/* Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setViewTab("boleto");
                    loadBoleto(selectedFatura.id);
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    viewTab === "boleto"
                      ? "bg-white shadow text-primary-600"
                      : "text-gray-500"
                  }`}
                >
                  Boleto Bancário
                </button>
                <button
                  onClick={() => {
                    setViewTab("pix");
                    loadPix(selectedFatura.id);
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    viewTab === "pix"
                      ? "bg-white shadow text-teal-600"
                      : "text-gray-500"
                  }`}
                >
                  PIX (QR Code)
                </button>
              </div>

              {/* Área de Conteúdo */}
              <div className="min-h-[200px] flex flex-col items-center justify-center">
                {loadingPayment ? (
                  <Loader2 className="w-10 h-10 text-fiber-orange animate-spin" />
                ) : viewTab === "boleto" ? (
                  <div className="w-full text-center space-y-4">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto" />
                    {pdfBase64 ? (
                      <a
                        href={`data:application/pdf;base64,${pdfBase64}`}
                        download={`fatura-${selectedFatura.id}.pdf`}
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
                      >
                        <Download className="w-5 h-5 mr-2" /> Baixar PDF Agora
                      </a>
                    ) : (
                      <p className="text-gray-500">Erro ao gerar boleto.</p>
                    )}
                  </div>
                ) : (
                  <div className="w-full text-center space-y-4">
                    {pixCode ? (
                      <>
                        <div className="bg-white p-2 border-2 border-gray-100 rounded-xl inline-block">
                          <QRCode value={pixCode} size={180} />
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(pixCode);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-800 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 mr-2 text-green-600" />
                          ) : (
                            <Copy className="w-5 h-5 mr-2" />
                          )}
                          {copied ? "Copiado!" : "Copiar Código Pix"}
                        </button>
                      </>
                    ) : (
                      <p className="text-gray-500">Gerando QR Code...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SegundaViaModal;
