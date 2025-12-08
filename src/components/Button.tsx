
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-bold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fiber-dark focus:ring-fiber-orange";
  
  const variants = {
    primary: "bg-fiber-orange text-white hover:bg-orange-600 shadow-lg shadow-orange-900/20",
    secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
    outline: "border-2 border-fiber-orange text-fiber-orange hover:bg-fiber-orange hover:text-white",
    whatsapp: "bg-fiber-green text-white hover:bg-green-600 shadow-lg"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
