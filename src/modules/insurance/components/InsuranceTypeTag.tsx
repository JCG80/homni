
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { InsuranceType } from '../types/insurance-types';
import { 
  Car, Home, Plane, Package, Heart, Shield, Briefcase, Tag 
} from "lucide-react";

interface InsuranceTypeTagProps {
  type: InsuranceType;
  onRemove?: () => void;
}

export const InsuranceTypeTag = ({ type, onRemove }: InsuranceTypeTagProps) => {
  // Map insurance type slugs to appropriate icons
  const getIcon = () => {
    switch (type.slug) {
      case 'car':
        return <Car className="h-3 w-3 mr-1" />;
      case 'home':
        return <Home className="h-3 w-3 mr-1" />;
      case 'travel':
        return <Plane className="h-3 w-3 mr-1" />;
      case 'contents':
        return <Package className="h-3 w-3 mr-1" />;
      case 'health':
        return <Heart className="h-3 w-3 mr-1" />;
      case 'life':
        return <Shield className="h-3 w-3 mr-1" />;
      case 'business':
        return <Briefcase className="h-3 w-3 mr-1" />;
      default:
        return <Tag className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <Badge 
      variant="outline" 
      className="flex items-center gap-1 mr-1 mb-1"
      onClick={onRemove ? (e) => {
        e.stopPropagation();
        onRemove();
      } : undefined}
    >
      {getIcon()}
      {type.name}
      {onRemove && (
        <span className="ml-1 cursor-pointer">&times;</span>
      )}
    </Badge>
  );
};
