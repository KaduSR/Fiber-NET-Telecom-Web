
import React, { useState } from 'react';
import { Instagram, MapPin, MessageCircle, ChevronRight, Mail, Phone, CheckCircle, AlertCircle, ArrowRight, ExternalLink, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as L from 'leaflet';
import { CONTACT_INFO } from '../constants';
import FiberNetLogo from './FiberNetLogo';

// Fix for default Leaflet marker icons in React
const icon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

interface FooterProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
  onOpenSupport?: () => void;
  onOpenSegundaVia?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, currentPage, onOpenSupport, onOpenSegundaVia }) => {
  // Form State
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [errors, setErrors] = useState({ email: '', phone: '' });
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'phone') {
       // Remove tudo que não é dígito
       const digits = value.replace(/\D/g, '');
       // Limita a 11 dígitos (DDD + 9 dígitos)
       const limitedDigits = digits.slice(0, 11);

       // Máscara dinâmica
       if (limitedDigits.length <= 10) {
         // Fixo: (DD) XXXX-XXXX
         newValue = limitedDigits
           .replace(/^(\d{2})(\d)/, '($1) $2')
           .replace(/(\d{4})(\d)/, '$1-$2');
       } else {
         // Celular: (DD) XXXXX-XXXX
         newValue = limitedDigits
           .replace(/^(\d{2})(\d)/, '($1) $2')
           .replace(/(\d{5})(\d)/, '$1-$2');
       }
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error on change
    if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
      let isValid = true;
      const newErrors = { email: '', phone: '' };

      // Email Validation (Robust Regex)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!formData.email.trim()) {
          newErrors.email = 'O e-mail é obrigatório.';
          isValid = false;
      } else if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Digite um e-mail válido (ex: nome@dominio.com).';
          isValid = false;
      }

      // Phone Validation (Min 10 digits - Landline or Mobile)
      const phoneClean = formData.phone.replace(/\D/g, '');
      const isRepeated = /^(\d)\1+$/.test(phoneClean); // Verifica números repetidos (ex: 11111111111)

      if (!formData.phone.trim()) {
          newErrors.phone = 'O telefone é obrigatório.';
          isValid = false;
      } else if (phoneClean.length < 10 || phoneClean.length > 11) {
          newErrors.phone = 'Informe o DDD + Número (min. 10 dígitos).';
          isValid = false;
      } else if (isRepeated) {
          newErrors.phone = 'Número de telefone inválido.';
          isValid = false;
      } else {
          // Validação extra para celular (11 dígitos deve começar com 9)
          if (phoneClean.length === 11 && parseInt(phoneClean[2]) !== 9) {
               newErrors.phone = 'Celular deve começar com o dígito 9.';
               isValid = false;
          }
      }

      setErrors(newErrors);
      return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
          // Simulate API call
          setSuccess(true);
          setFormData({ email: '', phone: '' });
          setTimeout(() => setSuccess(false), 5000);
      }
  };

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

  // Reusable Link Component for animated hover effect
  const FooterLink = ({ href, label, onClick }: { href: string, label: string, onClick?: (e: React.MouseEvent) => void }) => (
    <li>
      <a 
        href={href} 
        onClick={onClick} 
        className="group flex items-center text-gray-400 hover:text-fiber-orange transition-all duration-300 ease-in-out hover:translate-x-2 focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded px-1 py-1"
      >
        <ChevronRight size={14} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-fiber-orange mr-1" />
        {label}
      </a>
    </li>
  );

  // Fiber.Net Coordinates (Updated to exact location)
  const position: [number, number] = [-22.183377, -43.601004];

  return (
    <footer className="bg-fiber-card text-white pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column & Newsletter Form */}
          <div className="space-y-8">
            <div>
                <div 
                  className="mb-6 select-none cursor-pointer inline-block focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded" 
                  onClick={(e) => handleNav(e, 'home')}
                  role="button"
                  tabIndex={0}
                  aria-label="Voltar para página inicial"
                  onKeyDown={(e) => e.key === 'Enter' && handleNav(e as any, 'home')}
                >
                   <FiberNetLogo className="h-8 sm:h-10" />
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Conectando você ao mundo! Internet de qualidade 100% regional, homologada pela ANATEL.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex space-x-4 items-center">
                    <a 
                        href="https://www.instagram.com/fibernettelecom_" 
                        target="_blank" 
                        rel="noreferrer" 
                        aria-label="Instagram" 
                        className="text-gray-400 hover:text-fiber-orange hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded"
                    >
                        <Instagram size={24} />
                    </a>
                  </div>
                  
                  {/* Google Reviews Button */}
                  <a 
                    href="https://share.google/rpZywrszedM4tT4fH" 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="Avalie-nos no Google" 
                    className="flex items-center gap-3 p-2 bg-neutral-900 border border-white/5 rounded-lg hover:bg-neutral-800 hover:border-fiber-orange/30 transition-all group max-w-fit"
                  >
                    <div className="bg-white p-1.5 rounded-md group-hover:bg-fiber-orange group-hover:text-white transition-colors text-neutral-900">
                        <Star size={16} fill="currentColor" className="text-yellow-500 group-hover:text-white group-hover:fill-white transition-colors" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 group-hover:text-fiber-orange transition-colors">Avalie-nos</span>
                        <span className="text-xs font-bold text-white group-hover:text-gray-200">Google Reviews</span>
                    </div>
                  </a>
                </div>
            </div>

            {/* Newsletter Form with Validation */}
            <div className="pt-6 border-t border-white/10">
                <h5 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                    <Mail size={16} className="text-fiber-orange"/> Fique por dentro
                </h5>
                
                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-gray-500 pointer-events-none">
                                <Mail size={14} />
                            </div>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Seu e-mail"
                                className={`w-full bg-neutral-900 border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-fiber-orange'} rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-fiber-orange'} transition-all`}
                                aria-label="Endereço de e-mail para newsletter"
                            />
                            {errors.email && (
                                <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1 animate-fadeIn">
                                    <AlertCircle size={10} /> {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <div className="absolute left-3 top-3 text-gray-500 pointer-events-none">
                                <Phone size={14} />
                            </div>
                            <input 
                                type="text" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="WhatsApp / Telefone"
                                maxLength={15}
                                className={`w-full bg-neutral-900 border ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-fiber-orange'} rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${errors.phone ? 'focus:ring-red-500' : 'focus:ring-fiber-orange'} transition-all`}
                                aria-label="Número de telefone para contato"
                            />
                             {errors.phone && (
                                <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1 animate-fadeIn">
                                    <AlertCircle size={10} /> {errors.phone}
                                </p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-fiber-orange hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-900/20"
                        >
                            Cadastrar <ArrowRight size={14} />
                        </button>
                    </form>
                ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center animate-fadeIn">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle size={16} className="text-green-500" />
                        </div>
                        <p className="text-green-400 text-xs font-bold">Cadastro realizado!</p>
                        <p className="text-gray-400 text-[10px] mt-1">Em breve entraremos em contato com novidades.</p>
                    </div>
                )}
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-base font-bold mb-6 text-white">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="home" label="Início" onClick={(e) => handleNav(e, 'home')} />
              <FooterLink href="#planos" label="Serviços" onClick={(e) => handleNav(e, '#planos')} />
              <FooterLink href="#" label="2ª Via de Boleto" onClick={handleSegundaVia} />
              <FooterLink href="help" label="Central de Ajuda" onClick={(e) => handleNav(e, 'help')} />
              <FooterLink href="client-guide" label="Guia do Cliente" onClick={(e) => handleNav(e, 'client-guide')} />
            </ul>
          </div>

           {/* Legal Column */}
           <div>
            <h4 className="text-base font-bold mb-6 text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="legal" label="Política de Privacidade" onClick={(e) => handleNav(e, 'legal')} />
              <FooterLink href="ethics" label="Código de Ética" onClick={(e) => handleNav(e, 'ethics')} />
              <FooterLink href="legal" label="Termos de Uso" onClick={(e) => handleNav(e, 'legal')} />
            </ul>
          </div>

          {/* Contact Column with Map */}
          <div>
            <h4 className="text-base font-bold mb-6 text-white">Contato</h4>
            <ul className="space-y-4 text-gray-400 text-sm mb-6">
              <li>
                <button 
                  className="flex items-center hover:text-fiber-green transition-colors w-full text-left focus:outline-none focus:ring-2 focus:ring-fiber-green rounded px-1 group"
                  onClick={onOpenSupport}
                  aria-label={`Entrar em contato via WhatsApp: ${CONTACT_INFO.whatsapp}`}
                >
                  <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-fiber-green/20 transition-colors">
                    <MessageCircle className="w-4 h-4 text-fiber-green" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-0.5">Atendimento WhatsApp</span>
                    <span className="font-medium text-white group-hover:text-fiber-green transition-colors">{CONTACT_INFO.whatsapp}</span>
                  </div>
                </button>
              </li>
              <li className="flex items-start px-1 group">
                <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center mr-3 mt-1 group-hover:bg-fiber-orange/20 transition-colors flex-shrink-0">
                    <MapPin className="w-4 h-4 text-fiber-orange" />
                </div>
                <span className="group-hover:text-gray-200 transition-colors text-xs">{CONTACT_INFO.address}</span>
              </li>
            </ul>

            {/* Interactive Map */}
            <div className="w-full h-40 rounded-xl overflow-hidden border border-white/10 shadow-lg relative z-0">
                 <MapContainer 
                    center={position} 
                    zoom={15} 
                    scrollWheelZoom={false} 
                    className="h-full w-full z-0"
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                 >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={position} icon={icon}>
                        <Popup>
                            <span className="font-bold text-gray-900">Fiber.Net Telecom</span><br />
                            <span className="text-xs text-gray-700">Rio das Flores, RJ</span>
                        </Popup>
                    </Marker>
                </MapContainer>
                
                {/* Overlay link to Google Maps */}
                <a 
                    href="https://maps.app.goo.gl/VrTauxVymmyycMEL7"
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 bg-neutral-900/90 hover:bg-fiber-orange text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 transition-colors z-[400] border border-white/20"
                >
                    Abrir no Maps <ExternalLink size={10} />
                </a>
            </div>

            <p className="mt-6 text-red-500 text-xs font-bold uppercase tracking-wider px-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                NÃO ACEITAMOS LIGAÇÕES!!
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="text-center md:text-left">
             <p>&copy; 2025 Fiber.Net - Todos os direitos reservados.</p>
             <p className="mt-1">TELECOM FIBER NET LTDA - CNPJ: 22.969.088/0001-97</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
             <span>
               Desenvolvido e Gerenciado por{' '}
               <a href="https://kadudev.com" target="_blank" rel="noreferrer" aria-label="Visitar site da KaduDev" className="inline-block align-middle focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded hover:opacity-80 transition-opacity">
                 <img 
                   src="https://images.unsplash.com/vector-1763657979649-8d8d789164df?q=80&w=880&auto=format&fit=crop&fm=webp&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                   alt="KaduDev Logo" 
                   className="h-20 sm:h-24 w-auto object-contain" 
                   width="880" 
                   height="200"
                   loading="lazy"
                 />
               </a>
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
