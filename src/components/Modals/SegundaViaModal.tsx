// spell:disable
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Copy,
  CreditCard, // Renomeei o ícone para não conflitar com o componente
  Download,
  FileText,
  Loader2,
  QrCode as QrCodeIcon,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code"; // <--- IMPORTAÇÃO CORRETA (Instale: npm install react-qr-code)
import { API_BASE_URL, ENDPOINTS } from "../../config";
import { apiService } from "../../services/apiService";
import { Fatura as DashboardFatura } from "../../types/api";
import Button from "../Button";

interface SegundaViaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fatura?: DashboardFatura | null;
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

const SegundaViaModal: React.FC<SegundaViaModalProps> = ({
  isOpen,
  onClose,
  fatura,
  initialViewMode = "boleto",
}) => {
  // === ESTADOS DE NAVEGAÇÃO ===
  const [mode, setMode] = useState<"search" | "detail">("search");

  // === ESTADOS DA BUSCA PÚBLICA ===
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [boletos, setBoletos] = useState<BoletoPublico[]>([]);
  const [error, setError] = useState("");
  const [resumo, setResumo] = useState<any>(null);

  // === ESTADOS DO DETALHE (PIX/BOLETO) ===
  const [activeFaturaId, setActiveFaturaId] = useState<number | null>(null);
  const [viewTab, setViewTab] = useState<"boleto" | "pix">("boleto");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // === EFEITO: Inicializar Modal ===
  useEffect(() => {
    if (isOpen) {
      if (fatura) {
        // Se veio fatura da Área do Cliente, vai direto pro detalhe
        abrirDetalheFatura(
          fatura.id,
          fatura.valor,
          fatura.data_vencimento,
          initialViewMode
        );
      } else {
        // Se não, reseta para busca pública
        setMode("search");
        setCpfCnpj("");
        setBoletos([]);
        setResumo(null);
        setError("");
      }
    }
  }, [isOpen, fatura, initialViewMode]);

  // === LÓGICA DE BUSCA PÚBLICA ===
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpfCnpj(formatarCpfCnpj(e.target.value));
  };

  const buscarBoletos = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeros = cpfCnpj.replace(/\D/g, "");

    if (numeros.length !== 11 && numeros.length !== 14) {
      setError(
        "Por favor, digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido."
      );
      return;
    }

    setLoading(true);
    setError("");
    setBoletos([]);
    setResumo(null);

    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.INVOICES}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpfCnpj: numeros }),
      });

      if (!response.ok) throw new Error("Erro ao buscar boletos");
      const data = await response.json();

      if (data.boletos && data.boletos.length > 0) {
        setBoletos(data.boletos);
        setResumo(data.resumo);
      } else {
        setError("Nenhuma fatura em aberto encontrada para este CPF/CNPJ.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao buscar boletos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // === LÓGICA DE DETALHE (PIX/BOLETO) ===
  const abrirDetalheFatura = (
    id: number,
    valor: string,
    vencimento: string,
    initialTab: "boleto" | "pix" = "boleto"
  ) => {
    setActiveFaturaId(id);
    setMode("detail");
    setViewTab(initialTab);

    // Resetar dados anteriores
    setPdfBase64(null);
    setPixCode(null);
    setIsCopied(false);

    // Carregar dados iniciais
    if (initialTab === "pix") loadPix(id);
    else loadBoleto(id);
  };

  const loadBoleto = async (id: number) => {
    setLoadingDetail(true);
    try {
      const data = await apiService.imprimirBoleto(id);
      setPdfBase64(data.base64_document);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadPix = async (id: number) => {
    setLoadingDetail(true);
    try {
      const data = await apiService.getPixCode(id);
      if (data.qrcode) setPixCode(data.qrcode);
      else if (data.imagem) setPixCode(data.qrcode);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCopyPix = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Vencido":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "Vence Hoje":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      default:
        return "text-green-400 bg-green-400/10 border-green-400/20";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-fiber-card border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 p-6 border-b border-white/5 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fiber-orange/10 rounded-lg">
              {mode === "search" ? (
                <FileText size={24} className="text-fiber-orange" />
              ) : (
                <QrCodeIcon size={24} className="text-fiber-orange" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {mode === "search"
                  ? "2ª Via de Boleto"
                  : "Detalhes do Pagamento"}
              </h2>
              <p className="text-sm text-gray-400">
                {mode === "search"
                  ? "Consulte suas faturas por CPF ou CNPJ"
                  : `Fatura #${activeFaturaId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* MODO BUSCA */}
          {mode === "search" && (
            <>
              <form onSubmit={buscarBoletos} className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative">
                    <CreditCard
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                    <input
                      type="text"
                      value={cpfCnpj}
                      onChange={handleInputChange}
                      placeholder="Digite seu CPF ou CNPJ"
                      className="w-full h-14 pl-12 pr-4 bg-neutral-900 border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all"
                      maxLength={18}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="h-14 md:w-48 text-lg gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />{" "}
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search size={20} /> Buscar
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 mb-6 animate-fadeIn">
                  <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Lista de Boletos Encontrados */}
              {boletos.length > 0 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-white font-bold text-lg mb-4">
                    Faturas Encontradas
                  </h3>
                  {boletos.map((boleto) => (
                    <div
                      key={boleto.id}
                      className="bg-neutral-900 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all flex flex-col lg:flex-row justify-between gap-6"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                              boleto.status
                            )}`}
                          >
                            {boleto.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                              Vencimento
                            </span>
                            <span className="text-lg font-bold text-white">
                              {boleto.data_vencimento}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                              Valor
                            </span>
                            <span className="text-lg font-bold text-fiber-orange">
                              R$ {boleto.valor}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <button
                          onClick={() =>
                            abrirDetalheFatura(
                              boleto.id,
                              boleto.valor,
                              boleto.data_vencimento,
                              "pix"
                            )
                          }
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-fiber-green/10 text-fiber-green rounded-lg font-bold text-sm border border-fiber-green/30 hover:bg-fiber-green/20 transition-all"
                        >
                          <QrCodeIcon size={18} /> Pagar com PIX
                        </button>
                        <button
                          onClick={() =>
                            abrirDetalheFatura(
                              boleto.id,
                              boleto.valor,
                              boleto.data_vencimento,
                              "boleto"
                            )
                          }
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white rounded-lg font-bold text-sm border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <FileText size={18} /> Boleto PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* MODO DETALHE (VISUALIZAÇÃO HÍBRIDA) */}
          {mode === "detail" && activeFaturaId && (
            <div className="space-y-6 animate-fadeIn">
              {!fatura && (
                <button
                  onClick={() => setMode("search")}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-4"
                >
                  <ArrowLeft size={16} /> Voltar para lista
                </button>
              )}

              {/* Abas */}
              <div className="flex bg-neutral-900 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    setViewTab("boleto");
                    loadBoleto(activeFaturaId);
                  }}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                    viewTab === "boleto"
                      ? "bg-fiber-card border border-white/10 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Boleto Bancário
                </button>
                <button
                  onClick={() => {
                    setViewTab("pix");
                    loadPix(activeFaturaId);
                  }}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                    viewTab === "pix"
                      ? "bg-fiber-card border border-white/10 text-fiber-green shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  PIX (QR Code)
                </button>
              </div>

              {/* Conteúdo da Aba */}
              <div className="min-h-[300px] flex flex-col items-center justify-center bg-neutral-900/50 rounded-xl border border-white/5 p-8">
                {loadingDetail ? (
                  <div className="flex flex-col items-center text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-fiber-orange" />
                    <p>
                      Gerando {viewTab === "pix" ? "QR Code..." : "Boleto..."}
                    </p>
                  </div>
                ) : viewTab === "boleto" ? (
                  <div className="w-full text-center space-y-6">
                    <FileText className="w-20 h-20 text-gray-700 mx-auto" />
                    {pdfBase64 ? (
                      <>
                        <p className="text-gray-300">
                          Seu boleto foi gerado com sucesso!
                        </p>
                        <a
                          href={`data:application/pdf;base64,${pdfBase64}`}
                          download={`fatura-${activeFaturaId}.pdf`}
                          className="inline-flex items-center justify-center w-full md:w-auto px-8 py-4 bg-fiber-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20"
                        >
                          <Download className="w-5 h-5 mr-2" /> Baixar PDF
                        </a>
                      </>
                    ) : (
                      <p className="text-red-400">
                        Não foi possível gerar o PDF. Tente novamente.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full text-center space-y-6">
                    {pixCode ? (
                      <>
                        <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                          <QRCode value={pixCode} size={200} />
                        </div>
                        <div className="max-w-md mx-auto">
                          <p className="text-sm text-gray-400 mb-2">
                            Código PIX Copia e Cola:
                          </p>
                          <div className="bg-black/30 p-3 rounded-lg border border-white/10 text-xs text-gray-500 font-mono break-all mb-4">
                            {pixCode.substring(0, 50)}...
                          </div>
                          <button
                            onClick={handleCopyPix}
                            className="w-full flex items-center justify-center px-4 py-3 bg-fiber-green text-white font-bold rounded-xl hover:bg-green-600 transition-colors"
                          >
                            {isCopied ? (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />{" "}
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-5 h-5 mr-2" /> Copiar Código
                                Pix
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-red-400">Erro ao gerar Pix.</p>
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
};

export default SegundaViaModal;
