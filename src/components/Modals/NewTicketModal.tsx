import { X, Send, Loader2, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import Button from "../Button";
import { apiService } from "../../../services/apiService";

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: number;
}

const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
}) => {
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assunto || !mensagem) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // @ts-ignore - Implementaremos este método no apiService
      await apiService.createTicket({
        id_cliente: String(clientId),
        titulo: assunto,
        menssagem: mensagem,
      });
      onSuccess();
      setAssunto("");
      setMensagem("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao criar atendimento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-fiber-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="bg-neutral-900 p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Novo Atendimento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Assunto / Título
            </label>
            <input
              type="text"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Ex: Lentidão na conexão, Problema com boleto..."
              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-fiber-orange outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Mensagem Detalhada
            </label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva seu problema ou solicitação aqui..."
              rows={5}
              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-fiber-orange outline-none resize-none"
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} /> Enviar Solicitação
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicketModal;
