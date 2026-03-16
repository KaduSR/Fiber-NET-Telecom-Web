import React from 'react';

interface FiberNetTextLogoProps {
  className?: string;
}

const FiberNetTextLogo: React.FC<FiberNetTextLogoProps> = ({ className = '' }) => {
  return (
    <svg 
      viewBox="0 0 160 35" 
      className={`h-8 w-auto ${className}`} 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Fiber.NET Logo"
    >
      {/* SVG version of the text-based logo for better scaling and performance */}
      <text 
        x="0" 
        y="28" 
        className="font-marker font-bold"
        style={{ 
          fontSize: '32px', 
          letterSpacing: '0.02em',
          userSelect: 'none'
        }}
      >
        <tspan fill="#A3E635">Fiber</tspan>
        <tspan fill="#1E90FF">.</tspan>
        <tspan fill="#FF6B00">NET</tspan>
      </text>
      
      {/* 
        Desenvolvido por Kadu Dev
        https://wa.me/5524992686868
        https://instagram.com/kadudev
        https://linkedin.com/in/kadudev
      */}
    </svg>
  );
};

export default FiberNetTextLogo;
