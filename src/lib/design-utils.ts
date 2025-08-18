import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Design system utility functions for consistent styling
 */
export const designTokens = {
  // Spacing utilities
  spacing: {
    xs: "space-y-2",
    sm: "space-y-4", 
    md: "space-y-6",
    lg: "space-y-8",
    xl: "space-y-10",
  },
  
  // Grid utilities
  grid: {
    auto: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    twoCol: "grid grid-cols-1 md:grid-cols-2 gap-6",
    threeCol: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    fourCol: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
  },
  
  // Animation utilities
  animations: {
    fadeIn: "animate-fade-in",
    slideIn: "animate-slide-in-right",
    scaleIn: "animate-scale-in",
    hoverLift: "hover-lift",
    hoverScale: "hover-scale",
  },
  
  // Shadow utilities
  shadows: {
    card: "shadow-sm hover:shadow-md transition-shadow duration-300",
    elevated: "shadow-md hover:shadow-lg transition-shadow duration-300",
    floating: "shadow-lg hover:shadow-xl transition-shadow duration-300",
  }
} as const;

/**
 * Generate consistent color classes for semantic colors
 */
export const getColorClasses = (color: 'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info', variant: 'solid' | 'soft' | 'outline' = 'solid') => {
  const variants = {
    solid: `bg-${color} text-${color}-foreground`,
    soft: `bg-${color}/10 text-${color} border border-${color}/20`,
    outline: `border border-${color} text-${color} bg-transparent hover:bg-${color}/10`,
  };
  
  return variants[variant];
};

/**
 * Generate responsive text classes
 */
export const getResponsiveText = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl') => {
  const sizes = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg md:text-xl",
    xl: "text-xl md:text-2xl",
    '2xl': "text-2xl md:text-3xl lg:text-4xl",
    '3xl': "text-3xl md:text-4xl lg:text-5xl",
  };
  
  return sizes[size];
};