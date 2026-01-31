import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { apiService } from "../../services/apiService";
import { Fatura as Invoice } from "../../types/api";
import Button from "./Button";

const InvoiceFetcher: React.FC = () => {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPdfId, setLoadingPdfId] = useState<string | number | null>(
    null
  );
  const [activePixCode, setActivePixCode] = useState<string | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(value);
  };

  const fetchInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      setError("CPF inválido.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api-proxy/api/faturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: cleanCpf }),
      });
      if (!response.ok) throw new Error("Cliente não encontrado.");
      const data = await response.json();
      setInvoices(data.faturas || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fix: Adicionado para lidar com a visualização do PDF quando o botão é clicado
  const handleViewPdf = async (id: number | string) => {
    setLoadingPdfId(id);
    try {
      const response = await apiService.getSegundaVia(id);
      // @ts-ignore
      if (response.url) {
        // @ts-ignore
        window.open(response.url, "_blank");
      } else if (response.base64_document) {
        const b64 = response.base64_document;
        if (b64) {
          const byteCharacters = atob(b64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });
          const fileURL = URL.createObjectURL(blob);
          window.open(fileURL, "_blank");
        }
      }
    } catch (err) {
      console.error("Erro ao visualizar PDF:", err);
      alert("Não foi possível carregar o PDF.");
    } finally {
      setLoadingPdfId(null);
    }
  };

  return (
    <section className="py-20 bg-fiber-card">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          2ª Via de Boleto
        </h2>
        <form
          onSubmit={fetchInvoices}
          className="flex flex-col md:flex-row gap-4"
        >
          <input
            type="text"
            value={cpf}
            onChange={handleCpfChange}
            placeholder="CPF"
            className="flex-grow bg-fiber-dark p-4 rounded-xl text-white"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Consultar"}
          </Button>
        </form>
        {invoices && invoices.length > 0 && (
          <div className="mt-8 space-y-4">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-fiber-dark p-6 rounded-xl flex justify-between items-center"
              >
                {/* Fix: Property 'vencimento' does not exist on type 'Fatura'. Using normalized 'data_vencimento'. */}
                <div className="text-white font-bold">
                  R$ {inv.valor} - Vencimento: {inv.data_vencimento}
                </div>
                {/* Fix: Chamada correta para handleViewPdf e controle de loading por item */}
                <Button
                  variant="outline"
                  onClick={() => inv.id && handleViewPdf(inv.id)}
                  disabled={loadingPdfId === inv.id}
                >
                  {loadingPdfId === inv.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Ver PDF"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default InvoiceFetcher;
