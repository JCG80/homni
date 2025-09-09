import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  Edit3, 
  Building2, 
  ChevronDown, 
  ChevronRight,
  Check,
  X
} from 'lucide-react';

interface CategoryHeaderProps {
  category: string;
  moduleCount: number;
  grantedCount: number;
  isOpen: boolean;
  onToggle: () => void;
}

const categoryConfig = {
  admin: {
    icon: Shield,
    label: 'Admin Modules',
    description: 'System administration and user management',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeVariant: 'destructive' as const
  },
  core: {
    icon: Users,
    label: 'Core Modules', 
    description: 'Essential features for all users',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeVariant: 'default' as const
  },
  content: {
    icon: Edit3,
    label: 'Content Modules',
    description: 'Content creation and management',
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeVariant: 'secondary' as const
  },
  company: {
    icon: Building2,
    label: 'Company Modules',
    description: 'Business and company management',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50', 
    borderColor: 'border-purple-200',
    badgeVariant: 'outline' as const
  },
  general: {
    icon: Users,
    label: 'General Modules',
    description: 'Miscellaneous system modules',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200', 
    badgeVariant: 'outline' as const
  }
};

export function CategoryHeader({ 
  category, 
  moduleCount, 
  grantedCount, 
  isOpen, 
  onToggle 
}: CategoryHeaderProps) {
  const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.general;
  const Icon = config.icon;
  const ChevronIcon = isOpen ? ChevronDown : ChevronRight;
  
  const accessPercentage = moduleCount > 0 ? Math.round((grantedCount / moduleCount) * 100) : 0;
  const isFullAccess = grantedCount === moduleCount && moduleCount > 0;
  const isNoAccess = grantedCount === 0;

  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      className={`w-full justify-between p-4 h-auto ${config.bgColor} ${config.borderColor} border rounded-lg hover:opacity-80`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md bg-white ${config.borderColor} border`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{config.label}</span>
            <Badge variant={config.badgeVariant} className="text-xs">
              {grantedCount}/{moduleCount}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Access status indicator */}
        <div className="flex items-center gap-2">
          {isFullAccess ? (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Full Access</span>
            </div>
          ) : isNoAccess ? (
            <div className="flex items-center gap-1 text-red-600">
              <X className="h-4 w-4" />
              <span className="text-sm font-medium">No Access</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${accessPercentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {accessPercentage}%
              </span>
            </div>
          )}
        </div>
        
        <ChevronIcon className={`h-5 w-5 ${config.color} transition-transform duration-200`} />
      </div>
    </Button>
  );
}