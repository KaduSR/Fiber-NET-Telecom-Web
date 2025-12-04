
import React from 'react';
import { Plan } from '../types';
import { Check, Wifi, Zap, Headphones, Smartphone, Globe, Gamepad2, Wrench, Tv } from 'lucide-react';
import Button from './Button';

interface PlanCardProps {
  plan: Plan;
}

const getBenefitIcon = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes('wi-fi') || t.includes('wifi')) return Wifi;
  if (t.includes('suporte')) return Headphones;
  if (t.includes('instalação')) return Wrench;
  if (t.includes('upload') || t.includes('turbo')) return Zap;
  if (t.includes('gamer') || t.includes('latência') || t.includes('ping')) return Gamepad2;
  if (t.includes('apps')) return Smartphone;
  if (t.includes('ip') || t.includes('público')) return Globe;
  return Check;
};

const getPlanIcon = (plan: Plan) => {
  const text = (plan.description + ' ' + plan.benefits.join(' ')).toLowerCase();

  if (text.includes('gamer') || text.includes('jogos') || text.includes('ping')) {
    return Gamepad2;
  }
  if (text.includes('streaming') || text.includes('4k') || text.includes('tv') || text.includes('filmes')) {
    return Tv;
  }
  if (text.includes('wi-fi') || text.includes('wifi')) {
    return Wifi;
  }
  return Check;
};

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const MainIcon = getPlanIcon(plan);

  return (
    <div 
      className={`relative flex flex-col p-8 bg-fiber-card rounded-2xl transition-all duration-300 group hover:bg-neutral-900 
      ${plan.highlight 
        ? 'border-2 border-fiber-orange scale-105 z-20 shadow-[0_0_40px_rgba(255,107,0,0.3)] ring-1 ring-fiber-orange/50 bg-neutral-900' 
        : 'border border-white/10 hover:border-fiber-orange/50 z-0 hover:z-10 hover:shadow-lg hover:shadow-black/40'
      }`}
    >
      
      {plan.highlight && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-fiber-orange text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-orange-900/50">
          Mais Popular
        </div>
      )}

      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-2xl ${plan.highlight ? 'bg-fiber-orange/10 text-fiber-orange' : 'bg-neutral-800 text-gray-400 group-hover:text-fiber-orange group-hover:bg-fiber-orange/10 transition-colors'}`}>
                <MainIcon size={36} aria-hidden="true" />
            </div>
        </div>
        <h3 className="text-gray-400 font-medium uppercase tracking-widest text-xs mb-2">Internet Fibra</h3>
        <div className="text-3xl font-black text-white">
          {plan.speed}
        </div>
      </div>

      <div className="text-center mb-8 pb-8 border-b border-white/10">
        {plan.fullPrice && (
            <div className="text-gray-500 text-sm line-through mb-1">
                De R$ {plan.fullPrice}
            </div>
        )}
        <div className="flex items-center justify-center text-fiber-orange">
          <span className="text-2xl font-medium mt-2">R$</span>
          <span className="text-6xl font-bold mx-1">{plan.price}</span>
          <div className="flex flex-col items-start justify-center mt-2">
            <span className="text-xl font-bold">,{plan.cents}</span>
            <span className="text-xs text-gray-500 font-medium">{plan.period}</span>
          </div>
        </div>
        
        {plan.fullPrice && (
            <div className="mt-2 flex items-center justify-center gap-1 text-fiber-green text-xs font-bold bg-fiber-green/10 py-1.5 px-3 rounded-full">
                <span>R$ 10 OFF até o vencimento</span>
            </div>
        )}

        {plan.description && (
            <p className="text-gray-500 text-sm mt-3">{plan.description}</p>
        )}
      </div>

      <ul className="space-y-4 mb-8 flex-grow">
        {plan.benefits.map((benefit, index) => {
          const Icon = getBenefitIcon(benefit);
          return (
            <li key={index} className="flex items-start text-gray-300 text-sm">
              <Icon className="w-5 h-5 text-fiber-orange mr-3 flex-shrink-0" aria-hidden="true" />
              {benefit}
            </li>
          );
        })}
      </ul>

      <Button 
        variant={plan.highlight ? 'primary' : 'outline'} 
        fullWidth 
        onClick={() => window.open(`https://wa.me/552424581861?text=Olá, gostaria de saber mais sobre o plano de ${plan.speed}`, '_blank')}
        aria-label={`Assinar plano de ${plan.speed} agora via WhatsApp`}
        className={plan.highlight ? 'animate-subtle-bounce hover:animate-none' : ''}
      >
        Quero este plano
      </Button>
    </div>
  );
};

export default PlanCard;