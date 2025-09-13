import React, { useState, useEffect } from 'react';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { useProperty } from '@/modules/property/hooks/useProperty';
import { useDashboardOptimization } from '@/hooks/useDashboardOptimization';
import { WelcomeHeader } from './WelcomeHeader';
import { SmartQuickActions } from './SmartQuickActions';
import { PrimaryContentArea } from './PrimaryContentArea';
import { ContextualSidebar } from './ContextualSidebar';
import { EnhancedSkeletonDashboard } from '../enhanced/EnhancedSkeletonDashboard';
import { OptimizedDashboardLayout } from '../layout/OptimizedDashboardLayout';
import { PostAuthOnboardingWizard } from '@/components/onboarding/PostAuthOnboardingWizard';
import { supabase } from '@/integrations/supabase/client';

/**
 * Simplified User Dashboard - Phase 1 Implementation
 * Focused on reducing cognitive load and providing intuitive experience
 */
export const SimplifiedUserDashboard: React.FC = () => {
  const { user, profile, isLoading } = useIntegratedAuth();
  const { properties, loading: propertiesLoading } = useProperty();
  
  const {
    dashboardData,
    isLoading: dashboardLoading,
    refreshDashboard,
    performanceMetrics
  } = useDashboardOptimization({
    userId: user?.id,
    userRole: 'user',
    enablePerformanceMonitoring: true
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userStats, setUserStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    hasProperties: false,
    isNewUser: false
  });

  useEffect(() => {
    if (user && !isLoading) {
      checkUserStatus();
      fetchUserStats();
    }
  }, [user, isLoading]);

  const checkUserStatus = async () => {
    if (!user) return;

    try {
      // Check if user is new (created within last 24 hours)
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.created_at) {
        const userCreatedAt = new Date(authUser.user.created_at);
        const isNewUser = Date.now() - userCreatedAt.getTime() < 24 * 60 * 60 * 1000;
        
        if (isNewUser && (!profile?.metadata || Object.keys(profile.metadata).length === 0)) {
          setShowOnboarding(true);
        }

        setUserStats(prev => ({ ...prev, isNewUser }));
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!user?.id) return;

    try {
      // Get user's requests/leads
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('submitted_by', user.id);

      const totalRequests = leads?.length || 0;
      const pendingRequests = leads?.filter(lead => 
        ['new', 'qualified', 'contacted'].includes(lead.status)
      ).length || 0;
      const completedRequests = leads?.filter(lead => 
        lead.status === 'converted'
      ).length || 0;

      setUserStats(prev => ({
        ...prev,
        totalRequests,
        pendingRequests,
        completedRequests,
        hasProperties: properties && properties.length > 0
      }));
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refreshDashboard();
  };

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <WelcomeHeader 
          userName={profile?.full_name || user?.email?.split('@')[0] || 'Bruker'}
          isNewUser={true}
        />
        <PostAuthOnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Show loading state
  if (isLoading || dashboardLoading) {
    return (
      <OptimizedDashboardLayout loading={true}>
        <EnhancedSkeletonDashboard />
      </OptimizedDashboardLayout>
    );
  }

  return (
    <OptimizedDashboardLayout showPerformanceMonitor={true}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-screen">
        
        {/* Quick Actions Sidebar - 3 columns */}
        <div className="lg:col-span-3">
          <div className="sticky top-6 space-y-6">
            <SmartQuickActions 
              userStats={userStats}
              onRefresh={refreshDashboard}
            />
          </div>
        </div>

        {/* Main Content Area - 6 columns */}
        <div className="lg:col-span-6">
          <div className="space-y-6">
            <WelcomeHeader 
              userName={profile?.full_name || user?.email?.split('@')[0] || 'Bruker'}
              isNewUser={userStats.isNewUser}
            />
            
            <PrimaryContentArea 
              userStats={userStats}
              properties={properties}
              propertiesLoading={propertiesLoading}
              onRefresh={refreshDashboard}
            />
          </div>
        </div>

        {/* Contextual Sidebar - 3 columns */}
        <div className="lg:col-span-3">
          <div className="sticky top-6 space-y-6">
            <ContextualSidebar 
              userStats={userStats}
              performanceMetrics={performanceMetrics}
            />
          </div>
        </div>

      </div>
    </OptimizedDashboardLayout>
  );
};