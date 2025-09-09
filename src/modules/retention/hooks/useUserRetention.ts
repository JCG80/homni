import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

interface RetentionMetrics {
  loginStreak: number;
  lastActiveDate: string;
  totalSessions: number;
  engagementScore: number;
}

interface UserActivity {
  page_visited: string;
  action_taken: string;
  time_spent: number;
  created_at: string;
}

export const useUserRetention = () => {
  const [retentionMetrics, setRetentionMetrics] = useState<RetentionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track user activity - REMOVED: Functionality not needed for current requirements
  const trackActivity = useCallback(async (activity: Omit<UserActivity, 'created_at'>) => {
    // Activity tracking removed as user_activity_logs table implementation is not required
    console.log('Activity tracking not implemented', activity);
  }, []);

  // Calculate engagement score
  const calculateEngagementScore = useCallback((activities: UserActivity[]) => {
    if (!activities.length) return 0;

    const now = new Date();
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.created_at);
      const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Last 7 days
    });

    const avgTimeSpent = recentActivities.reduce((sum, activity) => sum + activity.time_spent, 0) / recentActivities.length;
    const activityFrequency = recentActivities.length / 7;
    
    return Math.min(100, (avgTimeSpent / 60) * 10 + activityFrequency * 20);
  }, []);

  // Load retention metrics
  const loadRetentionMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile with retention data
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('metadata')
        .eq('id', user.id)
        .single();

      const metadata = (profile?.metadata as Record<string, any>) || {};
      
      setRetentionMetrics({
        loginStreak: (metadata.loginStreak as number) || 0,
        lastActiveDate: metadata.lastActiveDate as string || new Date().toISOString(),
        totalSessions: (metadata.totalSessions as number) || 1,
        engagementScore: (metadata.engagementScore as number) || 50
      });
    } catch (error) {
      console.error('Error loading retention metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update login streak
  const updateLoginStreak = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !retentionMetrics) return;

      const now = new Date();
      const lastActive = new Date(retentionMetrics.lastActiveDate);
      const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = retentionMetrics.loginStreak;
      
      if (daysDiff === 1) {
        // Consecutive day login
        newStreak += 1;
        
        if (newStreak % 7 === 0) {
          toast({
            title: "Streak Achievement! 🔥",
            description: `Congratulations! You've maintained a ${newStreak}-day login streak!`,
          });
        }
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }

      const updatedMetrics = {
        ...retentionMetrics,
        loginStreak: newStreak,
        lastActiveDate: now.toISOString(),
        totalSessions: retentionMetrics.totalSessions + 1
      };

      const currentMetadata = (retentionMetrics as any) || {};
      await supabase
        .from('user_profiles')
        .update({
          metadata: {
            ...currentMetadata,
            loginStreak: newStreak,
            lastActiveDate: now.toISOString(),
            totalSessions: updatedMetrics.totalSessions
          }
        })
        .eq('id', user.id);

      setRetentionMetrics(updatedMetrics);
    } catch (error) {
      console.error('Error updating login streak:', error);
    }
  }, [retentionMetrics]);

  // Show retention prompt
  const showRetentionPrompt = useCallback(() => {
    if (!retentionMetrics) return;

    if (retentionMetrics.engagementScore < 30) {
      toast({
        title: "Explore More Features!",
        description: "Discover advanced property management tools to get the most out of Homni.",
      });
    }
  }, [retentionMetrics]);

  useEffect(() => {
    loadRetentionMetrics();
  }, [loadRetentionMetrics]);

  useEffect(() => {
    if (retentionMetrics && !isLoading) {
      updateLoginStreak();
      
      // Show retention prompt after a delay
      const timer = setTimeout(showRetentionPrompt, 5000);
      return () => clearTimeout(timer);
    }
  }, [retentionMetrics, isLoading, updateLoginStreak, showRetentionPrompt]);

  return {
    retentionMetrics,
    isLoading,
    trackActivity,
    updateLoginStreak,
    showRetentionPrompt,
  };
};