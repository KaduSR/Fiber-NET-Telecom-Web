import React, { useState, useEffect, useRef } from "react";
import {
  Lock,
  FileText,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  QrCode,
  X,
  LogOut,
  Wifi,
  Activity,
  Clock,
  Settings,
  Eye,
  Mail,
  LayoutDashboard,
  ArrowUp,
  ArrowDown,
  FileSignature,
  BarChart3,
  ScrollText,
  MapPin,
  Router,
  Bot,
  Send,
  ArrowLeft,
  ThumbsUp,
  Printer,
} from "lucide-react";
import Button from "./Button";
import { DashboardResponse, Consumo, Fatura } from "../types/api";
import { apiService } from "../services/apiService";
import AIInsights from "./AIInsights";
import { ChatWidget } from "./Chatbot/ChatWidget";

const DASH_CACHE_KEY = "fiber_dashboard_cache_v5_forced";

// === HELPERS ===

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
    link.click();
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

  // Tipagem 'any' usada no map para evitar erro de propriedade inexistente entre os tipos Daily/Monthly
  const data = rawData
    .map((item: any) => ({
      label: period === "daily" ? item.data || "" : item.mes_ano || "",
      download: bytesToGB(item.download_bytes),
      upload: bytesToGB(item.upload_bytes),
    }))
    .reverse();

  if (!history || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-black/20 rounded-xl mt-6">
        Histórico de consumo indisponível.
      </div>
    );
  }

  const maxVal = Math.max(
    ...data.map((d: any) => Math.max(d.download, d.upload)),
    1
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
      0
    )} ${height - padding} Z`;

  return (
    <div className="bg-black/20 border border-white/5 rounded-2xl p-6 mt-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Activity size={18} className="text-fiber-orange" /> Histórico de
          Consumo
        </h3>
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
      <div className="h-64 w-full relative group">
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
    }
  );

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem("authToken")
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const [loginError, setLoginError] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isPixModalOpen, setPixModalOpen] = useState(false);
  const [activePixCode, setActivePixCode] = useState("");
  const [isPixCopied, setIsPixCopied] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<
    number | string | null
  >(null);
  const [copiedBarcodeId, setCopiedBarcodeId] = useState<string | null>(null);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("aberto");
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
  const [diagResult, setDiagResult] = useState<{
    download: string;
    upload: string;
  } | null>(null);
  const [loginView, setLoginView] = useState<"login" | "forgot">("login");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const mainContentRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = async (background = false) => {
    if (!background) setIsDataLoading(true);
    else setIsRefetching(true);

    try {
      const data = await apiService.getDashboard();
      setDashboardData(data);
      localStorage.setItem(DASH_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao atualizar dashboard:", error);
    } finally {
      setIsDataLoading(false);
      setIsRefetching(false);
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

      if (rememberMe) localStorage.setItem("fiber_saved_email", email);
      else localStorage.removeItem("fiber_saved_email");

      setIsAuthenticated(true);
      setActiveTab("dashboard");

      fetchDashboardData();
    } catch (error: any) {
      setLoginError(error.message || "Falha na autenticação.");
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setDashboardData(null);
    setLoginView("login");
  };

  const handleImprimirBoleto = async (id: number | string) => {
    setDownloadingInvoiceId(id);
    try {
      const response = await apiService.imprimirBoleto(id);
      if (response.base64_document) {
        downloadBase64Pdf(response.base64_document, `Fatura-${id}.pdf`);
      } else {
        alert("O documento do boleto não está disponível no momento.");
      }
    } catch (error: any) {
      console.error(error);
      alert("Não foi possível baixar o boleto. Tente novamente.");
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const performLoginAction = async (
    loginId: string | number,
    action: "limpar-mac" | "desconectar" | "diagnostico"
  ) => {
    const id = Number(loginId);
    setActionStatus((prev) => ({
      ...prev,
      [loginId]: { status: "loading" as const },
    }));
    setDiagResult(null);

    try {
      const data = await apiService.performLoginAction(id, action);
      if (action === "diagnostico" && data.consumo) setDiagResult(data.consumo);
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
        3000
      );
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
        formData.get("recoveryEmail") as string
      );
      setRecoveryStatus("success");
      setRecoveryMessage(data.message);
    } catch (e: any) {
      setRecoveryStatus("error");
      setRecoveryMessage(e.message);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("fiber_saved_email");
    if (saved) {
      setEmailInput(saved);
      setRememberMe(true);
    }
    if (isAuthenticated && !dashboardData) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBarcodeId(id);
    setTimeout(() => setCopiedBarcodeId(null), 2000);
  };
  const handleOpenPixModal = (code: string) => {
    setActivePixCode(code);
    setPixModalOpen(true);
    setIsPixCopied(false);
  };
  const handleCopyPix = () => {
    navigator.clipboard.writeText(activePixCode);
    setIsPixCopied(true);
    setTimeout(() => setIsPixCopied(false), 2000);
  };

  // CORREÇÃO: Função de higienização da IA atualizada com verificações seguras de nulo
  const getSanitizedAiData = () => {
    if (!dashboardData?.ai_analysis) return undefined;

    const { summary, insights } = dashboardData.ai_analysis;

    // Verifica se insights existe antes de filtrar
    const safeInsights = (insights || []).filter((i: any) => {
      const title = i.title ? i.title.toLowerCase() : "";
      const message = i.message ? i.message.toLowerCase() : "";

      return (
        i.type !== "risk" &&
        !title.includes("risco") &&
        !message.includes("cancelamento")
      );
    });

    // Verificação segura do summary
    let safeSummary = summary;
    const summaryLower = summary ? summary.toLowerCase() : "";

    if (
      summaryLower.includes("risco") ||
      summaryLower.includes("cancelamento") ||
      summaryLower.includes("churn")
    ) {
      safeSummary =
        "Bem-vindo à Fiber.Net! Confira aqui dicas exclusivas para aproveitar o máximo da sua conexão.";
    }

    return {
      summary: safeSummary,
      insights:
        safeInsights.length > 0
          ? safeInsights
          : [
              {
                type: "positive",
                title: "Conexão Ativa",
                message: "Sua internet está operando com estabilidade.",
              },
              {
                type: "neutral",
                title: "Dica Wi-Fi",
                message:
                  "Mantenha o roteador em local central para melhor sinal.",
              },
            ],
    };
  };

  const TABS = [
    { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard },
    { id: "ai_support", label: "Suporte IA", icon: Bot, badge: "NOVO" },
    { id: "invoices", label: "Faturas", icon: FileText },
    { id: "connections", label: "Conexões", icon: Wifi },
    { id: "consumption", label: "Extrato", icon: BarChart3 },
    { id: "contracts", label: "Contratos", icon: FileSignature },
    { id: "notes", label: "Notas Fiscais", icon: ScrollText },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  // --- RENDER ---
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

  // --- MAIN APP RENDER (LAYOUT FIXADO & ZOOM 90%) ---
  return (
    <div
      className="h-screen w-full bg-black flex flex-col overflow-hidden"
      style={{ zoom: "90%" }}
    >
      {/* Header Fixo */}
      <header className="shrink-0 bg-black border-b border-white/10 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div
            className="cursor-pointer group"
            onClick={handleLogout}
            title="Ir para a Tela Inicial (Sair)"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 group-hover:text-fiber-orange transition-colors">
              {dashboardData?.clientes[0]?.nome?.split(" ")[0]
                ? `Olá, ${dashboardData.clientes[0].nome.split(" ")[0]}!`
                : "Carregando..."}
              {(isDataLoading || isRefetching) && (
                <Loader2 size={16} className="text-fiber-orange animate-spin" />
              )}
            </h1>
            <p className="text-gray-400 text-xs group-hover:text-white transition-colors">
              Clique aqui para sair para a tela inicial
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="!py-2 !px-4 text-sm gap-2 w-fit"
          >
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-70 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 lg:gap-8 pt-6">
          {/* Sidebar Fixa (Desktop) */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full overflow-y-auto pb-4 gap-2">
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

          {/* Mobile Menu (Scroll Horizontal) */}
          <div className="lg:hidden shrink-0 overflow-x-auto whitespace-nowrap pb-2 mb-2 flex gap-2">
            {" "}
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

          {/* Main Content (Scroll independente com Ref) */}
          <main
            ref={mainContentRef}
            className="flex-1 h-full flex flex-col overflow-hidden relative"
          >
            {isDataLoading && !dashboardData ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                <Loader2 size={48} className="text-fiber-orange animate-spin" />
                <p>Carregando seus dados...</p>
              </div>
            ) : (
              <>
                {/* 1. Abas COM Scroll */}
                {activeTab !== "ai_support" && (
                  <div className="flex-1 overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-white/10 pr-2">
                    <div className="bg-fiber-card border border-white/10 rounded-2xl p-6 min-h-full animate-fadeIn">
                      {activeTab === "dashboard" && dashboardData && (
                        <div className="space-y-8 pb-10">
                          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <LayoutDashboard className="text-fiber-orange" />{" "}
                            Visão Geral
                          </h2>

                          {/* INSIGHTS DE IA HIGIENIZADOS */}
                          <AIInsights data={getSanitizedAiData() as any} />

                          {dashboardData.contratos
                            .filter((c: any) => c.status === "A")
                            .map((contrato: any) => {
                              const loginsDoContrato =
                                dashboardData.logins.filter(
                                  (l: any) =>
                                    Number(l.contrato_id) ===
                                    Number(contrato.id)
                                );
                              const faturasDoContrato =
                                dashboardData.faturas.filter((f: any) =>
                                  f.contrato_id
                                    ? Number(f.contrato_id) ===
                                      Number(contrato.id)
                                    : true
                                );
                              const notasDoContrato =
                                dashboardData.notas?.filter((n: any) =>
                                  n.contrato_id
                                    ? Number(n.contrato_id) ===
                                      Number(contrato.id)
                                    : true
                                ) || [];

                              return (
                                <div
                                  key={contrato.id}
                                  className="bg-neutral-900 border border-white/10 rounded-xl p-6 mb-6 shadow-lg"
                                >
                                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/5 pb-4">
                                    <div>
                                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FileSignature
                                          size={20}
                                          className="text-fiber-orange"
                                        />
                                        {contrato.descricao_aux_plano_venda ||
                                          `Contrato #${contrato.id}`}
                                      </h3>
                                      <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                                        <MapPin
                                          size={14}
                                          className="text-gray-500"
                                        />
                                        {contrato.endereco ||
                                          "Endereço Principal"}
                                      </p>
                                    </div>
                                    <span
                                      className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-bold ${
                                        contrato.status === "A"
                                          ? "bg-green-500/20 text-green-400"
                                          : "bg-red-500/20 text-red-400"
                                      }`}
                                    >
                                      {contrato.status === "A"
                                        ? "Ativo"
                                        : "Inativo"}
                                    </span>
                                  </div>

                                  {/* CONEXÕES */}
                                  <div className="mb-8">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                      <Router size={14} /> Conexões e
                                      Equipamentos
                                    </h4>
                                    {loginsDoContrato.length > 0 ? (
                                      <div className="grid grid-cols-1 gap-4">
                                        {loginsDoContrato.map((login: any) => (
                                          <div
                                            key={login.id}
                                            className="bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4"
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
                                                <p className="text-xs text-gray-500 font-mono mt-0.5">
                                                  IP: {login.ip_privado || "--"}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-6 text-xs text-gray-400">
                                              <div
                                                className="flex items-center gap-2"
                                                title="Modelo da ONU"
                                              >
                                                <Router size={14} />{" "}
                                                {login.ont_modelo || "Padrão"}
                                              </div>
                                              <div
                                                className="flex items-center gap-2"
                                                title="Sinal Óptico"
                                              >
                                                <Activity size={14} />{" "}
                                                <span
                                                  className={
                                                    parseFloat(
                                                      login.sinal_ultimo_atendimento
                                                    ) < -27
                                                      ? "text-red-400"
                                                      : "text-fiber-green"
                                                  }
                                                >
                                                  {login.sinal_ultimo_atendimento ||
                                                    "-"}
                                                </span>
                                              </div>
                                              <div
                                                className="flex items-center gap-2"
                                                title="Tempo Conectado"
                                              >
                                                <Clock size={14} />{" "}
                                                {login.tempo_conectado ||
                                                  "Recente"}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 text-sm italic px-4">
                                        Nenhuma conexão ativa.
                                      </p>
                                    )}
                                  </div>

                                  {/* FINANCEIRO */}
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FileText size={14} /> Faturas Pendentes
                                      </h4>
                                      <div className="space-y-3">
                                        {faturasDoContrato.filter(
                                          (f: any) => f.status === "A"
                                        ).length > 0 ? (
                                          faturasDoContrato
                                            .filter(
                                              (f: any) => f.status === "A"
                                            )
                                            .map((fatura: any) => (
                                              <div
                                                key={fatura.id}
                                                className="flex justify-between items-center bg-white/5 p-3 rounded-lg border-l-2 border-fiber-orange hover:bg-white/10 transition-colors"
                                              >
                                                <div>
                                                  <p className="text-white font-bold text-sm">
                                                    R$ {fatura.valor}
                                                  </p>
                                                  <p className="text-[10px] text-gray-400">
                                                    Venc:{" "}
                                                    {fatura.data_vencimento}
                                                  </p>
                                                </div>
                                                <div className="flex gap-2">
                                                  {fatura.pix_txid && (
                                                    <button
                                                      onClick={() =>
                                                        handleOpenPixModal(
                                                          fatura.pix_txid!
                                                        )
                                                      }
                                                      className="text-[10px] bg-fiber-green/20 text-fiber-green px-2 py-1 rounded font-bold flex items-center gap-1"
                                                    >
                                                      <QrCode size={10} /> PIX
                                                    </button>
                                                  )}
                                                  <button
                                                    onClick={() =>
                                                      handleImprimirBoleto(
                                                        fatura.id
                                                      )
                                                    }
                                                    className="text-[10px] bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20 transition flex items-center gap-1"
                                                    disabled={
                                                      downloadingInvoiceId ===
                                                      fatura.id
                                                    }
                                                  >
                                                    {downloadingInvoiceId ===
                                                    fatura.id ? (
                                                      <Loader2
                                                        size={10}
                                                        className="animate-spin"
                                                      />
                                                    ) : (
                                                      <Download size={10} />
                                                    )}{" "}
                                                    PDF
                                                  </button>
                                                </div>
                                              </div>
                                            ))
                                        ) : (
                                          <p className="text-gray-500 text-sm italic flex items-center gap-2">
                                            <CheckCircle
                                              size={14}
                                              className="text-green-500"
                                            />{" "}
                                            Nenhuma fatura pendente.
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <ScrollText size={14} /> Últimas Notas
                                      </h4>
                                      <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
                                        {notasDoContrato.length > 0 ? (
                                          notasDoContrato
                                            .slice(0, 3)
                                            .map((nota: any) => (
                                              <div
                                                key={nota.id}
                                                className="flex justify-between items-center p-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0"
                                              >
                                                <div>
                                                  <p className="text-xs text-white">
                                                    NF #{nota.numero_nota}
                                                  </p>
                                                  <p className="text-[10px] text-gray-500">
                                                    {nota.data_emissao}
                                                  </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                  <span className="text-xs font-mono text-gray-300">
                                                    R$ {nota.valor}
                                                  </span>
                                                </div>
                                              </div>
                                            ))
                                        ) : (
                                          <p className="text-gray-500 text-sm italic">
                                            Nenhuma nota disponível.
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {activeTab === "invoices" && (
                        <div className="pb-10">
                          <h2 className="text-2xl font-bold text-white mb-6">
                            Todas as Faturas
                          </h2>
                          <div className="flex items-center gap-2 mb-6 bg-neutral-900 p-1.5 rounded-full border border-white/10 w-fit">
                            {["aberto", "pago", "todas"].map((s) => (
                              <button
                                key={s}
                                onClick={() => setInvoiceStatusFilter(s)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${
                                  invoiceStatusFilter === s
                                    ? "bg-fiber-orange text-white"
                                    : "text-gray-400"
                                }`}
                              >
                                {s.toUpperCase()}
                              </button>
                            ))}
                          </div>
                          <div className="space-y-3">
                            {(dashboardData?.faturas || [])
                              .filter((inv: any) =>
                                invoiceStatusFilter === "todas"
                                  ? true
                                  : (inv.status === "A" ? "aberto" : "pago") ===
                                    invoiceStatusFilter
                              )
                              .map((invoice: any) => (
                                <div
                                  key={invoice.id}
                                  className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4"
                                >
                                  <div>
                                    <p className="font-bold text-white">
                                      R$ {invoice.valor}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Venc: {invoice.data_vencimento}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="secondary"
                                      onClick={() =>
                                        handleImprimirBoleto(invoice.id)
                                      }
                                      disabled={
                                        downloadingInvoiceId === invoice.id
                                      }
                                      className="!py-1 !px-3 !text-xs gap-2"
                                    >
                                      {downloadingInvoiceId === invoice.id ? (
                                        <Loader2
                                          size={12}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Download size={12} />
                                      )}{" "}
                                      PDF
                                    </Button>
                                    {invoice.pix_txid && (
                                      <Button
                                        variant="secondary"
                                        onClick={() =>
                                          handleOpenPixModal(invoice.pix_txid!)
                                        }
                                        className="!py-1 !px-3 !text-xs gap-1 bg-fiber-green/20 text-fiber-green hover:bg-fiber-green/30"
                                      >
                                        <QrCode size={12} /> PIX
                                      </Button>
                                    )}
                                    {invoice.linha_digitavel && (
                                      <Button
                                        variant="secondary"
                                        onClick={() =>
                                          handleCopy(
                                            invoice.linha_digitavel!,
                                            String(invoice.id)
                                          )
                                        }
                                        className="!py-1 !px-3 !text-xs gap-1 flex items-center"
                                      >
                                        <Copy size={12} className="mr-1" />
                                        {copiedBarcodeId === String(invoice.id)
                                          ? "Copiado!"
                                          : "Copiar"}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "consumption" && (
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-4">
                            Extrato de Uso
                          </h2>
                          <ConsumptionChart
                            history={dashboardData?.consumo.history}
                          />
                        </div>
                      )}

                      {activeTab === "contracts" && dashboardData && (
                        <div className="space-y-8">
                          {dashboardData.contratos
                            .filter((c: any) => c.status === "A")
                            .map((contrato: any) => (
                              <div
                                key={contrato.id}
                                className="bg-white text-gray-800 rounded-lg overflow-hidden shadow-lg font-sans"
                              >
                                <div className="bg-nubank-primary p-6 flex justify-between items-center text-white">
                                  <div>
                                    <h2 className="text-2xl font-bold">
                                      Contrato #{contrato.id}
                                    </h2>
                                    <p className="text-purple-200 text-sm">
                                      Gerencie seu plano.
                                    </p>
                                  </div>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                  <p className="text-gray-700">
                                    {contrato.descricao_aux_plano_venda}
                                  </p>
                                  <div className="flex gap-2">
                                    <div
                                      className={`w-8 h-8 rounded flex items-center justify-center ${
                                        contrato.status === "A"
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    >
                                      <ThumbsUp
                                        size={16}
                                        className="text-white"
                                      />
                                    </div>
                                    <Printer
                                      size={18}
                                      className="text-gray-400"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {activeTab === "connections" && dashboardData && (
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-6">
                            Minhas Conexões
                          </h2>
                          <div className="space-y-6">
                            {dashboardData.logins.map((login: any) => (
                              <div
                                key={login.id}
                                className="bg-neutral-900 border border-white/10 rounded-xl p-6"
                              >
                                <h3 className="text-lg font-bold text-white mb-4">
                                  {login.login}
                                </h3>
                                <div className="flex gap-3 mb-4">
                                  <Button
                                    onClick={() =>
                                      performLoginAction(login.id, "limpar-mac")
                                    }
                                    variant="secondary"
                                    className="!text-xs gap-2"
                                    disabled={
                                      actionStatus[login.id]?.status ===
                                      "loading"
                                    }
                                  >
                                    Limpar MAC
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      performLoginAction(
                                        login.id,
                                        "desconectar"
                                      )
                                    }
                                    variant="secondary"
                                    className="!text-xs gap-2"
                                    disabled={
                                      actionStatus[login.id]?.status ===
                                      "loading"
                                    }
                                  >
                                    Desconectar
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      performLoginAction(
                                        login.id,
                                        "diagnostico"
                                      )
                                    }
                                    variant="outline"
                                    className="!text-xs gap-2"
                                    disabled={
                                      actionStatus[login.id]?.status ===
                                      "loading"
                                    }
                                  >
                                    Diagnóstico
                                  </Button>
                                </div>
                                {actionStatus[login.id]?.message && (
                                  <p
                                    className={`text-xs mt-2 ${
                                      actionStatus[login.id]?.status === "error"
                                        ? "text-red-400"
                                        : "text-green-400"
                                    }`}
                                  >
                                    {actionStatus[login.id]?.message}
                                  </p>
                                )}
                                {diagResult &&
                                  actionStatus[login.id]?.status !==
                                    "loading" && (
                                    <div className="mt-4 p-3 bg-black/40 rounded border border-white/10 text-xs font-mono">
                                      <p className="text-gray-400">
                                        Status Atual:
                                      </p>
                                      <p className="text-fiber-blue">
                                        Download: {diagResult.download}
                                      </p>
                                      <p className="text-fiber-orange">
                                        Upload: {diagResult.upload}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "notes" && (
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-6">
                            Notas Fiscais
                          </h2>
                          <div className="space-y-2">
                            {(dashboardData?.notas || []).map((nota: any) => (
                              <div
                                key={nota.id}
                                className="flex justify-between items-center p-4 bg-neutral-900 border border-white/5 rounded-xl"
                              >
                                <div>
                                  <p className="text-sm font-bold text-white">
                                    #{nota.numero_nota}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {nota.data_emissao}
                                  </p>
                                </div>
                                <span className="font-mono text-white">
                                  R$ {nota.valor}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "settings" && (
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-6">
                            Configurações
                          </h2>
                          <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 max-w-md">
                            <h3 className="font-bold text-white mb-4">
                              Trocar Senha
                            </h3>
                            <form
                              onSubmit={handlePasswordChange}
                              className="space-y-4"
                            >
                              <div className="relative">
                                <input
                                  type={showNewPass ? "text" : "password"}
                                  name="novaSenha"
                                  placeholder="Nova senha"
                                  required
                                  className="w-full bg-fiber-dark border border-white/10 rounded p-2 text-white pr-10"
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
                  </div>
                )}

                {/* 2. Aba de CHAT (FIXO NA TELA) */}
                {activeTab === "ai_support" && <ChatWidget />}
              </>
            )}
          </main>
        </div>
      </div>

      {isPixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
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
            <div className="bg-white p-4 rounded-lg mx-auto w-fit mb-4">
              <div className="w-48 h-48 bg-neutral-800 flex items-center justify-center">
                <QrCode size={100} className="text-white" />
              </div>
            </div>
            <div className="bg-neutral-900 p-2 rounded mb-4 overflow-hidden">
              <p className="text-xs text-gray-500 font-mono truncate">
                {activePixCode}
              </p>
            </div>
            <Button
              onClick={handleCopyPix}
              fullWidth
              className="gap-2 !bg-fiber-green hover:!bg-green-600"
            >
              {isPixCopied ? "Copiado!" : "Copiar Código"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientArea;
