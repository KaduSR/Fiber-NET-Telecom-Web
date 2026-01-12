// cspell: disable
import {
  AlertCircle,
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
import { apiService } from "../../services/apiService"; // Certifique-se de importar o apiService
import Button from "../Button";

interface SegundaViaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Boleto {
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
}) => {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null); // Estado para loading do download
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [error, setError] = useState("");
  const [resumo, setResumo] = useState<any>(null);

  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [activePixCode, setActivePixCode] = useState("");
  const [activePixImage, setActivePixImage] = useState("");
  const [isPixCopied, setIsPixCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Resetar modal ao fechar
  useEffect(() => {
    if (!isOpen) {
      setCpfCnpj("");
      setBoletos([]);
      setError("");
      setResumo(null);
      setLoading(false);
    }
  }, [isOpen]);
  const formatarDataVencimento = (dataString?: string) => {
    if (!dataString) return "--/--/----";
    if (dataString.includes("/")) {
      const [dia, mes, ano] = dataString.split("-");
      return `${dia}/${mes}/${ano}`;
    }
    return dataString;
  };

  const calcularDiasVencimento = (dataVencimento?: string): number => {
    if (!dataVencimento) return 0;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let dataVenc: Date;
    if (dataVencimento.includes("/")) {
      const [dia, mes, ano] = dataVencimento.split("/").map(Number);
      dataVenc = new Date(ano, mes - 1, dia);
    } else {
      dataVenc = new Date(dataVencimento);
    }

    const diffTime = hoje.getTime() - dataVenc.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

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
      // Usando a rota correta do controller que acabamos de ajustar
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
        const boletosOrdenados = data.boletos.sort((a: Boleto, b: Boleto) => {
          const dataA = a.data_vencimento
            ? new Date(a.data_vencimento)
            : new Date();
          const dataB = b.data_vencimento
            ? new Date(b.data_vencimento)
            : new Date();
          return dataB.getTime() - dataA.getTime();
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

  // === NOVA FUNÇÃO DE DOWNLOAD ===
  const handleDownloadPDF = async (boleto: Boleto) => {
    // 2. Se não tem link, gera via API
    try {
      setDownloadingId(boleto.id);

      // Chama o endpoint de gerar segunda via (verifique se apiService tem esse método)
      // Se apiService.imprimirBoleto não existir, use fetch direto:
      const response = await apiService.imprimirBoleto(boleto.id);

      if (response && response.base64_document) {
        // Cria link invisível para download
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

  const copiarCodigo = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const abrirPixModal = (codigo: string, imagem?: string | undefined) => {
    setActivePixCode(codigo);
    setActivePixImage(imagem || "");
    setPixModalOpen(true);
    setIsPixCopied(false);
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(activePixCode);
    setIsPixCopied(true);
    setTimeout(() => setIsPixCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Vencido":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "Vence Hoje":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "Vence em Breve":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      default:
        return "text-green-400 bg-green-400/10 border-green-400/20";
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
                        <div className="flex gap-8">
                          <div>
                            <div className="text-xs text-gray-500 uppercase">
                              Vencimento
                            </div>
                            <div className="text-lg font-bold text-white">
                              {formatarDataVencimento(boleto.data_vencimento)}
                            </div>
                            {calcularDiasVencimento(boleto.data_vencimento) >
                              0 &&
                              boleto.status !== "Pago" && (
                                <span className="text-xs font-bold text-red-400 block mt-1">
                                  {calcularDiasVencimento(
                                    boleto.data_vencimento
                                  )}{" "}
                                  dias
                                </span>
                              )}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase">
                              Valor
                            </div>
                            <div className="text-lg font-bold text-fiber-orange">
                              R$ {boleto.valor}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botões de Ação - Agora com TYPE=BUTTON para não recarregar */}
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        {/* Botão PIX */}
                        {(boleto.pix_txid || boleto.pix_qrcode) && (
                          <button
                            type="button"
                            onClick={() =>
                              abrirPixModal(
                                boleto.pix_txid || boleto.pix_qrcode || "",
                                boleto.pix_qrcode
                              )
                            }
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-fiber-green/10 text-fiber-green rounded-lg font-bold text-sm hover:bg-fiber-green/20 transition-all"
                          >
                            <QrCode size={18} /> Pagar com PIX
                          </button>
                        )}

                        {/* Botão Barras */}
                        {boleto.linha_digitavel && (
                          <button
                            type="button" // IMPORTANTE
                            onClick={() =>
                              copiarCodigo(
                                boleto.linha_digitavel!,
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
                                <Copy size={18} /> Copiar Código
                              </>
                            )}
                          </button>
                        )}

                        {/* Botão PDF - Sempre Visível */}
                        <button
                          type="button" // IMPORTANTE: Evita o refresh!
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

      {/* Modal PIX */}
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
              Pagamento PIX
            </h3>
            <div className="bg-white p-4 rounded-lg mx-auto w-fit mb-4 min-h-[232px] flex items-center justify-center">
              {activePixImage ? (
                <img
                  src={
                    activePixImage.startsWith("data.image")
                      ? activePixImage
                      : `data:image/png;base64,${activePixImage}`
                  }
                  alt="QR Code"
                  className="w-[200px] h-[200px] object-contain"
                />
              ) : (
                <QrCode size={200} className="text-neutral-900 opacity-20" />
              )}
            </div>
            <div className="bg-neutral-900 p-3 rounded-lg mb-4 max-h-20 overflow-y-auto">
              <p className="text-xs text-gray-400 font-mono break-all">
                {activePixCode}
              </p>
            </div>
            <Button
              onClick={copiarPix}
              fullWidth
              variant="primary"
              className="gap-2 !bg-fiber-green hover:!bg-green-600"
            >
              {isPixCopied ? "Copiado!" : "Copiar Código"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default SegundaViaModal;
