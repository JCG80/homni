import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/modules/auth/normalizeRole';

export const useCurrentRole = (): UserRole => {
  const { user, profile } = useAuth();
  
  if (!user) return 'guest';
  if (!profile) return 'user'; // fallback for authenticated but no profile
  
  return (profile.role as UserRole) || 'user';
};