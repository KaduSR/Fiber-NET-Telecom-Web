
import React from 'react';

interface FiberNetLogoProps {
  className?: string;
}

const FiberNetLogo: React.FC<FiberNetLogoProps> = ({ className = '' }) => {
  // Added &fm=webp&q=80 for optimization
  const imageUrl = "https://images.unsplash.com/vector-1763660435338-9a2924075279?q=80&w=2098&auto=format&fit=crop&fm=webp&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  return (
    <img 
      src={imageUrl} 
      alt="Fiber.Net Logo" 
      className={`h-8 w-auto object-contain ${className}`} 
      loading="eager" // Logo should load immediately
      width="2098" 
      height="450" 
    />
  );
};

export default FiberNetLogo;
