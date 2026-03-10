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
  Router,
  ScrollText,
  Server,
  Settings,
  Signal,
  Unlock,
  Wifi,
  Wrench,
  X
} from "lucide-react";
import React, { useEffect, useState } from "react";
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
    alert("Erro ao processar o arquivo PDF.");
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
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                period === "daily"
                  ? "bg-fiber-orange text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Diário
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                period === "monthly"
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

// === MAIN COMPONENT ===
const ClientArea: React.FC = () => {
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
  const [downloadingContractId, setDownloadingContractId] = useState<
    number | null
  >(null);
  const [activePixCode, setActivePixCode] = useState("");
  const [activePixImage, setActivePixImage] = useState("");
  const [loadingPixId, setLoadingPixId] = useState<number | null>(null);
  const [isPixCopied, setIsPixCopied] = useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("aberto");
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<number | null>(null); // <--- NOVO
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

  // Chat AI State
  // const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
  //   {
  //     id: "1",
  //     sender: "bot",
  //     text: "Olá! Sou a IA da Fiber.Net. Como posso ajudar você hoje?",
  //     timestamp: new Date(),
  //   },
  // ]);
  // const [chatInput, setChatInput] = useState("");
  // const chatEndRef = useRef<HTMLDivElement>(null);

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      setLoginError(error.message || "Falha na autenticação.");
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
        "Deseja utilizar o Desbloqueio de Confiança? Sua internet será liberada temporariamente.",
      )
    )
      return;

    setUnlockingId(idContrato);
    try {
      const response = await apiService.unlockContract(idContrato);
      alert(
        response.message ||
          "Desbloqueio realizado com sucesso! Aguarde alguns minutos e reinicie seu roteador.",
      );
      fetchDashboardData(); // Atualiza status
    } catch (error: any) {
      alert(error.message || "Não foi possível realizar o desbloqueio.");
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
        [loginId]: { status: "error", message: "Falha no diagnóstico" },
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
    if (!window.confirm("Você confirma a assinatura digital deste contrato?"))
      return;

    setIsSigning(true);
    try {
      await apiService.assinarContrato(idTermo);
      alert("Contrato assinado com sucesso!");
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || "Erro ao assinar contrato.");
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

  // const handleSendMessage = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!chatInput.trim()) return;

  //   const userMsg: ChatMessage = {
  //     id: Date.now().toString(),
  //     sender: "user",
  //     text: chatInput,
  //     timestamp: new Date(),
  //   };
  //   setChatMessages((prev) => [...prev, userMsg]);
  //   setChatInput("");

  //   try {
  //     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  //     const response = await ai.models.generateContent({
  //       model: "gemini-3-flash-preview",
  //       contents: chatInput,
  //       config: {
  //         systemInstruction: `Você é o assistente virtual da Fiber.Net.`,
  //       },
  //     });

  //     const botText =
  //       response.text ||
  //       "Desculpe, não consegui processar sua resposta no momento.";

  //     const botMsg: ChatMessage = {
  //       id: (Date.now() + 1).toString(),
  //       sender: "bot",
  //       text: botText,
  //       timestamp: new Date(),
  //     };
  //     setChatMessages((prev) => [...prev, botMsg]);
  //   } catch (error: any) {
  //     console.error("Gemini AI Error:", error);
  //     const errorMsg: ChatMessage = {
  //       id: (Date.now() + 1).toString(),
  //       sender: "bot",
  //       text: "Desculpe, estou enfrentando instabilidade técnica.",
  //       timestamp: new Date(),
  //     };
  //     setChatMessages((prev) => [...prev, errorMsg]);
  //   } finally {
  //   }
  // };

  const handleDownloadPdf = async (faturaId: number) => {
    try {
      const response = await apiService.getSegundaVia(faturaId);
      // CORREÇÃO: Removemos 'response.success' pois o tipo retornado é apenas { base64_document }
      if (response && response.base64_document) {
        downloadBase64Pdf(response.base64_document, `Fatura-${faturaId}.pdf`);
      } else {
        alert("Ocorreu um erro: PDF não disponível.");
      }
    } catch (error) {
      console.error("Erro ao baixar fatura:", error);
      alert("Não foi possível baixar a fatura no momento.");
    }
  };

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
      if (!token) setDashboardData(null); // Limpa dados antigos
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

  // useEffect(() => {
  //   if (activeTab === "ai_support" && chatEndRef.current) {
  //     chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [chatMessages, activeTab]);

  const abrirModalPixInterface = (codigo: string, image?: string) => {
    if (!codigo) {
      alert("Erro: Código PIX vazio.");
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
    // 1. Se já tem o código, abre direto
    if (boleto.pixCopiaECola) {
      abrirModalPixInterface(
        boleto.pixCopiaECola,
        boleto.pixImagem || undefined,
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
          "O sistema financeiro ainda não gerou o QR Code para esta fatura.",
        );
      }
    } catch (e) {
      console.error("Erro Pix:", e);
      alert("Erro ao conectar servidor para gerar Pix.");
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
      handlePdfBase64 (data.base64_document, `contrato-fiber-${id}.pdf`, 'view');
    } catch (error) {
      console.error("Erro ao baixar contrato:", error);
      alert("Erro ao baixar o contrato. Tente novamente mais tarde.");
    } finally {
      setDownloadingContractId(null);
    }
  };

  const faturasAbertas =
    dashboardData?.faturas.filter((f) => f.status === "A").length || 0;

  const TABS = [
    { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard },
    // { id: "ai_support", label: "Suporte IA", icon: Bot, badge: "NOVO" },
    { id: "invoices", label: "Faturas", icon: FileText, badge: faturasAbertas },
    { id: "tickets", label: "Suporte", icon: MessageSquare },
    { id: "service_orders", label: "Ordens de Serviço", icon: Wrench },
    { id: "connections", label: "Conexões", icon: Wifi },
    { id: "consumption", label: "Extrato", icon: BarChart3 },
    { id: "contracts", label: "Contratos", icon: FileSignature },
    { id: "notes", label: "Notas Fiscais", icon: ScrollText },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  // === CÁLCULO DE JUROS E MULTA ===
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
                Acesse sua conta para gerenciar seus serviços.
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
                    placeholder="Seu e-mail"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 pl-12 text-white focus:ring-1 focus:ring-fiber-orange"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showLoginPass ? "text" : "password"}
                    name="password"
                    placeholder="Sua senha"
                    required
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 pl-12 pr-10 text-white focus:ring-1 focus:ring-fiber-orange"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <Eye size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-fiber-orange rounded bg-neutral-900"
                    />
                    Salvar login
                  </label>
                  <button
                    type="button"
                    onClick={() => setLoginView("forgot")}
                    className="text-fiber-orange hover:underline"
                  >
                    Esqueci a senha
                  </button>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    "Acessar"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => setLoginView("login")}
                className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                Recuperar Senha
              </h2>
              {recoveryStatus !== "success" ? (
                <form onSubmit={handleRecovery} className="space-y-6">
                  <input
                    type="email"
                    name="recoveryEmail"
                    placeholder="E-mail do cadastro"
                    required
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white"
                  />
                  {recoveryStatus === "error" && (
                    <p className="text-red-400 text-sm text-center">
                      {recoveryMessage}
                    </p>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={recoveryStatus === "loading"}
                  >
                    {recoveryStatus === "loading" ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      "Enviar"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center">
                  <CheckCircle
                    size={32}
                    className="text-green-500 mx-auto mb-4"
                  />
                  <p className="text-white">{recoveryMessage}</p>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setLoginView("login")}
                    className="mt-4"
                  >
                    Voltar
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              Olá, {dashboardData?.clientes[0]?.nome?.split(" ")[0]}!
              {isRefetching && (
                <Loader2 size={16} className="text-fiber-orange animate-spin" />
              )}
            </h1>
            <p className="text-gray-400">
              Bem-vindo(a) à sua central de controle unificada.
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="!py-2 !px-4 text-sm gap-2"
          >
            <LogOut size={16} /> Sair
          </Button>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4 lg:sticky top-24 self-start">
            <div className="bg-fiber-card border border-white/10 rounded-2xl p-4 space-y-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg text-left transition-colors font-medium text-sm ${
                    activeTab === tab.id
                      ? "bg-fiber-orange text-white shadow-md"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={18} /> {tab.label}
                  </div>
                  {tab.badge && (
                    <span className="bg-white text-fiber-orange text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          <main className="w-full lg:w-3/4">
            {/* === NOTIFICAÇÃO GERAL DE DÉBITOS === */}
            {(() => {
              const totalGeralDivida = (dashboardData?.faturas || [])
                .filter((f) => f.status === "A")
                .reduce(
                  (acc, curr) =>
                    acc + parseFloat(String(curr.valor).replace(",", ".")),
                  0,
                );

              if (totalGeralDivida > 0) {
                return (
                  <div className="mb-6 bg-red-600 text-white p-6 rounded-2xl shadow-xl animate-pulse flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-full">
                        <AlertCircle className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">
                          Atenção: Existem débitos pendentes
                        </p>
                        <p className="text-sm text-white/90">
                          Valor total acumulado:{" "}
                          <span className="font-black text-2xl ml-1">
                            {totalGeralDivida.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setActiveTab("invoices")}
                      className="!bg-white !text-red-600 !px-8 !py-3 !rounded-xl !font-bold !text-sm hover:!bg-gray-100 transition-colors whitespace-nowrap shadow-md"
                    >
                      Resolver Agora
                    </Button>
                  </div>
                );
              }
              return null;
            })()}
            <div className="lg:hidden shrink-0 overflow-x-auto whitespace-nowrap p-4 mb-6 flex gap-2 bg-fiber-card border border-white/10 rounded-2xl">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    activeTab === tab.id
                      ? "bg-fiber-orange text-white"
                      : "bg-neutral-900 text-gray-400"
                  }`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-fiber-card border border-white/10 rounded-2xl p-6 md:p-8 min-h-[500px] animate-fadeIn">
              {/* === DASHBOARD (VISÃO GERAL) === */}
              {activeTab === "dashboard" && dashboardData && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <LayoutDashboard className="text-fiber-orange" /> Visão
                    Geral
                  </h2>

                  <AIInsights data={dashboardData.ai_analysis} />

                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-neutral-900 p-5 rounded-2xl border border-white/5 shadow-inner">
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">
                        Contratos Ativos
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-white">
                          {
                            dashboardData.contratos.filter(
                              (c) => c.status === "A",
                            ).length
                          }
                        </span>
                        <div className="p-2 bg-fiber-orange/10 rounded-lg text-fiber-orange">
                          <FileSignature size={20} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-neutral-900 p-5 rounded-2xl border border-white/5 shadow-inner">
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">
                        Equipamentos Online
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-white">
                          {
                            dashboardData.logins.filter((l) => l.online === "S")
                              .length
                          }
                        </span>
                        <div className="p-2 bg-fiber-green/10 rounded-lg text-fiber-green">
                          <Router size={20} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-neutral-900 p-5 rounded-2xl border border-white/5 shadow-inner">
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">
                        Faturas em Aberto
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-white">
                          {
                            dashboardData.faturas.filter(
                              (f) => f.status === "A",
                            ).length
                          }
                        </span>
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                          <FileText size={20} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-neutral-900 p-5 rounded-2xl border border-white/5 shadow-inner">
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">
                        Vencimento Próximo
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white truncate max-w-[100px]">
                          {dashboardData.faturas
                            .filter((f) => f.status === "A")
                            .sort((a, b) =>
                              a.data_vencimento.localeCompare(
                                b.data_vencimento,
                              ),
                            )[0]
                            ?.data_vencimento.split("-")
                            .reverse()
                            .join("/") || "--/--"}
                        </span>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          <Calendar size={20} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Combined Connections List */}
                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <Activity size={20} className="text-fiber-orange" />{" "}
                      Status da Rede em Tempo Real
                    </h3>
                    <div className="space-y-3">
                      {dashboardData.logins.map((login) => (
                        <div
                          key={login.id}
                          className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                login.online === "S"
                                  ? "bg-fiber-green animate-pulse"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            <div>
                              <p className="font-bold text-white text-sm">
                                {login.login}
                              </p>
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                {login.ont_modelo || "Equipamento Fibra"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-[9px] text-gray-500 uppercase font-black">
                                Sinal RX
                              </p>
                              <p
                                className={`text-xs font-bold ${
                                  parseFloat(login.sinal_ultimo_atendimento) <
                                  -27
                                    ? "text-red-400"
                                    : "text-fiber-green"
                                }`}
                              >
                                {login.sinal_ultimo_atendimento || "- dBm"}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] text-gray-500 uppercase font-black">
                                Uptime
                              </p>
                              <p className="text-xs text-white font-mono">
                                {login.tempo_conectado || "--"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Combined Pending Invoices with Detailed Delay Info */}
                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <FileText size={20} className="text-fiber-orange" />{" "}
                      Faturas e Cobranças Pendentes
                    </h3>
                    <div className="space-y-4">
                      {dashboardData.faturas.filter((f) => f.status === "A")
                        .length > 0 ? (
                        dashboardData.faturas
                          .filter((f) => f.status === "A")
                          // ORDENAÇÃO CRONOLÓGICA (Antigo -> Novo)
                          .sort((a, b) =>
                            a.data_vencimento.localeCompare(b.data_vencimento),
                          )
                          .map((fatura) => {
                            // --- LÓGICA DE CÁLCULO ---
                            const valorNum =
                              typeof fatura.valor === "string"
                                ? parseFloat(fatura.valor.replace(",", "."))
                                : Number(fatura.valor);

                            const estimativa = calcularEstimativa(
                              valorNum,
                              fatura.data_vencimento,
                            );

                            const hoje = new Date();
                            hoje.setHours(0, 0, 0, 0);

                            const dataSegura = fatura.data_vencimento.includes(
                              "T",
                            )
                              ? fatura.data_vencimento
                              : fatura.data_vencimento + "T12:00:00";

                            const venc = new Date(dataSegura);
                            venc.setHours(0, 0, 0, 0);

                            const diffTime = venc.getTime() - hoje.getTime();
                            const dias = Math.ceil(
                              diffTime / (1000 * 60 * 60 * 24),
                            );

                            // --- RENDERIZAÇÃO DO CARD ---
                            return (
                              <div
                                key={fatura.id}
                                className="flex flex-col md:flex-row justify-between items-center bg-white/5 p-5 rounded-2xl border-l-4 border-fiber-orange hover:bg-white/10 transition-colors gap-6"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <p className="text-white font-black text-xl">
                                      R${" "}
                                      {valorNum.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                      })}
                                    </p>
                                    {dias < 0 ? (
                                      <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-red-500/30">
                                        Vencida
                                      </span>
                                    ) : (
                                      <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-green-500/30">
                                        Aberta
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                                    <Calendar
                                      size={12}
                                      className="text-fiber-orange"
                                    />{" "}
                                    Vencimento:{" "}
                                    {fatura.data_vencimento
                                      .split("-")
                                      .reverse()
                                      .join("/")}
                                  </p>
                                  <p className="text-xs font-bold mt-1">
                                    {dias < 0 ? (
                                      <span className="text-red-400">
                                        Vencido há {Math.abs(dias)} dias
                                      </span>
                                    ) : dias === 0 ? (
                                      <span className="text-yellow-400">
                                        Vence hoje!
                                      </span>
                                    ) : (
                                      <span className="text-fiber-blue">
                                        Vence em {dias} dias
                                      </span>
                                    )}
                                  </p>

                                  {estimativa && (
                                    <div className="mt-3 pt-3 border-t border-white/5">
                                      <p className="text-[10px] text-gray-500 uppercase font-black mb-1">
                                        Cálculo de Atraso Estimado
                                      </p>
                                      <div className="flex gap-4 text-xs">
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
                                        <span className="text-fiber-orange font-bold">
                                          Total Atualizado:{" "}
                                          {estimativa.totalAtualizado}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex md:flex-col lg:flex-row gap-2 w-full md:w-auto">
                                  <button
                                    onClick={() =>
                                      handleOpenPixModal(
                                        fatura as unknown as BoletoView,
                                      )
                                    }
                                    disabled={loadingPixId === fatura.id}
                                    className="flex-1 flex items-center justify-center gap-2 bg-fiber-green text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-green-600 transition shadow-lg shadow-green-900/20"
                                  >
                                    {loadingPixId === fatura.id ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <QrCode size={16} />
                                    )}
                                    Pagar com PIX
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleCopy(
                                        fatura.linha_digitavel || "",
                                        fatura.id,
                                      )
                                    }
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition border ${
                                      copiedInvoiceId === fatura.id
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : "bg-white/10 text-white hover:bg-white/20 border-white/10"
                                    }`}
                                  >
                                    {copiedInvoiceId === fatura.id ? (
                                      <>
                                        <CheckCircle size={16} /> COPIADO!
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={16} /> CÓDIGO
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleDownloadPdf(fatura.id)}
                                    className="p-2.5 bg-neutral-800 text-gray-400 hover:text-white rounded-xl transition border border-white/5"
                                    title="Baixar PDF"
                                  >
                                    <Download size={18} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="text-center py-10 bg-black/20 rounded-2xl border border-dashed border-white/5">
                          <CheckCircle
                            className="mx-auto text-fiber-green mb-3"
                            size={40}
                          />
                          <p className="text-gray-400 font-medium">
                            Parabéns! Você não possui faturas pendentes no
                            momento.
                          </p>
                        </div>
                      )}
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
                      Financeiro & Contratos
                    </h2>
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-2 mb-6 bg-neutral-900 p-1.5 rounded-xl border border-white/5 w-fit">
                    {["aberto", "pago", "todos"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setInvoiceStatusFilter(s)}
                        className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                          invoiceStatusFilter === s
                            ? "bg-fiber-orange text-white shadow"
                            : "bg-transparent text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {s === "aberto"
                          ? "Pendentes"
                          : s === "pago"
                            ? "Histórico"
                            : "Ver Tudo"}
                      </button>
                    ))}
                  </div>

                  {/* Seletor de Contrato (Destaque quando houver múltiplos) */}
                  {dashboardData && dashboardData.contratos.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                      {dashboardData.contratos.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedContractId(c.id)}
                          className={`flex-shrink-0 px-5 py-3 rounded-2xl border transition-all text-left min-w-[200px] ${
                            selectedContractId === c.id
                              ? "bg-fiber-blue border-fiber-blue text-white shadow-xl shadow-blue-900/30 ring-2 ring-white/10"
                              : "bg-neutral-950 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                              ID: {c.id}
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

                  {/* Lista por Contrato */}
                  {dashboardData?.contratos
                    .filter(
                      (c) =>
                        selectedContractId === null ||
                        c.id === selectedContractId,
                    )
                    .map((contrato) => {
                      // Busca faturas deste contrato (Fix: Checa id_contrato e contrato_id)
                      const faturasContrato = (
                        dashboardData?.faturas || []
                      ).filter((f) => {
                        const fContratoId = f.id_contrato || f.contrato_id;
                        return (
                          String(fContratoId) === String(contrato.id) &&
                          f.status !== "C" &&
                          (invoiceStatusFilter === "todos" ||
                            (invoiceStatusFilter === "aberto"
                              ? f.status === "A"
                              : f.status === "P" || f.status === "R"))
                        );
                      });

                    // Busca login associado
                    const loginAssociado = dashboardData.logins.find(
                      (l) => String(l.contrato_id) === String(contrato.id),
                    );

                    // Se não tiver faturas no filtro e não for 'todos', pula
                    if (
                      faturasContrato.length === 0 &&
                      invoiceStatusFilter !== "todos"
                    )
                      return null;

                    return (
                      <div
                        key={contrato.id}
                        className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-sm mb-8 animate-fadeIn"
                      >
                        {/* CABEÇALHO DO CONTRATO (Endereço + Login + Status) */}
                        <div className="bg-white/5 p-6 border-b border-white/10">
                          <div className="flex flex-col lg:flex-row justify-between gap-6">
                            {/* Informações do Plano e Endereço */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-fiber-orange text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                                  {contrato.plano || contrato.descricao_aux_plano_venda}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-1 rounded border ${
                                    contrato.status === "A"
                                      ? "border-green-500/30 text-green-400 bg-green-500/10"
                                      : "border-red-500/30 text-red-400 bg-red-500/10"
                                  }`}
                                >
                                  {contrato.status === "A"
                                    ? "ATIVO"
                                    : "BLOQUEADO"}
                                </span>
                              </div>

                              <div className="text-gray-300 text-sm mb-2 font-medium flex items-center gap-2">
                                <MapPin size={14} className="text-gray-500" />
                                {contrato.endereco}, {contrato.numero} -{" "}
                                {contrato.bairro}
                              </div>

                              <div className="text-xs text-gray-500 font-mono bg-black/40 px-2 py-1 rounded border border-white/5 inline-block">
                                Login PPPoE:{" "}
                                <strong className="text-white">
                                  {loginAssociado?.login || "Não identificado"}
                                </strong>
                              </div>
                            </div>

                            {/* Ações (Desbloqueio) */}
                            <div className="flex items-center gap-3">
                              {contrato.status !== "A" && (
                                <Button
                                  variant="primary"
                                  className="!bg-amber-600 hover:!bg-amber-700 !py-2.5 !px-5 !text-xs gap-2 shadow-lg shadow-amber-950/20"
                                  onClick={() =>
                                    handleUnlockContract(contrato.id)
                                  }
                                  disabled={unlockingId === contrato.id}
                                >
                                  {unlockingId === contrato.id ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Unlock size={14} />
                                  )}
                                  DESBLOQUEIO DE CONFIANÇA
                                </Button>
                              )}

                              {/* Botão de Assinatura (se pendente) */}
                              {dashboardData.termos.some(
                                (t) =>
                                  String(t.id_contrato) ===
                                    String(contrato.id) && t.status === "P",
                              ) && (
                                <Button
                                  variant="primary"
                                  className="!bg-fiber-blue hover:!bg-blue-600 !py-2.5 !px-5 !text-xs gap-2"
                                  onClick={() => {
                                    const termo = dashboardData.termos.find(
                                      (t) =>
                                        String(t.id_contrato) ===
                                          String(contrato.id) &&
                                        t.status === "P",
                                    );
                                    if (termo) handleSignContract(termo.id);
                                  }}
                                  disabled={isSigning}
                                >
                                  {isSigning ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <FileSignature size={14} />
                                  )}
                                  ASSINAR CONTRATO
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* LISTA DE FATURAS DESTE CONTRATO */}
                        <div className="p-4 space-y-3 bg-black/20">
                          {faturasContrato.length > 0 ? (
                            faturasContrato.map((invoice) => (
                              <div
                                key={invoice.id}
                                className="bg-neutral-900 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center hover:bg-white/5 transition gap-4"
                              >
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                  <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      invoice.status === "P" ||
                                      invoice.status === "R"
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-fiber-orange/10 text-fiber-orange"
                                    }`}
                                  >
                                    {invoice.status === "P" ||
                                    invoice.status === "R" ? (
                                      <CheckCircle size={20} />
                                    ) : (
                                      <Clock size={20} />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white">
                                      R$ {invoice.valor}
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">
                                      Venc: {invoice.data_vencimento}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  {invoice.status === "A" && (
                                    <Button
                                      variant="primary"
                                      onClick={() =>
                                        handleOpenPixModal(
                                          invoice as unknown as BoletoView,
                                        )
                                      }
                                      disabled={loadingPixId === invoice.id}
                                      className="!py-1.5 !px-3 !text-[10px] !rounded-lg !bg-fiber-green hover:!bg-green-600 flex-1 sm:flex-none"
                                    >
                                      {loadingPixId === invoice.id ? (
                                        <Loader2
                                          size={12}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        "PIX"
                                      )}
                                    </Button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleDownloadPdf(invoice.id)
                                    }
                                    className="p-2 bg-white/5 text-gray-500 hover:text-white rounded-lg border border-white/5"
                                  >
                                    <Download size={14} />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 py-6 text-sm italic">
                              Nenhuma fatura para exibir neste filtro.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "tickets" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Suporte e Atendimento
                    </h2>
                    <Button
                      variant="primary"
                      className="!py-2 !px-4 !text-xs gap-2 !rounded-xl"
                      onClick={() =>
                        alert("Funcionalidade de criação de ticket em breve!")
                      }
                    >
                      <Plus size={16} /> Novo Atendimento
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {(dashboardData?.tickets || []).length > 0 ? (
                      dashboardData?.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-neutral-900 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 rounded-xl bg-fiber-blue/10 text-fiber-blue flex items-center justify-center">
                              <MessageSquare size={24} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-lg text-white">
                                {ticket.assunto_nome || ticket.assunto}
                              </p>
                              <p className="text-xs text-gray-500 uppercase font-black mt-1">
                                Protocolo: {ticket.protocolo} | Aberto em:{" "}
                                {ticket.data_abertura
                                  ? ticket.data_abertura
                                      .split(" ")[0]
                                      .split("-")
                                      .reverse()
                                      .join("/")
                                  : "N/A"}
                              </p>
                              {ticket.resolucao && (
                                <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/5">
                                  <p className="text-[10px] text-fiber-blue uppercase font-black mb-1">
                                    Resolução/Mensagem:
                                  </p>
                                  <p className="text-sm text-gray-300 italic">
                                    "{ticket.resolucao}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                ticket.status === "F"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-fiber-orange/20 text-fiber-orange border-fiber-orange/30"
                              }`}
                            >
                              {ticket.status === "F"
                                ? "Finalizado"
                                : "Em Aberto"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-dashed border-white/10">
                        <p className="text-gray-500 font-medium">
                          Você não possui tickets de suporte abertos.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "service_orders" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Ordens de Serviço
                  </h2>
                  <div className="space-y-4">
                    {(dashboardData?.ordensServico || []).length > 0 ? (
                      dashboardData?.ordensServico.map((os) => (
                        <div
                          key={os.id}
                          className="bg-neutral-900 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 rounded-xl bg-fiber-orange/10 text-fiber-orange flex items-center justify-center">
                              <Wrench size={24} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-lg text-white">
                                {os.assunto_nome ||
                                  os.assunto ||
                                  "Manutenção/Instalação"}
                              </p>
                              <p className="text-xs text-gray-500 uppercase font-black mt-1">
                                Protocolo: {os.protocolo} | Data:{" "}
                                {os.data_abertura
                                  ? os.data_abertura
                                      .split(" ")[0]
                                      .split("-")
                                      .reverse()
                                      .join("/")
                                  : "N/A"}
                              </p>
                              {os.resolucao && (
                                <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/5">
                                  <p className="text-[10px] text-fiber-orange uppercase font-black mb-1">
                                    Resolução/Conclusão:
                                  </p>
                                  <p className="text-sm text-gray-300 italic">
                                    "{os.resolucao}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                os.status === "F"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-fiber-orange/20 text-fiber-orange border-fiber-orange/30"
                              }`}
                            >
                              {os.status === "F" ? "Concluída" : "Agendada"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-dashed border-white/10">
                        <p className="text-gray-500 font-medium">
                          Nenhuma ordem de serviço encontrada.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "consumption" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Extrato de Uso
                  </h2>
                  <ConsumptionChart history={dashboardData?.consumo.history} />
                </div>
              )}

              {activeTab === "contracts" && dashboardData && (
                <div className="space-y-8">
                  {/* Termos Pendentes de Assinatura */}
                  {(dashboardData.termos || []).filter((t) => t.status === "P")
                    .length > 0 && (
                    <div className="bg-fiber-orange/10 border border-fiber-orange/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="text-fiber-orange" size={24} />
                        <h3 className="text-xl font-bold text-white">
                          Assinatura Pendente
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-6">
                        Você possui contratos aguardando sua assinatura digital.
                        Assine agora para evitar interrupções no serviço.
                      </p>
                      <div className="space-y-3">
                        {dashboardData.termos
                          .filter((t) => t.status === "P")
                          .map((termo) => (
                            <div
                              key={termo.id}
                              className="bg-neutral-900 border border-white/5 rounded-xl p-4 flex justify-between items-center"
                            >
                              <span className="text-white font-medium">
                                {termo.titulo || `Termo de Adesão #${termo.id}`}
                              </span>
                              <Button
                                variant="primary"
                                className="!py-2 !px-4 !text-xs"
                                onClick={() => handleSignContract(termo.id)}
                                disabled={isSigning}
                              >
                                {isSigning ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  "Assinar Digitalmente"
                                )}
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Listagem de Contratos */}
                  <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Meus Contratos
                        </h2>
                        <p className="text-gray-500 text-sm">
                          Gestão de planos e serviços
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-fiber-green">
                          {
                            dashboardData.contratos.filter(
                              (c) => c.status === "A",
                            ).length
                          }
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase font-black">
                          Ativos
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-white/5">
                      {dashboardData.contratos.map((contrato) => (
                        <div
                          key={contrato.id}
                          className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-4 w-full md:w-auto">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                contrato.status === "A"
                                  ? "bg-fiber-green/10 text-fiber-green"
                                  : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              <FileSignature size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-white">
                                {contrato.descricao_aux_plano_venda ||
                                  "Plano de Internet"}
                              </p>
                              <p className="text-xs text-gray-500 uppercase font-black">
                                ID: {contrato.id} | Status:{" "}
                                {contrato.status === "A" ? "Ativo" : "Inativo"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button
                              variant="outline"
                              className="!py-2 !px-4 !text-xs gap-2"
                              onClick={() =>
                                handleDownloadContrato(contrato.id)
                              }
                              disabled={downloadingContractId === contrato.id}
                            >
                              {downloadingContractId === contrato.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Printer size={14} />
                              )}
                              Imprimir Contrato
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
                                {login.ont_modelo || "Broadband Gateway"}
                              </p>
                            </div>
                            <div
                              className={`flex items-center gap-2 font-bold text-sm px-4 py-1.5 rounded-full border ${
                                login.online === "S"
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                              }`}
                            >
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  login.online === "S"
                                    ? "bg-green-400 animate-pulse"
                                    : "bg-gray-500"
                                }`}
                              ></div>
                              {login.online === "S" ? "Online" : "Offline"}
                            </div>
                          </div>

                          {/* RESULTADO DO DIAGNÓSTICO RICO (Se houver) */}
                          {diag ? (
                            <div className="mb-6 bg-black/40 border border-fiber-blue/30 rounded-xl p-5 animate-fadeIn">
                              <h4 className="text-xs font-bold text-fiber-blue mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <Activity size={14} /> Resultado do Diagnóstico
                                Técnico
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                  <p className="text-[9px] text-gray-500 uppercase font-black mb-1">
                                    Sinal da Fibra
                                  </p>
                                  <p
                                    className={`text-xl font-bold ${
                                      parseFloat(diag.sinal_dbm) < -25
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
                                    Status ONU
                                  </p>
                                  <p className="text-sm text-white font-bold">
                                    {diag.status_onu || "Operacional"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-500 uppercase font-black mb-1">
                                    MAC Address
                                  </p>
                                  <p className="text-xs text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                                    {diag.mac_onu || login.ont_mac || "--"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-500 uppercase font-black mb-1">
                                    Última Atualização
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
                                  Fiber Optic
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
                                  IP Interno
                                </span>
                                <span className="text-white font-mono text-xs">
                                  {login.ip_privado || "--"}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-3">
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
                              Limpar MAC
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
                              Desconectar
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
                              Diagnóstico Profissional
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
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Notas Fiscais
                  </h2>
                  <div className="space-y-2">
                    {(dashboardData?.notas || []).map((nota) => (
                      <div
                        key={nota.id}
                        className="flex justify-between items-center p-4 bg-neutral-900 border border-white/5 rounded-xl"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">
                            Nota #{nota.numero_nota}
                          </p>
                          <p className="text-xs text-gray-500">
                            {nota.data_emissao}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-white">
                            R$ {nota.valor}
                          </span>
                          {nota.link_pdf && (
                            <a
                              href={nota.link_pdf}
                              target="_blank"
                              className="text-fiber-blue hover:underline text-xs flex items-center gap-1"
                            >
                              <Download size={12} /> PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!dashboardData?.notas ||
                      dashboardData.notas.length === 0) && (
                      <p className="text-gray-500 italic">
                        Nenhuma nota fiscal encontrada.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Configurações
                  </h2>
                  <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 max-w-md">
                    <h3 className="font-bold text-white mb-4">Trocar Senha</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          name="novaSenha"
                          placeholder="Nova senha"
                          required
                          className="w-full bg-fiber-dark border border-white/10 rounded p-2 pr-10 text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                      <Button type="submit" variant="primary">
                        Salvar
                      </Button>
                    </form>
                    {passwordChangeStatus && (
                      <p
                        className={`mt-2 text-sm ${
                          passwordChangeStatus.type === "success"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {passwordChangeStatus.message}
                      </p>
                    )}
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
          alert("Atendimento criado com sucesso!");
          fetchDashboardData();
        }}
        clientId={dashboardData?.clientes[0]?.id || 0}
      />

      {isPixModalOpen && (
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
                <QrCode values={activePixCode} size={200} />
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
              onClick={handleCopyPix}
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
    </div>
  );
};

export default ClientArea;
