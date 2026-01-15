// spell:disable
import {
  Activity,
  AlertCircle,
  FileText,
  Lock,
  QrCode,
  Wifi,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { apiService } from "../../services/apiService";
import {
  Cliente as DashboardCliente,
  Contrato as DashboardContrato,
  Fatura as DashboardFatura,
  Plan,
} from "../../types/api";
import Button from "../Button";
import SegundaViaModal from "../Modals/SegundaViaModal";
import PlanCard from "./PlanCard";
import ServiceStatus from "./ServiceStatus";

interface ClientAreaProps {
  clientId?: number; // Agora opcional
}

export function ClientArea({ clientId }: ClientAreaProps) {
  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Estado do Dashboard
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cliente, setCliente] = useState<DashboardCliente | null>(null);
  const [faturas, setFaturas] = useState<DashboardFatura[]>([]);
  const [contratos, setContratos] = useState<DashboardContrato[]>([]);

  const [selectedFatura, setSelectedFatura] = useState<DashboardFatura | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialMode, setModalInitialMode] = useState<"boleto" | "pix">(
    "boleto"
  );

  // Verificar Auth ao carregar
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      loadClientData();
    }
  }, [clientId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      await apiService.login({ email: loginEmail, password: loginPass });
      setIsAuthenticated(true);
      loadClientData();
    } catch (err: any) {
      setLoginError(err.message || "Erro ao realizar login");
    } finally {
      setLoginLoading(false);
    }
  };

  const loadClientData = async () => {
    setLoading(true);
    try {
      setError(null);
      const data = await apiService.getDashboard();

      if (data.clientes && data.clientes.length > 0) {
        setCliente(data.clientes[0]);
      }
      if (data.faturas) setFaturas(data.faturas);
      if (data.contratos) setContratos(data.contratos);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      // Se der erro 401, desloga
      setError("Sessão expirada ou erro ao carregar.");
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSegundaVia = (
    fatura: DashboardFatura,
    mode: "boleto" | "pix" = "boleto"
  ) => {
    setSelectedFatura(fatura);
    setModalInitialMode(mode);
    setIsModalOpen(true);
  };

  // --- RENDERIZAÇÃO: TELA DE LOGIN ---
  if (!isAuthenticated) {
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
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO: DASHBOARD ---
  // Lógica de Filtragem
  const faturasVisiveis = faturas.filter((f) => {
    if (f.status !== "A") return false;
    const dataVenc = new Date(f.data_vencimento);
    const hoje = new Date();
    const hojeSemHora = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );
    const vencSemHora = new Date(
      dataVenc.getFullYear(),
      dataVenc.getMonth(),
      dataVenc.getDate()
    );
    const isVencido = vencSemHora < hojeSemHora;
    const isDoMes =
      dataVenc.getMonth() === hoje.getMonth() &&
      dataVenc.getFullYear() === hoje.getFullYear();
    return isVencido || isDoMes;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "A":
        return "text-green-600 bg-green-50 border-green-200";
      case "V":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Helper para converter Contrato em Plan
  const mapContratoToPlan = (c: DashboardContrato): Plan => ({
    id: c.id,
    speed: c.plano.split(" ")[0] || "Fibra",
    price: c.valor ? c.valor.split(",")[0] : "00",
    cents: c.valor ? c.valor.split(",")[1] || "00" : "00",
    period: "/mês",
    description: c.descricao_aux_plano_venda || "Plano de Internet",
    benefits: ["Wi-Fi Grátis", "Suporte VIP"],
    highlight: false,
  });

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  if (!cliente) return null;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto px-4 py-8">
      {/* Header Cliente */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Olá, {cliente.nome.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500">Bem-vindo à sua área exclusiva.</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("authToken");
              setIsAuthenticated(false);
            }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Sair da conta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Faturas */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="text-primary-600" /> Minhas Faturas
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Vencimento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Valor
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                      Pagar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {faturasVisiveis.length > 0 ? (
                    faturasVisiveis.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(f.data_vencimento).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          R$ {f.valor}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenSegundaVia(f, "pix")}
                            className="text-teal-600 hover:bg-teal-50 p-2 rounded-lg"
                          >
                            <QrCode size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenSegundaVia(f, "boleto")}
                            className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg"
                          >
                            <FileText size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        Nenhuma fatura pendente! 🎉
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contratos */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Wifi className="text-primary-600" /> Meus Planos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contratos.map((c) => (
                <PlanCard key={c.id} plan={mapContratoToPlan(c)} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="text-primary-600" /> Status da Rede
          </h2>
          <ServiceStatus />
        </div>
      </div>

      <SegundaViaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fatura={selectedFatura}
        initialViewMode={modalInitialMode}
      />
    </div>
  );
}

export default ClientArea;
