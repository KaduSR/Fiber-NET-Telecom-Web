// spell:disable
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FileText,
  QrCode,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { apiService } from "../../services/apiService";
import { Fatura as DashboardFatura } from "../../types/api";

// AQUI ESTAVA O PROBLEMA: A interface antiga não tinha 'fatura' nem 'initialViewMode'
interface SegundaViaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fatura: DashboardFatura | null; // Adicionado
  initialViewMode?: "boleto" | "pix"; // Adicionado
}

export function SegundaViaModal({
  isOpen,
  onClose,
  fatura,
  initialViewMode = "boleto",
}: SegundaViaModalProps) {
  const [loading, setLoading] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"boleto" | "pix">("boleto");

  useEffect(() => {
    if (isOpen && fatura) {
      setPdfBase64(null);
      setPixCode(null);
      setViewMode(initialViewMode);

      if (initialViewMode === "pix") {
        loadPix();
      } else {
        loadBoleto();
      }
    }
  }, [isOpen, fatura, initialViewMode]);

  const loadBoleto = async () => {
    if (!fatura) return;
    if (pdfBase64) return;

    try {
      setLoading(true);
      const data = await apiService.imprimirBoleto(fatura.id);
      setPdfBase64(data.base64_document);
    } catch (error) {
      console.error("Erro ao carregar boleto:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPix = async () => {
    if (!fatura) return;
    if (pixCode) return;

    try {
      setLoading(true);
      const data = await apiService.getPixCode(fatura.id);
      // Ajuste para pegar 'qrcode' ou 'pixCopiaECola' dependendo do retorno da API
      if (data.qrcode) {
        setPixCode(data.qrcode);
      } else if (data.imagem) {
        // Fallback caso venha em outro campo
        setPixCode(data.qrcode);
      }
    } catch (error) {
      console.error("Erro ao carregar Pix:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !fatura) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {viewMode === "boleto" ? (
              <FileText className="w-5 h-5 text-primary-600" />
            ) : (
              <QrCode className="w-5 h-5 text-teal-600" />
            )}
            Pagamento da Fatura
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => {
              setViewMode("boleto");
              loadBoleto();
            }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              viewMode === "boleto"
                ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50/50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Boleto Bancário
          </button>
          <button
            onClick={() => {
              setViewMode("pix");
              loadPix();
            }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              viewMode === "pix"
                ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            PIX (QR Code)
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-700 font-medium">
                Valor Total
              </span>
              <span className="text-lg font-bold text-blue-900">
                R$ {parseFloat(fatura.valor).toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Vencimento</span>
              <span className="text-sm font-medium text-blue-900">
                {new Date(fatura.data_vencimento).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : viewMode === "boleto" ? (
            <div className="space-y-4">
              {pdfBase64 ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    O boleto foi gerado com sucesso. Clique abaixo para baixar.
                  </p>
                  <a
                    href={`data:application/pdf;base64,${pdfBase64}`}
                    download={`fatura-${fatura.id}.pdf`}
                    className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Baixar PDF
                  </a>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Não foi possível carregar o boleto.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6 text-center animate-fade-in">
              {pixCode ? (
                <>
                  <div className="bg-white p-4 rounded-xl border-2 border-gray-100 inline-block shadow-sm">
                    <QRCode value={pixCode} size={180} />
                  </div>
                  <p className="text-sm text-gray-500">
                    Escaneie o QR Code com o app do seu banco
                  </p>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Ou copie o código
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyPix}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors active:scale-95 transform duration-150"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 mr-2 text-green-600" />
                        <span className="text-green-600 font-bold">
                          Copiado!
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copiar Código Pix
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="py-4 text-center">
                  <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Pix temporariamente indisponível para esta fatura.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tente usar o boleto bancário.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export default para garantir compatibilidade com o ClientArea
export default SegundaViaModal;
