// spell:disable
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Eye,
  FileSignature,
  FileText,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Power,
  Printer,
  QrCode,
  QrCodeIcon,
  RefreshCw,
  ScrollText,
  Server,
  Settings,
  Signal,
  Unlock,
  Wifi,
  Wrench,
  X
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { apiService } from "../../services/apiService";
import { API_BASE_URL } from "../config";

import { Consumo, DashboardResponse } from "../../types/api";
import { handlePdfBase64 } from "../../utils/pdfHelpers";
import AIInsights from "./AIInsights";
import Button from "./Button";
import NewTicketModal from "./Modals/NewTicketModal";

const DASH_CACHE_KEY = "fiber_dashboard_cache_v5_forced";

// === HELPERS ===

interface BoletoView {
  id: number;
  documento: string;
  vencimentoFormatado: string;
  valorFormatado: string;
  valor: number;
  valorRecebido?: number;
  linhaDigitavel: string | null;
  pixCopiaECola: string | null;
  pixImagem?: string | null;
  boleto_pdf_link: string | null;
  status: string;
  diasVencimento: number;
  clienteNome?: string;
}

const bytesToGB = (bytes: number) => {
  return parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2));
};

const downloadBase64Pdf = (base64Data: string, fileName: string) => {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (e) {
    console.error("Erro ao converter PDF", e);
    alert("Não foi possível processar o documento PDF neste momento. Por favor, tente novamente em instantes.");
  }
};

// === SUB-COMPONENT: CONSUMPTION CHART ===
const ConsumptionChart: React.FC<{ history?: Consumo["history"] }> = ({
  history,
}) => {
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [activePoint, setActivePoint] = useState<{
    label: string;
    download: number;
    upload: number;
  } | null>(null);

  const rawData = history?.[period] || [];

  const data = rawData
    .map((item: any) => ({
      label: period === "daily" ? item.data || "" : item.mes_ano || "",
      download: bytesToGB(item.download_bytes),
      upload: bytesToGB(item.upload_bytes),
    }))
    .reverse();

  const totalDownload = data.reduce((acc, curr) => acc + curr.download, 0);
  const totalUpload = data.reduce((acc, curr) => acc + curr.upload, 0);

  if (!history || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-black/20 rounded-xl mt-6">
        Histórico de consumo indisponível.
      </div>
    );
  }

  const maxVal = Math.max(
    ...data.map((d: any) => Math.max(d.download, d.upload)),
    1,
  );
  const width = 100,
    height = 100,
    padding = 10;

  const getX = (index: number) =>
    (index / (data.length - 1)) * (width - padding * 2) + padding;
  const getY = (value: number) =>
    height - padding - (value / maxVal) * (height - padding * 2);

  const getPath = (key: "download" | "upload") => {
    let d = `M ${getX(0)} ${getY(data[0][key])}`;
    for (let i = 1; i < data.length; i++)
      d += ` L ${getX(i)} ${getY(data[i][key])}`;
    return d;
  };

  const getAreaPath = (key: "download" | "upload") =>
    `${getPath(key)} L ${getX(data.length - 1)} ${height - padding} L ${getX(
      0,
    )} ${height - padding} Z`;

  return (
    <div className="bg-black/20 border border-white/5 rounded-2xl p-6 mt-6 relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-1">
            Total Download
          </p>
          <p className="text-2xl font-bold text-white">
            {totalDownload.toFixed(2)} GB
          </p>
        </div>
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-1">
            Total Upload
          </p>
          <p className="text-2xl font-bold text-white">
            {totalUpload.toFixed(2)} GB
          </p>
        </div>
        <div className="flex items-center justify-end">
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setPeriod("daily")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${period === "daily"
                ? "bg-fiber-orange text-white shadow-lg"
                : "text-gray-400 hover:text-white"
                }`}
            >
              Diário
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${period === "monthly"
                ? "bg-fiber-orange text-white shadow-lg"
                : "text-gray-400 hover:text-white"
                }`}
            >
              Mensal
            </button>
          </div>
        </div>
      </div>
      <div className="h-64 w-full relative group">
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-gray-500 font-mono pointer-events-none z-0">
          <span>{Math.round(maxVal)} GB</span>
          <span>{Math.round(maxVal / 2)} GB</span>
          <span>0 GB</span>
        </div>
        <div className="ml-8 h-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="gradDownload" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E90FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1E90FF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradUpload" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={getAreaPath("download")}
              fill="url(#gradDownload)"
              className="transition-all duration-500"
            />
            <path
              d={getPath("download")}
              fill="none"
              stroke="#1E90FF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 drop-shadow-lg"
            />
            <path
              d={getAreaPath("upload")}
              fill="url(#gradUpload)"
              className="transition-all duration-500"
            />
            <path
              d={getPath("upload")}
              fill="none"
              stroke="#FF6B00"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 drop-shadow-lg"
            />
            {data.map((d: any, i: number) => (
              <g key={i} className="group/point">
                <rect
                  x={getX(i) - 2}
                  y="0"
                  width="4"
                  height="100"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActivePoint(d)}
                  onMouseLeave={() => setActivePoint(null)}
                />
                <circle
                  cx={getX(i)}
                  cy={getY(d.download)}
                  r="1.5"
                  className="fill-[#1E90FF] opacity-0 group-hover/point:opacity-100"
                />
                <circle
                  cx={getX(i)}
                  cy={getY(d.upload)}
                  r="1.5"
                  className="fill-[#FF6B00] opacity-0 group-hover/point:opacity-100"
                />
              </g>
            ))}
          </svg>
        </div>
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] text-gray-400 font-medium px-2">
          <span>{data[0]?.label}</span>
          <span>{data[Math.floor(data.length / 2)]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
        {activePoint && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-neutral-900 border border-white/20 p-3 rounded-lg shadow-2xl z-10 pointer-events-none animate-fadeIn backdrop-blur-md">
            <div className="text-xs font-bold text-white mb-1 border-b border-white/10 pb-1">
              {activePoint.label}
            </div>
            <div className="flex items-center gap-2 text-xs text-fiber-blue">
              <ArrowDown size={12} /> {activePoint.download.toFixed(2)} GB
            </div>
            <div className="flex items-center gap-2 text-xs text-fiber-orange">
              <ArrowUp size={12} /> {activePoint.upload.toFixed(2)} GB
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-fiber-blue"></div>
          <span className="text-xs text-gray-400">Download</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-fiber-orange"></div>
          <span className="text-xs text-gray-400">Upload</span>
        </div>
      </div>
    </div>
  );
};

// === SUB-COMPONENT: INVOICE ITEM ===
const InvoiceItem: React.FC<{
  fatura: any;
  downloadingInvoiceId: number | null;
  loadingPixId: number | null;
  copiedInvoiceId: number | null;
  handleOpenPixModal: (boleto: BoletoView) => void;
  handleCopy: (text: string, id: number) => void;
  handleDownloadPdf: (faturaId: number) => void;
  calcularEstimativa: (valor: number, dataVencimento: string) => any;
}> = ({
  fatura,
  downloadingInvoiceId,
  loadingPixId,
  copiedInvoiceId,
  handleOpenPixModal,
  handleCopy,
  handleDownloadPdf,
  calcularEstimativa,
}) => {
    const valorNum =
      typeof fatura.valor === "string"
        ? parseFloat(fatura.valor.replace(",", "."))
        : Number(fatura.valor);

    const estimativa =
      fatura.status === "A"
        ? calcularEstimativa(valorNum, fatura.data_vencimento)
        : null;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataSegura =
      fatura.data_vencimento && fatura.data_vencimento.includes("T")
        ? fatura.data_vencimento
        : (fatura.data_vencimento || "") + "T12:00:00";

    const venc = new Date(dataSegura);
    venc.setHours(0, 0, 0, 0);

    const diffTime = venc.getTime() - hoje.getTime();
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
      <div
        key={fatura.id}
        className={`flex flex-col md:flex-row justify-between items-center bg-neutral-900 p-5 rounded-2xl border-l-4 hover:bg-white/5 transition-all gap-6 ${fatura.status === "A" ? "border-fiber-orange" : "border-fiber-green"
          }`}
      >
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-white font-black text-xl">
              R${" "}
              {valorNum.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
            {fatura.status === "A" ? (
              dias < 0 ? (
                <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-red-500/30">
                  Atrasada
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-amber-500/30">
                  Pendente
                </span>
              )
            ) : (
              <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-green-500/30">
                Liquidada
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 uppercase font-black tracking-wider flex items-center gap-1.5">
            <Calendar size={12} className="text-fiber-orange" /> Vencimento:{" "}
            {fatura.data_vencimento
              ? fatura.data_vencimento.split("-").reverse().join("/")
              : "N/A"}
          </p>
          {fatura.status === "A" && (
            <p className="text-xs font-bold mt-1">
              {dias < 0 ? (
                <span className="text-red-400">
                  {Math.abs(dias)} dias em atraso
                </span>
              ) : dias === 0 ? (
                <span className="text-yellow-400">Vence hoje</span>
              ) : (
                <span className="text-fiber-blue">Vence em {dias} dias</span>
              )}
            </p>
          )}

          {estimativa && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex flex-wrap gap-4 text-[10px]">
                <span className="text-gray-400">
                  Multa (2%):{" "}
                  <strong className="text-white">
                    R$ {estimativa.multa.toFixed(2)}
                  </strong>
                </span>
                <span className="text-gray-400">
                  Juros:{" "}
                  <strong className="text-white">
                    R$ {estimativa.juros.toFixed(2)}
                  </strong>
                </span>
                <span className="text-fiber-orange font-bold uppercase">
                  Total: {estimativa.totalAtualizado}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex md:flex-col lg:flex-row gap-2 w-full md:w-auto">
          {fatura.status === "A" && (
            <>
              <Button
                onClick={() =>
                  handleOpenPixModal(fatura as unknown as BoletoView)
                }
                disabled={loadingPixId === fatura.id}
                className="!flex-1 !flex !items-center !justify-center gap-2 !bg-fiber-green text-white !px-4 !py-2.5 !rounded-xl !font-bold !text-xs hover:!bg-green-600 transition shadow-lg shadow-green-900/20"
              >
                {loadingPixId === fatura.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <QrCode size={16} />
                )}
                Pagar via PIX
              </Button>

              <Button
                onClick={() => handleCopy(fatura.linha_digitavel || "", fatura.id)}
                className={`!flex-1 !flex !items-center !justify-center gap-2 !px-4 !py-2.5 !rounded-xl !font-bold !text-xs transition border ${copiedInvoiceId === fatura.id
                  ? "!bg-green-500/20 !text-green-400 !border-green-500/30"
                  : "!bg-white/10 !text-white hover:!bg-white/20 !border-white/10"
                  }`}
              >
                {copiedInvoiceId === fatura.id ? (
                  <>
                    <CheckCircle size={16} /> Copiado
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copiar Código
                  </>
                )}
              </Button>
            </>
          )}

          <Button
            onClick={() => handleDownloadPdf(fatura.id)}
            className="!flex-1 md:!flex-none !p-2.5 !bg-neutral-800 !text-gray-400 hover:!text-white !rounded-xl transition border !border-white/5 !flex !items-center !justify-center gap-2"
            title="Download PDF"
            disabled={downloadingInvoiceId === fatura.id}
          >
            {downloadingInvoiceId === fatura.id ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            <span className="md:hidden text-xs font-bold">Baixar PDF</span>
          </Button>
        </div>
      </div>
    );
  };

// === MAIN COMPONENT ===
interface ClientAreaProps {
  onNavigate?: (page: string) => void;
}

const ClientArea: React.FC<ClientAreaProps> = ({ onNavigate }) => {
  // === REFS ===
  const mainCardRef = useRef<HTMLDivElement>(null);

  // === STATE MANAGEMENT ===
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    () => {
      try {
        const cached = localStorage.getItem(DASH_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.contratos && parsed.clientes) return parsed;
        }
        return null;
      } catch (e) {
        return null;
      }
    },
  );

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem("authToken");
    return !!token;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const token = localStorage.getItem("authToken");
    const cached = localStorage.getItem(DASH_CACHE_KEY);
    if (!token) return false;
    if (cached) return false;
    return true;
  });

  const [isRefetching, setIsRefetching] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isPixModalOpen, setPixModalOpen] = useState(false);
  const [isNewTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<number | null>(null);
  const [downloadingContractId, setDownloadingContractId] = useState<
    number | null
  >(null);
  const [activePixCode, setActivePixCode] = useState("");
  const [activePixImage, setActivePixImage] = useState("");
  const [loadingPixId, setLoadingPixId] = useState<number | null>(null);
  const [isPixCopied, setIsPixCopied] = useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("aberto");
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<number | null>(null);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showNewPass, setShowNewPass] = useState(false);
  const [actionStatus, setActionStatus] = useState<{
    [key: string]: {
      status: "idle" | "loading" | "success" | "error";
      message?: string;
    };
  }>({});
  const [, setDiagResults] = useState<
    Record<
      number,
      {
        download: string;
        upload: string;
      } | null
    >
  >({});

  const [unlockingId, setUnlockingId] = useState<number | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    null,
  );
  const [diagnosticData, setDiagnosticData] = useState<Record<number, any>>({});

  const [loginView, setLoginView] = useState<"login" | "forgot">("login");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const fetchDashboardData = async () => {
    setIsRefetching(true);
    try {
      const data = await apiService.getDashboard();
      setDashboardData(data);
      setIsAuthenticated(true);
      localStorage.setItem(DASH_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao atualizar dashboard:", error);
      if (!dashboardData) {
        handleLogout();
      }
    } finally {
      setIsRefetching(false);
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const email = emailInput;

    try {
      const loginResponse = await apiService.login({ email, password });
      if (!loginResponse.token) throw new Error("Token inválido.");

      const dashData = await apiService.getDashboard();
      setDashboardData(dashData);
      localStorage.setItem(DASH_CACHE_KEY, JSON.stringify(dashData));

      if (rememberMe) localStorage.setItem("fiber_saved_email", email);
      else localStorage.removeItem("fiber_saved_email");

      setIsAuthenticated(true);
      setActiveTab("dashboard");

    } catch (error: any) {
      setLoginError(error.message || "Não foi possível validar seu acesso. Por favor, verifique suas credenciais.");
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setDashboardData(null);
    setLoginView("login");
  };

  const handleUnlockContract = async (idContrato: number) => {
    if (
      !window.confirm(
        "Deseja solicitar o Desbloqueio em Confiança? Sua conexão será restabelecida temporariamente enquanto aguardamos a compensação do seu pagamento.",
      )
    )
      return;

    setUnlockingId(idContrato);
    try {
      const response = await apiService.unlockContract(idContrato);
      alert(
        response.message ||
        "Desbloqueio processado com sucesso! Por favor, aguarde alguns instantes e, se necessário, reinicie seu equipamento.",
      );
      fetchDashboardData();
    } catch (error: any) {
      alert(error.message || "Não conseguimos processar sua solicitação de desbloqueio agora. Por favor, tente novamente em alguns instantes.");
    } finally {
      setUnlockingId(null);
    }
  };

  const handleAdvancedDiagnostic = async (
    idContrato: number | string,
    idLogin: number | string,
  ) => {
    const loginId = Number(idLogin);
    const contratoId = Number(idContrato);
    setActionStatus((prev) => ({ ...prev, [loginId]: { status: "loading" } }));
    try {
      const data = await apiService.getDiagnostico(contratoId);
      setDiagnosticData((prev) => ({ ...prev, [loginId]: data }));
      setActionStatus((prev) => ({
        ...prev,
        [loginId]: { status: "success", message: "Diagnóstico concluído" },
      }));
    } catch (error: any) {
      setActionStatus((prev) => ({
        ...prev,
        [loginId]: { status: "error", message: "O diagnóstico identificou uma instabilidade" },
      }));
    } finally {
      setTimeout(
        () =>
          setActionStatus((prev) => ({
            ...prev,
            [loginId]: { status: "idle" },
          })),
        3000,
      );
    }
  };

  const performLoginAction = async (
    loginId: string | number,
    action: "limpar-mac" | "desconectar" | "diagnostico",
  ) => {
    const id = Number(loginId);
    setActionStatus((prev) => ({
      ...prev,
      [loginId]: { status: "loading" as const },
    }));

    try {
      const data = await apiService.performLoginAction(id, action);
      if (action === "diagnostico" && data.consumo) {
        setDiagResults((prev) => ({ ...prev, [id]: data.consumo }));
      }
      setActionStatus((prev) => ({
        ...prev,
        [loginId]: { status: "success" as const, message: data.message },
      }));
    } catch (error: any) {
      setActionStatus((prev) => ({
        ...prev,
        [loginId]: { status: "error" as const, message: error.message },
      }));
    } finally {
      setTimeout(
        () =>
          setActionStatus((prev) => ({
            ...prev,
            [loginId]: { status: "idle" as const },
          })),
        3000,
      );
    }
  };

  const handleSignContract = async (idTermo: number) => {
    if (!window.confirm("Você confirma a assinatura digital deste documento? Esta ação tem validade jurídica e formaliza seu aceite aos termos contratados."))
      return;

    setIsSigning(true);
    try {
      await apiService.assinarContrato(idTermo);
      alert("Seu documento foi assinado digitalmente com sucesso!");
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || "Não foi possível concluir sua assinatura digital agora. Por favor, tente novamente.");
    } finally {
      setIsSigning(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordChangeStatus(null);
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("novaSenha") as string;

    try {
      const data = await apiService.changePassword(newPassword);
      setPasswordChangeStatus({ type: "success", message: data.message });
      e.currentTarget.reset();
    } catch (error: any) {
      setPasswordChangeStatus({ type: "error", message: error.message });
    }
  };

  const handleRecovery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRecoveryStatus("loading");
    try {
      const formData = new FormData(e.currentTarget);
      const data = await apiService.recoverPassword(
        formData.get("recoveryEmail") as string,
      );
      setRecoveryStatus("success");
      setRecoveryMessage(data.message);
    } catch (e: any) {
      setRecoveryStatus("error");
      setRecoveryMessage(e.message);
    }
  };

  const handleRegularizarPendencia = () => {
    setActiveTab("invoices");
    setInvoiceStatusFilter("aberto");

    if (dashboardData?.faturas) {
      const faturasPendentes = dashboardData.faturas
        .filter((f) => f.status === "A")
        .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento));

      if (faturasPendentes.length > 0) {
        const oldest = faturasPendentes[0];
        const contratoId = oldest.contrato_id || oldest.id_contrato;
        if (contratoId) {
          setSelectedContractId(Number(contratoId));
        }
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseTicket = async (ticketId: number) => {
    if (!window.confirm("Deseja realmente finalizar este atendimento?")) return;

    try {
      await apiService.closeTicket(ticketId);
      alert("Atendimento finalizado com sucesso!");
      fetchDashboardData();
    } catch (error: any) {
      alert(error.message || "Erro ao finalizar atendimento.");
    }
  };

  const handleDownloadPdf = async (faturaId: number) => {
    setDownloadingInvoiceId(faturaId);
    try {
      const response = await apiService.getSegundaVia(faturaId);
      if (response && response.base64_document) {
        downloadBase64Pdf(response.base64_document, `Fatura-${faturaId}.pdf`);
      } else {
        alert("Pedimos desculpas, mas não conseguimos localizar este documento para download. Caso o problema persista, nossa equipe de suporte está à disposição.");
      }
    } catch (error) {
      console.error("Erro ao baixar fatura:", error);
      alert("Houve um problema ao processar seu download. Por favor, tente novamente em alguns instantes.");
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
      if (!token) setDashboardData(null);
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData?.contratos?.length && selectedContractId === null) {
      setSelectedContractId(dashboardData.contratos[0].id);
    }
  }, [dashboardData, selectedContractId]);

  // Efeito para buscar diagnóstico automaticamente na aba de consumo se houver contrato selecionado
  useEffect(() => {
    if (activeTab === "consumption" && selectedContractId && dashboardData) {
      const login = dashboardData.logins.find(l => String(l.contrato_id) === String(selectedContractId));
      if (login && !diagnosticData[login.id]) {
        handleAdvancedDiagnostic(selectedContractId, login.id);
      }
    }
  }, [activeTab, selectedContractId, dashboardData]);

  const abrirModalPixInterface = (codigo: string, image?: string) => {
    if (!codigo) {
      alert("Atenção: O código PIX para este pagamento ainda não está disponível.");
      return;
    }

    setActivePixCode(codigo);
    setActivePixImage(image || "");
    setPixModalOpen(true);
    setIsPixCopied(false);
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedInvoiceId(id);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
  };

  const handleOpenPixModal = async (boleto: BoletoView) => {
    if (boleto.pixCopiaECola) {
      abrirModalPixInterface(
        boleto.pixCopiaECola,
        boleto.pixImagem || undefined,
      );
      return;
    }

    try {
      setLoadingPixId(boleto.id);
      const response = await fetch(`${API_BASE_URL}/boletos/${boleto.id}/pix`);
      const data = await response.json();

      if (
        (data.success || data.type === "success") &&
        (data.pixCopiaECola || data.pix?.qrCode?.qrcode)
      ) {
        const code = data.pixCopiaECola || data.pix?.qrCode?.qrcode;
        const img = data.pixImagem || data.pix?.qrCode?.imagemQrcode;

        boleto.pixCopiaECola = code;
        boleto.pixImagem = img;
        abrirModalPixInterface(code, img);
      } else {
        alert(
          "O sistema financeiro ainda está processando a geração do seu QR Code. Por favor, tente novamente em instantes.",
        );
      }
    } catch (e) {
      console.error("Erro Pix:", e);
      alert("Estamos com uma instabilidade momentânea na geração do PIX. Por favor, tente novamente em instantes.");
    } finally {
      setLoadingPixId(null);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(activePixCode);
    setIsPixCopied(true);
    setTimeout(() => setIsPixCopied(false), 2000);
  };

  const handleDownloadContrato = async (id: number) => {
    setDownloadingContractId(id);
    try {
      const data = await apiService.getContratoPdf(id);
      handlePdfBase64(data.base64_document, `contrato-fiber-${id}.pdf`, 'view');
    } catch (error) {
      console.error("Erro ao baixar contrato:", error);
      alert("Não foi possível realizar o download do contrato agora. Por favor, tente novamente em alguns minutos.");
    } finally {
      setDownloadingContractId(null);
    }
  };

  const faturasAbertas =
    dashboardData?.faturas.filter((f) => f.status === "A").length || 0;

  const TABS = [
    { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard },
    { id: "invoices", label: "Faturas", icon: FileText, badge: faturasAbertas },
    { id: "tickets", label: "Atendimento", icon: MessageSquare },
    { id: "service_orders", label: "Ordens de Serviço", icon: Wrench },
    { id: "connections", label: "Conexões", icon: Wifi },
    { id: "consumption", label: "Extrato", icon: BarChart3 },
    { id: "contracts", label: "Contratos", icon: FileSignature },
    { id: "notes", label: "Notas Fiscais", icon: ScrollText },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  const calcularEstimativa = (valor: number, dataVencimento: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataSegura = dataVencimento.includes("T")
      ? dataVencimento
      : dataVencimento + "T12:00:00";
    const venc = new Date(dataSegura);
    venc.setHours(0, 0, 0, 0);

    if (hoje <= venc) return null;

    const diffTime = Math.abs(hoje.getTime() - venc.getTime());
    const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const multa = valor * 0.02;
    const juros = valor * (0.00033 * diasAtraso);
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

  if (isLoading)
    return (
      <div className="min-h-screen bg-fiber-dark flex items-center justify-center">
        <Loader2 size={48} className="text-fiber-orange animate-spin" />
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-fiber-dark flex items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-md bg-fiber-card p-8 rounded-2xl border border-white/10 shadow-2xl">
          {loginView === "login" ? (
            <>
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                Área do Cliente
              </h2>
              <p className="text-gray-400 text-center mb-8">
                Seja bem-vindo. Acesse sua conta para gerenciar seus serviços com facilidade.
              </p>
              <form onSubmit={handleLogin} className="space-y-6">
                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
                    <p className="text-red-400 text-sm">{loginError}</p>
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    placeholder="Seu e-mail cadastrado"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 pl-12 text-white focus:ring-1 focus:ring-fiber-orange transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showLoginPass ? "text" : "password"}
                    name="password"
                    placeholder="Sua senha de acesso"
                    required
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 pl-12 pr-10 text-white focus:ring-1 focus:ring-fiber-orange transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-fiber-orange rounded bg-neutral-900 border-white/10"
                    />
                    Lembrar meu acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => setLoginView("forgot")}
                    className="text-fiber-orange hover:underline transition-all"
                  >
                    Recuperar senha
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={isLoading}
                    className="!py-4 !rounded-xl font-bold tracking-wide shadow-lg shadow-fiber-orange/20"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      "Acessar Área do Cliente"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => onNavigate?.("home")}
                    className="!py-4 !rounded-xl font-bold border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                  >
                    Voltar para o Site
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => setLoginView("login")}
                className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
              >
                <ArrowLeft size={16} /> Voltar para o login
              </button>
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Recuperação de Acesso
              </h2>
              <p className="text-gray-400 text-center mb-8 text-sm">
                Informe seu e-mail cadastrado para receber as instruções de redefinição de senha.
              </p>
              {recoveryStatus !== "success" ? (
                <form onSubmit={handleRecovery} className="space-y-6">
                  <input
                    type="email"
                    name="recoveryEmail"
                    placeholder="Seu e-mail cadastrado"
                    required
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-fiber-orange"
                  />
                  {recoveryStatus === "error" && (
                    <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {recoveryMessage}
                    </p>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={recoveryStatus === "loading"}
                    className="!py-4 !rounded-xl"
                  >
                    {recoveryStatus === "loading" ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      "Enviar instruções"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center animate-fadeIn">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <p className="text-white mb-6 leading-relaxed">{recoveryMessage}</p>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setLoginView("login")}
                    className="!py-3 !rounded-xl"
                  >
                    Voltar para o início
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // --- LÓGICA DE CÁLCULO DE DÉBITOS PARA O BANNER GERAL ---
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const totalGeralDivida = (dashboardData?.faturas || [])
    .filter((f) => {
      if (f.status !== "A") return false;
      const dateStr = String(f.data_vencimento);
      let month = 0, year = 0;
      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      } else if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts[0].length === 4) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
        } else {
          year = parseInt(parts[2], 10);
          month = parseInt(parts[1], 10);
        }
      }
      return month === currentMonth && year === currentYear;
    })
    .reduce((acc, curr) => acc + parseFloat(String(curr.valor).replace(",", ".")), 0);

  return (
    <div className="min-h-screen bg-fiber-dark py-8 md:py-12 animate-fadeIn overflow-x-hidden">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* === ALERTA DE DÉBITOS === */}
        {totalGeralDivida > 0 && (
          <div className="sticky top-4 z-50 mb-10 bg-gradient-to-r from-red-600/95 to-red-700/95 backdrop-blur-md text-white p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 border border-white/20 animate-fadeIn">
            <div className="flex items-center gap-5">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                <AlertCircle className="text-white" size={32} />
              </div>
              <div>
                <p className="font-bold text-xl md:text-2xl tracking-tight">
                  Regularização Pendente
                </p>
                <p className="text-white/90 font-medium">
                  Identificamos faturas em aberto no valor total de:
                  <span className="font-black text-2xl ml-2 text-white">
                    {totalGeralDivida.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </p>
              </div>
            </div>
            <Button
              onClick={handleRegularizarPendencia}
              className="!bg-white !text-red-600 !px-10 !py-4 !rounded-2xl !font-bold !text-lg hover:scale-105 transition-transform whitespace-nowrap shadow-xl"
            >
              Regularizar Pendência
            </Button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* SIDEBAR NAVEGAÇÃO */}
          <aside className={`w-full lg:w-1/4 lg:sticky self-start z-10 space-y-6 transition-all duration-300 ${totalGeralDivida > 0 ? "lg:top-40" : "lg:top-8"}`}>
            <div className="bg-fiber-card border border-white/10 rounded-3xl p-5 space-y-2 shadow-2xl">
              <div className="px-3 mb-6">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Área do Cliente</p>
                <h2 className="text-xl font-bold text-white truncate">
                  {dashboardData?.clientes[0]?.nome?.split(" ")[0]}
                </h2>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-3 mb-2">Menu Principal</p>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between gap-4 p-4 rounded-2xl text-left transition-all font-bold text-sm group ${activeTab === tab.id
                      ? "bg-fiber-orange text-white shadow-[0_10px_20px_rgba(255,107,0,0.3)] scale-[1.02]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <tab.icon size={22} className={activeTab === tab.id ? "text-white" : "text-gray-500 group-hover:text-fiber-orange transition-colors"} />
                      {tab.label}
                    </div>
                    {tab.badge && tab.badge > 0 && (
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-full shadow-inner ${activeTab === tab.id ? "bg-white text-fiber-orange" : "bg-fiber-orange text-white"
                        }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                <button
                  onClick={fetchDashboardData}
                  disabled={isRefetching}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left text-gray-400 hover:bg-white/5 hover:text-white transition-all font-bold text-sm"
                >
                  <RefreshCw size={22} className={isRefetching ? "animate-spin text-fiber-orange" : "text-gray-500"} />
                  Atualizar Dados
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
                >
                  <LogOut size={22} />
                  Sair da Conta
                </button>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-6 hidden lg:block">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-fiber-green animate-pulse"></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sistemas OK</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Todos os serviços da Fiber.Net estão operando normalmente.
              </p>
            </div>
          </aside>

          {/* CONTEÚDO PRINCIPAL */}
          <main className="w-full lg:w-3/4 relative" ref={mainCardRef}>
            {/* Mobile Tab Scroll */}
            <div className="lg:hidden shrink-0 overflow-x-auto whitespace-nowrap p-4 mb-8 flex gap-3 bg-fiber-card border border-white/10 rounded-3xl shadow-xl no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === tab.id
                    ? "bg-fiber-orange text-white shadow-lg"
                    : "bg-neutral-900 text-gray-500"
                    }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            <div
              key={activeTab}
              className="bg-fiber-card border border-white/10 rounded-[2.5rem] p-6 md:p-12 min-h-[600px] animate-fadeIn shadow-2xl relative z-0"
            >


              {/* === DASHBOARD (VISÃO GERAL) === */}
              {activeTab === "dashboard" && dashboardData && (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                    <div>
                      <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <LayoutDashboard size={28} className="text-fiber-orange" /> Central de Comando
                      </h2>
                      <p className="text-gray-500 mt-1 font-medium italic">Resumo de seus serviços e acessos rápidos.</p>
                    </div>
                  </div>

                  <AIInsights data={dashboardData.ai_analysis} />

                  {/* GRID PRINCIPAL DE CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">

                    {/* CARD MEU PLANO */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between hover:border-fiber-blue/30 transition-all group shadow-xl">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-4 bg-fiber-blue/10 rounded-2xl text-fiber-blue group-hover:scale-110 transition-transform">
                            <Wifi size={28} />
                          </div>
                          <span className="bg-fiber-green/10 text-fiber-green text-[10px] font-black px-3 py-1 rounded-full border border-fiber-green/20">CONEXÃO ATIVA</span>
                        </div>
                        <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Plano Atual</h3>
                        <p className="text-xl font-bold text-white mb-4 truncate">{dashboardData.contratos[0]?.plano || "Internet Fibra Óptica"}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("connections")}
                        className="mt-8 flex items-center gap-2 text-fiber-blue font-bold text-sm hover:gap-3 transition-all"
                      >
                        Ver detalhes <ArrowDown size={16} className="-rotate-90" />
                      </button>
                    </div>

                    {/* CARD FINANCEIRO */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between hover:border-fiber-orange/30 transition-all group shadow-xl">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-4 bg-fiber-orange/10 rounded-2xl text-fiber-orange group-hover:scale-110 transition-transform">
                            <FileText size={28} />
                          </div>
                          {faturasAbertas > 0 ? (
                            <span className="bg-red-500/10 text-red-400 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/20">{faturasAbertas} PENDENTE(S)</span>
                          ) : (
                            <span className="bg-fiber-green/10 text-fiber-green text-[10px] font-black px-3 py-1 rounded-full border border-fiber-green/20">TUDO EM DIA</span>
                          )}
                        </div>
                        <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Financeiro</h3>
                        <p className="text-xl font-bold text-white mb-4">Gestão de Faturas</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("invoices")}
                        className="mt-8 flex items-center gap-2 text-fiber-orange font-bold text-sm hover:gap-3 transition-all"
                      >
                        Ir para faturas <ArrowDown size={16} className="-rotate-90" />
                      </button>
                    </div>

                    {/* CARD ATENDIMENTO */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-4 bg-white/5 rounded-2xl text-white group-hover:scale-110 transition-transform">
                            <MessageSquare size={28} />
                          </div>
                          <span className="bg-white/5 text-gray-400 text-[10px] font-black px-3 py-1 rounded-full">HISTÓRICO</span>
                        </div>
                        <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Atendimento</h3>
                        <p className="text-xl font-bold text-white mb-4">Chamados</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("tickets")}
                        className="mt-8 flex items-center gap-2 text-white font-bold text-sm hover:gap-3 transition-all"
                      >
                        Ver chamados <ArrowDown size={16} className="-rotate-90" />
                      </button>
                    </div>

                    {/* CARD ORDENS DE SERVIÇO */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between hover:border-fiber-orange/30 transition-all group shadow-xl">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-4 bg-fiber-orange/10 rounded-2xl text-fiber-orange group-hover:scale-110 transition-transform">
                            <Wrench size={28} />
                          </div>
                          <span className="bg-white/5 text-gray-400 text-[10px] font-black px-3 py-1 rounded-full">AGENDAMENTOS</span>
                        </div>
                        <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Visitas Técnicas</h3>
                        <p className="text-xl font-bold text-white mb-4">Serviços</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("service_orders")}
                        className="mt-8 flex items-center gap-2 text-fiber-orange font-bold text-sm hover:gap-3 transition-all"
                      >
                        Ver ordens <ArrowDown size={16} className="-rotate-90" />
                      </button>
                    </div>

                  </div>

                  {/* ÚLTIMAS FATURAS (CORRIGIDO: SEM DUPLICIDADE) */}
                  <div className="bg-neutral-900/30 border border-white/5 rounded-[2rem] p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Clock size={20} className="text-fiber-orange" /> Faturas Recentes
                      </h3>
                      <button onClick={() => setActiveTab("invoices")} className="text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">VER HISTÓRICO COMPLETO</button>
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const faturasUnicas: any[] = [];
                        const datasVistas = new Set();

                        [...(dashboardData.faturas || [])]
                          .filter(f => f.status !== "C") // Remove canceladas
                          .sort((a, b) => {
                            // Ordena por data (mais recente) e depois status (Aberto antes de Pago)
                            const dateComp = (b.data_vencimento || "").localeCompare(a.data_vencimento || "");
                            if (dateComp !== 0) return dateComp;
                            return a.status === "A" ? -1 : 1;
                          })
                          .forEach(f => {
                            if (!datasVistas.has(f.data_vencimento)) {
                              faturasUnicas.push(f);
                              datasVistas.add(f.data_vencimento);
                            }
                          });

                        return faturasUnicas.slice(0, 3).map((fatura) => {
                          const valorNum = typeof fatura.valor === "string" ? parseFloat(fatura.valor.replace(",", ".")) : Number(fatura.valor);
                          return (
                            <div key={fatura.id} className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/5 transition-all">
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${fatura.status === "P" ? "bg-fiber-green/10 text-fiber-green" : "bg-fiber-orange/10 text-fiber-orange"}`}>
                                  <FileText size={22} />
                                </div>
                                <div>
                                  <p className="font-bold text-white">R$ {valorNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                                  <p className="text-[10px] text-gray-500 font-black uppercase">Vencimento: {fatura.data_vencimento ? fatura.data_vencimento.split("-").reverse().join("/") : "N/A"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${fatura.status === "P" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-fiber-orange/10 text-fiber-orange border-fiber-orange/20"}`}>
                                  {fatura.status === "P" ? "Liquidada" : "Pendente"}
                                </span>
                                {fatura.status !== "P" && (
                                  <button
                                    onClick={() => handleOpenPixModal(fatura as unknown as BoletoView)}
                                    className="p-2 bg-fiber-green text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-950/20"
                                    title="Pagar agora"
                                  >
                                    <QrCode size={18} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "invoices" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="bg-fiber-orange/10 p-2 rounded-lg text-fiber-orange">
                      <FileText size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Gestão Financeira
                    </h2>
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-2 mb-6 bg-neutral-900 p-1.5 rounded-xl border border-white/5 w-fit">
                    {["aberto", "pago"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setInvoiceStatusFilter(s)}
                        className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${invoiceStatusFilter === s
                          ? "bg-fiber-orange text-white shadow-lg"
                          : "bg-transparent text-gray-500 hover:text-gray-300"
                          }`}
                      >
                        {s === "aberto"
                          ? "Pendentes"
                          : "Histórico"}
                      </button>
                    ))}
                  </div>

                  {/* Listagem Unificada de Faturas */}
                  <div className="bg-neutral-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-fadeIn">
                    <div className="bg-white/5 p-6 md:p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {invoiceStatusFilter === "aberto" ? "Faturas Pendentes" : "Histórico de Pagamentos"}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1 italic">
                          {invoiceStatusFilter === "aberto"
                            ? "Listagem de boletos aguardando pagamento ou compensação."
                            : "Registro de faturas liquidadas e encerradas."}
                        </p>
                      </div>
                      <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-0.5 text-center">Total de Itens</span>
                        <p className="text-xl font-black text-white text-center">
                          {(() => {
                            const faturas = (dashboardData?.faturas || []).filter(f => {
                              if (f.status === "C") return false;
                              if (invoiceStatusFilter === "aberto") return f.status === "A";
                              if (invoiceStatusFilter === "pago") return f.status === "P" || f.status === "R";
                              return true;
                            });
                            const uniqueDates = new Set(faturas.map(f => f.data_vencimento));
                            return uniqueDates.size;
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 md:p-8 space-y-4 bg-black/20">
                      {(() => {
                        const faturasFiltradas = (dashboardData?.faturas || []).filter(f => {
                          if (f.status === "C") return false;
                          if (invoiceStatusFilter === "aberto") return f.status === "A";
                          if (invoiceStatusFilter === "pago") return f.status === "P" || f.status === "R";
                          return false;
                        });

                        const faturasUnicas: any[] = [];
                        const datasVistas = new Set();

                        [...faturasFiltradas]
                          .sort((a, b) => {
                            const dateComp = (b.data_vencimento || "").localeCompare(a.data_vencimento || "");
                            if (dateComp !== 0) return dateComp;
                            return a.status === "A" ? -1 : 1;
                          })
                          .forEach(f => {
                            if (!datasVistas.has(f.data_vencimento)) {
                              faturasUnicas.push(f);
                              datasVistas.add(f.data_vencimento);
                            }
                          });

                        return faturasUnicas.length > 0 ? (
                          faturasUnicas.map((fatura) => (
                            <InvoiceItem
                              key={fatura.id}
                              fatura={fatura}
                              downloadingInvoiceId={downloadingInvoiceId}
                              loadingPixId={loadingPixId}
                              copiedInvoiceId={copiedInvoiceId}
                              handleOpenPixModal={handleOpenPixModal}
                              handleCopy={handleCopy}
                              handleDownloadPdf={handleDownloadPdf}
                              calcularEstimativa={calcularEstimativa}
                            />
                          ))
                        ) : (
                          <div className="text-center py-20">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                              <FileText size={32} className="text-white" />
                            </div>
                            <p className="text-gray-500 font-bold">Nenhuma fatura encontrada</p>
                            <p className="text-gray-600 text-xs mt-1 italic">
                              Não existem registros de faturas {invoiceStatusFilter === "aberto" ? "pendentes" : "pagas"} no momento.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "tickets" && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-fiber-orange/10 p-3 rounded-2xl text-fiber-orange">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">Atendimento</h2>
                        <p className="text-gray-500 text-xs font-medium italic mt-1">Histórico de chamados e solicitações.</p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      className="!py-3 !px-6 !text-xs gap-2 !rounded-2xl shadow-lg shadow-fiber-orange/20"
                      onClick={() =>
                        setNewTicketModalOpen(true)
                      }
                    >
                      <Plus size={18} /> Novo Chamado
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(dashboardData?.tickets || []).length > 0 ? (
                      [...(dashboardData?.tickets || [])]
                        .sort((a, b) => (b.data_abertura || "").localeCompare(a.data_abertura || ""))
                        .map((ticket) => (
                          <div
                            key={ticket.id}
                            className="bg-neutral-900/40 border border-white/5 rounded-[2rem] p-6 flex flex-col hover:bg-white/5 transition-all group"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                              <div className="flex items-center gap-5 w-full md:w-auto flex-1">
                                <div className="w-14 h-14 rounded-2xl bg-fiber-blue/10 text-fiber-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <MessageSquare size={28} />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-lg text-white group-hover:text-fiber-blue transition-colors">
                                    {ticket.assunto_nome || ticket.assunto}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">
                                      Protocolo: <span className="text-gray-400">#{ticket.protocolo}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">
                                      Data: <span className="text-gray-400">{ticket.data_abertura ? ticket.data_abertura.split(" ")[0].split("-").reverse().join("/") : "N/A"}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                                <span
                                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ticket.status === "F"
                                    ? "bg-fiber-green/10 text-fiber-green border-fiber-green/20"
                                    : "bg-fiber-orange/10 text-fiber-orange border-fiber-orange/20"
                                    }`}
                                >
                                  {ticket.status === "F" ? "Concluído" : "Aberto"}
                                </span>
                                {ticket.status !== "F" && (
                                  <Button
                                    variant="outline"
                                    className="!py-1.5 !px-3 !text-[10px] !rounded-full border-red-500/20 text-red-400 hover:bg-red-500/10"
                                    onClick={() => handleCloseTicket(Number(ticket.id))}
                                  >
                                    Finalizar Atendimento
                                  </Button>
                                )}
                              </div>
                            </div>

                            {(ticket.resolucao || ticket.mensagem) && (
                              <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                                {ticket.mensagem && (
                                  <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Sua Solicitação:</p>
                                    <p className="text-sm text-gray-300 bg-black/20 p-4 rounded-2xl italic">
                                      "{ticket.mensagem}"
                                    </p>
                                  </div>
                                )}
                                {ticket.resolucao && (
                                  <div>
                                    <p className="text-[10px] font-black text-fiber-green uppercase tracking-widest mb-2">Resolução Técnica:</p>
                                    <div className="text-sm text-fiber-green/90 bg-fiber-green/5 p-4 rounded-2xl border border-fiber-green/10">
                                      {ticket.resolucao}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-24 bg-neutral-900/30 rounded-[2.5rem] border border-dashed border-white/10">
                        <MessageSquare size={32} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">Nenhum chamado aberto</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "service_orders" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                    <div className="bg-fiber-orange/10 p-3 rounded-2xl text-fiber-orange">
                      <Wrench size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Ordens de Serviço</h2>
                      <p className="text-gray-500 text-xs font-medium italic mt-1">Visitas técnicas e reparos agendados.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(dashboardData?.ordensServico || []).length > 0 ? (
                      [...(dashboardData?.ordensServico || [])]
                        .sort((a, b) => (b.data_abertura || "").localeCompare(a.data_abertura || ""))
                        .map((os) => {
                          const contratoRelacionado = dashboardData?.contratos.find(
                            (c) => String(c.id) === String(os.id_contrato || os.contrato_id)
                          );

                          return (
                            <div
                              key={os.id}
                              className="bg-neutral-900/40 border border-white/5 rounded-[2rem] p-6 flex flex-col hover:bg-white/5 transition-all group"
                            >
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-5 w-full md:w-auto flex-1">
                                  <div className="w-14 h-14 rounded-2xl bg-fiber-orange/10 text-fiber-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Wrench size={28} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-lg text-white group-hover:text-fiber-orange transition-colors">
                                      {os.assunto_nome || os.assunto || "Serviço Técnico"}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">
                                        Protocolo: <span className="text-gray-400">#{os.protocolo}</span>
                                      </p>
                                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">
                                        Data: <span className="text-gray-400">{os.data_abertura ? os.data_abertura.split(" ")[0].split("-").reverse().join("/") : "N/A"}</span>
                                      </p>
                                      {contratoRelacionado && (
                                        <div className="flex items-center gap-1.5 bg-fiber-blue/5 px-2 py-1 rounded-md border border-fiber-blue/10">
                                          <MapPin size={12} className="text-fiber-blue" />
                                          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tight">
                                            {contratoRelacionado.endereco || `Contrato #${contratoRelacionado.id}`}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                                  <span
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${os.status === "F"
                                      ? "bg-fiber-green/10 text-fiber-green border-fiber-green/20"
                                      : "bg-fiber-orange/10 text-fiber-orange border-fiber-orange/20"
                                      }`}
                                  >
                                    {os.status === "F" ? "Realizada" : "Agendada"}
                                  </span>
                                </div>
                              </div>

                              {(os.resolucao || os.diagnostico) && (
                                <div className="mt-6 pt-6 border-t border-white/5">
                                  <p className="text-[10px] font-black text-fiber-orange uppercase tracking-widest mb-2">Relatório do Técnico:</p>
                                  <div className="text-sm text-gray-300 bg-black/20 p-4 rounded-2xl border border-white/5">
                                    {os.resolucao || os.diagnostico}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-24 bg-neutral-900/30 rounded-[2.5rem] border border-dashed border-white/10">
                        <Wrench size={32} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">Nenhuma ordem de serviço</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "consumption" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                    <div className="bg-fiber-orange/10 p-3 rounded-2xl text-fiber-orange">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Extrato de Consumo</h2>
                      <p className="text-gray-500 text-xs font-medium italic mt-1">Análise de tráfego de dados.</p>
                    </div>
                  </div>

                  {/* Seletor de Contrato (Idêntico ao Financeiro) */}
                  {dashboardData && dashboardData.contratos.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {dashboardData.contratos.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedContractId(c.id)}
                          className={`flex-shrink-0 px-5 py-3 rounded-2xl border transition-all text-left min-w-[200px] ${selectedContractId === c.id
                            ? "bg-fiber-blue border-fiber-blue text-white shadow-xl shadow-blue-900/30 ring-2 ring-white/10"
                            : "bg-neutral-950 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300"
                            }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                              Contrato #{c.id}
                            </span>
                            {c.status === "A" ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            )}
                          </div>
                          <div className="text-xs font-bold truncate">
                            {c.plano || c.descricao_aux_plano_venda}
                          </div>
                          <div className="text-[9px] mt-1 opacity-50 truncate">
                            {c.endereco}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="bg-neutral-900/30 border border-white/5 rounded-[2.5rem] p-4 md:p-8">
                    {(() => {
                      const login = dashboardData?.logins.find(l => String(l.contrato_id) === String(selectedContractId || (dashboardData?.contratos[0]?.id)));
                      const history = (login && diagnosticData[login.id]?.consumo?.history) || dashboardData?.consumo.history;
                      return <ConsumptionChart history={history} />;
                    })()}
                  </div>
                </div>
              )}

              {activeTab === "contracts" && dashboardData && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                    <div className="bg-fiber-orange/10 p-3 rounded-2xl text-fiber-orange">
                      <FileSignature size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Gestão de Contratos</h2>
                      <p className="text-gray-500 text-xs font-medium italic mt-1">Seus termos, planos e documentos formalizados.</p>
                    </div>
                  </div>

                  {/* Termos Pendentes de Assinatura */}
                  {(dashboardData.termos || []).filter((t) => t.status === "P").length > 0 && (
                    <div className="bg-fiber-orange/10 border border-fiber-orange/20 rounded-[2rem] p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-fiber-orange p-3 rounded-2xl text-white shadow-lg shadow-fiber-orange/30">
                          <AlertCircle size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Assinatura Pendente</h3>
                          <p className="text-gray-400 text-sm">Formalize seus documentos digitais para evitar interrupções.</p>
                        </div>
                      </div>
                      <div className="space-y-3 mt-6">
                        {dashboardData.termos
                          .filter((t) => t.status === "P")
                          .map((termo) => (
                            <div
                              key={termo.id}
                              className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4"
                            >
                              <span className="text-white font-bold text-lg">
                                {termo.titulo || `Termo de Adesão #${termo.id}`}
                              </span>
                              <Button
                                variant="primary"
                                className="!py-3 !px-8 !text-xs !rounded-xl shadow-lg shadow-fiber-orange/20"
                                onClick={() => handleSignContract(termo.id)}
                                disabled={isSigning}
                              >
                                {isSigning ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  "Assinar Documento Agora"
                                )}
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Listagem de Contratos */}
                  <div className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">Meus Planos e Serviços</h3>
                        <p className="text-gray-500 text-sm mt-1">Histórico completo de seus contratos ativos.</p>
                      </div>
                      <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-black text-fiber-green">
                            {dashboardData.contratos.filter((c) => c.status === "A").length}
                          </div>
                          <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Ativos</div>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-gray-600">
                            {dashboardData.contratos.filter((c) => c.status !== "A").length}
                          </div>
                          <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Inativos</div>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-white/5">
                      {dashboardData.contratos.map((contrato) => (
                        <div
                          key={contrato.id}
                          className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/5 transition-all group"
                        >
                          <div className="flex items-center gap-6 w-full md:w-auto flex-1">
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${contrato.status === "A"
                                ? "bg-fiber-green/10 text-fiber-green"
                                : "bg-red-500/10 text-red-500"
                                }`}
                            >
                              <FileSignature size={28} />
                            </div>
                            <div>
                              <p className="font-bold text-xl text-white">
                                {contrato.descricao_aux_plano_venda || "Plano de Internet"}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-1">
                                <p className="text-xs text-gray-500 font-black uppercase tracking-widest">
                                  Contrato: <span className="text-gray-400">#{contrato.id}</span>
                                </p>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${contrato.status === "A" ? "bg-fiber-green/10 text-fiber-green" : "bg-red-500/10 text-red-500"
                                  }`}>
                                  {contrato.status === "A" ? "Ativo" : "Inativo"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button
                              variant="outline"
                              className="!py-3 !px-6 !text-xs gap-3 !rounded-2xl border-white/10 hover:border-fiber-blue hover:text-fiber-blue transition-all"
                              onClick={() => handleDownloadContrato(contrato.id)}
                              disabled={downloadingContractId === contrato.id}
                            >
                              {downloadingContractId === contrato.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Printer size={16} />
                              )}
                              Visualizar Contrato
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "connections" && dashboardData && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Minhas Conexões e Diagnóstico
                  </h2>
                  <div className="space-y-6">
                    {dashboardData.logins.map((login) => {
                      const diag = diagnosticData[login.id]; // Dados do diagnóstico realizado

                      return (
                        <div
                          key={login.id}
                          className="bg-neutral-900 border border-white/10 rounded-2xl p-6"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {login.login}
                              </h3>
                              <p className="text-[10px] text-gray-500 font-mono mt-1">
                                {login.ont_modelo || "Equipamento Fiber.Net"}
                              </p>
                            </div>
                            <div
                              className={`flex items-center gap-2 font-bold text-sm px-4 py-1.5 rounded-full border ${login.online === "S"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                }`}
                            >
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${login.online === "S"
                                  ? "bg-green-400 animate-pulse"
                                  : "bg-gray-500"
                                  }`}
                              ></div>
                              {login.online === "S" ? "Online" : "Desconectado"}
                            </div>
                          </div>

                          {/* RESULTADO DO DIAGNÓSTICO RICO (Se houver) */}
                          {diag ? (
                            <div className="mb-6 bg-black/40 border border-fiber-blue/30 rounded-xl p-5 animate-fadeIn">
                              <h4 className="text-xs font-bold text-fiber-blue mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <Activity size={14} /> Laudo Técnico de Conexão
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                  <p className="text-[9px] text-gray-500 uppercase font-black mb-1">
                                    Nível de Sinal
                                  </p>
                                  <p
                                    className={`text-xl font-bold ${parseFloat(diag.sinal_dbm) < -25
                                      ? "text-red-400"
                                      : "text-green-400"
                                      }`}
                                  >
                                    {diag.sinal_dbm ||
                                      login.ont_sinal_rx ||
                                      "N/A"}{" "}
                                    <span className="text-[10px] font-normal text-gray-400 italic">
                                      dBm
                                    </span>
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-500 uppercase font-black mb-1">
                                    Equipamento
                                  </p>
                                  <p className="text-sm text-white font-bold">
                                    {diag.status_onu || "Operacional"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-500 uppercase font-black mb-1">
                                    Identificador Físico
                                  </p>
                                  <p className="text-xs text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                                    {diag.mac_onu || login.ont_mac || "--"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-500 uppercase font-black mb-1">
                                    Última Verificação
                                  </p>
                                  <p className="text-xs text-white">
                                    {diag.ultima_conexao
                                      ? diag.ultima_conexao
                                        .split(" ")[0]
                                        .split("-")
                                        .reverse()
                                        .join("/")
                                      : "Tempo Real"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-gray-500 uppercase font-black">
                                  Interface
                                </span>
                                <span className="text-white flex items-center gap-2">
                                  <Server size={14} className="text-gray-500" />{" "}
                                  Fibra Óptica
                                </span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-gray-500 uppercase font-black">
                                  Sinal RX
                                </span>
                                <span className="text-white font-bold">
                                  {login.sinal_ultimo_atendimento || "- dBm"}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-gray-500 uppercase font-black">
                                  Uptime
                                </span>
                                <span className="text-white font-mono">
                                  {login.tempo_conectado || "N/A"}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-gray-500 uppercase font-black">
                                  Endereço IP
                                </span>
                                <span className="text-white font-mono text-xs">
                                  {login.ip_privado || "--"}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-3">
                            {login.online !== "S" && (
                              <Button
                                onClick={() => {
                                  const contratoId = Number(login.contrato_id);
                                  if (contratoId) handleUnlockContract(contratoId);
                                }}
                                variant="primary"
                                className="!text-xs !py-2.5 !px-5 gap-2 !rounded-xl !bg-amber-600 hover:!bg-amber-700 shadow-lg shadow-amber-900/20"
                                disabled={unlockingId === Number(login.contrato_id)}
                              >
                                {unlockingId === Number(login.contrato_id) ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Unlock size={14} />
                                )}
                                Desbloqueio de Confiança
                              </Button>
                            )}
                            <Button
                              onClick={() =>
                                performLoginAction(login.id, "limpar-mac")
                              }
                              variant="secondary"
                              className="!text-xs !py-2.5 !px-5 gap-2 !rounded-xl"
                              disabled={
                                actionStatus[login.id]?.status === "loading"
                              }
                            >
                              {actionStatus[login.id]?.status ===
                                "loading" ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <RefreshCw size={14} />
                              )}{" "}
                              Atualizar MAC
                            </Button>
                            <Button
                              onClick={() =>
                                performLoginAction(login.id, "desconectar")
                              }
                              variant="secondary"
                              className="!text-xs !py-2.5 !px-5 gap-2 !rounded-xl"
                              disabled={
                                actionStatus[login.id]?.status === "loading"
                              }
                            >
                              {actionStatus[login.id]?.status ===
                                "loading" ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Power size={14} />
                              )}{" "}
                              Reiniciar Conexão
                            </Button>
                            <Button
                              onClick={() =>
                                handleAdvancedDiagnostic(
                                  login.contrato_id,
                                  login.id,
                                )
                              }
                              variant="outline"
                              className="!text-xs !py-2.5 !px-5 gap-2 !rounded-xl border-fiber-blue text-fiber-blue hover:!bg-fiber-blue hover:!text-white transition-all shadow-lg shadow-blue-900/10"
                              disabled={
                                actionStatus[login.id]?.status === "loading"
                              }
                            >
                              {actionStatus[login.id]?.status ===
                                "loading" ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Signal size={14} />
                              )}{" "}
                              Diagnóstico Avançado
                            </Button>
                          </div>
                          {actionStatus[login.id]?.status === "success" &&
                            !diag && (
                              <p className="text-green-500 text-xs mt-3">
                                {actionStatus[login.id]?.message}
                              </p>
                            )}
                          {actionStatus[login.id]?.status === "error" && (
                            <p className="text-red-500 text-xs mt-3">
                              {actionStatus[login.id]?.message}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                    <div className="bg-fiber-orange/10 p-3 rounded-2xl text-fiber-orange">
                      <ScrollText size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Notas Fiscais</h2>
                      <p className="text-gray-500 text-xs font-medium italic mt-1">Comprovantes de prestação de serviços.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(dashboardData?.notas || []).length > 0 ? (
                      [...(dashboardData?.notas || [])]
                        .sort((a, b) => (b.data_emissao || "").localeCompare(a.data_emissao || ""))
                        .map((nota) => (
                          <div
                            key={nota.id}
                            className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/5 transition-all group"
                          >
                            <div className="flex items-center gap-5 w-full md:w-auto flex-1">
                              <div className="w-14 h-14 rounded-2xl bg-white/5 text-gray-400 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:text-fiber-orange">
                                <ScrollText size={28} />
                              </div>
                              <div>
                                <p className="font-bold text-lg text-white">
                                  Nota Fiscal #{nota.numero_nota}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 mt-1">
                                  <p className="text-xs text-gray-500 uppercase font-black tracking-wider">
                                    Emissão: <span className="text-gray-400">{nota.data_emissao}</span>
                                  </p>
                                  <div className="bg-white/5 px-3 py-1 rounded-lg border border-white/5 text-fiber-green font-mono font-bold text-sm">
                                    R$ {nota.valor}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                              {nota.link_pdf && (
                                <Button
                                  variant="outline"
                                  className="!py-2.5 !px-6 !text-xs gap-2 !rounded-xl border-white/10 hover:border-fiber-blue hover:text-fiber-blue transition-all"
                                  onClick={() => window.open(nota.link_pdf, "_blank")}
                                >
                                  <Download size={16} /> Visualizar PDF
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-24 bg-neutral-900/30 rounded-[2.5rem] border border-dashed border-white/10">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ScrollText size={32} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-bold text-lg">Nenhuma nota fiscal</p>
                        <p className="text-gray-600 text-sm mt-1">Você ainda não possui notas fiscais registradas no sistema.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                    <div className="bg-fiber-orange/10 p-3 rounded-2xl text-fiber-orange">
                      <Settings size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Configurações</h2>
                      <p className="text-gray-500 text-xs font-medium italic mt-1">Gerencie seu perfil e preferências de acesso.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Alterar Senha */}
                    <div className="bg-neutral-900/40 border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-fiber-orange/10 text-fiber-orange flex items-center justify-center">
                          <Lock size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Segurança</h3>
                          <p className="text-gray-500 text-xs">Atualize sua senha de acesso periodicamente.</p>
                        </div>
                      </div>

                      <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nova Senha</label>
                          <div className="relative">
                            <input
                              type={showNewPass ? "text" : "password"}
                              name="novaSenha"
                              placeholder="Mínimo 6 caracteres"
                              required
                              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-12 text-white focus:ring-2 focus:ring-fiber-orange/50 transition-all outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPass(!showNewPass)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                              {showNewPass ? <Unlock size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>

                        <Button type="submit" variant="primary" fullWidth className="!py-4 !rounded-2xl font-black shadow-lg shadow-fiber-orange/20">
                          Salvar Alterações
                        </Button>
                      </form>

                      {passwordChangeStatus && (
                        <div className={`mt-6 p-4 rounded-2xl text-sm font-bold border animate-fadeIn ${passwordChangeStatus.type === "success"
                          ? "bg-fiber-green/10 border-fiber-green/20 text-fiber-green"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}>
                          {passwordChangeStatus.message}
                        </div>
                      )}
                    </div>

                    {/* Informações da Conta */}
                    <div className="bg-neutral-900/40 border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-fiber-blue/10 text-fiber-blue flex items-center justify-center">
                            <Mail size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">Dados de Contato</h3>
                            <p className="text-gray-500 text-xs">E-mail vinculado à sua conta Fiber.Net.</p>
                          </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">E-mail Cadastrado</p>
                          <p className="text-white font-bold">{dashboardData?.clientes[0]?.email || "Não informado"}</p>
                        </div>
                      </div>

                      <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-xs text-gray-500 leading-relaxed italic text-center">
                          Para alterar dados cadastrais como endereço ou telefone, entre em contato com nossa central de atendimento.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setNewTicketModalOpen(false)}
        onSuccess={() => {
          alert("Seu chamado foi registrado com sucesso! Em breve, um de nossos especialistas entrará em contato.");
          fetchDashboardData();
        }}
        clientId={dashboardData?.clientes[0]?.id || 0}
      />

      {isPixModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-fiber-card border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setPixModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-white text-center mb-2">
              Pagamento via Pix
            </h3>
            <p className="text-gray-400 text-center text-sm mb-8">
              Aponte a câmera do seu celular para o QR Code ou utilize a opção "Pix Copia e Cola".
            </p>

            <div className="bg-white p-6 rounded-2xl mx-auto w-fit mb-8 shadow-inner flex items-center justify-center">
              {activePixImage && activePixImage.length > 50 ? (
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
                <QrCode values={activePixCode} size={200} />
              ) : (
                <QrCodeIcon
                  size={200}
                  className="text-neutral-900 opacity-10"
                />
              )}
            </div>

            <div className="bg-neutral-900 p-4 rounded-xl mb-8 max-h-24 overflow-y-auto custom-scrollbar border border-white/5">
              <p className="text-[10px] text-gray-500 font-mono break-all leading-relaxed">
                {activePixCode}
              </p>
            </div>

            <Button
              onClick={handleCopyPix}
              fullWidth
              className="!py-4 gap-3 !bg-fiber-green hover:!bg-green-600 !rounded-xl shadow-lg shadow-green-900/20"
            >
              {isPixCopied ? (
                <>
                  <CheckCircle size={20} /> Código copiado!
                </>
              ) : (
                <>
                  <Copy size={20} /> Pix Copia e Cola
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientArea;
