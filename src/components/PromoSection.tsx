import React, { useRef, useEffect, useState } from "react";
import { BatteryCharging, Zap, Wifi, ArrowRight } from "lucide-react";

interface PromoSectionProps {
  onOpenSupport?: () => void;
}

const PromoSection: React.FC<PromoSectionProps> = ({ onOpenSupport }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.2 }
    );

    const section = document.getElementById("promo-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="promo-section"
      className="bg-fiber-dark py-20"
      aria-label="Promoção Fiber Light - Roteador com internet sem parar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Grid: texto | vídeo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ─── COLUNA TEXTO ─────────────────────────────── */}
          <div>
            {/* Badge lançamento */}
            <div
              className={`inline-flex items-center gap-2 bg-fiber-orange/10 border border-fiber-orange/40 text-fiber-orange text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Zap size={13} className="fill-fiber-orange" />
              🚀 Lançamento — Novidade Fiber.Net
            </div>

            {/* Título */}
            <h2
              className={`text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4 transition-all duration-700 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              🚀 Fiber{" "}
              <span className="text-fiber-orange relative">
                Light
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-fiber-orange/50 rounded-full" />
              </span>
            </h2>

            {/* Chamada principal */}
            <p
              className={`text-white text-xl font-bold mb-2 transition-all duration-700 delay-150 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Mantenha seu ROTEADOR com internet sem parar!!
            </p>
            <p
              className={`text-gray-400 text-base leading-relaxed mb-6 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Vendo como estamos sofrendo com a falta de energia em nossa cidade,
              a Fiber.Net está lançando a solução ideal para você nunca ficar sem
              internet — mesmo na falta ou queda de energia!
            </p>

            {/* Destaque 4 horas */}
            <div
              className={`flex items-center gap-3 bg-fiber-orange/10 border border-fiber-orange/25 rounded-xl px-5 py-4 mb-7 transition-all duration-700 delay-250 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <BatteryCharging size={28} className="text-fiber-orange flex-shrink-0" />
              <span className="text-white font-semibold text-base">
                Funciona até{" "}
                <span className="text-fiber-orange font-extrabold text-xl">
                  4 horas
                </span>{" "}
                contínuas sem energia 😎
              </span>
            </div>

            {/* Oferta */}
            <div
              className={`mb-8 transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <p className="text-fiber-orange font-bold text-sm uppercase tracking-widest mb-3 underline underline-offset-4">
                Oferta Top:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-300 text-sm">
                  <Wifi size={15} className="text-fiber-orange mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-white">Adesão:</strong> R$ 25,00 no ato
                    da instalação do equipamento em sua residência
                  </span>
                </li>
                <li className="flex items-start gap-3 text-gray-300 text-sm">
                  <Wifi size={15} className="text-fiber-orange mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-white">Acréscimo:</strong> apenas R$ 12,90
                    na sua mensalidade
                  </span>
                </li>
              </ul>
            </div>

            {/* CTAs */}
            <div
              className={`flex flex-wrap gap-4 transition-all duration-700 delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <a
                id="promo-whatsapp-fiberlight"
                href="https://wa.me/552424581861?text=Olá!%20Quero%20saber%20mais%20sobre%20o%20Fiber%20Light!%20🚀"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 bg-fiber-orange text-white font-bold px-8 py-4 rounded-lg shadow-[0_0_24px_rgba(255,107,0,0.4)] hover:shadow-[0_0_36px_rgba(255,107,0,0.7)] hover:bg-orange-500 transition-all duration-300 text-sm"
              >
                Quero o Fiber Light
                <ArrowRight
                  size={17}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>

              <button
                id="promo-cta-support"
                onClick={onOpenSupport}
                className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-8 py-4 rounded-lg hover:border-fiber-orange/60 hover:bg-white/5 transition-all duration-300 text-sm"
              >
                Falar com Suporte
              </button>
            </div>
          </div>

          {/* ─── COLUNA VÍDEO ─────────────────────────────── */}
          <div className="flex justify-center">
            <div
              className={`relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black w-full max-w-sm transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
            >
              {/* Brilho laranja decorativo */}
              <div className="absolute -inset-1 bg-fiber-orange/20 blur-2xl rounded-2xl pointer-events-none" />

              <video
                ref={videoRef}
                className="relative z-10 w-full h-auto rounded-2xl"
                src="/img/fiberlig.mp4"
                controls
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                aria-label="Vídeo Fiber Light — internet mesmo sem energia"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PromoSection;
