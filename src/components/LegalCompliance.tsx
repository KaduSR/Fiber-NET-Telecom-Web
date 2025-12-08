
import React, { useState } from 'react';
import { Shield, Lock, FileText, Scale, Eye, UserCheck, Server, AlertCircle, Download, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './Button';

const LegalCompliance: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>('lgpd');

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="bg-fiber-dark min-h-screen pt-24 pb-20 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-fiber-card py-16 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-fiber-blue/10 rounded-full text-fiber-blue mb-6">
             <Shield size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Conformidade Legal e <span className="text-fiber-blue">Privacidade</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Transparência total sobre como protegemos seus dados e operamos de acordo com a LGPD e regulamentações da ANATEL.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Aviso de DPO */}
        <div className="bg-neutral-900 border border-fiber-blue/30 rounded-xl p-6 mb-12 flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-fiber-blue/5">
            <div className="p-4 bg-fiber-blue/10 rounded-full text-fiber-blue shrink-0">
                <UserCheck size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-white mb-1">Encarregado de Dados (DPO)</h3>
                <p className="text-gray-400 text-sm mb-3">
                    Para exercer seus direitos de titular (acesso, correção ou exclusão de dados), entre em contato com nosso encarregado de proteção de dados.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                    <div className="bg-black/30 px-3 py-1.5 rounded text-sm text-fiber-blue border border-white/5 font-mono">
                        dpo@fibernettelecom.com
                    </div>
                </div>
            </div>
        </div>

        {/* Seções Expansíveis */}
        <div className="space-y-4">

            {/* 1. LGPD */}
            <div className="bg-fiber-card border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
                <button 
                    onClick={() => toggleSection('lgpd')}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <Lock className="text-fiber-orange" size={24} />
                        <div>
                            <h3 className="text-lg font-bold text-white">LGPD - Lei Geral de Proteção de Dados</h3>
                            <p className="text-xs text-gray-500">Lei nº 13.709/2018</p>
                        </div>
                    </div>
                    {activeSection === 'lgpd' ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>
                
                {activeSection === 'lgpd' && (
                    <div className="p-6 pt-0 border-t border-white/5 bg-neutral-900/50">
                        <div className="prose prose-invert max-w-none text-sm text-gray-400 leading-relaxed space-y-4 pt-4">
                            <p>
                                A Fiber.Net Telecom coleta e trata dados pessoais com a finalidade exclusiva de prestar serviços de telecomunicações, emitir faturas e cumprir obrigações legais.
                            </p>
                            <h4 className="text-white font-bold">Seus Direitos:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong className="text-gray-300">Confirmação e Acesso:</strong> Você pode solicitar saber quais dados temos sobre você.</li>
                                <li><strong className="text-gray-300">Correção:</strong> Solicitar a atualização de dados incorretos ou desatualizados.</li>
                                <li><strong className="text-gray-300">Portabilidade:</strong> Transferir seus dados para outro fornecedor de serviço.</li>
                                <li><strong className="text-gray-300">Eliminação:</strong> Solicitar a exclusão de dados (exceto os necessários para cumprimento legal/fiscal).</li>
                            </ul>
                            <h4 className="text-white font-bold">Coleta de Dados:</h4>
                            <p>
                                Coletamos: Nome completo, CPF/CNPJ, Endereço, Telefone, E-mail e Logs de Conexão (obrigatório pelo Marco Civil da Internet - Lei 12.965/14).
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Marco Civil da Internet */}
            <div className="bg-fiber-card border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
                <button 
                    onClick={() => toggleSection('marco')}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <Server className="text-fiber-blue" size={24} />
                        <div>
                            <h3 className="text-lg font-bold text-white">Marco Civil da Internet</h3>
                            <p className="text-xs text-gray-500">Neutralidade e Guarda de Logs</p>
                        </div>
                    </div>
                    {activeSection === 'marco' ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>
                
                {activeSection === 'marco' && (
                    <div className="p-6 pt-0 border-t border-white/5 bg-neutral-900/50">
                        <div className="prose prose-invert max-w-none text-sm text-gray-400 leading-relaxed space-y-4 pt-4">
                            <p>
                                Em conformidade com a Lei 12.965/14, a Fiber.Net respeita a <strong>neutralidade da rede</strong>, tratando todo pacote de dados de forma isonômica, sem distinção por conteúdo, origem, destino ou serviço.
                            </p>
                            <p>
                                Somos obrigados por lei a manter os registros de conexão (Data, Hora de Início/Fim e IP) pelo prazo de <strong>1 ano</strong>, em ambiente controlado e seguro. Estes dados só são disponibilizados mediante ordem judicial.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Regulamentação ANATEL (SCM) */}
            <div className="bg-fiber-card border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
                <button 
                    onClick={() => toggleSection('scm')}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <Scale className="text-fiber-lime" size={24} />
                        <div>
                            <h3 className="text-lg font-bold text-white">Licença SCM - ANATEL</h3>
                            <p className="text-xs text-gray-500">Serviço de Comunicação Multimídia</p>
                        </div>
                    </div>
                    {activeSection === 'scm' ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>
                
                {activeSection === 'scm' && (
                    <div className="p-6 pt-0 border-t border-white/5 bg-neutral-900/50">
                        <div className="prose prose-invert max-w-none text-sm text-gray-400 leading-relaxed space-y-4 pt-4">
                            <p>
                                A TELECOM FIBER NET LTDA (CNPJ 22.969.088/0001-97) é uma empresa devidamente outorgada pela Agência Nacional de Telecomunicações (ANATEL) para prestar o Serviço de Comunicação Multimídia (SCM).
                            </p>
                            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <AlertCircle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-yellow-100">
                                    Central de Atendimento ANATEL: 1331 (Funciona de segunda a sexta, das 8h às 20h).
                                </p>
                            </div>
                            <p>
                                O Contrato de Prestação de Serviços e o Plano de Serviço aderido pelo assinante encontram-se registrados e disponíveis para consulta abaixo.
                            </p>
                        </div>
                    </div>
                )}
            </div>

        </div>

        {/* Área de Downloads */}
        <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="text-gray-500" /> Documentos Públicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-900 border border-white/10 rounded-xl flex items-center justify-between group hover:border-fiber-orange/50 transition-colors">
                    <div>
                        <h4 className="text-white font-bold text-sm">Política de Privacidade</h4>
                        <p className="text-gray-500 text-xs">Versão 2025.1 (PDF)</p>
                    </div>
                    <Button variant="outline" className="!p-2 !rounded-full">
                        <Download size={18} />
                    </Button>
                </div>

                <div className="p-4 bg-neutral-900 border border-white/10 rounded-xl flex items-center justify-between group hover:border-fiber-orange/50 transition-colors">
                    <div>
                        <h4 className="text-white font-bold text-sm">Contrato de Prestação SCM</h4>
                        <p className="text-gray-500 text-xs">Termo Padrão ANATEL</p>
                    </div>
                    <Button variant="outline" className="!p-2 !rounded-full">
                        <Download size={18} />
                    </Button>
                </div>

                <div className="p-4 bg-neutral-900 border border-white/10 rounded-xl flex items-center justify-between group hover:border-fiber-orange/50 transition-colors">
                    <div>
                        <h4 className="text-white font-bold text-sm">Termos de Uso do Site</h4>
                        <p className="text-gray-500 text-xs">Regras de utilização</p>
                    </div>
                    <Button variant="outline" className="!p-2 !rounded-full">
                        <Download size={18} />
                    </Button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LegalCompliance;
