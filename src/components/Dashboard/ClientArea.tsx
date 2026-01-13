// spell:disable
// src/components/Dashboard/ClientArea.tsx
import {
  Activity,
  AlertCircle,
  CheckCircle,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  QrCode,
  User,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiService } from "../../services/apiService";
import {
  Cliente as DashboardCliente,
  Contrato as DashboardContrato,
  Fatura as DashboardFatura,
  Plan,
} from "../../types/api";
import SegundaViaModal from "../Modals/SegundaViaModal";
import PlanCard from "./PlanCard";
import ServiceStatus from "./ServiceStatus";

interface ClientAreaProps {
  clientId: number;
}

export function ClientArea({ clientId }: ClientAreaProps) {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    // Reset para evitar delay visual
    setCliente(null);
    setFaturas([]);
    setContratos([]);
    setLoading(true);

    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setError(null);
      // CORREÇÃO 1: Usar getDashboard() em vez de getDashboardData
      const data = await apiService.getDashboard();

      // O endpoint retorna arrays. Pegamos o primeiro cliente ou filtramos pelo ID se necessário
      if (data.clientes && data.clientes.length > 0) {
        setCliente(data.clientes[0]);
      }
      if (data.faturas) setFaturas(data.faturas);
      if (data.contratos) setContratos(data.contratos);
    } catch (err) {
      console.error("Erro ao carregar dados do cliente:", err);
      setError(
        "Não foi possível carregar os dados. Tente novamente mais tarde."
      );
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

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "A":
        return "text-green-600 bg-green-50 border-green-200";
      case "P":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "V":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "A":
        return "Aberto";
      case "P":
        return "Pago";
      case "V":
        return "Vencido";
      default:
        return status;
    }
  };

  // Helper para converter Contrato em Plan para o PlanCard
  const mapContratoToPlan = (c: DashboardContrato): Plan => {
    return {
      id: c.id,
      speed: c.plano.split(" ")[0] || "Fibra", // Tenta extrair velocidade do nome "500MB Fibra"
      price: c.valor ? c.valor.split(",")[0] : "00",
      cents: c.valor ? c.valor.split(",")[1] || "00" : "00",
      period: "/mês",
      description:
        c.descricao_aux_plano_venda || "Plano de Internet Fibra Óptica",
      benefits: ["Wi-Fi Grátis", "Instalação Grátis", "Suporte VIP"],
      highlight: false,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Erro ao carregar dados
        </h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadClientData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!cliente) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary-50 p-3 rounded-xl hidden md:block">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              {/* CORREÇÃO 2: Uso seguro de propriedades (fallback para nome) */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {cliente.razao || cliente.nome || cliente.fantasia}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  {/* CORREÇÃO 3: Uso de cpn_cnpj ou cnpj_cpf */}
                  <span>CPF/CNPJ: {cliente.cnpj_cpf || cliente.cpn_cnpj}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>{cliente.email || "Email não cadastrado"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {/* CORREÇÃO 4: Uso de telefone_celular ou fone */}
                  <span>{cliente.telefone_celular || cliente.fone}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-100">
            <CheckCircle className="w-4 h-4" />
            <span>Cliente Ativo</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Endereço Principal
            </h3>
            {/* CORREÇÃO 5: Uso seguro de endereço */}
            <p className="text-gray-900 font-medium">
              {cliente.endereco}, {cliente.numero || "S/N"}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {cliente.bairro} - {cliente.cidade}/{cliente.uf}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Resumo Financeiro
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  Faturas Exibidas
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {faturasVisiveis.length}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  Total a Pagar
                </span>
                <span className="text-xl font-bold text-gray-900">
                  R${" "}
                  {faturasVisiveis
                    .reduce((acc, curr) => acc + parseFloat(curr.valor), 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-primary-600" />
              Planos Contratados
            </h2>
          </div>
          {contratos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contratos.map((contrato) => (
                // CORREÇÃO 6: Mapeamento de Contrato para Plan e remoção de props extras
                <PlanCard
                  key={contrato.id}
                  plan={mapContratoToPlan(contrato)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-500">Nenhum plano ativo encontrado.</p>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Status da Conexão
          </h2>
          {/* CORREÇÃO 7: Remoção de prop desnecessária clientId */}
          <ServiceStatus />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Faturas em Aberto
          </h2>
          <span className="text-sm text-gray-500">
            Exibindo vencidos e mês atual
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Vencimento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Documento
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faturasVisiveis.length > 0 ? (
                  faturasVisiveis.map((fatura) => (
                    <tr
                      key={fatura.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            fatura.status
                          )}`}
                        >
                          {getStatusLabel(fatura.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(fatura.data_vencimento).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R${" "}
                        {parseFloat(fatura.valor).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{fatura.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenSegundaVia(fatura, "pix")}
                            className="text-teal-600 hover:text-teal-900 p-1.5 hover:bg-teal-50 rounded-lg transition-colors group relative"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleOpenSegundaVia(fatura, "boleto")
                            }
                            className="text-primary-600 hover:text-primary-900 p-1.5 hover:bg-primary-50 rounded-lg transition-colors group relative"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                      Nenhuma fatura pendente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
