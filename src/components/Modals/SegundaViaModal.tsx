// cspell: disable
import {
  AlertCircle,
  Barcode,
  CheckCircle,
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
import { API_BASE_URL } from "../../config";
import { apiService } from "../../services/apiService";
import Button from "../Button";

interface SegundaViaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Interface atualizada conforme seu Controller
interface Boleto {
  id: number;
  clienteId: number;
  clienteNome: string;
  documento: string;
  vencimento: string;
  vencimentoFormatado: string;
  valor: number;
  valorFormatado: string;
  linhaDigitavel: string | null;
  pixCopiaECola: string | null;
  boleto_pdf_link: string | null;
  status: string;
  statusCor: string;
  diasVencimento: number;
  // Campos auxiliares para controle de interface
  pixImagem?: string;
}

const SegundaViaModal: React.FC<SegundaViaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [loadingPixId, setLoadingPixId] = useState<number | null>(null); // Estado para loading do botão Pix
  const [boletos, setBoletos] = useState<Boleto[]>([]);
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
    if (!isOpen) {
      setCpfCnpj("");
      setBoletos([]);
      setError("");
      setResumo(null);
      setLoading(false);
      setPixModalOpen(false);
    }
  }, [isOpen]);

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
    const formatted = formatarCpfCnpj(e.target.value);
    setCpfCnpj(formatted);
  };

  const buscarBoletos = async (e: React.FormEvent) => {
    e.preventDefault();
    const numerosSomenente = cpfCnpj.replace(/\D/g, "");

    if (numerosSomenente.length !== 11 && numerosSomenente.length !== 14) {
      setError("Por favor, digite um CPF ou CNPJ válido.");
      return;
    }

    setLoading(true);
    setError("");
    setBoletos([]);
    setResumo(null);

    try {
      const response = await fetch(`${API_BASE_URL}/boletos/buscar-cpf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpfCnpj: numerosSomenente }),
      });

      if (!response.ok) {
        throw new Error("Nenhuma fatura encontrada ou erro na busca.");
      }

      const data = await response.json();

      if (data.boletos && data.boletos.length > 0) {
        // Ordenação: Vencidos primeiro
        const boletosOrdenados = data.boletos.sort((a: Boleto, b: Boleto) => {
          return a.diasVencimento - b.diasVencimento;
        });

        setBoletos(boletosOrdenados);
        setResumo(data.resumo);
      } else {
        setError("Nenhuma fatura em aberto encontrada.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao buscar boletos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (boleto: Boleto) => {
    try {
      setDownloadingId(boleto.id);
      const response = await apiService.imprimirBoleto(boleto.id);

      if (response && response.base64_document) {
        const linkSource = `data:application/pdf;base64,${response.base64_document}`;
        const downloadLink = document.createElement("a");
        const fileName = `Fatura-${boleto.documento || boleto.id}.pdf`;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
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

  // === FUNÇÕES DE CÓDIGO DE BARRAS ===
  const copiarCodigoBarras = (texto: string, id: string) => {
    console.log("Copiando Código de Barras:", texto); // Debug
    navigator.clipboard.writeText(texto);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // === FUNÇÕES DO PIX ===
  const abrirPixModal = (codigo: string, imagem?: string) => {
    console.log("Abrindo Modal Pix com Código:", codigo); // Debug
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
    console.log("Copiando Pix do Modal:", activePixCode); // Debug
    navigator.clipboard.writeText(activePixCode);
    setIsPixCopied(true);
    setTimeout(() => setIsPixCopied(false), 2000);
  };

  // Função para buscar o Pix sob demanda (Botão Verde)
  const handlePagarComPix = async (boleto: Boleto) => {
    // 1. Se já tem o código carregado no objeto, abre direto
    if (boleto.pixCopiaECola) {
      console.log("Pix já carregado, abrindo modal...");
      abrirPixModal(boleto.pixCopiaECola, boleto.pixImagem);
      return;
    }

    // 2. Se não tem, busca no backend
    try {
      setLoadingPixId(boleto.id);
      console.log(`Buscando Pix para boleto ${boleto.id}...`);

      const response = await fetch(`${API_BASE_URL}/boletos/${boleto.id}/pix`);
      const data = await response.json();

      console.log("Resposta Pix:", data);

      if (data.success && data.pixCopiaECola) {
        // Atualiza o boleto na lista local para não buscar de novo
        boleto.pixCopiaECola = data.pixCopiaECola;
        boleto.pixImagem = data.pixImagem;

        abrirPixModal(data.pixCopiaECola, data.pixImagem);
      } else {
        alert(
          "O sistema financeiro ainda não gerou o QR Code para esta fatura. Tente novamente em alguns instantes."
        );
      }
    } catch (e) {
      console.error("Erro ao buscar Pix:", e);
      alert("Erro ao conectar servidor para gerar Pix.");
    } finally {
      setLoadingPixId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-4xl bg-fiber-card border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
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
                  Consulte por CPF ou CNPJ
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
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
                    className="w-full h-14 pl-12 pr-4 bg-neutral-900 border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:border-fiber-orange"
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
                      <Loader2 className="animate-spin" /> Buscando...
                    </>
                  ) : (
                    <>
                      <Search /> Buscar
                    </>
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 mb-6 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}

            {/* Resumo Financeiro */}
            {resumo && (
              <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white/5 p-3 rounded">
                    <div className="text-fiber-orange font-bold text-xl">
                      {resumo.totalBoletos}
                    </div>
                    <div className="text-xs text-gray-400">Faturas</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded">
                    <div className="text-white font-bold text-xl">
                      {resumo.totalEmAbertoFormatado}
                    </div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded">
                    <div className="text-red-400 font-bold text-xl">
                      {resumo.boletosVencidos}
                    </div>
                    <div className="text-xs text-gray-400">Vencidas</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded">
                    <div className="text-green-400 font-bold text-xl">
                      {resumo.boletosAVencer}
                    </div>
                    <div className="text-xs text-gray-400">A Vencer</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Boletos */}
            {boletos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg mb-4">
                  Faturas Encontradas
                </h3>
                {boletos.map((boleto) => (
                  <div
                    key={boleto.id}
                    className="bg-neutral-900 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              boleto.diasVencimento < 0
                                ? "text-red-400 bg-red-400/10 border-red-400/20"
                                : boleto.diasVencimento <= 5
                                ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                                : "text-green-400 bg-green-400/10 border-green-400/20"
                            }`}
                          >
                            {boleto.status}
                          </span>
                          {boleto.clienteNome && (
                            <span className="text-gray-400 text-sm">
                              {boleto.clienteNome}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-8">
                          <div>
                            <div className="text-xs text-gray-500 uppercase">
                              Vencimento
                            </div>
                            <div className="text-lg font-bold text-white">
                              {boleto.vencimentoFormatado}
                            </div>
                            {boleto.diasVencimento < 0 && (
                              <span className="text-xs font-bold text-red-400 block mt-1">
                                Vencido há {Math.abs(boleto.diasVencimento)}{" "}
                                dias
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase">
                              Valor
                            </div>
                            <div className="text-lg font-bold text-fiber-orange">
                              {boleto.valorFormatado}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* --- BOTÕES DE AÇÃO --- */}
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        {/* 1. Botão PIX (Verde) */}
                        {/* Exibe se tiver código OU status aberto */}
                        {(boleto.pixCopiaECola ||
                          boleto.status === "A Vencer" ||
                          boleto.status === "Vencido" ||
                          boleto.status === "Vence Hoje") && (
                          <button
                            type="button"
                            onClick={() => handlePagarComPix(boleto)}
                            disabled={loadingPixId === boleto.id}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-fiber-green/10 text-fiber-green rounded-lg font-bold text-sm hover:bg-fiber-green/20 transition-all disabled:opacity-50"
                          >
                            {loadingPixId === boleto.id ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <QrCode size={18} />
                            )}
                            Pagar com PIX
                          </button>
                        )}

                        {/* 2. Botão Linha Digitável (Cinza/Branco) */}
                        {boleto.linhaDigitavel && (
                          <button
                            type="button"
                            onClick={() =>
                              copiarCodigoBarras(
                                boleto.linhaDigitavel!,
                                `bar-${boleto.id}`
                              )
                            }
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white rounded-lg font-bold text-sm hover:bg-white/10 transition-all"
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
                                <Barcode size={18} /> Copiar Barras
                              </>
                            )}
                          </button>
                        )}

                        {/* 3. Botão PDF (Laranja) */}
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(boleto)}
                          disabled={downloadingId === boleto.id}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-fiber-orange/10 text-fiber-orange rounded-lg font-bold text-sm hover:bg-fiber-orange/20 transition-all disabled:opacity-50"
                        >
                          {downloadingId === boleto.id ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />{" "}
                              Gerando...
                            </>
                          ) : (
                            <>
                              <Download size={18} /> Baixar PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL ESPECÍFICO DO PIX --- */}
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

            {/* Área da Imagem do QR Code */}
            <div className="bg-white p-4 rounded-lg mx-auto w-fit mb-4 min-h-[232px] flex items-center justify-center">
              {activePixImage ? (
                <img
                  src={
                    activePixImage.startsWith("data:image")
                      ? activePixImage
                      : `data:image/png;base64,${activePixImage}`
                  }
                  alt="QR Code Pix"
                  className="w-[200px] h-[200px] object-contain"
                />
              ) : (
                <QrCode size={200} className="text-neutral-900 opacity-20" />
              )}
            </div>

            <div className="bg-neutral-900 p-3 rounded-lg mb-4 max-h-24 overflow-y-auto">
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
