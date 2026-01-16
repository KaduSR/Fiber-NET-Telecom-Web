import { Chat, GoogleGenAI } from "@google/genai";
import {
  AlertTriangle,
  Loader2,
  MessageCircle,
  Send,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { DashboardResponse } from "../../types/api";

interface ChatWidgetProps {
  dashboardData: DashboardResponse | null;
  clientName: string;
}

interface Message {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: Date;
  isAlert?: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  dashboardData,
  clientName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Initialize Chat Session
  useEffect(() => {
    if (!process.env.API_KEY || hasInitialized.current) return;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Create context string from dashboard data
    let systemContext = `Você é o assistente virtual da Fiber.Net Telecom. Seu nome é Fiber.IA.
    O cliente se chama ${clientName}.
    Seja educado, técnico mas acessível. Responda em Português do Brasil.
    
    DADOS DO CLIENTE EM TEMPO REAL:
    `;

    if (dashboardData) {
      const faturasAbertas = dashboardData.faturas.filter(
        (f) => f.status === "A"
      );
      const loginsOffline = dashboardData.logins.filter(
        (l) => l.online === "N"
      );

      systemContext += `\n- Contratos Ativos: ${
        dashboardData.contratos.filter((c) => c.status === "A").length
      }`;
      systemContext += `\n- Faturas em Aberto: ${
        faturasAbertas.length
      } (Valor total aprox: R$ ${faturasAbertas
        .reduce(
          (acc, curr) => acc + parseFloat(curr.valor.replace(",", ".")),
          0
        )
        .toFixed(2)})`;
      systemContext += `\n- Status da Conexão: ${
        loginsOffline.length > 0
          ? "ALERTA: Cliente possui equipamentos OFFLINE"
          : "Conexão estável/Online"
      }.`;

      if (faturasAbertas.length > 0) {
        systemContext += `\n\nATENÇÃO: O cliente possui faturas vencidas ou a vencer. Se ele perguntar sobre bloqueio ou internet lenta, verifique se é por falta de pagamento. Oriente a usar o botão 'PIX' na aba Faturas.`;
      }
    }

    // Using gemini-3-flash-preview for general text tasks
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemContext,
      },
    });

    setChatSession(chat);
    hasInitialized.current = true;

    // Initial Greeting
    setMessages([
      {
        id: "init",
        role: "model",
        text: `Olá ${
          clientName.split(" ")[0]
        }! Sou a IA da Fiber.Net. Como posso ajudar com sua conexão hoje?`,
        timestamp: new Date(),
      },
    ]);
  }, [clientName, dashboardData]);

  // Proactive Alerts (Simulating Push)
  useEffect(() => {
    if (!dashboardData) return;

    const checkForAlerts = () => {
      const faturasVencidas = dashboardData.faturas.filter(
        (f) => f.status === "A" && isOverdue(f.data_vencimento)
      );
      const conexaoOffline = dashboardData.logins.some((l) => l.online === "N");

      // Alert: Connection Issue
      if (
        conexaoOffline &&
        !messages.some((m) =>
          m.text.includes("equipamento parece estar offline")
        )
      ) {
        const alertMsg: Message = {
          id: `alert-${Date.now()}`,
          role: "model",
          text: "⚠️ Notei que seu equipamento parece estar OFFLINE. Gostaria de ajuda para realizar um diagnóstico?",
          timestamp: new Date(),
          isAlert: true,
        };
        setMessages((prev) => [...prev, alertMsg]);
        if (!isOpen) setUnreadCount((prev) => prev + 1);
      }

      // Alert: Invoice Overdue
      else if (
        faturasVencidas.length > 0 &&
        !messages.some((m) => m.text.includes("fatura vencida"))
      ) {
        const alertMsg: Message = {
          id: `alert-bill-${Date.now()}`,
          role: "model",
          text: `📄 Você possui ${faturasVencidas.length} fatura(s) vencida(s). Posso gerar o código PIX para você agora?`,
          timestamp: new Date(),
          isAlert: true,
        };
        setMessages((prev) => [...prev, alertMsg]);
        if (!isOpen) setUnreadCount((prev) => prev + 1);
      }
    };

    const timer = setTimeout(checkForAlerts, 2000); // Check shortly after load
    return () => clearTimeout(timer);
  }, [dashboardData, messages, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  // Reset unread on open
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const isOverdue = (dateString: string) => {
    if (!dateString) return false;
    const [day, month, year] = dateString.split("/").map(Number);
    const dueDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatSession) return;

    const userText = input;
    setInput("");

    // Add User Message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        text: userText,
        timestamp: new Date(),
      },
    ]);

    setIsTyping(true);

    try {
      // Fix: sendMessage requires a message parameter
      const result = await chatSession.sendMessage({ message: userText });
      const responseText = result.text;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: responseText || "Desculpe, não consegui obter uma resposta.",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Chat Error", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: "Desculpe, tive um problema de conexão. Tente novamente em instantes.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] w-16 h-16 rounded-full shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-neutral-800 text-gray-400 rotate-90"
            : "bg-fiber-orange text-white"
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={32} />}

        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-black animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 w-[90vw] sm:w-[400px] h-[600px] max-h-[70vh] bg-fiber-card border border-white/10 rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 translate-y-10 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-fiber-orange to-orange-700 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Zap className="text-white fill-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white leading-none">Fiber.IA</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-white/90 font-medium">
                  Online Agora
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900/50 scrollbar-thin scrollbar-thumb-fiber-orange/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Bot Avatar */}
              {msg.role === "model" && (
                <div className="w-8 h-8 rounded-full bg-fiber-card border border-white/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                  {msg.isAlert ? (
                    <AlertTriangle size={14} className="text-yellow-500" />
                  ) : (
                    <Zap size={14} className="text-fiber-orange" />
                  )}
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm text-sm relative group ${
                  msg.role === "user"
                    ? "bg-fiber-orange text-white rounded-br-sm"
                    : msg.isAlert
                    ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-100 rounded-bl-sm"
                    : "bg-neutral-800 text-gray-200 border border-white/5 rounded-bl-sm"
                }`}
              >
                {msg.isAlert && (
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                    Notificação Automática
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </p>
                <span className="text-[9px] opacity-40 mt-1 block text-right">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-fiber-card border border-white/10 flex items-center justify-center shrink-0 mr-2">
                <Zap size={14} className="text-fiber-orange" />
              </div>
              <div className="bg-neutral-800 rounded-2xl rounded-bl-sm p-4 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions (Contextual) */}
        {!isTyping && messages.length < 3 && dashboardData && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setInput("Minha fatura vence quando?")}
              className="bg-neutral-800 hover:bg-neutral-700 text-xs text-gray-300 px-3 py-1.5 rounded-full border border-white/10 transition-colors"
            >
              📅 Vencimento Fatura
            </button>
            <button
              onClick={() => setInput("Minha internet está lenta")}
              className="bg-neutral-800 hover:bg-neutral-700 text-xs text-gray-300 px-3 py-1.5 rounded-full border border-white/10 transition-colors"
            >
              🐢 Internet Lenta
            </button>
            <button
              onClick={() => setInput("Quero o código PIX")}
              className="bg-neutral-800 hover:bg-neutral-700 text-xs text-gray-300 px-3 py-1.5 rounded-full border border-white/10 transition-colors"
            >
              💸 Código PIX
            </button>
          </div>
        )}

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-fiber-card border-t border-white/10 flex gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-grow bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-fiber-orange focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-fiber-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg shadow-orange-900/20"
          >
            {isTyping ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatWidget;
