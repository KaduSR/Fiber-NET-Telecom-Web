import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  HelpCircle,
  MessageCircle,
  Search,
  Wifi,
  Wrench,
} from "lucide-react";
import React, { useState } from "react";
import { CONTACT_INFO } from "../types/constants";
import Button from "./Button";

interface HelpCenterProps {
  onNavigate?: (page: string) => void;
  onOpenSegundaVia?: () => void;
}

const CATEGORIES = ["Financeiro", "Suporte Técnico", "Wi-Fi", "Geral"];

const FAQ_DATA: Record<string, { question: string; answer: string }[]> = {
  Financeiro: [
    {
      question: "Como emitir a 2ª via do boleto?",
      answer:
        'Você pode emitir a 2ª via rapidamente clicando no botão "2ª Via" no menu deste site, acessando a Área do Cliente, ou solicitando ao nosso Bot no WhatsApp.',
    },
    {
      question: "Todas as formas de pagamento aceitas",
      answer: `FORMAS DE PAGAMENTO DA FIBER.NET:

🟢 PIX (RECOMENDADO - Baixa em até 1h):
   - Copie o código no boleto
   - Cole no seu banco
   - Confirmação automática

🔵 Código de Barras (Baixa em 1-2 dias úteis):
   - Use o código no app do banco
   - Ou pague em lotéricas/bancos

🏦 Débito Automático (Em breve):
   - Solicite via WhatsApp
   - Sem risco de atraso

❌ NÃO ACEITAMOS:
   - Cartão de crédito
   - Dinheiro em espécie
   - Cheque

DÚVIDAS: (24) 2458-1861`,
    },
    {
      question:
        "Minha internet foi bloqueada por falta de pagamento. Como liberar?",
      answer:
        'Após o pagamento via PIX, a liberação ocorre automaticamente em até 1 hora. Se pagar via código de barras, pode levar até 1 dia útil. Você também pode solicitar o "Desbloqueio de Confiança" uma vez por mês na Área do Cliente.',
    },
    {
      question: "Posso mudar a data de vencimento da fatura?",
      answer:
        "Sim! Entre em contato com nosso setor financeiro pelo WhatsApp para solicitar a alteração da data de vencimento para o próximo ciclo de faturamento.",
    },
  ],
  "Suporte Técnico": [
    {
      question: "Minha internet está lenta. Checklist completo de verificação",
      answer: `DIAGNÓSTICO PASSO A PASSO:

✅ TESTE 1 - Reiniciar Modem (Resolve 70% dos casos)
   1. Desligar da tomada
   2. Aguardar 30 segundos
   3. Religar
   4. Aguardar 2 minutos para estabilizar

✅ TESTE 2 - Cabo vs Wi-Fi
   1. Conecte um computador direto no cabo
   2. Acesse speedtest.net
   3. Se velocidade estiver OK, problema é no Wi-Fi
   
✅ TESTE 3 - Posicionamento do Roteador
   - Deve estar em local ALTO e CENTRAL
   - Longe de microondas, geladeira, espelhos
   - Sem obstáculos entre ele e seus dispositivos

✅ TESTE 4 - Quantos dispositivos conectados?
   - Vá em 192.168.1.1 (senha no roteador)
   - Veja quantos aparelhos estão conectados
   - Remova os desconhecidos

SE NADA RESOLVER: WhatsApp (24) 2458-1861`,
    },
    {
      question: 'A luz "LOS" do modem está vermelha ou piscando.',
      answer:
        "Isso indica rompimento ou falha no sinal de fibra óptica que chega até sua casa. Por favor, entre em contato imediatamente com o suporte técnico para agendar uma visita de reparo.",
    },
    {
      question: 'A luz "PON" está piscando.',
      answer:
        "A luz PON piscando indica que o modem está tentando se autenticar, mas não consegue. Pode ser uma manutenção na região ou desconfiguração. Reinicie o aparelho e, se não voltar em 5 minutos, chame o suporte.",
    },
  ],
  "Wi-Fi": [
    {
      question: "Como mudar a senha do Wi-Fi?",
      answer:
        "Por questões de segurança e configuração técnica, a troca de senha é realizada pela nossa equipe. Basta solicitar pelo WhatsApp que faremos a alteração remotamente em instantes.",
    },
    {
      question: "Qual a diferença entre a rede 2.4GHz e 5GHz?",
      answer:
        "A rede 5GHz é mais rápida e sofre menos interferência, ideal para jogos e streaming, mas tem alcance menor (funciona melhor no mesmo cômodo). A rede 2.4GHz é mais lenta, mas o sinal chega mais longe (atravessa mais paredes).",
    },
    {
      question: "Onde devo posicionar meu roteador?",
      answer:
        "O roteador deve ficar em um local central da casa e o mais alto possível. Evite colocá-lo dentro de móveis, gavetas ou atrás de espelhos e aquários, pois isso bloqueia o sinal Wi-Fi.",
    },
  ],
  Geral: [
    {
      question: "Como funciona a instalação da Fiber.Net?",
      answer: `PASSO A PASSO DA INSTALAÇÃO:

1. AGENDAMENTO (Mesmo dia ou 24h):
   - Entre em contato via WhatsApp (24) 2458-1861
   - Ou pelo telefone (24) 2458-1861
   - Informe seu nome completo ou CPF/CNPJ
   - Escolha o melhor Périodo para a visita técnica

2. VISITA TÉCNICA (1-2 horas):
   - Técnico verifica viabilidade
   - Define melhor ponto para entrada da fibra
   - Explica o processo completo
   
3. INSTALAÇÃO (2-4 horas):
   - Passagem do cabo de fibra óptica
   - Instalação da ONU/ONT (modem)
   - Configuração do Wi-Fi
   - Teste de velocidade
   
4. ENTREGA:
   - Login e senha do Wi-Fi
   - Explicação sobre uso do equipamento
   - Contrato assinado

IMPORTANTE: Instalação 100% GRATUITA!`,
    },
    {
      question: "Como faço para contratar um plano?",
      answer:
        "Você pode contratar diretamente pelo nosso WhatsApp, clicando no botão de contato aqui no site. Nossa equipe comercial irá verificar a viabilidade técnica para o seu endereço imediatamente.",
    },
    {
      question: "Qual o horário de atendimento?",
      answer:
        "Nosso suporte técnico e comercial atende de Segunda a Sexta das 08h às 17:30h e aos Sábados das 08h às 12h. Fora desses horários, temos monitoramento de rede ativo.",
    },
    {
      question: "A Fiber.Net atende em quais cidades?",
      answer:
        "Atualmente atendemos Rio das Flores e toda a região circunvizinha, incluindo áreas rurais específicas. Consulte a viabilidade exata pelo WhatsApp.",
    },
    {
      question: "O serviço possui fidelidade?",
      answer:
        "Sim, nossos planos residenciais possuem fidelidade contratual de 12 meses, garantindo instalação gratuita e equipamentos em comodato.",
    },
  ],
};
const HelpCenter: React.FC<HelpCenterProps> = ({ onOpenSegundaVia }) => {
  const [activeCategory, setActiveCategory] = useState<string>("Financeiro");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Financeiro":
        return <DollarSign size={18} />;
      case "Suporte Técnico":
        return <Wrench size={18} />;
      case "Wi-Fi":
        return <Wifi size={18} />;
      default:
        return <HelpCircle size={18} />;
    }
  };

  // Filtragem das perguntas baseada na categoria ativa e na busca
  const currentQuestions = (FAQ_DATA[activeCategory] || []).filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-fiber-dark min-h-screen pt-24">
      {/* Hero Section */}
      <div className="bg-fiber-card py-16 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fiber-orange opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Como podemos <span className="text-fiber-orange">ajudar?</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Selecione uma categoria abaixo para encontrar respostas rápidas.
          </p>

          <div className="max-w-2xl mx-auto relative hidden md:block">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Pesquisar em ${activeCategory}...`}
              className="w-full bg-neutral-900 border border-white/10 rounded-full py-4 px-6 pl-12 text-white focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all placeholder-gray-500 shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de Categorias */}
          <div className="w-full lg:w-1/4">
            <div className="bg-fiber-card border border-white/10 rounded-xl overflow-hidden sticky top-24 lg:top-28 z-20 shadow-xl">
              <div className="p-4 bg-neutral-900 border-b border-white/5 font-bold text-white uppercase text-xs">
                Categorias
              </div>
              <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible lg">
                {CATEGORIES.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveCategory(category);
                        setOpenIndex(null);
                        setSearchTerm(""); // Limpa busca ao trocar categoria
                      }}
                      className={`flex items-center gap-3 p-4 text-left transition-all whitespace-nowrap lg:whitespace-normal
                            ${
                              isActive
                                ? "bg-fiber-orange text-white"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }
                        `}
                    >
                      {getCategoryIcon(category)}
                      <span className="font-medium text-sm">{category}</span>
                      {isActive && (
                        <ChevronRight
                          size={16}
                          className="ml-auto hidden lg:block"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner de Suporte */}
            <div className="mt-6 bg-gradient-to-br from-neutral-900 to-fiber-card border border-white/10 rounded-xl p-6 text-center hidden lg:block">
              <div className="w-12 h-12 bg-fiber-green/20 rounded-full flex items-center justify-center mx-auto mb-4 text-fiber-green">
                <MessageCircle size={24} />
              </div>
              <h4 className="text-white font-bold mb-2">
                Não achou o que procura?
              </h4>
              <p className="text-gray-400 text-xs mb-4">
                Nosso time está online no WhatsApp para te ajudar.
              </p>
              <Button
                variant="whatsapp"
                fullWidth
                onClick={() =>
                  window.open(
                    `https://wa.me/55${CONTACT_INFO.whatsapp.replace(
                      /\D/g,
                      "",
                    )}`,
                    "_blank",
                  )
                }
                className="!text-xs"
              >
                Falar no WhatsApp
              </Button>
            </div>
          </div>

          {/* Accordion Content */}
          <div className="w-full lg:w-3/4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-fiber-orange font-bold text-lg">#</span>
                <h2 className="text-2xl font-bold text-white">
                  {activeCategory}
                </h2>
              </div>

              {/* Mobile Search Input */}
              <div className="md:hidden relative w-1/2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 px-3 pl-8 text-xs text-white focus:outline-none focus:border-fiber-orange"
                />
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 w-3 h-3" />
              </div>
            </div>

            <div className="space-y-4">
              {currentQuestions.length > 0 ? (
                currentQuestions.map((item, index) => (
                  <div
                    key={index}
                    className="bg-fiber-card border border-white/10 rounded-xl overflow-hidden transition-all hover:border-fiber-orange/30"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none group"
                    >
                      <span
                        className={`font-medium pr-4 text-base md:text-lg transition-colors ${
                          openIndex === index
                            ? "text-fiber-orange"
                            : "text-white group-hover:text-gray-200"
                        }`}
                      >
                        {item.question}
                      </span>
                      <div
                        className={`transition-transform duration-300 ${
                          openIndex === index ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        <ChevronDown
                          className={`w-5 h-5 ${
                            openIndex === index
                              ? "text-fiber-orange"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        openIndex === index
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-6 pt-0">
                        <div className="border-t border-white/5 pt-4 text-gray-400 text-sm leading-relaxed flex gap-3">
                          <div className="min-w-[4px] bg-fiber-orange/50 rounded-full"></div>
                          <div className="whitespace-pre-line">
                            {item.answer}
                            {activeCategory === "Financeiro" &&
                              item.question.includes("2ª via") && (
                                <div className="mt-3">
                                  <Button
                                    variant="outline"
                                    className="!py-1.5 !px-3 !text-xs"
                                    onClick={onOpenSegundaVia}
                                  >
                                    Acessar 2ª Via Agora
                                  </Button>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-white/5">
                  <p>Nenhuma pergunta encontrada para "{searchTerm}".</p>
                </div>
              )}
            </div>

            {/* Mobile Support Banner */}
            <div className="mt-8 lg:hidden bg-neutral-900 border border-white/10 rounded-xl p-6 text-center">
              <h4 className="text-white font-bold mb-2">Ainda com dúvidas?</h4>
              <Button
                variant="whatsapp"
                fullWidth
                onClick={() =>
                  window.open(
                    `https://wa.me/55${CONTACT_INFO.whatsapp.replace(
                      /\D/g,
                      "",
                    )}`,
                    "_blank",
                  )
                }
              >
                Chamar no WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
