import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Smartphone,
  DollarSign,
  Gamepad2,
  Tv,
  ShieldCheck,
  RefreshCw,
  Server,
  Wifi,
  CheckCircle2,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { ENDPOINTS } from "../config";

// ===== TIPAGEM DA SUA API REAL (2025) =====
interface ServiceDetail {
  service: string;
  hasIssues: boolean;
  status: "stable" | "degraded" | "down";
  message: string;
  sources: Array<{
    name: string;
    trending?: boolean;
    count?: number;
    status?: string;
  }>;
}

interface ApiResponse {
  updated_at: string;
  summary: string;
  total: number;
  problems: number;
  details: ServiceDetail[];
}

// ===== COMPONENTE =====
interface ServiceStatusProps {
  onNavigate?: (page: string) => void;
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ onNavigate }) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("--:--");
  const [error, setError] = useState(false);

  // Categorias com nomes exatos da sua API
  const categories = {
    social: {
      label: "Redes Sociais",
      icon: Smartphone,
      items: [
        "whatsapp",
        "instagram",
        "facebook",
        "tiktok",
        "x",
        "twitter",
        "discord",
      ],
    },
    streaming: {
      label: "Streaming e Música",
      icon: Tv,
      items: [
        "netflix",
        "youtube",
        "spotify",
        "primevideo",
        "globoplay",
        "disneyplus",
        "hbomax",
      ],
    },
    gaming: {
      label: "Jogos Online",
      icon: Gamepad2,
      items: ["steam", "discord", "twitch"],
    },
    finance: {
      label: "Bancos e Pagamentos",
      icon: DollarSign,
      items: [
        "nubank",
        "itau",
        "bradesco",
        "caixa",
        "bb",
        "santander",
        "picpay",
        "mercadopago",
        "inter",
      ],
    },
    other: {
      label: "Outros Serviços",
      icon: Server,
      items: [
        "google",
        "gmail",
        "google-drive",
        "outlook",
        "hotmail",
        "icloud",
        "cloudflare",
      ],
    },
  };

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await fetch(`${ENDPOINTS.SERVICE_STATUS}?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("API offline");

      const json: ApiResponse = await res.json();
      setData(json);
      setLastUpdated(
        new Date(json.updated_at).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (err) {
      console.warn("API indisponível, mantendo último estado conhecido");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 90_000); // a cada 90s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === "down")
      return "text-red-400 bg-red-400/10 border-red-400/20";
    if (status === "degraded")
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    return "text-green-400 bg-green-400/10 border-green-400/20";
  };

  const getStatusText = (status: string) => {
    if (status === "down") return "FORA DO AR";
    if (status === "degraded") return "INSTÁVEL";
    return "NORMAL";
  };

  const getCategory = (serviceName: string) => {
    const lower = serviceName.toLowerCase();
    for (const [key, cat] of Object.entries(categories)) {
      if (cat.items.some((item) => lower.includes(item))) return key;
    }
    return "other";
  };

  const overallStatus =
    data?.problems === 0
      ? "operational"
      : data?.problems === data?.total
      ? "down"
      : "warning";

  return (
    <div className="bg-fiber-dark min-h-screen pt-24 pb-20 font-sans">
      {/* Header */}
      <div className="bg-fiber-card border-b border-white/5 py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fiber-blue/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <button
                onClick={() => onNavigate?.("help")}
                className="flex items-center text-gray-500 hover:text-white mb-4 text-sm"
              >
                <ArrowLeft size={16} className="mr-2" /> Voltar
              </button>
              <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
                <Activity className="text-fiber-orange" size={44} />
                Status dos <span className="text-fiber-orange">Serviços</span>
              </h1>
              <p className="text-xl text-gray-400">
                Monitoramento em tempo real com Twitter/X + Downdetector
              </p>
            </div>

            {/* Card de Status Geral */}
            <div
              className={`px-10 py-8 rounded-3xl border-2 backdrop-blur-xl shadow-2xl ${
                overallStatus === "operational"
                  ? "bg-green-500/10 border-green-500/30"
                  : overallStatus === "warning"
                  ? "bg-yellow-500/10 border-yellow-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`p-4 rounded-2xl ${
                    overallStatus === "operational"
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {overallStatus === "operational" ? (
                    <CheckCircle2 size={48} className="text-green-400" />
                  ) : (
                    <AlertTriangle size={48} className="text-red-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm uppercase tracking-wider text-gray-400 font-bold">
                    Status Atual
                  </div>
                  <div
                    className={`text-2xl font-bold mt-1 ${
                      overallStatus === "operational"
                        ? "text-green-400"
                        : overallStatus === "warning"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {overallStatus === "operational"
                      ? "Tudo funcionando"
                      : overallStatus === "warning"
                      ? "Alguns serviços com instabilidade"
                      : "Múltiplos serviços fora"}
                  </div>
                  {data && (
                    <div className="text-sm text-gray-500 mt-1">
                      {data.problems} de {data.total} com problemas
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Barra superior */}
        <div className="flex justify-between items-center mb-10 bg-neutral-900/70 backdrop-blur p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  loading ? "bg-orange-500 animate-pulse" : "bg-green-500"
                }`}
              ></div>
              <span className="text-gray-400">
                Última checagem:{" "}
                <span className="text-white font-mono font-bold">
                  {lastUpdated}
                </span>
              </span>
            </div>
            {error && (
              <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
                Conexão perdida (dados em cache)
              </span>
            )}
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-fiber-orange hover:bg-orange-600 text-black font-bold rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Atualizar Agora
          </button>
        </div>

        {/* Grid de Categorias */}
        {loading && !data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 bg-white/5 rounded-3xl animate-pulse border border-white/10"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Object.entries(categories).map(([key, cat]) => {
              const CategoryIcon = cat.icon;
              const servicesInCat =
                data?.details.filter((s) => getCategory(s.service) === key) ||
                [];
              if (servicesInCat.length === 0) return null;

              const hasProblems = servicesInCat.some((s) => s.hasIssues);

              return (
                <div
                  key={key}
                  className="bg-fiber-card rounded-3xl border border-white/10 hover:border-white/20 transition-all overflow-hidden"
                >
                  <div className="p-6 bg-gradient-to-r from-neutral-900/80 to-neutral-900 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-neutral-800 rounded-2xl">
                        <CategoryIcon size={28} className="text-fiber-orange" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {cat.label}
                      </h3>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                        hasProblems
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {hasProblems ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      {hasProblems ? "Problemas" : "Normal"}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {servicesInCat.map((service) => (
                      <div
                        key={service.service}
                        className={`p-4 rounded-2xl border ${getStatusColor(
                          service.status
                        )} flex justify-between items-center`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-white capitalize">
                            {service.service === "x"
                              ? "X (Twitter)"
                              : service.service === "bb"
                              ? "Banco do Brasil"
                              : service.service.replace("-", " ")}
                          </div>
                          {service.sources.some(
                            (s) => s.name === "X/Twitter" && s.trending
                          ) && (
                            <span title="Pico no Twitter/X">
                              <Zap size={16} className="text-yellow-400" />
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs font-bold uppercase ${
                            service.status === "down"
                              ? "text-red-400"
                              : service.status === "degraded"
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
                          {getStatusText(service.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-16 p-8 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl border border-white/10 text-center">
          <Server size={40} className="text-fiber-orange mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">
            Monitoramento Avançado 2025
          </h3>
          <p className="text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Detectamos quedas em tempo real usando <strong>Twitter/X</strong>{" "}
            (prioridade máxima), <strong>Gemini AI</strong> e{" "}
            <strong>Downdetector</strong>. Se o WhatsApp caiu, você sabe aqui{" "}
            <strong>antes de qualquer outro lugar no Brasil</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceStatus;
