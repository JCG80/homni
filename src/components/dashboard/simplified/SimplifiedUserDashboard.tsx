import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { useProperty } from '@/modules/property/hooks/useProperty';
import { useDashboardOptimization } from '@/hooks/useDashboardOptimization';
import { useAdvancedCaching } from '@/hooks/useAdvancedCaching';
import { DashboardPerformanceMonitor } from '@/components/dashboard/performance/DashboardPerformanceMonitor';
import { LazyWidgetLoader } from '@/components/dashboard/performance/LazyWidgetLoader';
import { logger } from '@/utils/logger';

import { WelcomeHeader } from './WelcomeHeader';
import { SmartQuickActions } from './SmartQuickActions';
import { PrimaryContentArea } from './PrimaryContentArea';
import { ContextualSidebar } from './ContextualSidebar';
import { EnhancedSkeletonDashboard } from '../enhanced/EnhancedSkeletonDashboard';
import { OptimizedDashboardLayout } from '../layout/OptimizedDashboardLayout';
import { PostAuthOnboardingWizard } from '@/components/onboarding/PostAuthOnboardingWizard';
import { GuidedOnboardingFlow } from '../guided/GuidedOnboardingFlow';
import { AchievementSystem } from '../guided/AchievementSystem';
import { SmartProgressTracker } from '../guided/SmartProgressTracker';
import { AdaptiveWidgetContainer } from '../adaptive/AdaptiveWidgetContainer';
import { SmartNotificationCenter } from '../adaptive/SmartNotificationCenter';
import { PersonalizedInsights } from '../adaptive/PersonalizedInsights';
import { supabase } from '@/integrations/supabase/client';

/**
 * Simplified User Dashboard - Phases 1, 2 & 3 Implementation
 * Phase 1: Reduced cognitive load and intuitive experience
 * Phase 2: Guided user experience with smart onboarding and progress tracking
 * Phase 3: Data-driven personalization with adaptive widgets and AI insights
 */
export const SimplifiedUserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useIntegratedAuth();
  const { properties, loading: propertiesLoading } = useProperty();
  const { smartInvalidate } = useAdvancedCaching({
    enableBackgroundSync: true,
    enablePredictivePreloading: true,
    maxCacheSize: 50
  });
  
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
  const [userBehavior, setUserBehavior] = useState({
    primaryActions: [] as string[],
    preferredContent: [] as string[],
    interactionPatterns: {}
  });
  const [userStats, setUserStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    hasProperties: false,
    isNewUser: false,
    profileCompleted: false,
    daysActive: 0,
    weeklyActivity: 0
  });

  useEffect(() => {
    if (user && !isLoading) {
      checkUserStatus();
      fetchUserStats();
      loadUserBehavior();
    }
  }, [user, isLoading]);

  const loadUserBehavior = async () => {
    // Simplified behavior loading - could be enhanced with actual behavioral learning
    setUserBehavior({
      primaryActions: ['dashboard', 'properties', 'leads'],
      preferredContent: ['quick-actions', 'notifications'],
      interactionPatterns: {}
    });
  };

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
        hasProperties: properties && properties.length > 0,
        profileCompleted: !!profile?.full_name && !!profile?.metadata,
        daysActive: Math.floor((Date.now() - new Date(user.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)),
        weeklyActivity: leads?.filter(lead => {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return new Date(lead.created_at) > weekAgo;
        }).length || 0
      }));
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refreshDashboard();
  };

  const handleGoalAction = (goalId: string) => {
    switch (goalId) {
      case 'weekly-request':
        navigate('/');
        break;
      case 'profile-optimization':
        navigate('/profile');
        break;
      case 'property-management':
        navigate('/properties');
        break;
      default:
        break;
    }
  };

  // Simple event tracking function
  const trackEvent = (eventType: string, eventId: string, metadata?: any) => {
    logger.debug('Event tracked', { eventType, eventId, metadata });
    // Could be enhanced to send to analytics service
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
        
        {/* Phase 3: Adaptive Widget Container */}
        <AdaptiveWidgetContainer 
          userId={user?.id || ''}
          userBehavior={userBehavior}
        >
          {/* Quick Actions Sidebar - 3 columns */}
          <div className="lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              <SmartQuickActions 
                userStats={userStats}
                onRefresh={refreshDashboard}
              />
              
              {/* Phase 3: Smart Notifications */}
              <SmartNotificationCenter 
                userId={user?.id || ''}
                onNotificationAction={(notificationId, action) => {
                  trackEvent('notification_action', notificationId, { action });
                }}
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
              
              {/* Phase 2: Smart Progress Tracker */}
              <SmartProgressTracker 
                userStats={userStats}
                onGoalAction={handleGoalAction}
              />
              
              {/* Phase 3: Personalized Insights */}
              <PersonalizedInsights 
                userId={user?.id || ''}
                userStats={userStats}
                onInsightAction={(insight, action) => {
                  trackEvent('insight_action', insight.id, { action, insight_type: insight.insight_type });
                }}
              />
              
              {/* Phase 2: Achievement System */}
              <AchievementSystem 
                userStats={userStats}
                onAchievementUnlocked={(achievement) => {
                  trackEvent('achievement_unlocked', achievement.id, { title: achievement.title });
                  console.log('Achievement unlocked:', achievement.title);
                }}
              />
            </div>
          </div>
        </AdaptiveWidgetContainer>

      </div>
    </OptimizedDashboardLayout>
  );
};