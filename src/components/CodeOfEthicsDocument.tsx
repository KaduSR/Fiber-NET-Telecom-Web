import React from "react";
import { FileText, Download, Shield, ArrowLeft, Printer } from "lucide-react";
import Button from "./Button";
import FiberNetLogo from "./FiberNetLogo";
import { generateEthicsCodePDF } from "../../utils/generateEthicsCodePDF";

interface CodeOfEthicsDocumentProps {
  onNavigate?: (page: string) => void;
}

const CodeOfEthicsDocument: React.FC<CodeOfEthicsDocumentProps> = ({
  onNavigate,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-fiber-dark min-h-screen pt-24 pb-20 animate-fadeIn print:bg-white print:pt-0 print:pb-0">
      {/* Header Section - Oculto na Impressão */}
      <div className="bg-fiber-card py-16 border-b border-white/5 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-fiber-orange/10 rounded-full text-fiber-orange mb-6">
            <FileText size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Código de Ética e <span className="text-fiber-orange">Conduta</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Documento oficial contendo as diretrizes de integridade, compliance
            e normas de conduta da Fiber.Net Telecom.
          </p>
        </div>
      </div>

      {/* Controls Section - Oculto na Impressão */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:hidden flex justify-between items-center">
        {onNavigate && (
          <button
            onClick={() => onNavigate("ethics")}
            className="flex items-center text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft
              size={20}
              className="mr-2 group-hover:-translate-x-1 transition-transform"
            />
            Voltar
          </button>
        )}
        <div className="flex gap-4">
          <Button
            onClick={generateEthicsCodePDF}
            variant="primary"
            className="gap-2 shadow-lg hover:shadow-fiber-orange/20"
          >
            <Download size={18} /> Baixar PDF
          </Button>
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer size={18} /> Imprimir
          </Button>
        </div>
      </div>

      {/* DOCUMENTO A4 VISUAL */}
      <div className="max-w-[210mm] mx-auto bg-white text-black shadow-2xl print:shadow-none print:w-full print:max-w-none">
        {/* PÁGINA 1 */}
        <div className="p-[20mm] min-h-[297mm] flex flex-col relative">
          {/* Cabeçalho do Documento */}
          <div className="flex justify-between items-center border-b-2 border-neutral-800 pb-6 mb-10">
            <div>
              {/* Logo Placeholder para Impressão */}
              <div className="text-2xl font-black tracking-tighter uppercase">
                Fiber<span className="text-orange-600">.Net</span>
              </div>
              <div className="text-xs text-gray-500 font-bold tracking-widest mt-1">
                TELECOMUNICAÇÕES
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                Documento Oficial
              </div>
              <div className="font-mono text-sm">REV. 2025.1</div>
            </div>
          </div>

          {/* Título */}
          <div className="text-center mb-16 mt-10">
            <h1 className="text-4xl font-serif font-bold text-neutral-900 mb-4">
              CÓDIGO DE ÉTICA E CONDUTA
            </h1>
            <div className="w-24 h-1 bg-orange-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 italic">
              "Conectando pessoas com integridade, transparência e respeito."
            </p>
          </div>

          {/* Índice / Sumário */}
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 mb-10">
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wider text-neutral-700">
              Sumário
            </h3>
            <ul className="space-y-2 font-serif text-sm">
              <li className="flex justify-between">
                <span>1. Mensagem da Diretoria</span>{" "}
                <span className="text-gray-400">...................</span>{" "}
                <span>01</span>
              </li>
              <li className="flex justify-between">
                <span>2. Objetivo e Abrangência</span>{" "}
                <span className="text-gray-400">...................</span>{" "}
                <span>01</span>
              </li>
              <li className="flex justify-between">
                <span>3. Nossos Princípios Fundamentais</span>{" "}
                <span className="text-gray-400">...................</span>{" "}
                <span>02</span>
              </li>
              <li className="flex justify-between">
                <span>4. Relação com Clientes e Sociedade</span>{" "}
                <span className="text-gray-400">...................</span>{" "}
                <span>02</span>
              </li>
              <li className="flex justify-between">
                <span>5. Segurança da Informação (LGPD)</span>{" "}
                <span className="text-gray-400">...................</span>{" "}
                <span>03</span>
              </li>
              <li className="flex justify-between">
                <span>6. Canal de Denúncias</span>{" "}
                <span className="text-gray-400">...................</span>{" "}
                <span>03</span>
              </li>
            </ul>
          </div>

          {/* Rodapé da Página */}
          <div className="mt-auto pt-8 border-t border-gray-200 flex justify-between text-[10px] text-gray-500 font-mono uppercase">
            <span>Fiber.Net Telecom Ltda</span>
            <span>Página 1 de 3</span>
          </div>
        </div>

        {/* PÁGINA 2 */}
        <div className="p-[20mm] min-h-[297mm] flex flex-col relative border-t print:border-t-0 break-before-page">
          {/* Conteúdo Texto */}
          <div className="font-serif text-justify leading-relaxed text-neutral-800 space-y-6">
            <section>
              <h3 className="text-lg font-bold font-sans text-neutral-900 mb-2 uppercase flex items-center gap-2">
                <span className="bg-neutral-900 text-white w-6 h-6 flex items-center justify-center text-xs rounded">
                  1
                </span>
                Mensagem da Diretoria
              </h3>
              <p className="mb-4">
                A Fiber.Net nasceu com o propósito não apenas de prover internet
                de qualidade, mas de construir relacionamentos duradouros
                baseados na confiança. Este Código de Ética não é apenas um
                documento formal; é a bússola que guia nossas decisões diárias.
                Esperamos que cada colaborador e parceiro leia, compreenda e
                vivencie estes princípios.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold font-sans text-neutral-900 mb-2 uppercase flex items-center gap-2">
                <span className="bg-neutral-900 text-white w-6 h-6 flex items-center justify-center text-xs rounded">
                  2
                </span>
                Objetivo e Abrangência
              </h3>
              <p>
                Este documento estabelece as diretrizes de conduta esperadas de
                todos os colaboradores, diretores, fornecedores e prestadores de
                serviço da Fiber.Net. O não cumprimento destas normas está
                sujeito a medidas disciplinares, conforme a legislação vigente e
                normas internas da empresa.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold font-sans text-neutral-900 mb-2 uppercase flex items-center gap-2">
                <span className="bg-neutral-900 text-white w-6 h-6 flex items-center justify-center text-xs rounded">
                  3
                </span>
                Nossos Princípios Fundamentais
              </h3>
              <div className="pl-4 border-l-4 border-orange-100 space-y-4">
                <div>
                  <strong className="block font-sans text-orange-700">
                    3.1 Integridade
                  </strong>
                  <p>
                    Agimos com honestidade em todas as situações. Rejeitamos
                    qualquer forma de suborno, propina ou favorecimento ilícito.
                    A verdade é inegociável.
                  </p>
                </div>
                <div>
                  <strong className="block font-sans text-orange-700">
                    3.2 Profissionalismo e Respeito
                  </strong>
                  <p>
                    O ambiente de trabalho deve ser livre de assédio moral,
                    sexual ou qualquer tipo de discriminação (raça, cor,
                    religião, gênero, orientação sexual). Promovemos o respeito
                    mútuo.
                  </p>
                </div>
                <div>
                  <strong className="block font-sans text-orange-700">
                    3.3 Conflito de Interesses
                  </strong>
                  <p>
                    Colaboradores devem evitar situações onde seus interesses
                    pessoais possam conflitar com os interesses da Fiber.Net.
                    Qualquer potencial conflito deve ser declarado imediatamente
                    ao gestor.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold font-sans text-neutral-900 mb-2 uppercase flex items-center gap-2">
                <span className="bg-neutral-900 text-white w-6 h-6 flex items-center justify-center text-xs rounded">
                  4
                </span>
                Relação com Clientes e Sociedade
              </h3>
              <p>
                Nosso cliente é nosso maior patrimônio. O atendimento deve ser
                sempre transparente, cortês e eficiente. Não prometemos o que
                não podemos cumprir e corrigimos erros com agilidade.
                Respeitamos as normas da ANATEL e os direitos do consumidor.
              </p>
            </section>
          </div>

          {/* Rodapé da Página */}
          <div className="mt-auto pt-8 border-t border-gray-200 flex justify-between text-[10px] text-gray-500 font-mono uppercase">
            <span>Fiber.Net Telecom Ltda</span>
            <span>Página 2 de 3</span>
          </div>
        </div>

        {/* PÁGINA 3 */}
        <div className="p-[20mm] min-h-[297mm] flex flex-col relative border-t print:border-t-0 break-before-page">
          <div className="font-serif text-justify leading-relaxed text-neutral-800 space-y-6">
            <section>
              <h3 className="text-lg font-bold font-sans text-neutral-900 mb-2 uppercase flex items-center gap-2">
                <span className="bg-neutral-900 text-white w-6 h-6 flex items-center justify-center text-xs rounded">
                  5
                </span>
                Segurança da Informação (LGPD)
              </h3>
              <p className="mb-4">
                A Fiber.Net trata dados pessoais de clientes e colaboradores com
                rigorosa confidencialidade, em conformidade com a Lei Geral de
                Proteção de Dados (LGPD).
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  É proibido compartilhar dados de clientes com terceiros sem
                  autorização.
                </li>
                <li>
                  O acesso aos sistemas da empresa é pessoal e intransferível.
                </li>
                <li>
                  Documentos físicos contendo dados sensíveis devem ser
                  descartados de forma segura.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold font-sans text-neutral-900 mb-2 uppercase flex items-center gap-2">
                <span className="bg-neutral-900 text-white w-6 h-6 flex items-center justify-center text-xs rounded">
                  6
                </span>
                Canal de Denúncias
              </h3>
              <p>
                A empresa mantém um canal aberto para o reporte de violações a
                este código. As denúncias podem ser feitas de forma anônima e
                são tratadas com sigilo absoluto. A Fiber.Net garante a não
                retaliação ao denunciante de boa-fé.
              </p>
              <div className="mt-4 p-4 bg-gray-100 rounded border border-gray-300">
                <p className="font-bold text-center">Canais Oficiais:</p>
                <p className="text-center font-mono text-sm mt-2">
                  E-mail: etica@fibernettelecom.com
                </p>
                <p className="text-center font-mono text-sm">
                  Telefone: (24) 2458-1861
                </p>
              </div>
            </section>

            <section className="mt-12 pt-12 border-t-2 border-dashed border-gray-300 text-center">
              <p className="font-bold mb-8">TERMO DE COMPROMISSO</p>
              <p className="text-sm mb-12">
                Declaro que recebi, li e compreendi o Código de Ética e Conduta
                da Fiber.Net, comprometendo-me a cumprir suas diretrizes.
              </p>

              <div className="flex justify-between gap-8 mt-16 px-10">
                <div className="flex-1 border-t border-black pt-2">
                  <p className="text-xs uppercase">Assinatura do Colaborador</p>
                </div>
                <div className="flex-1 border-t border-black pt-2">
                  <p className="text-xs uppercase">Data</p>
                </div>
              </div>
            </section>
          </div>

          {/* Rodapé da Página */}
          <div className="mt-auto pt-8 border-t border-gray-200 flex justify-between text-[10px] text-gray-500 font-mono uppercase">
            <span>Fiber.Net Telecom Ltda</span>
            <span>Página 3 de 3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeOfEthicsDocument;
