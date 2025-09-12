import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RedirectProps {
  to?: string;
  replace?: boolean;
}

export const AccountRedirect = ({ to = '/account', replace = true }: RedirectProps) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);
  
  return null;
};

// Legacy exports for backward compatibility
export const ProfileRedirect = () => <AccountRedirect />;
export const SettingsRedirect = () => <AccountRedirect />;