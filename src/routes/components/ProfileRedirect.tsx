import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const ProfileRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/account', { replace: true });
  }, [navigate]);
  
  return null;
};