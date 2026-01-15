// spell:disable
import { GoogleGenAI } from "@google/genai";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Bot,
  CheckCircle,
  Clock,
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
  Power,
  Printer,
  Router,
  ScrollText,
  Send,
  Server,
  Settings,
  ThumbsUp,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { apiService } from "../../services/apiService";
import {
  ChatMessage,
  Consumo,
  DashboardResponse,
  Fatura,
} from "../../types/api";
import AIInsights from "../AIInsights";
import Button from "../Button";
import SegundaViaModal from "../Modals/SegundaViaModal"; // <--- IMPORTADO O MODAL NOVO

const DASH_CACHE_KEY = "fiber_dashboard_cache_v5_forced";

// === HELPERS ===

const bytesToGB = (bytes: number) => {
  return parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2));
};

// === SUB-COMPONENT: CONSUMPTION CHART ===
const ConsumptionChart: React.FC<{ history?: Consumo["history"] }> = ({
  history,
}) => {
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [activePoint] = useState<{
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
    }
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

  // === NOVOS ESTADOS PARA O MODAL UNIFICADO ===
  const [isSegundaViaOpen, setIsSegundaViaOpen] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);
  const [modalInitialMode, setModalInitialMode] = useState<"boleto" | "pix">(
    "boleto"
  );

  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("aberto");
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showNewPass] = useState(false);
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

  // Chat AI State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Olá! Sou a IA da Fiber.Net. Como posso ajudar você hoje?",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // === HANDLER PARA O NOVO MODAL ===
  const handleOpenSegundaVia = (fatura: Fatura, mode: "boleto" | "pix") => {
    setSelectedFatura(fatura);
    setModalInitialMode(mode);
    setIsSegundaViaOpen(true);
  };

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
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setDashboardData(null);
    setLoginView("login");
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: chatInput,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatTyping(true);

    try {
      const apiKey = process.env.API_KEY;

      if (!apiKey) {
        setTimeout(() => {
          const responses = [
            "Em que posso ajudar?",
            "Verificando sua conexão...",
            "Consulte a aba Faturas.",
          ];
          const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, botMsg]);
          setIsChatTyping(false);
        }, 1500);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: chatInput,
        config: {
          systemInstruction: `Você é o assistente virtual da Fiber.Net.`,
        },
      });

      const botText =
        response.text ||
        "Desculpe, não consegui processar sua resposta no momento.";

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botText,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error("Gemini AI Error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Desculpe, estou enfrentando instabilidade técnica.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatTyping(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("fiber_saved_email");
    if (saved) {
      setEmailInput(saved);
      setRememberMe(true);
    }
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, []);

  useEffect(() => {
    if (activeTab === "ai_support" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

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
      <div className="min-h-[70vh]  flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="max-w-md w-full bg-black rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Área do Cliente</h2>
            <p className="text-white text-sm mt-2">
              Acesse suas faturas e serviços
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email / CPF
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                placeholder="Seu login"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Senha
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                placeholder="Sua senha"
                required
              />
            </div>

            {loginError && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {loginError}
              </div>
            )}

            <Button
              fullWidth
              type="submit"
              variant="primary"
              disabled={loginLoading}
              className="py-3"
            >
              {loginLoading ? "Entrando..." : "Acessar Conta"}
            </Button>
          </form>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {/* Mobile Menu */}
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
              {/* === DASHBOARD === */}
              {activeTab === "dashboard" && dashboardData && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <LayoutDashboard className="text-fiber-orange" /> Visão
                    Geral
                  </h2>

                  <AIInsights data={dashboardData.ai_analysis} />

                  {dashboardData.contratos.map((contrato, index) => {
                    const loginsDoContrato = dashboardData.logins.filter(
                      (l) => Number(l.contrato_id) === Number(contrato.id)
                    );
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    const faturasDoContrato = dashboardData.faturas.filter(
                      (f) => {
                        let perteceAoContrato = false;

                        if (f.contrato_id) {
                          perteceAoContrato =
                            Number(f.contrato_id) === Number(contrato.id);
                        } else {
                          // Se a fatura não tiver contrato_id, verificar pelos logins
                          perteceAoContrato = index === 0;
                        }
                        if (!perteceAoContrato) return false;

                        if (f.status !== "A" && f.status !== "P") return false;
                        const vencimento = new Date(f.data_vencimento);
                        vencimento.setHours(0, 0, 0, 0);

                        const isVencida = vencimento < hoje;
                        const isDoMes =
                          vencimento.getMonth() === hoje.getMonth() &&
                          vencimento.getFullYear() === hoje.getFullYear();

                        return isVencida || isDoMes;
                      }
                    );
                    const notasDoContrato =
                      dashboardData.notas?.filter((n) =>
                        n.contrato_id
                          ? Number(n.contrato_id) === Number(contrato.id)
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
                              <MapPin size={14} className="text-gray-500" />
                              {contrato.endereco || "Endereço Principal"}
                              {contrato.bairro && ` - ${contrato.bairro}`}
                              {contrato.cidade && `, ${contrato.cidade}`}
                            </p>
                          </div>
                          <span
                            className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-bold ${
                              contrato.status === "A"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {contrato.status === "A" ? "Ativo" : "Inativo"}
                          </span>
                        </div>

                        <div className="mb-8">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Router size={14} /> Conexões e Equipamentos
                          </h4>

                          {loginsDoContrato.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                              {loginsDoContrato.map((login) => (
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
                                        IP Privado: {login.ip_privado || "--"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-6 text-xs text-gray-400">
                                    <div
                                      className="flex items-center gap-2"
                                      title="Modelo da ONU"
                                    >
                                      <Router size={14} />{" "}
                                      {login.ont_modelo || "ONU Padrão"}
                                    </div>
                                    <div
                                      className="flex items-center gap-2"
                                      title="Sinal Óptico"
                                    >
                                      <Activity size={14} />
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
                                          "- dBm"}
                                      </span>
                                    </div>
                                    <div
                                      className="flex items-center gap-2"
                                      title="Tempo Conectado"
                                    >
                                      <Clock size={14} />{" "}
                                      {login.tempo_conectado || "Recente"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic px-4">
                              Nenhuma conexão ativa para este contrato.
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <FileText size={14} /> Faturas Pendentes
                            </h4>
                            <div className="space-y-3">
                              {faturasDoContrato.length > 0 ? (
                                faturasDoContrato.map((fatura) => {
                                  // CÁLCULO DE DIAS (Lógica Nova)
                                  const dataVenc = new Date(
                                    fatura.data_vencimento
                                  );
                                  dataVenc.setHours(0, 0, 0, 0);

                                  // Diferença em milissegundos convertida para dias
                                  const diffTime =
                                    dataVenc.getTime() - hoje.getTime();
                                  const diasRestantes = Math.ceil(
                                    diffTime / (1000 * 60 * 60 * 24)
                                  );

                                  return (
                                    <div
                                      key={fatura.id}
                                      className="flex justify-between items-center bg-white/5 p-3 rounded-lg border-l-2 border-fiber-orange hover:bg-white/10 transition-colors"
                                    >
                                      <div>
                                        <p className="text-white font-bold text-sm">
                                          R$ {fatura.valor}
                                        </p>

                                        <div className="flex flex-col">
                                          <p className="text-[10px] text-gray-400">
                                            Venc: {fatura.data_vencimento}
                                          </p>

                                          {/* TEXTO DE DIAS VENCIDOS */}
                                          <p className="text-[10px] font-bold mt-0.5">
                                            {diasRestantes < 0 ? (
                                              <span className="text-red-400">
                                                Vencido há{" "}
                                                {Math.abs(diasRestantes)} dias
                                              </span>
                                            ) : diasRestantes === 0 ? (
                                              <span className="text-yellow-400">
                                                Vence hoje!
                                              </span>
                                            ) : (
                                              <span className="text-green-400">
                                                Vence em {diasRestantes} dias
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        {/* Seus botões de ação aqui... */}
                                        <button
                                          onClick={() =>
                                            handleOpenSegundaVia(fatura, "pix")
                                          }
                                          className="text-[10px] bg-fiber-green/20 text-fiber-green px-2 py-1 rounded hover:bg-fiber-green/30 transition font-bold flex items-center gap-1"
                                        >
                                          PIX
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-gray-500 text-sm italic flex items-center gap-2">
                                  <CheckCircle
                                    size={14}
                                    className="text-green-500"
                                  />{" "}
                                  Tudo em dia!
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <ScrollText size={14} /> Últimas Notas Fiscais
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
                              {notasDoContrato.length > 0 ? (
                                notasDoContrato.slice(0, 3).map((nota) => (
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
                                      {nota.link_pdf && (
                                        <a
                                          href={nota.link_pdf}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-fiber-blue hover:text-white transition-colors"
                                          title="Baixar PDF"
                                        >
                                          <Download size={14} />
                                        </a>
                                      )}
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

              {/* === SUPORTE IA === */}
              {activeTab === "ai_support" && (
                <div className="h-[700px] flex flex-col">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bot className="text-fiber-orange" /> Suporte
                        Inteligente
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Tire dúvidas sobre sua fatura, conexão e mais.
                      </p>
                    </div>
                  </div>

                  <div className="flex-grow bg-neutral-900 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                    <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-fiber-orange/20">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl p-4 ${
                              msg.sender === "user"
                                ? "bg-fiber-orange text-white rounded-br-none"
                                : "bg-white/10 text-gray-200 rounded-bl-none"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <span className="text-[10px] opacity-50 mt-1 block text-right">
                              {msg.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                      {isChatTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 text-gray-400 rounded-2xl rounded-bl-none p-4 text-xs italic flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" />{" "}
                            Fiber.IA está digitando...
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form
                      onSubmit={handleSendMessage}
                      className="p-4 bg-neutral-800 border-t border-white/5 flex gap-2"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Digite sua dúvida aqui..."
                        className="flex-grow bg-neutral-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-fiber-orange"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        className="!px-4"
                        disabled={!chatInput.trim() || isChatTyping}
                      >
                        <Send size={18} />
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* === INVOICES TAB (ATUALIZADA) === */}
              {activeTab === "invoices" && (
                <div>
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
                      .filter((inv) =>
                        invoiceStatusFilter === "todas"
                          ? true
                          : (inv.status === "A" ? "aberto" : "pago") ===
                            invoiceStatusFilter
                      )
                      .map((invoice) => (
                        <div
                          key={invoice.id}
                          className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-white">
                              R$ {invoice.valor}
                            </p>
                            <p className="text-xs text-gray-500">
                              {invoice.data_vencimento}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {/* BOTÕES ATUALIZADOS */}
                            <Button
                              variant="secondary"
                              onClick={() =>
                                handleOpenSegundaVia(invoice, "boleto")
                              }
                              className="!py-1 !px-3 !text-xs"
                            >
                              Boleto
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleOpenSegundaVia(invoice, "pix")
                              }
                              className="!py-1 !px-3 !text-xs text-green-500 border-green-500/20"
                            >
                              Pix
                            </Button>
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
                  <ConsumptionChart history={dashboardData?.consumo.history} />
                </div>
              )}

              {activeTab === "contracts" && dashboardData && (
                <div className="space-y-8">
                  <div className="bg-white text-gray-800 rounded-lg overflow-hidden shadow-lg font-sans">
                    <div className="bg-nubank-primary p-6 flex justify-between items-center text-white">
                      <div className="flex items-center gap-4">
                        <FileText size={40} className="opacity-80" />
                        <div>
                          <h2 className="text-2xl font-bold">Contratos</h2>
                          <p className="text-purple-200 text-sm">
                            Gerencie seus contratos.
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">
                          {
                            dashboardData.contratos.filter(
                              (c) => c.status === "A"
                            ).length
                          }
                        </div>
                        <div className="text-xs text-purple-200 uppercase tracking-wider">
                          contratos ativos
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="text-center md:text-left">Status</div>
                      <div className="md:col-span-2">Plano</div>
                      <div className="text-center">Ações</div>
                    </div>

                    {dashboardData.contratos.map((contrato) => (
                      <div
                        key={contrato.id}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-center md:justify-start">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center ${
                              contrato.status === "A"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            <ThumbsUp size={16} fill="currentColor" />
                          </div>
                        </div>
                        <div className="md:col-span-2 font-medium text-gray-700">
                          {contrato.descricao_aux_plano_venda || "Plano Padrão"}
                        </div>
                        <div className="flex justify-center gap-3 text-gray-400">
                          <button
                            onClick={() =>
                              contrato.pdf_link &&
                              window.open(contrato.pdf_link, "_blank")
                            }
                            className="hover:text-gray-600 transition-colors"
                            title="Imprimir Contrato"
                            disabled={!contrato.pdf_link}
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONNECTIONS TAB */}
              {activeTab === "connections" && dashboardData && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Minhas Conexões
                  </h2>
                  <div className="space-y-6">
                    {dashboardData.logins.map((login) => (
                      <div
                        key={login.id}
                        className="bg-neutral-900 border border-white/10 rounded-xl p-6"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                          <h3 className="text-lg font-bold text-white">
                            {login.login}
                          </h3>
                          <div
                            className={`flex items-center gap-2 font-bold text-sm ${
                              login.online === "S"
                                ? "text-fiber-green"
                                : "text-gray-500"
                            }`}
                          >
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                login.online === "S"
                                  ? "bg-fiber-green animate-pulse"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            {login.online === "S" ? "Online" : "Offline"}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Server size={14} /> <strong>ONT:</strong>{" "}
                            <span className="text-white">
                              {login.sinal_ultimo_atendimento || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock size={14} /> <strong>Uptime:</strong>{" "}
                            <span className="text-white">
                              {login.tempo_conectado || "N/A"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-400">
                            <Activity size={14} /> <strong>IP Privado:</strong>
                            <span className="text-white font-mono text-xs">
                              {login.ip_privado || "--"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() =>
                              performLoginAction(login.id, "limpar-mac")
                            }
                            variant="secondary"
                            className="!text-xs !py-2 !px-4 gap-2"
                            disabled={
                              actionStatus[login.id]?.status === "loading"
                            }
                          >
                            {actionStatus[login.id]?.status === "loading" ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <X size={14} />
                            )}{" "}
                            Limpar MAC
                          </Button>
                          <Button
                            onClick={() =>
                              performLoginAction(login.id, "desconectar")
                            }
                            variant="secondary"
                            className="!text-xs !py-2 !px-4 gap-2"
                            disabled={
                              actionStatus[login.id]?.status === "loading"
                            }
                          >
                            {actionStatus[login.id]?.status === "loading" ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Power size={14} />
                            )}{" "}
                            Desconectar
                          </Button>
                          <Button
                            onClick={() =>
                              performLoginAction(login.id, "diagnostico")
                            }
                            variant="outline"
                            className="!text-xs !py-2 !px-4 gap-2"
                            disabled={
                              actionStatus[login.id]?.status === "loading"
                            }
                          >
                            {actionStatus[login.id]?.status === "loading" ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Zap size={14} />
                            )}{" "}
                            Diagnóstico
                          </Button>
                        </div>
                        {actionStatus[login.id]?.status === "success" && (
                          <p className="text-green-500 text-xs mt-3">
                            {actionStatus[login.id]?.message}
                          </p>
                        )}
                        {actionStatus[login.id]?.status === "error" && (
                          <p className="text-red-500 text-xs mt-3">
                            {actionStatus[login.id]?.message}
                          </p>
                        )}
                        {diagResult && (
                          <p className="text-blue-400 text-xs mt-3 font-mono">
                            Consumo Atual: DL {diagResult.download} / UL{" "}
                            {diagResult.upload}
                          </p>
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
                      <input
                        type={showNewPass ? "text" : "password"}
                        name="novaSenha"
                        placeholder="Nova senha"
                        required
                        className="w-full bg-fiber-dark border border-white/10 rounded p-2 text-white"
                      />
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

      {/* === NOVO MODAL UNIFICADO === */}
      <SegundaViaModal
        isOpen={isSegundaViaOpen}
        onClose={() => setIsSegundaViaOpen(false)}
        fatura={selectedFatura}
        initialViewMode={modalInitialMode}
      />
    </div>
  );
};

export default ClientArea;
