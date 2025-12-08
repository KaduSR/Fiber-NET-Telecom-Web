import React, { useEffect, useState } from 'react';
import { ThumbsUp, Users, Monitor, RefreshCcw } from 'lucide-react';

const Features: React.FC = () => {
  const values = [
    {
      title: 'Qualidade em Telecomunicações',
      desc: 'Prestar um serviço de qualidade na área de telecomunicações levando internet para todas as residências.',
      icon: ThumbsUp
    },
    {
      title: 'Respeito ao Cliente',
      desc: 'Respeito total com o assinante, garantindo satisfação e atendimento humanizado.',
      icon: Users
    },
    {
      title: 'Valorização da Equipe',
      desc: 'Total consideração com as pessoas que fazem parte da nossa empresa.',
      icon: Monitor
    },
    {
      title: 'Espírito de Cooperação',
      desc: 'Espírito de cooperação com os fornecedores, colaboradores, e principalmente nossos clientes.',
      icon: RefreshCcw
    }
  ];

  return (
    <section className="py-20 bg-fiber-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título semântico para SEO (visualmente integrado ou oculto se preferir, aqui mantido visível para estrutura) */}
        <h2 className="sr-only">Diferenciais de Banda Larga e Fibra Óptica</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <div key={i} className="p-8 bg-fiber-card rounded-xl border border-white/5 hover:border-fiber-orange/30 transition-all h-full flex flex-col">
              <div className="w-12 h-12 rounded-lg border border-fiber-orange text-fiber-orange flex items-center justify-center mb-6">
                <v.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 leading-tight">{v.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;