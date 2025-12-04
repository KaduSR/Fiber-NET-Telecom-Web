import React from 'react';
import { Shield, Scale, FileText, AlertTriangle, Lock, Users, Mail, Phone } from 'lucide-react';
import Button from './Button';

const Ethics: React.FC = () => {
  return (
    <div className="bg-fiber-dark min-h-screen pt-24">
      {/* Header Section */}
      <div className="bg-fiber-card py-16 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Ética e <span className="text-fiber-orange">Compliance</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Nosso compromisso com a transparência, integridade e conformidade em todas as nossas relações.
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Programa de <span className="text-fiber-orange">Integridade</span>
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Na <strong>Fiber.Net</strong>, acreditamos que o sucesso do nosso negócio está diretamente ligado à confiança que construímos com nossos clientes, colaboradores e parceiros. 
              </p>
              <p>
                Nosso programa de integridade foi desenvolvido para assegurar que todas as nossas atividades sejam pautadas pelos mais altos padrões éticos, combatendo a corrupção e promovendo um ambiente de trabalho justo e respeitoso.
              </p>
              <p>
                Adotamos práticas rigorosas para garantir o cumprimento das leis vigentes e das normas internas, reforçando nosso compromisso de ser uma empresa 100% transparente e homologada.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-fiber-card p-6 rounded-xl border border-white/10 hover:border-fiber-orange/50 transition-colors">
              <Shield className="w-10 h-10 text-fiber-orange mb-4" />
              <h3 className="text-white font-bold mb-2">Transparência</h3>
              <p className="text-sm text-gray-400">Clareza total em nossos contratos, planos e relações comerciais.</p>
            </div>
            <div className="bg-fiber-card p-6 rounded-xl border border-white/10 hover:border-fiber-orange/50 transition-colors">
              <Scale className="w-10 h-10 text-fiber-orange mb-4" />
              <h3 className="text-white font-bold mb-2">Conformidade</h3>
              <p className="text-sm text-gray-400">Atuação rigorosa dentro das normas da ANATEL e leis brasileiras.</p>
            </div>
            <div className="bg-fiber-card p-6 rounded-xl border border-white/10 hover:border-fiber-orange/50 transition-colors">
              <Users className="w-10 h-10 text-fiber-orange mb-4" />
              <h3 className="text-white font-bold mb-2">Respeito</h3>
              <p className="text-sm text-gray-400">Valorização humana em primeiro lugar, com clientes e equipe.</p>
            </div>
            <div className="bg-fiber-card p-6 rounded-xl border border-white/10 hover:border-fiber-orange/50 transition-colors">
              <Lock className="w-10 h-10 text-fiber-orange mb-4" />
              <h3 className="text-white font-bold mb-2">Segurança</h3>
              <p className="text-sm text-gray-400">Proteção de dados e privacidade como prioridade absoluta.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Code of Conduct Section */}
      <div className="bg-neutral-900 py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FileText className="w-16 h-16 text-fiber-orange mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Código de Ética e Conduta</h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-8">
            Nosso Código de Ética e Conduta é o guia que orienta as ações de todos os colaboradores e parceiros da Fiber.Net. Ele estabelece os princípios que devem ser seguidos para garantir um ambiente ético e profissional.
          </p>
          <Button variant="outline" className="gap-2">
            Baixar Código de Ética (PDF)
          </Button>
        </div>
      </div>

      {/* Whistleblowing Channel (Canal de Denúncias) */}
      <div className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-fiber-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row">
          <div className="bg-fiber-orange p-10 md:w-1/3 flex flex-col justify-center text-white">
            <AlertTriangle className="w-16 h-16 mb-6" />
            <h3 className="text-2xl font-bold mb-4">Canal de Denúncias</h3>
            <p className="opacity-90 text-sm leading-relaxed">
              Este é um espaço seguro e confidencial para o registro de denúncias sobre condutas que violem nosso Código de Ética, políticas internas ou leis vigentes.
            </p>
          </div>
          <div className="p-10 md:w-2/3">
            <h4 className="text-xl font-bold text-white mb-6">Como fazer um relato?</h4>
            <p className="text-gray-400 mb-8 text-sm">
              A Fiber.Net garante o anonimato e a não retaliação para qualquer pessoa que, de boa-fé, relate uma preocupação. Você pode entrar em contato através dos seguintes canais:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-neutral-800 p-3 rounded-lg text-fiber-orange">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-white font-bold">E-mail</p>
                  <p className="text-gray-400 text-sm mt-1">etica@fibernettelecom.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-neutral-800 p-3 rounded-lg text-fiber-orange">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-white font-bold">Telefone</p>
                  <p className="text-gray-400 text-sm mt-1">(24) 2458-1861</p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10">
               <p className="text-xs text-gray-500">
                 *Todas as denúncias são tratadas com sigilo absoluto e analisadas pelo nosso comitê de ética.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ethics;