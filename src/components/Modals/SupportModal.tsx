import {
  ExternalLink,
  FileText,
  Headphones,
  MessageCircle,
  PhoneOutgoing,
  X,
} from "lucide-react";
import React, { useEffect } from "react";
import Button from "../Button";
import FiberNetTextLogo from "../FiberNetTextLogo";
import { CONTACT_INFO } from "./../../types/constants";

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

  const ligar = () => {
    const telefone = "552424581861";
    if (window.confirm("Deseja realizar a ligação agora?")) {
      window.location.href = `tel:${telefone}`;
    }
  };

  const handleSegundaViaClick = () => {
    if (onOpenSegundaVia) {
      onOpenSegundaVia();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
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
      <div className="relative w-full max-w-[95%] sm:max-w-md bg-fiber-card border border-white/10 rounded-2xl shadow-2xl transform transition-all animate-fadeIn scale-100 flex flex-col max-h-[90vh] overflow-hidden 2xl:max-w-lg">
        {/* Header - Fixed */}
        <div className="bg-neutral-900 p-5 sm:p-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fiber-orange/10 rounded-lg text-fiber-orange">
              <Headphones size={24} aria-hidden="true" />
            </div>
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-white">
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

        {/* Scrollable Body */}
        <div className="relative flex-grow overflow-hidden group/scroll">
          {/* Top Fade Indicator */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-fiber-card to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity"></div>
          
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[50vh] custom-scrollbar">
            <div className="text-gray-400 text-sm mb-4 text-center">
              <p>Escolha como deseja falar com a equipe <FiberNetTextLogo />.</p>
              <p className="mt-1">Atendimento via WhatsApp ou telefone fixo.</p>
            </div>

            {/* WhatsApp Option */}
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, "")}`,
                  "_blank",
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
                  <div className="text-white font-bold text-sm sm:text-base">Via WhatsApp</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">
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
                  <div className="text-white font-bold text-sm sm:text-base">2ª Via de Boleto</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">
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

            {/* Ligação Rápida Option */}
            <button
              onClick={ligar}
              className="w-full flex items-center justify-between p-4 bg-neutral-800 hover:bg-fiber-red/10 border border-white/5 hover:border-fiber-red/50 rounded-xl group transition-all focus:outline-none focus:ring-2 focus:ring-fiber-red"
              aria-label="Telefone Fixo"
            >
              <div className="flex items-center gap-4">
                <div className="bg-fiber-red/20 p-3 rounded-full text-fiber-red group-hover:scale-110 transition-transform">
                  <PhoneOutgoing size={24} aria-hidden="true" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-sm sm:text-base">Telefone Fixo</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">
                    Acesso rápido por chamada convencional
                  </div>
                </div>
              </div>
              <ExternalLink
                size={16}
                className="text-gray-500 group-hover:text-fiber-red"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="bg-neutral-900 p-5 sm:p-6 border-t border-white/5 shrink-0">
          <Button
            variant="primary"
            fullWidth
            aria-label="Acessar Área do Cliente"
            onClick={handleClientAreaClick}
          >
            Acessar Área do Cliente
          </Button>
          <div className="mt-4 text-center">
            <p className="text-[10px] text-fiber-red uppercase tracking-wider font-bold">
              ❌ NÃO ACEITAMOS LIGAÇÕES VIA WHATSAPP.
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2">
              Horário de Atendimento
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
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
