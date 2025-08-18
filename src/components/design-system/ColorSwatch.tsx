import React from 'react';

interface ColorSwatchProps {
  colorName: string;
  colorValue: string;
  label: string;
  className?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ 
  colorName, 
  colorValue, 
  label,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        className="w-20 h-20 rounded-md shadow-sm border"
        style={{ backgroundColor: colorValue }}
        aria-label={`${colorName} color`}
      />
      <span className="text-sm mt-1">{label}</span>
    </div>
  );
};