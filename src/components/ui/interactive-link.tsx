import React from 'react';
import { Link } from 'react-router-dom';

interface InteractiveLinkProps {
  to: string;
  variant?: 'underline' | 'scale';
  children: React.ReactNode;
  className?: string;
}

export const InteractiveLink: React.FC<InteractiveLinkProps> = ({ 
  to, 
  variant = 'underline', 
  children,
  className = ""
}) => {
  const baseClasses = "text-primary font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm";
  
  const variantClasses = {
    underline: "story-link",
    scale: "hover-scale inline-block"
  };

  return (
    <Link 
      to={to} 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
};