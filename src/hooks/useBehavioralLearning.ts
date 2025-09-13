import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';

/**
 * Hook for tracking user behavior and learning from patterns
 */
export const useBehavioralLearning = () => {
  const { user } = useIntegratedAuth();

  // Track user interaction events
  const trackEvent = useCallback(async (
    eventType: string, 
    eventTarget: string, 
    eventContext: any = {}
  ) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_behavior_events')
        .insert({
          user_id: user.id,
          event_type: eventType,
          event_target: eventTarget,
          event_context: eventContext,
          session_id: sessionStorage.getItem('session_id') || crypto.randomUUID()
        });
    } catch (error) {
      console.error('Error tracking behavior event:', error);
    }
  }, [user?.id]);

  // Get user behavior patterns
  const getBehaviorPatterns = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const { data } = await supabase
        .from('user_behavior_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('created_at', { ascending: false });

      if (!data?.length) return null;

      // Analyze patterns
      const patterns = {
        mostClickedTargets: getMostFrequent(data, 'event_target'),
        primaryActions: getMostFrequent(data, 'event_type'),
        timeOfDayPreference: getTimePatterns(data),
        sessionLength: getAverageSessionLength(data),
        contentPreferences: getContentPreferences(data)
      };

      return patterns;
    } catch (error) {
      console.error('Error getting behavior patterns:', error);
      return null;
    }
  }, [user?.id]);

  // Update user preferences based on behavior
  const updateUserPreferences = useCallback(async (preferenceType: string, data: any) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_type: preferenceType,
          preference_data: data
        });
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }, [user?.id]);

  // Generate smart notifications based on behavior
  const generateSmartNotification = useCallback(async (
    type: string,
    title: string,
    content: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    metadata: any = {}
  ) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('smart_notifications')
        .insert({
          user_id: user.id,
          notification_type: type,
          title,
          content,
          priority,
          metadata
        });
    } catch (error) {
      console.error('Error generating smart notification:', error);
    }
  }, [user?.id]);

  // Analyze user engagement and generate insights
  const analyzeEngagement = useCallback(async () => {
    if (!user?.id) return;

    try {
      const patterns = await getBehaviorPatterns();
      if (!patterns) return;

      // Generate engagement-based notifications
      if (patterns.sessionLength < 5) {
        await generateSmartNotification(
          'tip',
          'Utforsk flere funksjoner',
          'Det ser ut som du bruker korte økter. Visste du at du kan spare tid ved å bruke hurtighandlinger?',
          'low',
          { action: { label: 'Se tips', url: '/help' } }
        );
      }

      if (patterns.primaryActions.includes('dismiss') && 
          patterns.mostClickedTargets.includes('notification')) {
        // User dismisses many notifications - reduce frequency
        await updateUserPreferences('notification_frequency', { reduced: true });
      }

      // Update adaptive widget priorities based on interaction patterns
      if (patterns.mostClickedTargets.length > 0) {
        await updateUserPreferences('widget_priorities', {
          priorities: patterns.mostClickedTargets.map((target, index) => ({
            widget: target,
            priority: index + 1
          }))
        });
      }

    } catch (error) {
      console.error('Error analyzing engagement:', error);
    }
  }, [user?.id, getBehaviorPatterns, generateSmartNotification, updateUserPreferences]);

  // Auto-run engagement analysis periodically
  useEffect(() => {
    if (!user?.id) return;

    // Run analysis when user becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        analyzeEngagement();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial analysis
    analyzeEngagement();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, analyzeEngagement]);

  return {
    trackEvent,
    getBehaviorPatterns,
    updateUserPreferences,
    generateSmartNotification,
    analyzeEngagement
  };
};

// Helper functions for pattern analysis
function getMostFrequent(data: any[], field: string) {
  const frequency: { [key: string]: number } = {};
  data.forEach(item => {
    const value = item[field];
    frequency[value] = (frequency[value] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([key]) => key);
}

function getTimePatterns(data: any[]) {
  const hours = data.map(item => new Date(item.created_at).getHours());
  const hourFrequency: { [key: number]: number } = {};
  
  hours.forEach(hour => {
    hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;
  });
  
  const peakHour = Object.entries(hourFrequency)
    .sort(([,a], [,b]) => b - a)[0];
    
  return peakHour ? parseInt(peakHour[0]) : null;
}

function getAverageSessionLength(data: any[]) {
  const sessions: { [key: string]: Date[] } = {};
  
  data.forEach(event => {
    const sessionId = event.session_id || 'default';
    if (!sessions[sessionId]) sessions[sessionId] = [];
    sessions[sessionId].push(new Date(event.created_at));
  });
  
  const sessionLengths = Object.values(sessions).map(timestamps => {
    if (timestamps.length < 2) return 0;
    const sorted = timestamps.sort((a, b) => a.getTime() - b.getTime());
    return (sorted[sorted.length - 1].getTime() - sorted[0].getTime()) / (1000 * 60); // minutes
  });
  
  return sessionLengths.length > 0 
    ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length 
    : 0;
}

function getContentPreferences(data: any[]) {
  const contentTypes = data
    .filter(event => event.event_context?.widget_type || event.event_context?.content_type)
    .map(event => event.event_context.widget_type || event.event_context.content_type);
    
  return getMostFrequent(contentTypes.map((_, i) => ({ content_type: contentTypes[i] })), 'content_type');
}