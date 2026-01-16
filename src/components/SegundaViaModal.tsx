import {
  AlertCircle,
  CheckCircle,
  Copy,
  CreditCard,
  Download,
  FileText,
  Loader2,
  QrCode,
  QrCodeIcon,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { API_BASE_URL, ENDPOINTS } from "../../config";
import { apiService } from "../../services/apiService";
import { Fatura as DashboardFatura } from "../../types/api";
import Button from "./Button";

interface SegundaViaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fatura?: DashboardFatura | null; // Opcional, para modo cliente
  initialViewMode?: "boletos" | "pix"; // Define a aba inicial
}

interface BoletoView {
  id: number;
  documento: string;
  vencimentoFormatado: string;
  valorFormatado: string;
  valor: number;
  linhaDigitavel: string | null;
  pixCopiaECola: string | null;
  pixImagem?: string | null;
  boleto_pdf_link: string | null;
  status: string;
  diasVencimento: number;
  clienteNome?: string;
}

const SegundaViaModal: React.FC<SegundaViaModalProps> = ({
  isOpen,
  onClose,
  fatura,
  initialViewMode,
}) => {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [loadingPixId, setLoadingPixId] = useState<number | null>(null);
  const [boletos, setBoletos] = useState<BoletoView[]>([]);
  const [error, setError] = useState("");
  const [resumo, setResumo] = useState<any>(null);

  // Estados do Modal de Pix
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [activePixCode, setActivePixCode] = useState("");
  const [activePixImage, setActivePixImage] = useState("");
  const [isPixCopied, setIsPixCopied] = useState(false);

  // Estados do Código de Barras
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (fatura) {
        // MODO CLIENTE: Converte a fatura recebida para o formato de visualização
        const faturaAdaptada: BoletoView = {
          id: fatura.id,
          documento: fatura.documento || `Fat-${fatura.id}`,
          vencimentoFormatado: new Date(
            fatura.data_vencimento
          ).toLocaleDateString("pt-BR"),
          valorFormatado: parseFloat(fatura.valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          linhaDigitavel: fatura.linha_digitavel || null,
          pixCopiaECola: fatura.pix_code || null,
          boleto_pdf_link: fatura.boleto || null,
          status:
            fatura.status === "A"
              ? "Aberto"
              : fatura.status === "V"
              ? "Vencido"
              : fatura.status,
          diasVencimento: 0, // Cálculo simplificado ou vindo do backend
          clienteNome: "",
          valor: 0,
        };

        setBoletos([faturaAdaptada]);

        // Auto-abrir Pix se solicitado
        if (initialViewMode === "pix") {
          handlePagarComPix(faturaAdaptada);
        }
      } else {
        // MODO PÚBLICO: Reseta estados
        setCpfCnpj("");
        setBoletos([]);
        setError("");
        setResumo(null);
      }
      setLoading(false);
      setPixModalOpen(false);
    }
  }, [isOpen, fatura, initialViewMode]);

  const calcularValorAtualizado = (boleto: BoletoView) => {
    // Só calcula se estiver vencido (diasVencimento negativo) e em aberto
    if (boleto.diasVencimento >= 0 || boleto.status !== "A") return null;

    const diasAtraso = Math.abs(boleto.diasVencimento);
    const multa = boleto.valor * 0.02; // 2% de multa
    const juros = boleto.valor * (0.00033 * diasAtraso); // 0.033% ao dia (~1% mês)

    const total = boleto.valor + multa + juros;

    return {
      multa,
      juros,
      total,
      textoTotal: total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    };
  };

  // Formatar CPF/CNPJ
  const formatarCpfCnpj = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");

    if (numeros.length <= 11) {
      // CPF: 000.000.000-00
      return numeros
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // CNPJ: 00.000.000/0000-00
      return numeros
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCpfCnpj(e.target.value);
    setCpfCnpj(formatted);
  };

  const buscarBoletos = async (e: React.FormEvent) => {
    e.preventDefault();

    const numerosSomenente = cpfCnpj.replace(/\D/g, "");

    if (numerosSomenente.length !== 11 && numerosSomenente.length !== 14) {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpfCnpj: numerosSomenente }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao buscar boletos");
      }

      const data = await response.json();

      if (data.boletos && data.boletos.length > 0) {
        // 🔥 CORREÇÃO 1: Filtrar apenas boletos Abertos (A) ou Parciais (P)
        // Removemos "R" (Recebido/Pago) e "C" (Cancelado) da visualização pública
        const boletosFiltrados = data.boletos.filter(
          (b: any) => b.status === "A" || b.status === "P"
        );

        if (boletosFiltrados.length === 0) {
          setError("Nenhuma fatura pendente encontrada para este CPF/CNPJ.");
          setBoletos([]);
          setResumo(null);
          return;
        }

        // 🔥 CORREÇÃO 2: Recalcular o resumo baseado apenas nos filtrados
        // Isso impede que boletos pagos (R) contem como "Vencidos" ou somem no total
        const novoResumo = {
          totalBoletos: boletosFiltrados.length,
          totalEmAberto: boletosFiltrados.reduce(
            (acc: number, b: any) => acc + Number(b.valor),
            0
          ),
          totalEmAbertoFormatado: boletosFiltrados
            .reduce((acc: number, b: any) => acc + Number(b.valor), 0)
            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          // Conta como vencido apenas se diasVencimento for negativo E o status for Aberto/Parcial
          boletosVencidos: boletosFiltrados.filter(
            (b: any) => b.diasVencimento < 0
          ).length,
          boletosAVencer: boletosFiltrados.filter(
            (b: any) => b.diasVencimento >= 0
          ).length,
        };

        setBoletos(boletosFiltrados);
        setResumo(novoResumo);
      } else {
        setError("Nenhuma fatura em aberto encontrada para este CPF/CNPJ.");
      }
    } catch (err: any) {
      console.error("Erro ao buscar boletos:", err);
      setError(err.message || "Erro ao buscar boletos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(activePixCode);
    setIsPixCopied(true);
    setTimeout(() => setIsPixCopied(false), 2000);
  };

  const handleDownloadPDF = async (boleto: BoletoView) => {
    try {
      setDownloadingId(boleto.id);
      const response = await apiService.imprimirBoleto(boleto.id);

      if (response && response.base64_document) {
        const linkSource = `data:application/pdf;base64,${response.base64_document}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = `Fatura-${boleto.documento}.pdf`;
        downloadLink.click();
      } else {
        alert("PDF não disponível no momento. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro download:", error);
      alert("Erro ao gerar PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const abrirModalPixInterface = (codigo: string, imagem?: string) => {
    if (!codigo) {
      alert("Erro: Código Pix vazio.");
      return;
    }
    setActivePixCode(codigo);
    setActivePixImage(imagem || "");
    setPixModalOpen(true);
    setIsPixCopied(false);
  };

  const copiarPixDoModal = () => {
    navigator.clipboard.writeText(activePixCode);
    setIsPixCopied(true);
    setTimeout(() => setIsPixCopied(false), 2000);
  };

  const handlePagarComPix = async (boleto: BoletoView) => {
    // 1. Se já tem o código, abre direto
    if (boleto.pixCopiaECola) {
      abrirModalPixInterface(
        boleto.pixCopiaECola,
        boleto.pixImagem || undefined
      );
      return;
    }

    // 2. Se não tem, busca no backend
    try {
      setLoadingPixId(boleto.id);
      // Ajuste na rota para usar o endpoint correto do seu backend
      const response = await fetch(`${API_BASE_URL}/boletos/${boleto.id}/pix`);
      const data = await response.json();

      // Verifica se retornou sucesso E o código pix
      if (
        (data.success || data.type === "success") &&
        (data.pixCopiaECola || data.pix?.qrCode?.qrcode)
      ) {
        const code = data.pixCopiaECola || data.pix?.qrCode?.qrcode;
        const img = data.pixImagem || data.pix?.qrCode?.imagemQrcode;

        // Atualiza localmente
        boleto.pixCopiaECola = code;
        boleto.pixImagem = img;
        abrirModalPixInterface(code, img);
      } else {
        alert(
          "O sistema financeiro ainda não gerou o QR Code para esta fatura."
        );
      }
    } catch (e) {
      console.error("Erro Pix:", e);
      alert("Erro ao conectar servidor para gerar Pix.");
    } finally {
      setLoadingPixId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Vencido":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "Vence Hoje":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "A Vencer":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      default:
        return "text-green-400 bg-green-400/10 border-green-400/20";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-4xl bg-fiber-card border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-neutral-900 p-6 border-b border-white/5 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-fiber-orange/10 rounded-lg">
                <FileText size={24} className="text-fiber-orange" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  2ª Via de Boleto
                </h2>
                <p className="text-sm text-gray-400">
                  Consulte suas faturas por CPF ou CNPJ
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-red-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <X size={30} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Form */}
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
                  className="h-14 md:w-48 text-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Buscando...
                    </>
                  ) : (
                    <>
                      <Search size={20} /> Buscar
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 mb-6 animate-fadeIn">
                <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Resumo */}
            {resumo && (
              <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 mb-6 animate-fadeIn">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="text-fiber-green" size={20} />
                  Resumo Financeiro
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-fiber-orange">
                      {resumo.totalBoletos}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Total de Faturas
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {resumo.totalEmAbertoFormatado}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Valor Total
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">
                      {resumo.boletosVencidos}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Vencidas</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {resumo.boletosAVencer}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">A Vencer</div>
                  </div>
                </div>
              </div>
            )}

            {/* Boletos */}
            {boletos.length > 0 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-white font-bold text-lg mb-4">
                  Faturas Encontradas
                </h3>

                {boletos.map((boleto) => (
                  <div
                    key={boleto.id}
                    className="bg-neutral-900 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                              boleto.status
                            )}`}
                          >
                            {boleto.status}
                          </span>
                          {boleto.clienteNome && (
                            <span className="text-gray-400 text-sm">
                              {boleto.clienteNome}
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                            Vencimento
                          </p>
                          <p
                            className={`font-medium ${
                              boleto.diasVencimento < 0
                                ? "text-red-500"
                                : "text-white"
                            }`}
                          >
                            {boleto.vencimentoFormatado}
                          </p>
                          {/* Mostra dias de atraso se vencido */}
                          {boleto.diasVencimento < 0 &&
                            boleto.status === "A" && (
                              <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">
                                {Math.abs(boleto.diasVencimento)} dias atrasado
                              </span>
                            )}
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                            Valor Original
                          </p>
                          <p className="text-lg font-bold text-white">
                            {boleto.valorFormatado}
                          </p>

                          {/* 🔥 ÁREA DE JUROS (Só aparece se vencido) */}
                          {(() => {
                            const calculo = calcularValorAtualizado(boleto);
                            if (calculo) {
                              return (
                                <div className="mt-1 animate-fadeIn">
                                  <p className="text-[10px] text-gray-400">
                                    + Encargos est.: R${" "}
                                    {(calculo.multa + calculo.juros).toFixed(2)}
                                  </p>
                                  <p className="text-sm font-black text-fiber-orange">
                                    Total Aprox: {calculo.textoTotal}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <button
                          type="button"
                          onClick={() => handlePagarComPix(boleto)}
                          disabled={loadingPixId === boleto.id}
                          className="w-full"
                        >
                          <span className="flex items-center justify-center gap-2 px-4 py-3 bg-fiber-green/10 text-fiber-green rounded-lg font-bold text-sm hover:bg-fiber-green/20 transition-all disabled:opacity-50">
                            {loadingPixId === boleto.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <QrCode size={18} />
                            )}
                            PIX Copia e Cola
                          </span>
                        </button>

                        {boleto.linhaDigitavel && (
                          <button
                            onClick={() =>
                              copiarCodigo(
                                boleto.linhaDigitavel!,
                                `bar-${boleto.id}`
                              )
                            }
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-sm border border-white/10 transition-all"
                          >
                            {copiedId === `bar-${boleto.id}` ? (
                              <>
                                <CheckCircle
                                  size={18}
                                  className="text-green-400"
                                />{" "}
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy size={18} /> Copiar Código
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDownloadPDF(boleto)}
                          disabled={loadingPixId === boleto.id}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-fiber-orange/10 hover:bg-fiber-orange/20 text-fiber-orange rounded-lg font-bold text-sm border border-fiber-orange/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingPixId === boleto.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Download size={18} />
                          )}
                          Baixar PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && boletos.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  Digite seu CPF ou CNPJ para buscar suas faturas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PIX Modal */}
      {pixModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-fiber-card border border-white/10 rounded-2xl p-6 max-w-md w-full relative">
            <button
              onClick={() => setPixModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white text-center mb-4">
              Pagamento via PIX
            </h3>

            <div className="bg-white p-4 rounded-lg mx-auto w-fit mb-4 min-h-[232px] flex items-center justify-center">
              {activePixImage && activePixImage.length > 50 ? (
                // Se tiver imagem base64 válida vinda do backend
                <img
                  src={
                    activePixImage.startsWith("data:image")
                      ? activePixImage
                      : `data:image/png;base64,${activePixImage}`
                  }
                  alt="QR Code Pix"
                  className="w-[200px] h-[200px] object-contain"
                />
              ) : activePixCode ? (
                // Se não tiver imagem, gera na hora usando a lib
                <QRCode value={activePixCode} size={200} />
              ) : (
                <QrCodeIcon
                  size={200}
                  className="text-neutral-900 opacity-20"
                />
              )}
            </div>

            <div className="bg-neutral-900 p-3 rounded-lg mb-4 max-h-24 overflow-y-auto custom-scrollbar">
              <p className="text-xs text-gray-400 font-mono break-all">
                {activePixCode}
              </p>
            </div>

            <Button
              onClick={copiarPixDoModal}
              fullWidth
              className="gap-2 !bg-fiber-green hover:!bg-green-600"
            >
              {isPixCopied ? (
                <>
                  <CheckCircle size={18} /> Copiado!
                </>
              ) : (
                <>
                  <Copy size={18} /> Copiar Pix Copia e Cola
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default SegundaViaModal;
