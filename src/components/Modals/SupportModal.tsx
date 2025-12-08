import React, { useEffect } from "react";
import {
  X,
  MessageCircle,
  ExternalLink,
  Headphones,
  FileText,
} from "lucide-react";
import Button from "../Button";
import { CONTACT_INFO } from "../../../constants";
import FiberNetTextLogo from "../FiberNetTextLogo";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  onOpenSegundaVia?: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenSegundaVia,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleClientAreaClick = () => {
    if (onNavigate) {
      onNavigate("client-area");
    }
    onClose();
  };

  const handleSegundaViaClick = () => {
    if (onOpenSegundaVia) {
      onOpenSegundaVia();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-fiber-card border border-white/10 rounded-2xl shadow-2xl transform transition-all animate-float scale-100 overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-900 p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fiber-orange/10 rounded-lg text-fiber-orange">
              <Headphones size={24} aria-hidden="true" />
            </div>
            <h2 id="modal-title" className="text-xl font-bold text-white">
              Central de Suporte
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full focus:outline-none focus:ring-2 focus:ring-fiber-orange"
            aria-label="Fechar modal de suporte"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-400 text-sm mb-4">
            Escolha como deseja falar com a equipe <FiberNetTextLogo />. Nosso
            atendimento é **exclusivamente** via WhatsApp!
          </p>

          {/* WhatsApp Option */}
          <button
            onClick={() =>
              window.open(
                `https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, "")}`,
                "_blank"
              )
            }
            className="w-full flex items-center justify-between p-4 bg-neutral-800 hover:bg-fiber-green/10 border border-white/5 hover:border-fiber-green/50 rounded-xl group transition-all focus:outline-none focus:ring-2 focus:ring-fiber-green"
            aria-label="Iniciar conversa no WhatsApp"
          >
            <div className="flex items-center gap-4">
              <div className="bg-fiber-green/20 p-3 rounded-full text-fiber-green group-hover:scale-110 transition-transform">
                <MessageCircle size={24} aria-hidden="true" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold">Via WhatsApp</div>
                <div className="text-xs text-gray-400">
                  Atendimento rápido e prático
                </div>
              </div>
            </div>
            <ExternalLink
              size={16}
              className="text-gray-500 group-hover:text-fiber-green"
              aria-hidden="true"
            />
          </button>

          {/* 2ª Via Rápida Option */}
          <button
            onClick={handleSegundaViaClick}
            className="w-full flex items-center justify-between p-4 bg-neutral-800 hover:bg-fiber-orange/10 border border-white/5 hover:border-fiber-orange/50 rounded-xl group transition-all focus:outline-none focus:ring-2 focus:ring-fiber-orange"
            aria-label="Acessar 2ª Via de Boleto"
          >
            <div className="flex items-center gap-4">
              <div className="bg-fiber-orange/20 p-3 rounded-full text-fiber-orange group-hover:scale-110 transition-transform">
                <FileText size={24} aria-hidden="true" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold">2ª Via de Boleto</div>
                <div className="text-xs text-gray-400">
                  Acesso rápido por CPF/CNPJ
                </div>
              </div>
            </div>
            <ExternalLink
              size={16}
              className="text-gray-500 group-hover:text-fiber-orange"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-900 p-6 border-t border-white/5">
          <Button
            variant="primary"
            fullWidth
            aria-label="Acessar Área do Cliente"
            onClick={handleClientAreaClick}
          >
            Acessar Área do Cliente
          </Button>
          <div className="mt-4 text-center">
            <p className="text-[10px] text-red-500 uppercase tracking-wider font-bold">
              NÃO ACEITAMOS LIGAÇÕES!!
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2">
              Horário de Atendimento
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Segunda a Sexta: 08h às 12h e 13:30h às 17:30h • Sábado: 08h às
              12h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
