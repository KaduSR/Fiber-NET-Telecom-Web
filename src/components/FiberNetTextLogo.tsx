import React from 'react';

interface FiberNetTextLogoProps {
  className?: string;
}

const FiberNetTextLogo: React.FC<FiberNetTextLogoProps> = ({ className = '' }) => {
  return (
    <span className={`font-marker tracking-wider ${className}`}>
      <span className="text-fiber-lime">Fiber</span>
      <span className="text-fiber-blue mx-0.5">.</span>
      <span className="text-fiber-orange">NET</span>
    </span>
  );
};

export default FiberNetTextLogo;