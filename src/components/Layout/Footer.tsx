
import React from 'react';
import { Instagram, MessageCircle, ChevronRight, Star } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';
import FiberNetLogo from './FiberNetLogo';

interface FooterProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
  onOpenSupport?: () => void;
  onOpenSegundaVia?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, currentPage, onOpenSupport, onOpenSegundaVia }) => {
  
  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (!onNavigate) return;

    if (href.startsWith('#')) {
      if (currentPage !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSegundaVia = (e: React.MouseEvent) => {
      e.preventDefault();
      if (onOpenSegundaVia) onOpenSegundaVia();
  };

  const FooterLink = ({ href, label, onClick }: { href: string, label: string, onClick?: (e: React.MouseEvent) => void }) => (
    <li>
      <a 
        href={href} 
        onClick={onClick} 
        className="group flex items-center text-gray-400 hover:text-fiber-orange transition-all duration-200 text-sm"
      >
        <ChevronRight size={14} className="text-fiber-orange mr-1 opacity-50 group-hover:opacity-100 transition-opacity" />
        {label}
      </a>
    </li>
  );

  return (
    <footer className="bg-fiber-card text-white pt-12 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 mb-1">
          
          {/* Coluna 1: Marca e Social */}
          <div className="space-y-4">
            <div 
              className="cursor-pointer inline-block" 
              onClick={(e) => handleNav(e, 'home')}
            >
               <FiberNetLogo className="h-8" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Conectando você ao mundo! Internet de qualidade 100% regional, homologada pela ANATEL.
            </p>
            
            <div className="flex gap-3 pt-2">
              <a 
                  href="https://www.instagram.com/fibernettelecom_" 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="Instagram" 
                  className="bg-neutral-900 p-2 rounded-lg text-gray-400 hover:text-fiber-orange hover:bg-neutral-800 transition-all"
              >
                  <Instagram size={20} />
              </a>
              
              <a 
                href="https://share.google/rpZywrszedM4tT4fH" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-3 py-2 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-all group"
              >
                <Star size={16} fill="currentColor" className="text-yellow-500" />
                <span className="text-xs font-bold text-gray-300 group-hover:text-white">Avalie-nos</span>
              </a>
            </div>
          </div>

          {/* Coluna 2: Navegação Unificada */}
          <div className="flex justify-start md:justify-center gap-12">
            <div>
                <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Menu</h4>
                <ul className="space-y-1">
                    <FooterLink href="home" label="Início" onClick={(e) => handleNav(e, 'home')} />
                    <FooterLink href="#planos" label="Planos" onClick={(e) => handleNav(e, '#planos')} />
                    <FooterLink href="#" label="2ª Via Boleto" onClick={handleSegundaVia} />
                    <FooterLink href="help" label="Central de Ajuda" onClick={(e) => handleNav(e, 'help')} />
                </ul>
            </div>
            <div>
                <h4 className="text-sm font-bold mb-2 text-white uppercase tracking-wider">Legal</h4>
                <ul className="space-y-2">
                    <FooterLink href="legal" label="Privacidade" onClick={(e) => handleNav(e, 'legal')} />
                    <FooterLink href="ethics" label="Código de Ética" onClick={(e) => handleNav(e, 'ethics')} />
                    <FooterLink href="legal" label="Termos de Uso" onClick={(e) => handleNav(e, 'legal')} />
                </ul>
            </div>
          </div>

          {/* Coluna 3: Contato Compacto */}
          <div className="md:text-right">
            <h4 className="text-sm font-bold mb-2 text-white uppercase tracking-wider">Fale Conosco</h4>
            <div className="flex flex-col md:items-end space-y-3">
                <button 
                  className="group flex items-center gap-2 text-gray-400 hover:text-fiber-green transition-colors"
                  onClick={onOpenSupport}
                >
                  <MessageCircle size={18} />
                  <span className="font-medium text-sm">{CONTACT_INFO.whatsapp}</span>
              </button>
              
                <div className="pt-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        Não aceitamos ligações
                    </span>
                </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-2 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="text-center md:text-left">
             <p>&copy; {new Date().getFullYear()} Fiber.Net - CNPJ: 22.969.088/0001-97</p>
          </div>
          <div className="flex items-center gap-2">
             <span>Desenvolvido por</span>
             <a href="https://kadudev.com" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
               <img 
                 src="https://images.unsplash.com/vector-1763657979649-8d8d789164df?q=80&w=880&auto=format&fit=crop&fm=webp" 
                 alt="KaduDev Logo" 
                 className="h-20 w-auto opacity-80" 
               />
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
