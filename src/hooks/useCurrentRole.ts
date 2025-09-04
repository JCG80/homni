import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/routes/routeTypes';

export const useCurrentRole = (): UserRole => {
  const { user, profile } = useAuth();
  
  if (!user) return 'anonymous';
  if (!profile) return 'user'; // fallback for authenticated but no profile
  
  return (profile.role as UserRole) || 'user';
};