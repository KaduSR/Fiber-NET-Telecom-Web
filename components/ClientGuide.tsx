import React from 'react';
import { FileText, Wifi, ShieldCheck, Router, AlertCircle, CheckCircle } from 'lucide-react';
import Button from './Button';

const ClientGuide: React.FC = () => {
  return (
    <div className="bg-fiber-dark min-h-screen pt-24">
      {/* Hero Section */}
      <div className="bg-fiber-card py-16 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-3 rounded-full bg-fiber-orange/10 text-fiber-orange mb-6">
             <FileText size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Guia do <span className="text-fiber-orange">Cliente</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tudo o que você precisa saber para aproveitar ao máximo a sua conexão Fiber.Net.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* 1. Understanding the Invoice */}
        <section className="bg-neutral-900 rounded-2xl p-8 md:p-10 border border-white/5">
          <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-fiber-blue/20 rounded-lg text-fiber-blue">
                   <FileText size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Entendendo sua Fatura</h2>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Nossa fatura foi desenhada para ser simples e transparente. Veja os principais pontos de atenção para identificar seus dados e valores.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="text-fiber-green w-5 h-5 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="text-white font-bold block">Vencimento</span>
                    <span className="text-gray-500 text-sm">Fique atento à data de vencimento para evitar bloqueios automáticos.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-fiber-green w-5 h-5 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="text-white font-bold block">Dados do Beneficiário</span>
                    <span className="text-gray-500 text-sm">Confira sempre se o beneficiário é a <strong>FIBER.NET - TELECOM FIBER NET LTDA</strong>.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-fiber-green w-5 h-5 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="text-white font-bold block">QR Code Pix</span>
                    <span className="text-gray-500 text-sm">Use o QR Code no corpo do boleto para baixa imediata do pagamento.</span>
                  </div>
                </li>
              </ul>
              <div className="mt-8">
                <Button variant="outline" onClick={() => window.open('https://wa.me/552424581861', '_blank')}>
                   Solicitar 2ª Via
                </Button>
              </div>
            </div>

            {/* Boleto Visualization SICOOB Style */}
            <div className="w-full max-w-md bg-white text-black text-[10px] font-sans p-4 rounded shadow-2xl border border-gray-200 select-none transform hover:scale-105 transition-transform duration-300 origin-top">
              
              {/* Boleto Header */}
              <div className="flex items-center border-b-2 border-gray-800 pb-1 mb-1">
                <div className="flex items-center gap-1 pr-4 border-r-2 border-gray-800">
                   {/* Sicoob Logo Icon */}
                   <div className="w-5 h-5 bg-[#00AE9D] clip-path-triangle relative">
                      <div className="absolute inset-0 bg-[#343433] opacity-20 transform rotate-45"></div>
                   </div>
                   <span className="font-bold text-lg tracking-tighter text-[#003641]">SICOOB</span>
                </div>
                <div className="px-4 text-xl font-bold border-r-2 border-gray-800">756</div>
                <div className="flex-1 text-right text-xs sm:text-sm font-mono tracking-widest truncate pl-2">
                  75691.32603 01082.304005 08552.020011 1 12610000008990
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-4 border border-gray-400">
                {/* Row 1 */}
                <div className="col-span-3 border-r border-b border-gray-400 p-1">
                  <div className="text-[8px] text-gray-600 uppercase tracking-tight">Local de Pagamento</div>
                  <div className="font-bold text-[10px]">Pagar preferencialmente no banco emitente</div>
                </div>
                <div className="col-span-1 border-b border-gray-400 p-1 bg-[#f0f0f0]">
                  <div className="text-[8px] text-gray-600 uppercase tracking-tight">Vencimento</div>
                  <div className="font-bold text-xs">10/11/2025</div>
                </div>

                {/* Row 2 */}
                <div className="col-span-3 border-r border-b border-gray-400 p-1">
                   <div className="text-[8px] text-gray-600 uppercase tracking-tight">Beneficiário</div>
                   <div className="font-bold text-[10px]">FIBER.NET - 22.969.088/0001-97</div>
                   <div className="text-[8px] text-gray-500 truncate">ROD RJ 145, 53320, ELIZABETH - Rio das Flores/RJ - 27660-000</div>
                </div>
                <div className="col-span-1 border-b border-gray-400 p-1">
                   <div className="text-[8px] text-gray-600 uppercase tracking-tight">Agência/Código Beneficiário</div>
                   <div className="font-bold text-[10px] text-right">3260/823040</div>
                </div>

                {/* Row 3 - Data/Number/Esp/Aceite/Processamento */}
                <div className="col-span-3 grid grid-cols-5 border-r border-b border-gray-400">
                    <div className="border-r border-gray-400 p-1 col-span-1">
                       <div className="text-[8px] text-gray-600">Data Doc.</div>
                       <div className="font-bold">10/11/2025</div>
                    </div>
                    <div className="border-r border-gray-400 p-1 col-span-1">
                       <div className="text-[8px] text-gray-600">Número Doc.</div>
                       <div className="font-bold">225482</div>
                    </div>
                     <div className="border-r border-gray-400 p-1 col-span-1">
                       <div className="text-[8px] text-gray-600">Espécie Doc.</div>
                       <div className="font-bold">DM</div>
                    </div>
                     <div className="border-r border-gray-400 p-1 col-span-1">
                       <div className="text-[8px] text-gray-600">Aceite</div>
                       <div className="font-bold">N</div>
                    </div>
                    <div className="p-1 col-span-1">
                       <div className="text-[8px] text-gray-600">Data Proc.</div>
                       <div className="font-bold">10/11/2025</div>
                    </div>
                </div>
                <div className="col-span-1 border-b border-gray-400 p-1">
                   <div className="text-[8px] text-gray-600 uppercase tracking-tight">Nosso Número</div>
                   <div className="font-bold text-[10px] text-right">855202</div>
                </div>

                {/* Row 4 - Values & Instructions */}
                <div className="col-span-3 border-r border-gray-400 p-1 min-h-[120px] relative">
                    <div className="text-[8px] text-gray-600 mb-1">Instruções de responsabilidade do BENEFICIÁRIO. Qualquer dúvida sobre este boleto contate o beneficiário</div>
                    <div className="font-bold text-[10px] mb-0.5">Após vencimento juros R$ 0,03 ao dia.</div>
                    <div className="font-bold text-[10px] mb-4">Após vencimento multa R$ 1,80.</div>
                    
                    {/* QR Code Mock */}
                    <div className="absolute bottom-2 right-2 w-16 h-16 md:w-20 md:h-20 bg-white border border-gray-300 p-1">
                       <div className="w-full h-full bg-neutral-900 grid grid-cols-5 grid-rows-5 gap-0.5 p-0.5">
                         {/* Simple Pattern */}
                         <div className="bg-white col-span-2 row-span-2"></div>
                         <div className="bg-white col-start-4 col-span-2 row-span-2"></div>
                         <div className="bg-white col-start-2 row-start-4"></div>
                       </div>
                    </div>
                </div>
                <div className="col-span-1">
                   <div className="border-b border-gray-400 p-1">
                      <div className="text-[8px] text-gray-600">(=) Valor do Documento</div>
                      <div className="font-bold text-right text-sm">89,90</div>
                   </div>
                   <div className="border-b border-gray-400 p-1 h-8">
                      <div className="text-[8px] text-gray-600">(-) Desconto/Abatimentos</div>
                   </div>
                   <div className="border-b border-gray-400 p-1 h-8">
                      <div className="text-[8px] text-gray-600">(+) Outros Acréscimos</div>
                   </div>
                   <div className="border-b border-gray-400 p-1 h-8 bg-[#f0f0f0]">
                      <div className="text-[8px] text-gray-600 font-bold">(=) Valor Cobrado</div>
                   </div>
                </div>
              </div>

              {/* Footer - Payer */}
              <div className="mt-1 border border-gray-400 p-1 text-[9px]">
                 <div className="text-[8px] text-gray-600 uppercase mb-0.5">Pagador</div>
                 <div className="font-bold text-[10px]">NOME DO CLIENTE</div>
                 <div className="text-gray-600">ENDEREÇO DO CLIENTE - CIDADE - UF</div>
                 <div className="mt-1 border-t border-gray-300 pt-0.5 text-[8px] flex justify-between text-gray-500">
                    <span>Sacador/Avalista: 22.969.088/0001-97 - TELECOM FIBER NET LTDA</span>
                    <span>FICHA DE COMPENSAÇÃO</span>
                 </div>
              </div>

              {/* Barcode */}
              <div className="mt-3 h-10 sm:h-12 flex items-end gap-px overflow-hidden px-2">
                <div className="text-[8px] text-gray-400 absolute right-8 -mt-3">Autenticação Mecânica</div>
                {[...Array(55)].map((_, i) => (
                    <div key={i} className={`bg-black h-full w-0.5 sm:w-1 flex-shrink-0 ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-0'}`} style={{ height: Math.random() > 0.5 ? '100%' : '60%' }}></div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* 2. Wi-Fi Tips */}
        <section>
          <div className="flex items-center gap-3 mb-8">
             <div className="p-2 bg-fiber-orange/20 rounded-lg text-fiber-orange">
                <Wifi size={24} />
             </div>
             <h2 className="text-2xl font-bold text-white">Dicas para um Wi-Fi Turbinado</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-fiber-card p-6 rounded-xl border border-white/10">
               <div className="mb-4 text-fiber-orange"><Router /></div>
               <h3 className="text-white font-bold mb-2">Posicionamento</h3>
               <p className="text-sm text-gray-400">
                 O roteador deve ficar em local alto e central na casa. Evite escondê-lo em gavetas, atrás de TVs ou espelhos, pois isso bloqueia o sinal.
               </p>
            </div>
            <div className="bg-fiber-card p-6 rounded-xl border border-white/10">
               <div className="mb-4 text-fiber-orange"><AlertCircle /></div>
               <h3 className="text-white font-bold mb-2">Interferências</h3>
               <p className="text-sm text-gray-400">
                 Micro-ondas, babás eletrônicas e telefones sem fio podem interferir no sinal. Mantenha o roteador afastado desses aparelhos.
               </p>
            </div>
            <div className="bg-fiber-card p-6 rounded-xl border border-white/10">
               <div className="mb-4 text-fiber-orange"><Wifi /></div>
               <h3 className="text-white font-bold mb-2">5GHz vs 2.4GHz</h3>
               <p className="text-sm text-gray-400">
                 Use a rede <strong>5GHz</strong> para velocidade máxima perto do roteador, e a rede <strong>2.4GHz</strong> para maior alcance em cômodos distantes.
               </p>
            </div>
          </div>
        </section>

        {/* 3. Security */}
        <section className="bg-gradient-to-r from-neutral-900 to-fiber-card p-8 md:p-12 rounded-2xl border border-white/5">
           <div className="flex flex-col md:flex-row items-center gap-8">
              <ShieldCheck className="w-24 h-24 text-fiber-green opacity-80" />
              <div>
                 <h2 className="text-2xl font-bold text-white mb-4">Navegue com Segurança</h2>
                 <p className="text-gray-400 mb-4">
                   Sua segurança é nossa prioridade. A rede da Fiber.Net conta com proteção contra ataques externos, mas você também pode fazer a sua parte:
                 </p>
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                    <li className="flex items-center"><div className="w-2 h-2 bg-fiber-green rounded-full mr-2"></div>Não compartilhe sua senha do Wi-Fi com desconhecidos.</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-fiber-green rounded-full mr-2"></div>Troque a senha periodicamente.</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-fiber-green rounded-full mr-2"></div>Cuidado com e-mails suspeitos (Phishing).</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-fiber-green rounded-full mr-2"></div>Mantenha seu antivírus atualizado.</li>
                 </ul>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default ClientGuide;