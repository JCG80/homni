import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';

export const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  useEffect(() => {
    // Redirect to the most appropriate admin page based on role
    if (role === 'master_admin') {
      navigate('/admin/roles', { replace: true });
    } else {
      navigate('/admin/system-modules', { replace: true });
    }
  }, [navigate, role]);

  return null;
};