/**
 * NavigationSync - Ensures consistent navigation state across components
 * Part of navigation consolidation effort
 */

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationPreferences } from '@/hooks/navigation/useNavigationPreferences';
import { useAuth } from '@/modules/auth/hooks';

export const NavigationSync: React.FC = () => {
  const location = useLocation();
  const { updatePreferences } = useNavigationPreferences();
  const { isAuthenticated } = useAuth();

  // Update current route in preferences for breadcrumbs and recent routes
  useEffect(() => {
    if (isAuthenticated && location.pathname) {
      // This will automatically update recentRoutes in useNavigationPreferences
      // The hook tracks location changes internally
    }
  }, [location.pathname, isAuthenticated, updatePreferences]);

  // This is a utility component, doesn't render anything
  return null;
};