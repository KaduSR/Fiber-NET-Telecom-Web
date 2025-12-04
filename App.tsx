
import React, { useState, Suspense, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import SupportModal from './components/SupportModal';
import ClientArea from './components/ClientArea';
import NewsSection from './components/NewsSection';
import { PLANS, HISTORY_TEXT } from './constants';
import { Loader2, Headphones } from 'lucide-react';
import FiberNetTextLogo from './components/FiberNetTextLogo';
import PlanCard from './components/PlanCard';
import SegundaViaModal from './components/SegundaViaModal';

// Lazy load heavier components
const Ethics = React.lazy(() => import('./components/Ethics'));
const HelpCenter = React.lazy(() => import('./components/HelpCenter'));
const ClientGuide = React.lazy(() => import('./components/ClientGuide'));
const CodeOfEthicsDocument = React.lazy(() => import('./components/CodeOfEthicsDocument'));
const ServiceStatus = React.lazy(() => import('./components/ServiceStatus'));
const LegalCompliance = React.lazy(() => import('./components/LegalCompliance'));

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isSegundaViaModalOpen, setIsSegundaViaModalOpen] = useState(false);

  // === NOVO: SEO e Scroll para o topo sempre que a página mudar ===
  useEffect(() => {
    // Scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // SEO: Título Dinâmico Otimizado (Fibra Óptica + Banda Larga)
    const baseTitle = "Fiber.Net Telecom";
    const titles: Record<string, string> = {
      'home': `Internet Fibra Óptica e Banda Larga em Rio das Flores | ${baseTitle}`,
      'planos': `Planos de Internet Banda Larga e Gamer | ${baseTitle}`,
      'client-area': `Área do Cliente - 2ª Via e Suporte | ${baseTitle}`,
      'news': `Notícias de Tecnologia e Conectividade | ${baseTitle}`,
      'help': `Central de Ajuda e Suporte Técnico Fibra | ${baseTitle}`,
      'client-guide': `Guia do Cliente Fiber.Net | ${baseTitle}`,
      'ethics': `Código de Ética e Conduta | ${baseTitle}`,
      'status': `Status dos Serviços em Tempo Real | ${baseTitle}`,
      'segunda-via': `Emitir 2ª Via de Boleto - Banda Larga | ${baseTitle}`,
      'legal': `Privacidade, LGPD e Conformidade Legal | ${baseTitle}`
    };

    document.title = titles[currentPage] || baseTitle;

  }, [currentPage]);

  const toggleSupportModal = () => setIsSupportModalOpen(!isSupportModalOpen);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsSupportModalOpen(false); // Close modal if navigating from it
  };

  return (
    <div className="min-h-screen bg-fiber-dark font-sans text-gray-900 flex flex-col">
      <Navbar 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onOpenSegundaVia={() => setIsSegundaViaModalOpen(true)}
      />
      
      <main className="flex-grow">
        {currentPage === 'home' && (
          <>
            {/* Hero Section */}
            <div id="home">
              <Hero />
            </div>

            {/* History Section */}
            <section id="sobre" className="py-20 bg-fiber-card border-y border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-2">Sobre a <span className="text-fiber-orange"><FiberNetTextLogo /></span></h2>
                    <div className="w-20 h-1 bg-fiber-orange mx-auto rounded-full"></div>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white/5 rounded-2xl p-8 md:p-12 border border-white/5">
                    <div className="text-left order-2 lg:order-1">
                        <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                          {HISTORY_TEXT}
                        </p>
                        <p className="mt-8 text-fiber-orange font-bold text-lg">
                          <FiberNetTextLogo /> - Uma empresa Homologada pela ANATEL! É 100% regional. Conectando você ao mundo!
                        </p>
                    </div>
                    <div className="relative h-full min-h-[300px] order-1 lg:order-2 group">
                        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img 
                            src="https://res.cloudinary.com/dbblxiya7/image/upload/f_auto,q_auto/v1763993086/Gemini_Generated_Image_6m5kop6m5kop6m5k_urxmoq.png"
                            alt="Cidade de Rio das Flores à noite - Cobertura Fiber.Net"
                            className="relative w-full h-full object-cover rounded-xl shadow-2xl border border-white/10"
                            loading="lazy"
                            width="1000"
                            height="667"
                        />
                    </div>
                 </div>
              </div>
            </section>

            {/* Features / Values Section */}
            <Features />

            {/* Why Choose Us Section */}
            <section className="py-16 bg-fiber-dark">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white">Por que escolher a <span className="text-fiber-orange"><FiberNetTextLogo />?</span></h2>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 border border-white/10 rounded-xl hover:border-fiber-orange/50 transition-colors">
                            <div className="w-12 h-12 bg-fiber-orange/10 text-fiber-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                            </div>
                            <h3 className="text-white font-bold mb-2">Internet Ilimitada</h3>
                            <p className="text-gray-400 text-sm">Sem limite de dados, use à vontade!</p>
                        </div>
                        <div className="p-6 border border-white/10 rounded-xl hover:border-fiber-orange/50 transition-colors">
                            <div className="w-12 h-12 bg-fiber-orange/10 text-fiber-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <h3 className="text-white font-bold mb-2">Suporte Especializado</h3>
                            <p className="text-gray-400 text-sm">Suporte técnico gratuito e especializado</p>
                        </div>
                        <div className="p-6 border border-white/10 rounded-xl hover:border-fiber-orange/50 transition-colors">
                             <div className="w-12 h-12 bg-fiber-orange/10 text-fiber-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3 className="text-white font-bold mb-2">Empresa Local</h3>
                            <p className="text-gray-400 text-sm">100% regional, perto de você</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Strip */}
            <section className="bg-fiber-orange py-16">
               <div className="max-w-4xl mx-auto px-4 text-center">
                  <h3 className="text-3xl font-bold text-white mb-4">Pronto para ter a melhor internet da região?</h3>
                  <p className="text-white/90 text-lg mb-8">Entre em contato conosco e descubra nossos planos de Banda Larga</p>
                  <button 
                    onClick={() => setIsSupportModalOpen(true)}
                    className="inline-block bg-fiber-card text-fiber-orange font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                     Fale Conosco Agora
                  </button>
               </div>
            </section>

            {/* Plans Section */}
            <section id="planos" className="py-24 bg-fiber-dark">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
                    Nossos Planos de Internet
                  </h2>
                  <p className="text-gray-400 text-lg">
                    Escolha a velocidade de Banda Larga ideal para sua necessidade em Rio das Flores
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {PLANS.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
        
        {currentPage === 'client-area' && <ClientArea />}
        
        {/* Lazy Loaded Components with Suspense Fallback */}
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 text-fiber-orange animate-spin" /></div>}>
            {currentPage === 'ethics' && <Ethics />}
            {currentPage === 'help' && <HelpCenter onNavigate={handleNavigate} onOpenSegundaVia={() => setIsSegundaViaModalOpen(true)} />}
            {currentPage === 'client-guide' && <ClientGuide />}
            {currentPage === 'code-of-ethics' && <CodeOfEthicsDocument onNavigate={handleNavigate} />}
            {currentPage === 'status' && <ServiceStatus onNavigate={handleNavigate} />}
            {currentPage === 'legal' && <LegalCompliance />}
        </Suspense>
        
        {currentPage === 'news' && <NewsSection />}
        
      </main>

      <Footer 
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onOpenSegundaVia={() => setIsSegundaViaModalOpen(true)}
      />
      
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
        onNavigate={handleNavigate}
        onOpenSegundaVia={() => setIsSegundaViaModalOpen(true)}
      />

      <SegundaViaModal 
        isOpen={isSegundaViaModalOpen}
        onClose={() => setIsSegundaViaModalOpen(false)}
      />

      {/* Floating Support Button */}
      <button 
        onClick={() => setIsSupportModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-fiber-orange text-white p-4 rounded-full shadow-[0_0_20px_rgba(255,107,0,0.5)] hover:scale-110 hover:shadow-[0_0_30px_rgba(255,107,0,0.8)] transition-all duration-300 group"
        aria-label="Abrir Central de Suporte"
        title="Central de Suporte"
      >
        <Headphones size={32} />
        {/* Tooltip on Hover */}
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-fiber-card text-white text-xs font-bold py-2 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 flex items-center">
            Falar com Suporte
            {/* Seta do Tooltip */}
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-fiber-card border-t border-r border-white/10 transform rotate-45"></span>
        </span>
      </button>
    </div>
  );
};

export default App;
