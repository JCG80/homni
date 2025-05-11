
import { Building, User } from 'lucide-react';

interface TabIconProps {
  userType: 'private' | 'business';
  size?: number;
  className?: string;
}

export const TabIcon = ({ userType, size = 4, className = '' }: TabIconProps) => {
  return userType === 'private' ? (
    <User className={`h-${size} w-${size} ${className}`} />
  ) : (
    <Building className={`h-${size} w-${size} ${className}`} />
  );
};
